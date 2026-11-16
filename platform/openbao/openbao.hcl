# OpenBao on LXC bao (bao.lan). Auto-unseal via AWS KMS (<aws-region>).
ui           = true
cluster_name = "homelab"
api_addr     = "https://bao.lan:8200"
cluster_addr = "https://bao.lan:8201"

storage "raft" {
  path    = "/opt/openbao/data"
  node_id = "bao-1"
}

listener "tcp" {
  address         = "0.0.0.0:8200"
  cluster_address = "0.0.0.0:8201"
  tls_cert_file   = "/opt/openbao/tls/bao-chain.crt"
  tls_key_file    = "/opt/openbao/tls/bao.key"
  tls_min_version = "tls12"
}

# AWS KMS seal: external plugin since OpenBao 2.7 (openbao-plugins, kms-aws v0.1.1,
# GPG-verified). Root-owned and pinned by checksum; no auto download.
plugin_directory     = "/opt/openbao/plugins"
plugin_auto_download = false

plugin "kms" "awskms" {
  command   = "openbao-plugin-kms-aws"
  version   = "v0.1.1"
  sha256sum = "0dffe0a159a5bdbeb147a892595fe517de858f48a99a64f33fabc775af0eec76"
}

seal "awskms" {
  region     = "<aws-region>"
  kms_key_id = "<kms-key-id>"
  # one Decrypt per day instead of every 10 minutes (each one triggers an email alert)
  health_check_interval = "24h"
}

# Audit log (declarative only in OpenBao 2.x; cannot be disabled through the API)
audit "file" "file" {
  description = "every request and response, secrets HMAC-hashed"
  options {
    file_path = "/var/log/openbao/audit.log"
    mode      = "0600"
  }
}
