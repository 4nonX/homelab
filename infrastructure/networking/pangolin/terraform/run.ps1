# Terraform wrapper with SOPS decryption (PowerShell)
# Usage:
#   .\run.ps1 init
#   .\run.ps1 plan
#   .\run.ps1 apply
#   .\run.ps1 destroy

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$TerraformArgs
)

$ErrorActionPreference = "Stop"

$SopsFile  = "terraform.tfvars.enc"
$PlainFile = "terraform.tfvars"
$AgeKey    = if ($env:SOPS_AGE_KEY_FILE) { $env:SOPS_AGE_KEY_FILE } else { "$env:USERPROFILE\.age\homelab.key" }

# Check dependencies
if (-not (Get-Command sops -ErrorAction SilentlyContinue)) {
    Write-Error "sops not installed. Install from: https://github.com/getsops/sops/releases"
    exit 1
}
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error "terraform not installed. Install from: https://developer.hashicorp.com/terraform/install"
    exit 1
}
if (-not (Test-Path $AgeKey)) {
    Write-Error "age key not found at $AgeKey`nSet SOPS_AGE_KEY_FILE env var if your key is elsewhere."
    exit 1
}
if (-not (Test-Path $SopsFile)) {
    Write-Error "$SopsFile not found. Encrypt first with: sops --encrypt terraform.tfvars > terraform.tfvars.enc"
    exit 1
}

# Decrypt
$env:SOPS_AGE_KEY_FILE = $AgeKey
Write-Host "Decrypting $SopsFile..."
sops --decrypt $SopsFile | Out-File -Encoding utf8 $PlainFile

try {
    Write-Host "Running: terraform $TerraformArgs"
    terraform @TerraformArgs
} finally {
    # Always clean up plaintext
    Remove-Item -Force $PlainFile -ErrorAction SilentlyContinue
    Write-Host "Cleaned up plaintext tfvars."
}
