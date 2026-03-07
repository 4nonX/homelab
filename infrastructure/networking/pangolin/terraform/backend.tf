terraform {
  backend "s3" {
    bucket = "terraform-state"
    key    = "homelab/terraform.tfstate"
    region = "us-east-1"

    endpoints = {
      s3 = "https://minio.d-net.me"
    }

    access_key                  = "[username]"
    secret_key                  = "[password]"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    use_path_style              = true
  }
}
