# This resource represents the existing VPS.
# On DR: update vps_ip in terraform.tfvars after creating new IONOS VPS,
# then run terraform apply to re-provision everything.

resource "null_resource" "vps_provision" {
  # Re-run provisioner if IP changes (i.e. new VPS after DR)
  triggers = {
    vps_ip = var.vps_ip
  }

  connection {
    type        = "ssh"
    host        = var.vps_ip
    user        = "root"
    private_key = file(pathexpand(var.vps_ssh_private_key_path))
    timeout     = "10m"
  }

  # Step 1: System setup
  provisioner "remote-exec" {
    inline = [
      "apt-get update -qq",
      "apt-get install -y -qq curl git ca-certificates gnupg lsb-release python3-pip",
    ]
  }

  # Step 2: Install Docker
  provisioner "remote-exec" {
    inline = [
      "if ! command -v docker &>/dev/null; then",
      "  curl -fsSL https://get.docker.com | sh",
      "fi",
      "systemctl enable docker",
      "systemctl start docker",
    ]
  }

  # Step 3: Install MinIO client (mc) for backup/restore
  provisioner "remote-exec" {
    inline = [
      "if ! command -v mc &>/dev/null; then",
      "  curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc",
      "  chmod +x /usr/local/bin/mc",
      "fi",
      "mc alias set nas ${var.minio_endpoint} ${var.minio_access_key} ${var.minio_secret_key} --api S3v4",
    ]
  }

  # Step 4: Upload configs
  provisioner "file" {
    source      = "${path.module}/config/"
    destination = "/root/pangolin/config"
  }

  # Step 5: Upload docker-compose
  provisioner "file" {
    source      = "${path.module}/docker-compose.yml"
    destination = "/root/pangolin/docker-compose.yml"
  }

  # Step 6: Upload backup + restore scripts
  provisioner "file" {
    source      = "${path.module}/scripts/"
    destination = "/root/"
  }

  # Step 7: Restore latest backup if it exists, otherwise fresh start
  provisioner "remote-exec" {
    inline = [
      "chmod +x /root/backup.sh /root/restore.sh",
      "cd /root/pangolin",
      "if mc ls nas/pangolin-backup/latest.tar.gz &>/dev/null; then",
      "  echo 'Backup found - restoring...'",
      "  /root/restore.sh",
      "else",
      "  echo 'No backup found - fresh deployment'",
      "fi",
    ]
  }

  # Step 8: Start stack
  provisioner "remote-exec" {
    inline = [
      "cd /root/pangolin",
      "docker compose up -d",
      "echo 'Waiting for stack to be healthy...'",
      "sleep 30",
      "docker compose ps",
    ]
  }

  # Step 9: Install backup cron (weekly Sunday 3am)
  provisioner "remote-exec" {
    inline = [
      "(crontab -l 2>/dev/null | grep -v backup.sh; echo '0 3 * * 0 /root/backup.sh >> /var/log/pangolin-backup.log 2>&1') | crontab -",
    ]
  }
}
