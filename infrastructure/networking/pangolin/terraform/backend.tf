terraform {
  backend "s3" {
    bucket = "terraform-state"
    key    = "homelab/terraform.tfstate"
    region = "us-east-1"

    endpoints = {
      s3 = "https://minio.d-net.me"
    }

    access_key                  = "DanDressen"
    secret_key                  = "DHimHmwnmPS23"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    use_path_style              = true
  }
}
