# Index

Map of every file in this repository. Stacks and legacy files are grouped by folder.

---

## Top level

| File | Description |
|---|---|
| [.gitignore](.gitignore) | Ignores rendered .env files and local state |
| [.gitleaks.toml](.gitleaks.toml) | Secret-scan configuration |
| [INDEX.md](INDEX.md) | This file |
| [README.md](README.md) | Overview: architecture, deployment, security, service matrix, storage |

---

## Docs - `docs/`

| File | Description |
|---|---|
| [docs/INDEX.md](docs/INDEX.md) | Overview of the documents in this folder |
| [docs/architecture.md](docs/architecture.md) | Host, guests, storage, network and routing |
| [docs/data-protection.md](docs/data-protection.md) | Datasets, snapshot policy, off-site backups (homelab and VPS), restores, what is not covered yet |
| [docs/gitops-pipeline.md](docs/gitops-pipeline.md) | Komodo, OpenBao rendering, Renovate, Trivy, health checks, adding a stack |
| [docs/security.md](docs/security.md) | Security layers and deliberate non-decisions |
| [docs/media-stack.md](docs/media-stack.md) | Arr suite + Emby notes |
| [docs/productivity-services.md](docs/productivity-services.md) | Nextcloud, Immich, Paperless notes |
| [docs/nextcloud-update-guide.md](docs/nextcloud-update-guide.md) | Post-update steps, failure diagnosis |

---

## Stacks - `stacks/`

Each folder: `compose.yaml` (sanitized, pinned images) and `.env.example` (keys only, values in OpenBao).

| Stack | Files |
|---|---|
| [authentik](stacks/authentik/) | [.env.example](stacks/authentik/.env.example), [compose.yaml](stacks/authentik/compose.yaml) |
| [bentopdf](stacks/bentopdf/) | [.env.example](stacks/bentopdf/.env.example), [compose.yaml](stacks/bentopdf/compose.yaml) |
| [bookstack](stacks/bookstack/) | [.env.example](stacks/bookstack/.env.example), [compose.yaml](stacks/bookstack/compose.yaml) |
| [boox](stacks/boox/) | [.env.example](stacks/boox/.env.example), [compose.yaml](stacks/boox/compose.yaml) |
| [calendar-ce](stacks/calendar-ce/) | [.env.example](stacks/calendar-ce/.env.example), [compose.yaml](stacks/calendar-ce/compose.yaml) |
| [dan-portfolio](stacks/dan-portfolio/) | [.env.example](stacks/dan-portfolio/.env.example), [apache-security.conf](stacks/dan-portfolio/apache-security.conf), [compose.yaml](stacks/dan-portfolio/compose.yaml), [php-security.ini](stacks/dan-portfolio/php-security.ini) |
| [danvas](stacks/danvas/) | [.env.example](stacks/danvas/.env.example), [compose.yaml](stacks/danvas/compose.yaml) |
| [dockpeek](stacks/dockpeek/) | [.env.example](stacks/dockpeek/.env.example), [compose.yaml](stacks/dockpeek/compose.yaml) |
| [dplaneos-website2](stacks/dplaneos-website2/) | [.env.example](stacks/dplaneos-website2/.env.example), [compose.yaml](stacks/dplaneos-website2/compose.yaml) |
| [emby-arr](stacks/emby-arr/) | [.env.example](stacks/emby-arr/.env.example), [compose.yaml](stacks/emby-arr/compose.yaml) |
| [forgejo](stacks/forgejo/) | [.env.example](stacks/forgejo/.env.example), [compose.yaml](stacks/forgejo/compose.yaml) |
| [haven](stacks/haven/) | [.env.example](stacks/haven/.env.example), [compose.yaml](stacks/haven/compose.yaml) |
| [homarr](stacks/homarr/) | [.env.example](stacks/homarr/.env.example), [compose.yaml](stacks/homarr/compose.yaml) |
| [immich](stacks/immich/) | [.env.example](stacks/immich/.env.example), [compose.yaml](stacks/immich/compose.yaml) |
| [joplin](stacks/joplin/) | [.env.example](stacks/joplin/.env.example), [compose.yaml](stacks/joplin/compose.yaml) |
| [linkwarden](stacks/linkwarden/) | [.env.example](stacks/linkwarden/.env.example), [compose.yaml](stacks/linkwarden/compose.yaml) |
| [memos](stacks/memos/) | [compose.yaml](stacks/memos/compose.yaml) |
| [navidrome](stacks/navidrome/) | [compose.yaml](stacks/navidrome/compose.yaml) |
| [netbox](stacks/netbox/) | [.env.example](stacks/netbox/.env.example), [compose.yaml](stacks/netbox/compose.yaml), [sso.py.example](stacks/netbox/sso.py.example) |
| [newt](stacks/newt/) | [.env.example](stacks/newt/.env.example), [compose.yaml](stacks/newt/compose.yaml) |
| [nextcloud](stacks/nextcloud/) | [.env.example](stacks/nextcloud/.env.example), [compose.yaml](stacks/nextcloud/compose.yaml) |
| [paperless-ngx](stacks/paperless-ngx/) | [.env.example](stacks/paperless-ngx/.env.example), [compose.yaml](stacks/paperless-ngx/compose.yaml) |
| [pinchflat](stacks/pinchflat/) | [compose.yaml](stacks/pinchflat/compose.yaml) |
| [searxng](stacks/searxng/) | [compose.yaml](stacks/searxng/compose.yaml) |
| [stremio](stacks/stremio/) | [compose.yaml](stacks/stremio/compose.yaml) |
| [stremio-server](stacks/stremio-server/) | [compose.yaml](stacks/stremio-server/compose.yaml) |
| [sure](stacks/sure/) | [.env.example](stacks/sure/.env.example), [compose.yaml](stacks/sure/compose.yaml) |
| [swingmusic](stacks/swingmusic/) | [compose.yaml](stacks/swingmusic/compose.yaml) |
| [tailscale](stacks/tailscale/) | [compose.yaml](stacks/tailscale/compose.yaml) |
| [traefik-internal](stacks/traefik-internal/) | [.env.example](stacks/traefik-internal/.env.example), [compose.yaml](stacks/traefik-internal/compose.yaml), [config/traefik.yml](stacks/traefik-internal/config/traefik.yml), [gen.py](stacks/traefik-internal/gen.py) |
| [trilium](stacks/trilium/) | [.env.example](stacks/trilium/.env.example), [compose.yaml](stacks/trilium/compose.yaml) |
| [typehaus](stacks/typehaus/) | [.env.example](stacks/typehaus/.env.example), [compose.yaml](stacks/typehaus/compose.yaml) |
| [wallos](stacks/wallos/) | [compose.yaml](stacks/wallos/compose.yaml) |

