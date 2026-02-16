# Docker Compose Configurations

This directory contains all Docker Compose configurations for my homelab infrastructure.

## Structure

- **media-management/** - Arr stack (Sonarr, Radarr, etc.) and download clients
- **media-servers/** - Media servers (Emby, Immich, music services)
- **productivity/** - Productivity apps (Nextcloud, Paperless-ngx, notes)
- **development/** - Development projects and portfolios
- **security/** - Security tools (Vaultwarden, Pi-hole)
- **monitoring/** - System monitoring and management
- **infrastructure/** - Core infrastructure services
- **networking/** - Network-related services

## Usage

Each subdirectory contains compose files for specific services. To deploy:
```bash
cd docker/<category>/<service>
docker compose up -d
```

## Notes

- Sensitive values (passwords, API keys) should be stored in `.env` files
- `.env` files are gitignored for security
- `.env.example` files show required variables
