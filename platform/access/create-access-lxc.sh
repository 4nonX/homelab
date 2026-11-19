#!/bin/bash
# Runs on the Proxmox host: creates LXC access (ID 104, 192.0.2.20). Stops without changing anything if ID or address are taken.
set -euo pipefail
VMID=104; IP=192.0.2.20; DIR=$(cd "$(dirname "$0")" && pwd)
[ ! -e /etc/pve/lxc/$VMID.conf ] && [ ! -e /etc/pve/qemu-server/$VMID.conf ] || { echo "ID $VMID is already in use"; exit 1; }
if ping -c 2 -W 1 "$IP" >/dev/null 2>&1; then echo "$IP already answers on the network"; exit 1; fi
pveam update >/dev/null
T=$(pveam available --section system | awk '/debian-13-standard_.*_amd64/{print $2}' | sort -V | tail -1)
[ -n "$T" ] || { echo "no Debian 13 template found"; exit 1; }
pveam list local | grep -q "$T" || pveam download local "$T"
pct create $VMID "local:vztmpl/$T" --hostname access --description "Admin access path: second newt, independent of VM docker. infra/access/ in the repo." \
  --ostype debian --unprivileged 1 --features nesting=1 --cores 1 --memory 512 --swap 256 --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,firewall=1,gw=192.0.2.1,ip=$IP/24,type=veth --nameserver 192.0.2.1 --searchdomain lan \
  --onboot 1 --startup order=1 --timezone Europe/Berlin
pct start $VMID
for i in $(seq 1 30); do pct exec $VMID -- getent hosts deb.debian.org >/dev/null 2>&1 && break; sleep 2; done
pct exec $VMID -- mkdir -p /root/access-files
for f in nftables.conf newt.service setup-inside.sh; do pct push $VMID "$DIR/$f" "/root/access-files/$f"; done
pct exec $VMID -- bash /root/access-files/setup-inside.sh
