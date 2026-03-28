# Pangolin: Self-Hosted WireGuard Tunnel

Pangolin replaces commercial tunnels (Cloudflare Tunnel, ngrok) with a fully self-hosted equivalent.
No home IP exposure. No port forwarding on the home router.

## Components

| Component | Host | Role |
|---|---|---|
| Pangolin server | Raspberry Pi 5 (local) | Identity, SSL, routing control plane |
| Gerbil | VPS (IONOS, Berlin) | WireGuard endpoint, public-facing |
| Newt | NAS + other hosts | Tunnel client, connects to Gerbil |
| Traefik (VPS) | VPS | TLS termination, HTTPS ingress |

## Traffic Flow

```
Client (Internet)
  → VPS:443 (Traefik)
  → WireGuard tunnel (Gerbil ↔ Newt, encrypted)
  → Raspberry Pi 5 (Pangolin / inner Traefik)
  → Target service on LAN
```

## Key Properties

- Home router has **zero open ports**.
- Home IP is **never exposed** to the internet.
- All traffic is encrypted end-to-end via WireGuard.
- TLS 1.3 is enforced at both the VPS and inner layers.
- CrowdSec blocks malicious IPs before they ever reach the LAN.

## Documentation

| Document | Description |
|---|---|
| [pangolin-infrastructure.md](../../docs/pangolin-infrastructure.md) | Architecture deep-dive |
| [pangolin-deployment-guide.md](../../docs/pangolin-deployment-guide.md) | Step-by-step VPS setup |
| [pangolin-configurations.md](../../docs/pangolin-configurations.md) | Config file reference |
| [pangolin-vps-relay-guide.md](../../docs/pangolin-vps-relay-guide.md) | Relay server setup |
| [pangolin-upgrade-guide.md](../../docs/pangolin-upgrade-guide.md) | Version upgrade procedures |
| [pangolin-z-performance-tuning.md](../../docs/pangolin-z-performance-tuning.md) | Kernel/sysctl tuning |
| [pangolin-traefikdashboard-guide.md](../../docs/pangolin-traefikdashboard-guide.md) | Traefik dashboard setup |
| [terraform/pangolin-terraform-iac.md](terraform/pangolin-terraform-iac.md) | Terraform IaC: DNS, VPS provisioning, backup strategy |
| [terraform/DR_RUNBOOK.md](terraform/DR_RUNBOOK.md) | Disaster recovery runbook: full VPS rebuild in ~15 min |
