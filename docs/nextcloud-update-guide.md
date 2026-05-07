# Nextcloud Update Guide

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Nextcloud](https://img.shields.io/badge/Nextcloud-Latest-0082C9?logo=nextcloud&logoColor=white)](https://nextcloud.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained-Yes-brightgreen.svg)](https://github.com/yourusername/homelab)

> Step-by-step procedure for updating Nextcloud in Docker — covers the ordered post-update `occ` commands, common failure modes, and how to diagnose a 502 behind Traefik/Pangolin.

---

## Table of Contents

- [Overview](#-overview)
- [Before You Update](#-before-you-update)
- [Running the Update](#-running-the-update)
- [Post-Update Command Sequence](#-post-update-command-sequence)
- [Diagnosing Failures](#-diagnosing-failures)
- [Traefik 502 / 504 Errors](#️-traefik-502--504-errors)
- [Command Reference](#-command-reference)
- [Verification Checklist](#-verification-checklist)
- [Related Documentation](#related-documentation)

---

## Overview

Nextcloud requires a specific sequence of maintenance commands after every container image update. Skipping or reordering these steps leads to database inconsistencies, broken sessions, or a container that starts but returns errors.

This guide is written for the setup documented in [nextcloud-optimization-guide.md](nextcloud-optimization-guide.md): Nextcloud running in Docker, exposed through Traefik via a Pangolin/Newt tunnel, with PostgreSQL and Redis as backing services.

---

## Before You Update

**Backup first.** Updates are largely safe, but a database snapshot takes seconds and costs nothing.

```bash
# Snapshot the PostgreSQL database
docker exec nextcloud-db pg_dump -U nextcloud nextcloud > nextcloud_backup_$(date +%Y%m%d).sql

# Note the current image version before pulling
docker inspect nextcloud --format '{{ .Config.Image }}'
```

Put Nextcloud into maintenance mode before pulling a new image. This prevents users from hitting a half-migrated instance during the update window.

```bash
docker exec -u www-data nextcloud php occ maintenance:mode --on
```

---

## Running the Update

Pull the new image and recreate the container:

```bash
# Pull the latest image
docker compose -f nextcloud.yml pull nextcloud

# Recreate only the Nextcloud container (leaves DB/Redis running)
docker compose -f nextcloud.yml up -d --no-deps nextcloud
```

Wait for the container to reach a running state before executing any `occ` commands:

```bash
docker ps | grep nextcloud
# STATUS should show "Up" — not "Restarting" or "Exited"
```

---

## Post-Update Command Sequence

Run these commands **in order** after every Nextcloud image update. Each step depends on the previous one completing successfully.

### 1. Run the upgrade

```bash
docker exec -u www-data nextcloud php occ upgrade
```

This applies any database schema migrations bundled with the new image. If this command fails, stop here and check [Diagnosing Failures](#-diagnosing-failures).

### 2. Disable maintenance mode

```bash
docker exec -u www-data nextcloud php occ maintenance:mode --off
```

> **⚠️ Do not skip this.** Nextcloud returns HTTP 503 to all users while maintenance mode is active.

### 3. Add missing database indices

```bash
docker exec -u www-data nextcloud php occ db:add-missing-indices
```

Nextcloud occasionally adds new indices between releases. This command is safe to run repeatedly and completes in seconds on a typical homelab dataset.

### 4. Add missing database columns

```bash
docker exec -u www-data nextcloud php occ db:add-missing-columns
```

### 5. Add missing primary keys

```bash
docker exec -u www-data nextcloud php occ db:add-missing-primary-keys
```

### 6. Convert filecache columns (PostgreSQL)

```bash
docker exec -u www-data nextcloud php occ db:convert-filecache-bigint
```

Converts integer columns in the filecache table to bigint. Required for large file counts. Safe to run; exits immediately if already done.

### 7. Repair and housekeeping

```bash
docker exec -u www-data nextcloud php occ maintenance:repair
```

Runs the internal repair steps registered by Nextcloud and installed apps. Catches anything the upgrade step missed.

### 8. Update all installed apps

```bash
docker exec -u www-data nextcloud php occ app:update --all
```

Applies any app updates that have been released since the last run. Do this after the core upgrade has completed successfully.

---

## Diagnosing Failures

### Container is not running

```bash
# Check container state
docker ps -a | grep nextcloud

# Read the last 50 log lines
docker logs --tail 50 nextcloud
```

Common log patterns and their fixes:

| Log pattern | Cause | Fix |
|-------------|-------|-----|
| `could not connect to server` | PostgreSQL not ready | Start DB first: `docker compose -f nextcloud.yml up -d nextcloud-db` |
| `Connection refused` on Redis port | Redis container down | `docker compose -f nextcloud.yml up -d redis` |
| `Permission denied` on `/var/www/html` | Volume ownership changed after update | `docker exec nextcloud chown -R www-data:www-data /var/www/html` |
| `PHP Fatal error` | Incompatible app after a major version jump | `docker exec -u www-data nextcloud php occ app:disable <appname>` |

### Stuck in maintenance mode

If the container was killed mid-upgrade, Nextcloud may remain in maintenance mode even after restart.

```bash
docker exec -u www-data nextcloud php occ maintenance:mode --off
```

Verify the mode is cleared:

```bash
docker exec -u www-data nextcloud php occ status
```

### Database migration did not complete

```bash
docker exec -u www-data nextcloud php occ upgrade
docker exec -u www-data nextcloud php occ db:add-missing-indices
```

Check for migration errors in the Nextcloud log:

```bash
docker exec nextcloud tail -30 /var/www/html/data/nextcloud.log
```

### Redis / memcache errors

Confirm Redis is reachable from the Nextcloud container:

```bash
docker exec nextcloud redis-cli -h redis ping
```

If `redis-cli` is not available inside the container:

```bash
docker exec nextcloud php -r "
\$r = new Redis();
\$r->connect('redis', 6379);
echo \$r->ping();
"
```

Expected output: `+PONG`. Any other result means the Redis container is down or the hostname in `config.php` does not match the service name in the Compose file.

---

## Traefik 502 / 504 Errors

A 502 or 504 through Traefik when using a Pangolin/Newt tunnel almost always means **the Nextcloud container itself is not responding** — not a tunnel or proxy issue.

```
Browser → Traefik (VPS) → Pangolin tunnel → Newt (home) → Nextcloud container
                                                                    ↑
                                                             failure is here
```

| Code | Meaning |
|------|---------|
| **502 Bad Gateway** | Nextcloud is not responding on its port (container down or still starting) |
| **504 Gateway Timeout** | Nextcloud is responding but too slowly (stuck in a long upgrade or repair) |

**Diagnostic sequence for a 502 behind Traefik:**

```bash
# 1. Confirm the container is running
docker ps -a | grep nextcloud

# 2. Check logs for the immediate cause
docker logs --tail 50 nextcloud

# 3. If running, test connectivity directly (bypass Traefik entirely)
docker exec nextcloud curl -s http://localhost/status.php
```

A healthy `status.php` response:

```json
{"installed":true,"version":"29.x.x","versionstring":"29.x.x","edition":"","maintenance":false}
```

`"maintenance":true` in this output means maintenance mode is still active — run step 2 of the [post-update sequence](#2-disable-maintenance-mode).

---

## Command Reference

All commands run as `www-data` inside the container:

```bash
docker exec -u www-data nextcloud php occ <command>
```

| Command | When to run |
|---------|-------------|
| `maintenance:mode --on` | Before pulling a new image |
| `upgrade` | After every image update — always first |
| `maintenance:mode --off` | Immediately after upgrade completes |
| `db:add-missing-indices` | After every update |
| `db:add-missing-columns` | After every update |
| `db:add-missing-primary-keys` | After every update |
| `db:convert-filecache-bigint` | After major version jumps |
| `maintenance:repair` | After update, or when app errors appear |
| `app:update --all` | After the core upgrade has succeeded |
| `status` | To verify Nextcloud reports healthy |
| `app:list` | To see enabled and disabled apps |
| `files:scan --all` | If files appear missing after update |

---

## Verification Checklist

After completing the post-update sequence, confirm the following:

- [ ] `docker ps | grep nextcloud` shows **Up** (not Restarting or Exited)
- [ ] `php occ status` shows `"maintenance": false` and `"installed": true`
- [ ] `/status.php` returns `"maintenance":false`
- [ ] The web interface loads without errors
- [ ] No new errors in `data/nextcloud.log`
- [ ] Collabora Online documents open correctly (if used)
- [ ] Nextcloud Talk calls connect (if HPB is configured)
- [ ] Background jobs report no failures (**Admin → System → Background jobs**)

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [nextcloud-optimization-guide.md](nextcloud-optimization-guide.md) | Full stack setup — PostgreSQL, Redis, Collabora, Talk HPB |
| [pangolin-upgrade-guide.md](pangolin-upgrade-guide.md) | Updating the Pangolin tunnel stack |
| [docker-infrastructure.md](docker-infrastructure.md) | Docker Compose patterns and update procedures |
| [productivity-services.md](productivity-services.md) | Overview of all productivity services |
