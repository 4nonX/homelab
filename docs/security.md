# Security

Each layer stands on its own. Equally important are the places where the setup is deliberately *not* locked down:
every extra lock is also a way to lock yourself out, and a homelab with one admin needs a way back in.

## Edge: Pangolin on a VPS

- The home network has no open ports and no port-forwarding. newt on the Docker VM holds an outbound WireGuard
  tunnel to Pangolin on a VPS; the home IP is never published.
- Pangolin terminates TLS for the public hostnames. Sensitive resources (the Proxmox UI, when published) get
  Pangolin's own SSO, and the Pangolin account has 2FA. That is the single gate for remote administration.
- Temporary admin access (for example to Komodo) is a Pangolin resource with an IP-bypass rule for the one client
  address that needs it, plus "deny everyone else", deleted after use.
- VPS-side notes: [infrastructure/](../infrastructure/).

## Routing and identity

- One internal Traefik serves LAN and internet with the same routes. Per app one of three modes
  ([gen.py](../stacks/traefik-internal/gen.py)): own login, authentik forward-auth, or forward-auth except `/api`.
- authentik is the OIDC provider for every app that supports it. Local accounts exist only as a fallback for when
  authentik is down.
- **Deliberate:** the LAN is trusted. App ports also answer directly on the Docker VM without authentik; only the
  internet path is gated.

## Secrets: OpenBao

- No secret in git, ever. `.env` files are rendered from OpenBao at deploy time, mode 600, and masked in every log.
- AppRoles are bound to their host address (CIDR) and get short-lived tokens; each policy covers only its path.
- Containers cannot reach the OpenBao API (firewall rule in `DOCKER-USER`); only host processes can.
- The root token is revoked; daily work uses an admin policy without token-minting rights. A root token can be
  regenerated with the recovery keys when needed and is revoked right after.
- File audit device (declared in the config, cannot be disabled through the API), request and response bodies
  HMAC-hashed.
- Auto-unseal through AWS KMS. The IAM user may only encrypt/decrypt with that one key, and every use of the key
  (and every change to it) sends an email.

## Containers

- **Pinned images:** version plus digest; updates only through reviewed Renovate PRs.
- **Trivy gate:** a PR that brings in a new fixable CRITICAL CVE is marked red ([pipeline](gitops-pipeline.md)).
- **No raw Docker socket for dashboards:** dockpeek and homarr reach the Docker API only through
  `linuxserver/socket-proxy` on an internal network (no route out, no published port), read-only (`POST=0`). They can
  list containers, stats and logs; they cannot start, stop or update anything. Updates come from git anyway.
- **Hardening for own images:** run as a non-root user with `cap_drop: ALL` and `no-new-privileges`. Third-party
  images that start as root and drop privileges themselves get `no-new-privileges` only, since removing capabilities
  would break their entrypoint.
- **Post-deploy health check:** a deploy only counts as successful when every container is running, healthy and
  stable.

## Host and data

- Guests are separated by role: secrets, deployment control and workloads cannot read each other's disks.
- ZFS checksums every block. Snapshots are taken on the Proxmox host, so a compromised guest cannot delete them.
- **Deliberate:** no TOTP on the Proxmox root login. Pangolin with 2FA is the only remote way in; a second factor on
  Proxmox itself would add a lockout risk without closing a real gap.
- **Deliberate:** no push notifications. Problems are noticed by use and checked remotely; Komodo shows failed deploys
  and alerts in its UI.