Route generator: [stacks/traefik-internal/gen.py](stacks/traefik-internal/gen.py) - Route table generator: one table decides authentik per app

---

## Platform - `platform/`

| File | Description |
|---|---|
| [platform/aws/openbao-unseal.yaml](platform/aws/openbao-unseal.yaml) | CloudFormation: KMS key, least-privilege IAM user, email on every key use |
| [platform/docker-vm/bao-render-env](platform/docker-vm/bao-render-env) | Render .env files from OpenBao (literal values, atomic writes, --check mode) |
| [platform/docker-vm/daemon.json](platform/docker-vm/daemon.json) | Docker daemon: log rotation, address pools off the LAN range |
| [platform/docker-vm/docker-block-bao.service](platform/docker-vm/docker-block-bao.service) | Firewall rule: containers cannot reach OpenBao |
| [platform/docker-vm/komodo-bao-watch](platform/docker-vm/komodo-bao-watch) | Redeploy stacks whose secrets changed in OpenBao |
| [platform/docker-vm/komodo-bao-watch.service](platform/docker-vm/komodo-bao-watch.service) | Runs komodo-bao-watch |
| [platform/docker-vm/komodo-bao-watch.timer](platform/docker-vm/komodo-bao-watch.timer) | Every 5 minutes |
| [platform/docker-vm/komodo-compose](platform/docker-vm/komodo-compose) | Compose wrapper that masks secret values in Komodo's logs |
| [platform/docker-vm/komodo-postdeploy](platform/docker-vm/komodo-postdeploy) | Komodo post_deploy: wait until all containers are running, healthy, stable |
| [platform/docker-vm/komodo-predeploy](platform/docker-vm/komodo-predeploy) | Komodo pre_deploy: render the stack's .env from OpenBao |
| [platform/docker-vm/komodo-redact.py](platform/docker-vm/komodo-redact.py) | Masking used by komodo-compose |
| [platform/github/renovate.json](platform/github/renovate.json) | Renovate: pinned digests, grouped refreshes, DB majors blocked |
| [platform/github/scripts/scan-pr-images.sh](platform/github/scripts/scan-pr-images.sh) | Pairs old/new images, fails only on newly introduced CRITICAL CVEs |
| [platform/github/workflows/renovate.yml](platform/github/workflows/renovate.yml) | Weekly Renovate run (GitHub Actions) |
| [platform/github/workflows/trivy.yml](platform/github/workflows/trivy.yml) | Trivy check of changed images on PRs |
| [platform/komodo/compose.yaml](platform/komodo/compose.yaml) | Komodo Core + MongoDB |
| [platform/komodo/set-postdeploy.sh](platform/komodo/set-postdeploy.sh) | Add the post-deploy hook to every Komodo stack that lacks it |
| [platform/openbao/bao-roundtrip-check.sh](platform/openbao/bao-roundtrip-check.sh) | Verify rendered .env files match OpenBao |
| [platform/openbao/bao-snapshot](platform/openbao/bao-snapshot) | Daily Raft snapshot with a snapshot-only AppRole |
| [platform/openbao/bao-snapshot.service](platform/openbao/bao-snapshot.service) | Runs bao-snapshot |
| [platform/openbao/bao-snapshot.timer](platform/openbao/bao-snapshot.timer) | Daily |
| [platform/openbao/nftables.conf](platform/openbao/nftables.conf) | OpenBao LXC firewall |
| [platform/openbao/openbao.hcl](platform/openbao/openbao.hcl) | OpenBao config: Raft, TLS, AWS KMS auto-unseal, audit device |
| [platform/openbao/policies/admin.hcl](platform/openbao/policies/admin.hcl) | Policy for the admin user |
| [platform/openbao/policies/raft-snapshot.hcl](platform/openbao/policies/raft-snapshot.hcl) | Policy for the snapshot AppRole: Raft snapshots only |
| [platform/openbao/policies/stacks-read.hcl](platform/openbao/policies/stacks-read.hcl) | Policy for the Docker host: read stack secrets only |
| [platform/proxmox/sanoid.conf](platform/proxmox/sanoid.conf) | ZFS snapshot policy |
| [platform/proxmox/backup/homelab-backup](platform/proxmox/backup/homelab-backup) | Off-site backup: consistent ZFS snapshots, read-only zvol clone, restic upload, retention, check |
| [platform/proxmox/backup/env.example](platform/proxmox/backup/env.example) | Backup settings; the target is one line |
| [platform/proxmox/backup/homelab-backup.service](platform/proxmox/backup/homelab-backup.service) | Backup run, mails on failure |
| [platform/proxmox/backup/homelab-backup.timer](platform/proxmox/backup/homelab-backup.timer) | Nightly |
| [platform/proxmox/backup/homelab-backup-check.service](platform/proxmox/backup/homelab-backup-check.service) | restic check reading a sample of the stored data |
| [platform/proxmox/backup/homelab-backup-check.timer](platform/proxmox/backup/homelab-backup-check.timer) | Weekly |
| [platform/proxmox/backup/homelab-backup-failed.service](platform/proxmox/backup/homelab-backup-failed.service) | Mail on failure only |

