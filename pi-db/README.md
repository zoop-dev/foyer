# Foyer DB host (self-hosted D1 replacement)

Runs `server.py` — a tiny D1-compatible SQLite HTTP service — on your Raspberry Pi,
exposed to Cloudflare via a Tunnel. Foyer's Pages Functions then use this instead of
the D1 binding (one SQLite file per site). Pure Python stdlib; nothing to `pip install`.

> Reversible & per-site: a site only uses the Pi when its config has a `dbHttp` block
> (emits `DB_HTTP_URL`/`DB_HTTP_NAME`). Remove it and the site falls back to D1.

---

## 0. One-shot setup (paste this on the Pi)

Wipes any half-built state, mounts the ext4 `foyerdb` USB, installs + starts the DB
service, and health-checks it. Safe to re-run as many times as you like. Requires the
USB (labelled `foyerdb`, with the `pi-db` folder on it) plugged in. It will ask for your
`sudo` password once. **This does NOT do the Cloudflare tunnel** — that needs an
interactive login (see step 3 below) — but it does everything else.

```bash
bash <<'FOYER'
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

echo '== 3/6  installing server.py from the USB =='
mkdir -p ~/foyer-db
SRC=$(find /mnt/foyerdb /media/"$USER" /media 2>/dev/null -maxdepth 4 -name server.py -path '*pi-db*' | head -1)
[ -n "$SRC" ] || { echo "ERROR: server.py not found (looked for **/pi-db/server.py on the USB). Re-copy the pi-db folder onto the stick."; exit 1; }
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
echo "DB host ready. Next: the Cloudflare tunnel (step 3 in this README)."
FOYER
```

If it prints `{"ok": true}  <-- DB host is UP ✓`, the database host is running with its
data on the USB. Then do the tunnel (step 3) and migration (step 4).

---

## 1. Put the service on the Pi

```bash
# on the Pi
mkdir -p ~/foyer-db/data
# copy server.py here (scp from your machine, or git pull):
#   scp pi-db/server.py zoop@<pi>:~/foyer-db/server.py
```

## 2. Run it as a systemd service

Create `/etc/systemd/system/foyer-db.service` (see `foyer-db.service` in this folder):

```ini
[Unit]
Description=Foyer DB host (SQLite over HTTP)
After=network.target

[Service]
Environment=DB_SECRET=dgYMH4ZI5DzazSeX1yw18ULJYHTniyHcSRX-Bmum-Ag
Environment=DATA_DIR=/home/zoop/foyer-db/data
Environment=PORT=8787
Environment=ALLOWED_DBS=lanson,burzer
ExecStart=/usr/bin/python3 /home/zoop/foyer-db/server.py
Restart=always
User=zoop

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now foyer-db
curl localhost:8787/health        # -> {"ok": true}
```

`DB_SECRET` above is the one I generated and stored as the `DB_HTTP_SECRET` Cloudflare
secret — keep them identical. `ALLOWED_DBS` whitelists which site db names may be opened.

## 3. Expose it with a Cloudflare Tunnel

```bash
# on the Pi (one-time)
cloudflared tunnel login
cloudflared tunnel create foyer-db
# route a hostname you control to the tunnel, e.g. db.zo0p.dev:
cloudflared tunnel route dns foyer-db db.zo0p.dev
```

`~/.cloudflared/config.yml`:

```yaml
tunnel: foyer-db
credentials-file: /home/zoop/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: db.zo0p.dev
    service: http://localhost:8787
  - service: http_status:404
```

```bash
sudo cloudflared service install      # runs the tunnel on boot
curl https://db.zo0p.dev/health       # -> {"ok": true}
```

## 4. Migrate each site's D1 data onto the Pi

```bash
# on your dev machine — export the live D1 (per site)
CLOUDFLARE_ACCOUNT_ID=<site-account-id> \
  npx wrangler d1 export <d1Name> --remote --output lanson.sql

# ship + import on the Pi
scp lanson.sql zoop@<pi>:~/foyer-db/
ssh zoop@<pi> 'sqlite3 ~/foyer-db/data/lanson.db < ~/foyer-db/lanson.sql'
```

(`<d1Name>`/account id come from the site's `config.json` → `cloudflare`.)

## 5. Point a site at the Pi

Add to that site's `config.json`:

```json
"dbHttp": { "url": "https://db.zo0p.dev", "name": "lanson" }
```

Set the bearer secret on the Pages project (once per project):

```bash
CLOUDFLARE_ACCOUNT_ID=<site-account-id> \
  npx wrangler pages secret put DB_HTTP_SECRET --project-name=<project>
# value: dgYMH4ZI5DzazSeX1yw18ULJYHTniyHcSRX-Bmum-Ag
```

Then `node build.js <site>` + `foyer deploy <site>`. Verify, then optionally retire the D1.

**Roll back** anytime: delete the `dbHttp` block, rebuild, redeploy → back on D1.
