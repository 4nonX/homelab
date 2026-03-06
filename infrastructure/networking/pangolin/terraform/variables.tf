variable "cloudflare_api_token" {
  description = "Cloudflare API Token with DNS:Edit permission"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for d-net.me"
  type        = string
}

variable "vps_ip" {
  description = "Public IP of the IONOS VPS"
  type        = string
}

variable "vps_ssh_private_key_path" {
  description = "Path to SSH private key for VPS provisioning"
  type        = string
  default     = "~/.ssh/id_ed25519"
}

variable "pangolin_server_secret" {
  description = "Pangolin server secret (32-char random string)"
  type        = string
  sensitive   = true
}

variable "minio_endpoint" {
  description = "MinIO S3 endpoint on NAS"
  type        = string
  default     = "http://192.168.8.158:9000"
}

variable "minio_access_key" {
  description = "MinIO access key"
  type        = string
  sensitive   = true
}

variable "minio_secret_key" {
  description = "MinIO secret key"
  type        = string
  sensitive   = true
}