---

## VPS edge - `infrastructure/`

| File | Description |
|---|---|
| [infrastructure/networking/pangolin/README.md](infrastructure/networking/pangolin/README.md) | The Pangolin edge: components, traffic flow, hardening, backup, lessons |
| [infrastructure/networking/traefik/README.md](infrastructure/networking/traefik/README.md) | The two Traefik layers (VPS edge and internal) and why there are two |
| [infrastructure/security/crowdsec/README.md](infrastructure/security/crowdsec/README.md) | CrowdSec on the VPS: engine, fail-open bouncer, CGNAT home allowlist, rollout |
| [infrastructure/networking/pangolin/vps/docker-compose.yml](infrastructure/networking/pangolin/vps/docker-compose.yml) | Compose file of the VPS: Pangolin, Gerbil, Traefik, CrowdSec |
| [infrastructure/networking/pangolin/vps/traefik-dynamic-crowdsec.yml](infrastructure/networking/pangolin/vps/traefik-dynamic-crowdsec.yml) | Bouncer middleware: stream mode, fail-open, no trusted forwarded headers |
| [infrastructure/networking/pangolin/vps/crowdsec-profiles.yaml](infrastructure/networking/pangolin/vps/crowdsec-profiles.yaml) | CrowdSec profiles: ban only, 4 hours |
| [infrastructure/networking/pangolin/vps/crowdsec-home.sh](infrastructure/networking/pangolin/vps/crowdsec-home.sh) | Keeps the home line (newt endpoint from Pangolin's DB) on the CrowdSec allowlist |
| [infrastructure/networking/pangolin/vps/fail2ban-10-local.conf](infrastructure/networking/pangolin/vps/fail2ban-10-local.conf) | Fail2Ban sshd jail with escalating ban times, Tailscale range exempt |
| [infrastructure/networking/pangolin/vps/sshd-10-hardening.conf](infrastructure/networking/pangolin/vps/sshd-10-hardening.conf) | SSH limits: auth tries, login grace time |
| [infrastructure/networking/pangolin/vps/logrotate-pangolin-traefik](infrastructure/networking/pangolin/vps/logrotate-pangolin-traefik) | Daily rotation of the Traefik access log |
| [infrastructure/networking/pangolin/vps/backup/pangolin-backup](infrastructure/networking/pangolin/vps/backup/pangolin-backup) | Hourly restic backup: consistent SQLite copy, quick_check, upload, retention, check |
| [infrastructure/networking/pangolin/vps/backup/env.example](infrastructure/networking/pangolin/vps/backup/env.example) | Backup settings; the target is one line |
| [infrastructure/networking/pangolin/vps/backup/pangolin-backup.service](infrastructure/networking/pangolin/vps/backup/pangolin-backup.service) | Backup run, mails on failure |
| [infrastructure/networking/pangolin/vps/backup/pangolin-backup.timer](infrastructure/networking/pangolin/vps/backup/pangolin-backup.timer) | Hourly |
| [infrastructure/networking/pangolin/vps/backup/pangolin-backup-check.service](infrastructure/networking/pangolin/vps/backup/pangolin-backup-check.service) | restic check reading all stored data |
| [infrastructure/networking/pangolin/vps/backup/pangolin-backup-check.timer](infrastructure/networking/pangolin/vps/backup/pangolin-backup-check.timer) | Weekly |
| [infrastructure/networking/pangolin/vps/backup/pangolin-backup-failed.service](infrastructure/networking/pangolin/vps/backup/pangolin-backup-failed.service) | Mails the journal excerpt when the backup or check fails |
| [infrastructure/networking/pangolin/vps/backup/mail-relay-setup.sh](infrastructure/networking/pangolin/vps/backup/mail-relay-setup.sh) | Local postfix relay (loopback only, TLS required) for failure mails |

---

## Repository tooling

| File | Description |
|---|---|
| [.github/workflows/secret-scan.yml](.github/workflows/secret-scan.yml) | gitleaks on every push and PR |

---

## Legacy - `legacy/`

Previous setups and designs, not deployed. See [legacy/README.md](legacy/README.md), which also lists the earlier
Pangolin and remote-access guides with a note on each.

- [legacy/.env.example](legacy/.env.example)
- [legacy/README.md](legacy/README.md)
- [legacy/docs/DOCKER-SERVICES.md](legacy/docs/DOCKER-SERVICES.md)
- [legacy/docs/EXECUTIVE_SUMMARY.md](legacy/docs/EXECUTIVE_SUMMARY.md)
- [legacy/docs/INDEX.md](legacy/docs/INDEX.md)
- [legacy/docs/NIXOS-MIGRATION.md](legacy/docs/NIXOS-MIGRATION.md)
- [legacy/docs/PORTFOLIO.md](legacy/docs/PORTFOLIO.md)
- [legacy/docs/architecture-diagram.html](legacy/docs/architecture-diagram.html)
- [legacy/docs/dataflow-diagram.html](legacy/docs/dataflow-diagram.html)
- [legacy/docs/docker-infrastructure.md](legacy/docs/docker-infrastructure.md)
- [legacy/docs/hardware-specs.md](legacy/docs/hardware-specs.md)
- [legacy/docs/homelab-complete-journey.md](legacy/docs/homelab-complete-journey.md)
- [legacy/docs/homelab-dashboard-guide.md](legacy/docs/homelab-dashboard-guide.md)
- [legacy/docs/network-remote-access.md](legacy/docs/network-remote-access.md)
- [legacy/docs/network-security.md](legacy/docs/network-security.md)
- [legacy/docs/nextcloud-optimization-guide.md](legacy/docs/nextcloud-optimization-guide.md)
- [legacy/docs/pangolin-configurations.md](legacy/docs/pangolin-configurations.md)
- [legacy/docs/pangolin-deployment-guide.md](legacy/docs/pangolin-deployment-guide.md)
- [legacy/docs/pangolin-ha-setup.md](legacy/docs/pangolin-ha-setup.md)
- [legacy/docs/pangolin-infrastructure.md](legacy/docs/pangolin-infrastructure.md)
- [legacy/docs/pangolin-traefikdashboard-guide.md](legacy/docs/pangolin-traefikdashboard-guide.md)
- [legacy/docs/pangolin-upgrade-guide.md](legacy/docs/pangolin-upgrade-guide.md)
- [legacy/docs/pangolin-vps-relay-guide.md](legacy/docs/pangolin-vps-relay-guide.md)
- [legacy/docs/pangolin-z-performance-tuning.md](legacy/docs/pangolin-z-performance-tuning.md)
- [legacy/docs/security-diagram.html](legacy/docs/security-diagram.html)
- [legacy/docs/why-dplaneos.md](legacy/docs/why-dplaneos.md)
- [legacy/infrastructure/monitoring](legacy/infrastructure/monitoring)
- [legacy/infrastructure/networking](legacy/infrastructure/networking)
- [legacy/infrastructure/pangolin-terraform](legacy/infrastructure/pangolin-terraform)
- [legacy/infrastructure/security](legacy/infrastructure/security)
- [legacy/infrastructure/storage](legacy/infrastructure/storage)
- [legacy/scripts](legacy/scripts)
- [legacy/services](legacy/services)
