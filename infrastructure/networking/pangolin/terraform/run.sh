#!/bin/bash
# Terraform wrapper with SOPS decryption
# Usage:
#   ./run.sh init
#   ./run.sh plan
#   ./run.sh apply
#   ./run.sh destroy

set -e

SOPS_FILE="terraform.tfvars.enc"
PLAIN_FILE="terraform.tfvars"
AGE_KEY="${SOPS_AGE_KEY_FILE:-$HOME/.age/homelab.key}"

# Check dependencies
if ! command -v sops &>/dev/null; then
    echo "ERROR: sops not installed. Install from: https://github.com/getsops/sops/releases"
    exit 1
fi
if ! command -v terraform &>/dev/null; then
    echo "ERROR: terraform not installed. Install from: https://developer.hashicorp.com/terraform/install"
    exit 1
fi
if [ ! -f "$AGE_KEY" ]; then
    echo "ERROR: age key not found at $AGE_KEY"
    echo "Set SOPS_AGE_KEY_FILE env var if your key is elsewhere."
    exit 1
fi
if [ ! -f "$SOPS_FILE" ]; then
    echo "ERROR: $SOPS_FILE not found. Run './run.sh encrypt' first."
    exit 1
fi

# Decrypt tfvars
export SOPS_AGE_KEY_FILE="$AGE_KEY"
echo "Decrypting $SOPS_FILE..."
sops --decrypt "$SOPS_FILE" > "$PLAIN_FILE"

# Always clean up plaintext on exit
cleanup() {
    rm -f "$PLAIN_FILE"
    echo "Cleaned up plaintext tfvars."
}
trap cleanup EXIT

# Run terraform
echo "Running: terraform $*"
terraform "$@"
