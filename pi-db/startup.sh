#!/usr/bin/env bash
# Convenience: re-sync the Foyer DB host from the USB and (re)start the service.
# Lives at ~/startup on the Pi (setup.sh installs it). Run after loading new code
# onto the USB from the desktop:  bash ~/startup
sudo umount /mnt/foyerdb 2>/dev/null
sudo mkdir -p /mnt/foyerdb && sudo mount -L foyerdb /mnt/foyerdb \
  && cp /mnt/foyerdb/pi-db/setup.sh ~/setup.sh && bash ~/setup.sh
