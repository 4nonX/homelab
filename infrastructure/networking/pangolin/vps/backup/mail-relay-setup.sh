#!/bin/bash
# VPS (Ubuntu): postfix relays all mail through the mail provider (smtp.example.com:587, TLS required, SASL login relay@example.com).
# Same setup as on the Proxmox host, but its own SMTP token. The token arrives on stdin
# (first line). root mail -> ALERT_TO. Run as root on the VPS.
set -eu
ALERT_TO=alerts@example.com; LOGIN=relay@example.com
IFS= read -r TOKEN; [ ${#TOKEN} -ge 12 ] || { echo "token missing"; exit 1; }
export DEBIAN_FRONTEND=noninteractive
# install postfix without its interactive questions: local delivery only, relay set below
echo "postfix postfix/main_mailer_type select Satellite system" | debconf-set-selections
echo "postfix postfix/mailname string $(hostname -f)" | debconf-set-selections
echo "postfix postfix/relayhost string [smtp.example.com]:587" | debconf-set-selections
apt-get install -y -qq postfix libsasl2-modules bsd-mailx >/dev/null
umask 077
printf '[smtp.example.com]:587 %s:%s\n' "$LOGIN" "$TOKEN" > /etc/postfix/sasl_passwd; unset TOKEN
postmap /etc/postfix/sasl_passwd; chmod 600 /etc/postfix/sasl_passwd /etc/postfix/sasl_passwd.db
umask 022
# the provider only accepts mail from addresses of the account: every sender becomes relay@example.com
printf '/.+/    %s\n' "$LOGIN" > /etc/postfix/sender_canonical
postconf -e \
  "relayhost = [smtp.example.com]:587" \
  "smtp_sasl_auth_enable = yes" \
  "smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd" \
  "smtp_sasl_security_options = noanonymous" \
  "smtp_sasl_tls_security_options = noanonymous" \
  "smtp_tls_security_level = encrypt" \
  "smtp_tls_mandatory_protocols = >=TLSv1.2" \
  "smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt" \
  "sender_canonical_maps = regexp:/etc/postfix/sender_canonical" \
  "inet_interfaces = loopback-only" \
  'myorigin = $myhostname' \
  'mydestination = $myhostname, localhost.$mydomain, localhost'
if grep -q '^root:' /etc/aliases; then sed -i "s/^root:.*/root: $ALERT_TO/" /etc/aliases; else echo "root: $ALERT_TO" >> /etc/aliases; fi
newaliases
postfix check; systemctl restart postfix
echo "postfix: $(systemctl is-active postfix), relayhost $(postconf -h relayhost), tls $(postconf -h smtp_tls_security_level), listens $(postconf -h inet_interfaces); root -> $(grep '^root:' /etc/aliases | cut -d' ' -f2); mail: $(command -v mail)"
