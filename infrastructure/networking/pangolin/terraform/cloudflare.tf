data "cloudflare_zone" "dnetme" {
  zone_id = var.cloudflare_zone_id
}

# Wildcard CNAME: *.d-net.me -> pangolin.d-net.me
resource "cloudflare_record" "wildcard" {
  zone_id = data.cloudflare_zone.dnetme.zone_id
  name    = "*"
  type    = "CNAME"
  content = "pangolin.d-net.me"
  ttl     = 1
  proxied = false
}

# Root A-record: d-net.me -> VPS IP
resource "cloudflare_record" "root" {
  zone_id = data.cloudflare_zone.dnetme.zone_id
  name = "d-net.me"
  type    = "A"
  content = var.vps_ip
  ttl     = 1
  proxied = false
}

# Pangolin A-record: pangolin.d-net.me -> VPS IP
resource "cloudflare_record" "pangolin" {
  zone_id = data.cloudflare_zone.dnetme.zone_id
  name    = "pangolin"
  type    = "A"
  content = var.vps_ip
  ttl     = 1
  proxied = false
}
