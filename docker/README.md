# docker/ — Legacy Source Directory

> **Note:** This directory is preserved as the original source. All compose files have been
> reorganised into the canonical structure at the repo root:
>
> - `infrastructure/` — networking, security, monitoring, storage
> - `services/` — media, productivity, management, development
>
> The `docker/` tree will be removed in a future cleanup commit once all paths
> have been validated in production. Do not add new stacks here.

## Canonical locations

| Old path | New path |
|---|---|
| `docker/media-management/` | `services/media/` |
| `docker/media-servers/` | `services/media/` |
| `docker/productivity/` | `services/productivity/` |
| `docker/security/` | `infrastructure/security/` + `infrastructure/networking/` |
| `docker/monitoring/` | `infrastructure/monitoring/` |
| `docker/infrastructure/` | `services/management/` |
| `docker/development/` | `services/development/` |
