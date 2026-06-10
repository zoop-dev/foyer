#!/usr/bin/env bash
# Foyer DB host — Cloudflare tunnel setup (token / dashboard-managed).
# Installs cloudflared if needed, then installs+starts it as a service using the
# tunnel token. The public hostname (db.zo0p.dev -> localhost:8787) is configured
# in the Cloudflare dashboard, NOT here. Safe to re-run.
#
#   bash /mnt/foyerdb/pi-db/tunnel.sh
set -e
TOKEN='eyJhIjoiNTc0NWQ2OThkODNjMTVlNjU1OTI0YjI1MjQ4YTMwMjkiLCJ0IjoiNzQ2Y2Y0MTEtYTEyNi00M2M4LWI4Y2QtMDIzZjVmOWVlYTBjIiwicyI6Ik5HTmpZMk0yTjJZdFpqRmlNUzAwTkRGbExUaG1Oell0WVdKbU9UYzJPREkwTnpSayJ9'

echo '== 1/3  install cloudflared if missing =='
if ! command -v cloudflared >/dev/null 2>&1; then
  ARCH=arm64; [ "$(uname -m)" = armv7l ] && ARCH=arm; [ "$(uname -m)" = armv6l ] && ARCH=arm
  curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH" -o /tmp/cloudflared
  sudo install -m755 /tmp/cloudflared /usr/local/bin/cloudflared
fi
cloudflared --version

echo '== 2/3  install + start the tunnel service =='
sudo cloudflared service uninstall 2>/dev/null || true
sudo cloudflared service install "$TOKEN"
sudo systemctl enable --now cloudflared 2>/dev/null || true
sleep 6

echo '== 3/3  health check via the tunnel =='
if curl -fsS https://db.zo0p.dev/health; then
  echo "  <-- TUNNEL UP ✓"
else
  echo
  echo "Tunnel running but db.zo0p.dev isn't routing yet."
  echo "In the Cloudflare dashboard (Networks -> Tunnels -> foyer-db -> Public Hostname),"
  echo "add:  db.zo0p.dev   Type=HTTP   URL=localhost:8787   then re-run this."
  echo "Connector logs: sudo journalctl -u cloudflared -n 30 --no-pager"
fi
