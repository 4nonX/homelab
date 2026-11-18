# Legacy

The previous setup, before the move to Proxmox VE in November 2026: CasaOS/ZimaOS-era compose files (big-bear app
store), the planned NixOS + DPlaneOS migration, and the documents that described that platform (service index,
hardware, journey, diagrams).

Nothing in here is deployed any more. Kept for reference and history; links inside these files may point to paths
that have moved. The current setup is described in the [README](../README.md) and [docs/](../docs/), and the running
stacks are in [stacks/](../stacks/).

## Pangolin and remote access designs

Guides written for the edge before its current form. Each starts with a note on what it describes and why it is no
longer the running setup. The current edge: [infrastructure/networking/pangolin/](../infrastructure/networking/pangolin/README.md).

| Document | Written | What it was |
|---|---|---|
| [pangolin-infrastructure.md](docs/pangolin-infrastructure.md) | 2026-02 | Tunnel architecture before the Proxmox move |
| [pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md) | 2026-02 | First deployment of the Pangolin VPS |
| [pangolin-configurations.md](docs/pangolin-configurations.md) | 2026-02 | Config reference, Pangolin/Traefik 2 era |
| [pangolin-upgrade-guide.md](docs/pangolin-upgrade-guide.md) | 2026-02 | Upgrade notes up to Pangolin 1.14 |
| [pangolin-z-performance-tuning.md](docs/pangolin-z-performance-tuning.md) | 2026-02 | Kernel and CrowdSec tuning, host-installed setup |
| [pangolin-traefikdashboard-guide.md](docs/pangolin-traefikdashboard-guide.md) | 2026-02 | Traefik log dashboard on the VPS |
| [pangolin-vps-relay-guide.md](docs/pangolin-vps-relay-guide.md) | 2026-02 | Pangolin on a Raspberry Pi, VPS as relay |
| [pangolin-ha-setup.md](docs/pangolin-ha-setup.md) | 2026-05 | Two-VPS failover design with Litestream |
| [network-remote-access.md](docs/network-remote-access.md) | 2026-02 | Pangolin vs Tailscale vs ZeroTier |
| [pangolin-terraform-iac.md](infrastructure/pangolin-terraform/pangolin-terraform-iac.md) | 2026-03 | Terraform for the VPS, MinIO state backend |
| [DR_RUNBOOK.md](infrastructure/pangolin-terraform/DR_RUNBOOK.md) | 2026-03 | Rebuild runbook for the Terraform setup |
| [nextcloud-optimization-guide.md](docs/nextcloud-optimization-guide.md) | 2026-02 | Nextcloud tuning on the ZimaOS host |
