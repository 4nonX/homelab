terraform {
  backend "s3" {
    bucket = "terraform-state"
    key    = "homelab/terraform.tfstate"
    region = "us-east-1"

    endpoint                    = "http://192.168.8.158:9000"
    access_key                  = "DanDressen"
    secret_key                  = "DHimHmwnmPS23"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    force_path_style            = true
  }
}
