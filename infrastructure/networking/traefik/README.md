# Traefik

Traefik v3 runs on the VPS gateway (IONOS, Berlin) as part of the Pangolin stack.
It is not managed from this repo directly — configuration lives on the VPS.

**Role:** TLS termination, HTTPS routing, Let's Encrypt certificate management.

**Key config points:**
- Entrypoints: `web` (80, redirect → 443), `websecure` (443)
- Certificate resolver: `letsencrypt` (HTTP challenge via Gerbil/WireGuard)
- Dashboard protected behind Pangolin identity
- Labels on local containers define routing rules (see individual compose files)

See: [docs/pangolin-traefikdashboard-guide.md](../../docs/pangolin-traefikdashboard-guide.md)
