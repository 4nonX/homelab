# Documentation

## Current setup

| Document | Description |
|---|---|
| [architecture.md](architecture.md) | Host, guests, storage, network and routing |
| [gitops-pipeline.md](gitops-pipeline.md) | Komodo, OpenBao rendering, Renovate, Trivy, health checks, adding a stack |
| [security.md](security.md) | Security layers and the deliberate non-decisions |
| [data-protection.md](data-protection.md) | Datasets, snapshot policy, off-site backups (homelab and VPS), restores, what is not covered yet |

## The edge (VPS)

| Document | Description |
|---|---|
| [Pangolin edge](../infrastructure/networking/pangolin/README.md) | Components, traffic flow, hardening, backup, lessons; sanitized config files in `vps/` |
| [Traefik](../infrastructure/networking/traefik/README.md) | The two proxy layers (VPS edge and internal) and why there are two |
| [CrowdSec](../infrastructure/security/crowdsec/README.md) | Engine, fail-open bouncer, CGNAT home allowlist, rollout |

## Service notes

| Document | Description |
|---|---|
| [media-stack.md](media-stack.md) | Arr suite + Emby notes |
| [productivity-services.md](productivity-services.md) | Nextcloud, Immich, Paperless notes |
| [nextcloud-update-guide.md](nextcloud-update-guide.md) | Post-update steps, failure diagnosis |

Earlier designs and guides (the NixOS/ZimaOS-era platform, earlier Pangolin setups, HA and Terraform designs) are in
[legacy/](../legacy/README.md), each with a note on what it describes.
