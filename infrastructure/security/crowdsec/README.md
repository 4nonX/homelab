# CrowdSec on the Pangolin VPS

CrowdSec watches every request that reaches the VPS and bans clients that behave like scanners or attackers. The ban
is enforced by Traefik, before the request reaches Pangolin, the tunnel or any app.

Files: [profiles](../../networking/pangolin/vps/crowdsec-profiles.yaml),
[bouncer middleware](../../networking/pangolin/vps/traefik-dynamic-crowdsec.yml),
[home allowlist](../../networking/pangolin/vps/crowdsec-home.sh), service in the
[compose file](../../networking/pangolin/vps/docker-compose.yml).

## Pieces

| Piece | What it does |
|---|---|
| **Security engine** (`crowdsec` container, pinned version and digest) | tails Traefik's JSON access log, parses it, runs the scenarios, writes decisions to its local API |
| **Collections** | `crowdsecurity/traefik`, `crowdsecurity/http-cve`, `crowdsecurity/base-http-scenarios` (admin-interface probing, path traversal, sensitive files, bad user agents, crawling, 403 brute force) |
| **Profiles** | ban only, 4 hours, per IP or range. No captcha profile: without a captcha provider the bouncer would turn a captcha into a ban anyway |
| **Bouncer** | [Traefik plugin](https://github.com/maxlerebourg/crowdsec-bouncer-traefik-plugin) as an entrypoint middleware on `websecure`, so it applies to every route Pangolin generates |
| **Local API** | only on the Docker network; no port published (the installer template publishes the metrics port, which Docker would expose past the host firewall) |

## Bouncer settings and why

```yaml
crowdsecMode: stream          # decisions cached in Traefik, refreshed every 30 s: no API call per request
updateIntervalSeconds: 30
updateMaxFailure: -1          # fail-open
crowdsecAppsecEnabled: false
clientTrustedIPs: [10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 100.64.0.0/10]
# no forwardedHeadersTrustedIPs
```

- **Fail-open.** In `live` mode, or in `stream` mode with `updateMaxFailure: 0`, the plugin blocks every request as
  soon as it cannot reach CrowdSec. One CrowdSec restart would take every public site down. With `-1` an outage of
  CrowdSec means "no blocking for a while", not "nothing works".
- **No trusted forwarded headers.** Clients connect straight to this Traefik (DNS points at the VPS, no CDN in
  front), so `X-Forwarded-For` is never trustworthy here. Trusting it (the installer uses `0.0.0.0/0`) lets anyone
  pick the IP CrowdSec sees: dodge a ban, or get someone else banned.
- **AppSec off for now.** The WAF rules are installed but not wired in. They inspect request bodies, and the services
  behind this edge include WebDAV sync and large photo/video uploads; that needs its own observation period first.

## The home line

newt's tunnel runs from the home line, and the home line sits behind the ISP's carrier-grade NAT: its public IPv4 is
shared with other customers and changes without notice. If CrowdSec banned that address, because of another customer
behind it or a community-blocklist entry, the tunnel and with it all remote access would go down.

[crowdsec-home.sh](../../networking/pangolin/vps/crowdsec-home.sh) (cron, every 30 minutes) therefore reads the
endpoint of the newt site from Pangolin's database, which Pangolin updates on every connection, and puts that IP on
the allowlist `home` for three hours. No DNS name is involved, so the allowlist is current even right after the
carrier hands out a new address.

Trade-off, accepted: other customers behind the same CGNAT address also pass CrowdSec. They still meet Pangolin's
auth, authentik and the apps' own logins; without the allowlist, strangers on a shared IP could cut the tunnel.

## How it was rolled out

1. **Observe.** Engine running, bouncer disabled. Within the first hour CrowdSec had raised bans on a handful of
   data-centre scanners (cloud providers in several countries, internet-wide scanners) and none on own devices.
2. **Enforce.** Bouncer switched on with the settings above. The key from an older setup was rejected (`403` on every
   decision pull, visible in CrowdSec's log); a new bouncer key fixed it. A key change needs a Traefik restart: a file
   reload starts a new plugin instance but leaves the old one polling with the old key.
3. **Test.** A three-minute manual ban on a phone's mobile IPv4 address returned `403` on every public hostname; after
   deleting the decision the phone got through again. (The public hostnames have no AAAA records, so clients arrive
   over IPv4: bans and allowlists need IPv4 addresses.)

## Day to day

```bash
docker exec crowdsec cscli alerts list -l 20          # what triggered recently
docker exec crowdsec cscli decisions list             # active bans
docker exec crowdsec cscli decisions delete --ip <ip> # lift a ban
docker exec crowdsec cscli metrics show acquisition   # is the access log being read and parsed
docker exec crowdsec cscli bouncers list              # last_pull shows the bouncer is fetching decisions
```
