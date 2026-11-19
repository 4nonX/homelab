# Proxmox host: host-level settings

Settings on the host itself, outside any guest. Snapshots: [sanoid.conf](sanoid.conf). Off-site backup:
[backup/](backup/). Second way in: [../access/](../access/README.md).

## Thin pool for the guest system disks: autoextend

The guests' system disks live on an LVM thin pool on the host's SSD. The disks promised to guests (about 64 GB) are
larger than the pool (54 GB). Thin provisioning is fine while usage stays low, but a pool that really fills up freezes
or errors every guest on it at once. The volume group has about 15 GB free, enough to cover every promised disk in full.

LVM therefore grows the pool by itself: at 80 % use it extends by 20 % from the free space in the volume group,
watched by `dmeventd` (`lvm2-monitor`). One line in `/etc/lvm/lvm.conf`, section `activation`:

    thin_pool_autoextend_threshold = 80     # default 100 = never
    thin_pool_autoextend_percent = 20       # Debian default, unchanged

Check:

    lvmconfig activation/thin_pool_autoextend_threshold activation/thin_pool_autoextend_percent
    lvs -o lv_name,lv_size,data_percent,metadata_percent pve

Once the volume group's free space is used up, autoextend has nothing left to give: then add disk space or shrink the
promises.

## Subscription notice in the web UI

[pve-nosub](pve-nosub) makes `checked_command` in the web UI's JavaScript run the action directly instead of showing
the "No valid subscription" dialog first. [99pve-nosub](99pve-nosub) is an apt hook that re-applies it after every
package change, because updates restore the file.

It only patches when the expected line exists exactly once. If Proxmox changes the code, the script leaves the file
alone and the dialog simply comes back, instead of a broken UI. The original stays next to the file. Undo: remove the
hook and the script, `apt install --reinstall proxmox-widget-toolkit`.

## Graphical console for the VMs

The VMs boot from Debian cloud images with a serial console. That is enough day to day, but not as a fallback: the
cloud kernel has no graphics driver at all, so a virtual graphics card shows a scrambled or black picture. (The card
ran at 800x600 under OVMF while the kernel's EFI framebuffer assumed 1280x800; a screenshot taken through the QEMU
monitor showed the mismatch.)

The fix, per VM:

1. `qm set <vmid> --vga std`, keeping `serial0`, so the serial console still works.
2. A root password for the console only (`qm guest passwd <vmid> root`). SSH stays key-only.
3. Debian's standard kernel with the `bochs` DRM driver. Booted once with `grub-reboot` while the cloud kernel stayed
   the default, so a failed boot would have fallen back by itself; only after a successful graphical login were the
   cloud kernel packages removed.

Done on the Komodo VM; the Docker VM follows, with the [access LXC](../access/README.md) as the way in while it
restarts.
