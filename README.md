# Homelab Infrastructure

[![Status](https://img.shields.io/badge/status-production-success?style=flat-square)](https://github.com/4nonX/homelab)
[![Stacks](https://img.shields.io/badge/stacks-33-blue?style=flat-square)](stacks/)
[![Containers](https://img.shields.io/badge/containers-84-blue?style=flat-square)](stacks/)
[![Hypervisor](https://img.shields.io/badge/Proxmox_VE-9-E57000?style=flat-square&logo=proxmox)](https://www.proxmox.com)
[![Storage](https://img.shields.io/badge/storage-ZFS-orange?style=flat-square)](docs/data-protection.md)
[![GitOps](https://img.shields.io/badge/deploy-GitOps_(Komodo)-6E40C9?style=flat-square)](docs/gitops-pipeline.md)

A self-hosted home infrastructure: 33 Docker Compose stacks (84 containers) on a single Proxmox VE host, deployed
by GitOps from a git repository, secrets in OpenBao, public access through a Pangolin tunnel with zero
port-forwarding.

This repository is the public, sanitized mirror of the setup. Every compose file and script here is the one that runs,
with domains, LAN addresses, host ports and personal values replaced by placeholders (`example.com`, `${..._PORT}`,
`192.0.2.x`, `*.lan`). Secrets are never stored in git, they live in OpenBao.

> **[INDEX.md](INDEX.md)** - map of every file. **[legacy/](legacy/README.md)** - the previous NixOS/ZimaOS-era setup, kept for reference.

## Contents

- [Architecture](#architecture)
- [How a change gets deployed](#how-a-change-gets-deployed)
- [Security model](#security-model)
- [Service matrix](#service-matrix)
- [Storage and data protection](#storage-and-data-protection)
- [Repository structure](#repository-structure)
- [Documentation](#documentation)

---

## Architecture

```
Internet
  │
  ▼
VPS: Pangolin (Traefik + Gerbil), TLS, identity-aware access
  │   WireGuard tunnel, outbound from home; no open ports at home
  ▼
Proxmox VE host  ─ ZFS pool "mainpool" (sanoid snapshots)
  ├─ VM  docker     Docker + Komodo Periphery, all 33 stacks
  │     ├─ newt                tunnel client (Pangolin site)
  │     ├─ traefik-internal    one router for LAN and internet, authentik forward-auth
  │     ├─ authentik           SSO for every app that supports OIDC
  │     └─ 30 app stacks       media, documents, notes, photos, dev, dashboards
  ├─ VM  komodo     Komodo Core: pulls the git repo, deploys changed stacks
  ├─ LXC bao        OpenBao: all stack secrets, auto-unseal via AWS KMS
  └─ LXC samba      SMB shares on ZFS datasets, snapshots as "Previous Versions"
```

- **Outside = inside.** Every public route ends at the internal Traefik on the Docker VM, the same router the LAN uses.
  Who gets authentik in front of an app is decided in one table ([gen.py](stacks/traefik-internal/gen.py)).
- **Separation by guest.** Secrets (OpenBao), deployment control (Komodo) and workloads (Docker) sit in separate
  guests. Containers on the Docker VM are firewalled away from OpenBao; only the host-side renderer talks to it.
- **Nothing calls in.** Komodo polls git, Renovate runs in GitHub Actions, the tunnel is outbound. No webhook and no
  port on the home router.

Details: [docs/architecture.md](docs/architecture.md).

---

## How a change gets deployed

```
git push (or merged Renovate PR)
  └─> Komodo procedure, every 5 min: DeployStackIfChanged for all stacks
        ├─ pre_deploy   komodo-predeploy     render .env from OpenBao (kv/stacks/<stack>)
        ├─ compose      komodo-compose       docker compose, secret values masked in all logs
        └─ post_deploy  komodo-postdeploy    wait until every container is running, healthy and stable
                                             (otherwise the deploy is marked failed)
secret changed in OpenBao
  └─> komodo-bao-watch (timer, 5 min): compares rendered .env with OpenBao, redeploys that stack
```

- Images are pinned to version and digest. **Renovate** opens update PRs weekly; nothing merges on its own.
- **Trivy** compares every image a PR changes with the image it replaces and marks the PR red only when it
  brings in a fixable CRITICAL CVE the running image does not have. Findings that are already in production do not
  block a digest refresh.

Details and all scripts: [docs/gitops-pipeline.md](docs/gitops-pipeline.md), [platform/](platform/).

---

## Security model

```
Edge          Pangolin on a VPS: TLS, SSO + 2FA in front of admin UIs, no inbound ports at home;
              CrowdSec bans scanners at the VPS (fail-open), Fail2Ban on the VPS's SSH
Routing       one internal Traefik for LAN and internet; authentik forward-auth for apps without own login
Identity      authentik (OIDC) for every app that supports it, local accounts only as fallback
Secrets       OpenBao: per-stack paths, AppRoles bound to their host, short-lived tokens, audit log,
              AWS KMS auto-unseal with an email on every use of the key; containers cannot reach it
Containers    images pinned by digest, Trivy gate on updates, Docker API only through read-only
              socket proxies, own images non-root with no capabilities
Data          ZFS checksums, sanoid snapshots taken on the host (a compromised VM cannot delete them)
```

The home LAN is treated as trusted: apps also answer on their LAN ports without authentik. Only the internet path is
gated. Details: [docs/security.md](docs/security.md).

---

## Service matrix

| Area | Stacks |
|---|---|
| Edge, routing, identity | [newt](stacks/newt/), [traefik-internal](stacks/traefik-internal/), [authentik](stacks/authentik/), [tailscale](stacks/tailscale/) |
| Media | [emby-arr](stacks/emby-arr/) (Emby, Sonarr, Radarr, Lidarr, Prowlarr, Bazarr, Seerr, qBittorrent behind Gluetun, FlareSolverr, Recyclarr, Maintainerr), [navidrome](stacks/navidrome/), [swingmusic](stacks/swingmusic/), [pinchflat](stacks/pinchflat/), [stremio](stacks/stremio/), [stremio-server](stacks/stremio-server/) |
| Books | [boox](stacks/boox/) (Audiobookshelf, Grimmory, Bookkeep, ReadMeABook) |
| Files, photos, office | [nextcloud](stacks/nextcloud/) (+ Talk HPB, office, whiteboard), [immich](stacks/immich/), [paperless-ngx](stacks/paperless-ngx/), [bentopdf](stacks/bentopdf/) |
| Notes and knowledge | [trilium](stacks/trilium/), [joplin](stacks/joplin/), [memos](stacks/memos/), [bookstack](stacks/bookstack/), [linkwarden](stacks/linkwarden/) |
| Personal finance and planning | [sure](stacks/sure/), [wallos](stacks/wallos/), [calendar-ce](stacks/calendar-ce/) |
| Development and own projects | [forgejo](stacks/forgejo/), [danvas](stacks/danvas/), [typehaus](stacks/typehaus/), [haven](stacks/haven/), [dan-portfolio](stacks/dan-portfolio/), [dplaneos-website2](stacks/dplaneos-website2/) |
| Operations | [homarr](stacks/homarr/) (dashboard), [dockpeek](stacks/dockpeek/) (container overview), [netbox](stacks/netbox/) (inventory), [searxng](stacks/searxng/) |

Platform services outside Docker: Komodo Core, OpenBao, Samba, sanoid ([platform/](platform/)).

---

## Storage and data protection

One ZFS pool on the host, datasets per purpose, shared into the Docker VM over virtiofs. App state lives on the
Docker VM's data disk, a zvol in the same pool. sanoid snapshots everything that matters (48 hourly, 30 daily,
6 monthly for important data; shorter for the media library). Restores are a `zfs rollback` or a copy out of
`.zfs/snapshot`.

Off-site: a nightly restic backup from ZFS snapshots on the host to a European storage box over SFTP, encrypted
before it leaves, with retention, a weekly integrity check of a data sample and mail only on failure. Local backup
jobs wait for a dedicated backup NAS. The Pangolin VPS backs up its own state every hour the same way, to a separate
account on the same box. Details: [docs/data-protection.md](docs/data-protection.md).

---

## Repository structure

```
stacks/<name>/          compose.yaml + .env.example (+ config) of every running stack, sanitized
platform/
  docker-vm/            Komodo hooks (pre/post deploy, compose wrapper, log redaction), OpenBao renderer,
                        secret watcher, container-to-OpenBao firewall rule, daemon.json
  komodo/               Komodo Core compose, script that sets the post-deploy hook on all stacks
  openbao/              config, ACL policies, daily Raft snapshot, nftables, round-trip check
  aws/                  CloudFormation: KMS key for auto-unseal + alert on every key use
  proxmox/              sanoid snapshot policy, off-site backup (restic script, systemd units)
  github/               Renovate config, Renovate and Trivy workflows, PR scan script
infrastructure/         the Pangolin edge on the VPS: docs, sanitized config, CrowdSec, Fail2Ban, backup
docs/                   architecture, pipeline, security, data protection, service guides
legacy/                 previous NixOS/ZimaOS-era stacks and docs, earlier edge designs (not deployed)
```

The workflows under `platform/github/` are copies for reference; they are not active in this repository.

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | Host, guests, storage, network and routing |
| [GitOps pipeline](docs/gitops-pipeline.md) | Komodo, OpenBao rendering, Renovate, Trivy, health checks, adding a stack |
| [Security](docs/security.md) | Each layer, and the decisions behind what is *not* locked down |
| [Data protection](docs/data-protection.md) | Datasets, snapshot policy, off-site backup, what is not covered yet |
| [Pangolin edge](infrastructure/networking/pangolin/README.md) | The VPS: components, traffic flow, hardening, backup, lessons |
| [Traefik](infrastructure/networking/traefik/README.md) | The two proxy layers and why there are two |
| [CrowdSec](infrastructure/security/crowdsec/README.md) | Fail-open bouncer, CGNAT home allowlist, how it was rolled out |
| [Nextcloud update guide](docs/nextcloud-update-guide.md) | Post-update steps, failure diagnosis |
| [Media stack](docs/media-stack.md), [productivity services](docs/productivity-services.md) | Service configuration notes |
