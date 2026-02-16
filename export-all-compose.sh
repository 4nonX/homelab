#!/bin/bash
# Export all Docker Compose files from ZimaOS

REPO_DIR="$HOME/homelab/docker"
APPS_DIR="/var/lib/casaos/apps"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting compose file export...${NC}\n"

# Export function
export_compose() {
    local app_dir=$1
    local category=$2
    local app_name=$(basename "$app_dir")
    
    if [ -f "$app_dir/docker-compose.yml" ] || [ -f "$app_dir/docker-compose.yaml" ]; then
        local compose_file=$(find "$app_dir" -maxdepth 1 -name "docker-compose.y*ml" | head -1)
        
        mkdir -p "$REPO_DIR/$category/$app_name"
        cp "$compose_file" "$REPO_DIR/$category/$app_name/"
        
        # Also copy .env if exists
        if [ -f "$app_dir/.env" ]; then
            cp "$app_dir/.env" "$REPO_DIR/$category/$app_name/.env.example"
            echo -e "${GREEN}✓${NC} Exported: $app_name (with .env)"
        else
            echo -e "${GREEN}✓${NC} Exported: $app_name"
        fi
        
        return 0
    fi
    return 1
}

# Media Management Stack
echo -e "${BLUE}=== Media Management ===${NC}"
for app in sonarr radarr lidarr bazarr prowlarr recyclarr maintainerr flaresolverr qbittorrent gluetun seerr homarr; do
    export_compose "$APPS_DIR/$app" "media-management"
done

# Media Servers
echo -e "\n${BLUE}=== Media Servers ===${NC}"
for app in emby immich audiobookshelf navidrome swingmusic pinchflat stremio; do
    export_compose "$APPS_DIR/$app" "media-servers"
done

# Productivity
echo -e "\n${BLUE}=== Productivity ===${NC}"
for app in nextcloud big-bear-paperless-ngx big-bear-joplin big-bear-linkwarden memos big-bear-wallos; do
    export_compose "$APPS_DIR/$app" "productivity"
done

# Development
echo -e "\n${BLUE}=== Development ===${NC}"
for app in portfolio-frontend portfolio-backend dan-portfolio dplaneos-website nginx-cv-final; do
    export_compose "$APPS_DIR/$app" "development"
done

# Security
echo -e "\n${BLUE}=== Security ===${NC}"
for app in vaultwarden pihole; do
    export_compose "$APPS_DIR/$app" "security"
done

# Monitoring
echo -e "\n${BLUE}=== Monitoring ===${NC}"
for app in homelab-glances homelab-dashboard big-bear-dockge big-bear-scrutiny big-bear-dockpeek parkling_jamaal-main_app; do
    export_compose "$APPS_DIR/$app" "monitoring"
done

# Infrastructure
echo -e "\n${BLUE}=== Infrastructure ===${NC}"
for app in syncthing searxng postfix-relay; do
    export_compose "$APPS_DIR/$app" "infrastructure"
done

echo -e "\n${GREEN}Export complete!${NC}"
echo -e "Files saved to: $REPO_DIR"
