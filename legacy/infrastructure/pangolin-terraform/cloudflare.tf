data "cloudflare_zone" "example" {
  zone_id = var.cloudflare_zone_id
}

# Wildcard CNAME: *.example.com -> pangolin.example.com
resource "cloudflare_record" "wildcard" {
  zone_id = data.cloudflare_zone.example.zone_id
  name    = "*"
  type    = "CNAME"
  content = "pangolin.example.com"
  ttl     = 1
  proxied = false
}

# Root A-record: example.com -> VPS IP
resource "cloudflare_record" "root" {
  zone_id = data.cloudflare_zone.example.zone_id
  name = "example.com"
  type    = "A"
  content = var.vps_ip
  ttl     = 1
  proxied = false
}

# Pangolin A-record: pangolin.example.com -> VPS IP
resource "cloudflare_record" "pangolin" {
  zone_id = data.cloudflare_zone.example.zone_id
  name    = "pangolin"
  type    = "A"
  content = var.vps_ip
  ttl     = 1
  proxied = false
}
