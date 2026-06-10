#!/usr/bin/env bash
# Foyer DB host — one-shot (re)install. Safe to re-run; tears down any half-built
# state first, then mounts the ext4 'foyerdb' USB, installs + starts the service,
# and health-checks it. Asks for sudo once. Does NOT set up the Cloudflare tunnel
# (that needs an interactive login — see README step 3).
#
#   bash /mnt/foyerdb/pi-db/setup.sh      # or wherever the pi-db folder lives
set -e
SECRET='dgYMH4ZI5DzazSeX1yw18ULJYHTniyHcSRX-Bmum-Ag'

echo '== 1/6  tearing down any previous setup =='
sudo systemctl disable --now foyer-db 2>/dev/null || true
sudo rm -f /etc/systemd/system/foyer-db.service
sudo systemctl daemon-reload
sudo umount /mnt/foyerdb 2>/dev/null || true
sudo sed -i '\|/mnt/foyerdb|d' /etc/fstab
rm -rf ~/foyer-db

echo '== 2/6  finding + mounting the foyerdb USB =='
DEV=$(sudo blkid -L foyerdb || true)
[ -n "$DEV" ] || { echo "ERROR: no ext4 partition labelled 'foyerdb'. Plug in the USB, or reformat it: sudo mkfs.ext4 -L foyerdb /dev/sdX1 (check device with lsblk!)"; exit 1; }
UUID=$(sudo blkid -s UUID -o value "$DEV")
sudo mkdir -p /mnt/foyerdb
echo "UUID=$UUID /mnt/foyerdb ext4 defaults,nofail,x-systemd.device-timeout=10 0 2" | sudo tee -a /etc/fstab >/dev/null
sudo mount /mnt/foyerdb
sudo mkdir -p /mnt/foyerdb/data
sudo chown -R "$USER:$USER" /mnt/foyerdb

echo '== 3/6  installing server.py =='
mkdir -p ~/foyer-db
SRC=$(find /mnt/foyerdb /media/"$USER" /media 2>/dev/null -maxdepth 4 -name server.py -path '*pi-db*' | head -1)
[ -n "$SRC" ] || { echo "ERROR: server.py not found (looked for **/pi-db/server.py). Re-copy the pi-db folder onto the stick."; exit 1; }
cp "$SRC" ~/foyer-db/server.py

echo '== 4/6  writing the systemd unit =='
PY=$(command -v python3)
sudo tee /etc/systemd/system/foyer-db.service >/dev/null <<UNIT
[Unit]
Description=Foyer DB host (SQLite over HTTP)
After=network.target
RequiresMountsFor=/mnt/foyerdb

[Service]
Environment=DB_SECRET=$SECRET
Environment=DATA_DIR=/mnt/foyerdb/data
Environment=PORT=8787
Environment=ALLOWED_DBS=lanson,burzer
ExecStart=$PY /home/$USER/foyer-db/server.py
Restart=always
RestartSec=2
User=$USER

[Install]
WantedBy=multi-user.target
UNIT

echo '== 5/6  starting the service =='
sudo systemctl daemon-reload
sudo systemctl enable --now foyer-db
sleep 2

echo '== 6/6  health check =='
curl -fsS localhost:8787/health && echo "  <-- DB host is UP ✓" || { echo "FAILED. Logs:"; journalctl -u foyer-db -n 25 --no-pager; exit 1; }
echo
echo "DB host ready. Next: the Cloudflare tunnel (README step 3)."
