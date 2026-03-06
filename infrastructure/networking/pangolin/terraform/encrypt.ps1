# One-time encryption of terraform.tfvars -> terraform.tfvars.enc
# Run this once after filling in terraform.tfvars, then delete terraform.tfvars

$ErrorActionPreference = "Stop"

$AgeKey = if ($env:SOPS_AGE_KEY_FILE) { $env:SOPS_AGE_KEY_FILE } else { "$env:USERPROFILE\.age\homelab.key" }
$env:SOPS_AGE_KEY_FILE = $AgeKey

if (-not (Test-Path "terraform.tfvars")) {
    Write-Error "terraform.tfvars not found."
    exit 1
}

Write-Host "Encrypting terraform.tfvars -> terraform.tfvars.enc..."
sops --encrypt terraform.tfvars | Out-File -Encoding utf8 "terraform.tfvars.enc"

Write-Host "Done. Verify the encrypted file looks correct:"
Get-Content "terraform.tfvars.enc" | Select-Object -First 5

Write-Host "`nNow delete the plaintext file:"
Write-Host "  Remove-Item terraform.tfvars"
Write-Host "`nCommit terraform.tfvars.enc to git. Never commit terraform.tfvars."
