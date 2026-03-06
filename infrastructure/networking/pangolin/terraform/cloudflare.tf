data "cloudflare_zone" "dnetme" {
  zone_id = var.cloudflare_zone_id
}

# Wildcard A-record: *.d-net.me -> VPS IP
resource "cloudflare_record" "wildcard" {
  zone_id = data.cloudflare_zone.dnetme.zone_id
  name    = "*"
  type    = "A"
  content = var.vps_ip
  ttl     = 1       # Auto
  proxied = false   # DNS only (grey cloud)
}

# Root A-record: d-net.me -> VPS IP
resource "cloudflare_record" "root" {
  zone_id = data.cloudflare_zone.dnetme.zone_id
  name    = "@"
  type    = "A"
  content = var.vps_ip
  ttl     = 1
  proxied = false
}
