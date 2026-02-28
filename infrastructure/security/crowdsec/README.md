# CrowdSec

CrowdSec IDS/IPS runs on the VPS gateway alongside Traefik.

**Role:** Intrusion detection, IP reputation, automated banning via bouncer.

**Integration:**
- Traefik bouncer plugin blocks flagged IPs at the proxy layer
- Community blocklists updated automatically
- Local decisions synced via CrowdSec LAPI

**Log sources monitored:** Traefik access logs, SSH, system auth.

See: [docs/network-security.md](../../docs/network-security.md)
