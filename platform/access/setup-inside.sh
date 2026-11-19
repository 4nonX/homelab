#!/bin/bash
# Runs inside LXC access (started by create-access-lxc.sh). Installs newt and the firewall; newt starts once its credentials exist.
set -euo pipefail
NEWT_VERSION=1.20.0
NEWT_SHA256=f380273f7f92917d743ab1b0b92da3ca9e8ac72d0a9909c253633de29b4a70cb
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get -y -qq upgrade >/dev/null
apt-get -y -qq install --no-install-recommends nftables curl ca-certificates unattended-upgrades >/dev/null
curl -fsSL -o /tmp/newt "https://github.com/fosrl/newt/releases/download/$NEWT_VERSION/newt_linux_amd64"
echo "$NEWT_SHA256  /tmp/newt" | sha256sum -c -
install -m 755 /tmp/newt /usr/local/bin/newt && rm -f /tmp/newt
id newt >/dev/null 2>&1 || useradd --system --home-dir /var/lib/newt --shell /usr/sbin/nologin newt
install -d -m 700 /etc/newt
nft -c -f /root/access-files/nftables.conf
install -m 644 /root/access-files/nftables.conf /etc/nftables.conf
install -m 644 /root/access-files/newt.service /etc/systemd/system/newt.service
systemctl daemon-reload
systemctl enable nftables
systemctl restart nftables   # the template already runs it with the default accept-all rules
systemctl enable newt
printf 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
' > /etc/apt/apt.conf.d/20auto-upgrades
systemctl enable --now unattended-upgrades
echo "--- checks"
echo "pangolin resolves to: $(getent hosts pangolin.example.com | awk '{print $1}')"
code() { curl -k -s -o /dev/null -m 6 -w '%{http_code}' "$1" || true; }
echo "Proxmox UI (must be 200):     $(code https://192.0.2.16:8006/)"
echo "Komodo UI (must be 200):      $(code http://192.0.2.18:9120/)"
echo "Pangolin (must be 200):       $(code https://pangolin.example.com/)"
echo "VM docker (must be 000):      $(code https://192.0.2.15/)"
echo "Router UI (must be 000):      $(code http://192.0.2.1/)"
