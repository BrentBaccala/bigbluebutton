#!/bin/bash
#
# This is a per-once script, i.e, it doesn't run after the first time the VM boots.

# I don't do this apt stuff with cloud-init because it waits for the packages to be installed before
# running per-once scripts or even phone_home notifying.

sudo apt update

# This will install the GNOME desktop so that it automatically logs in the user 'ubuntu'

sudo DEBIAN_FRONTEND=noninteractive apt -y install ubuntu-desktop
sudo sed -i -e 's/#  Automatic/Automatic/' -e '/Automatic/s/user1/ubuntu/' /etc/gdm3/custom.conf

# Configure dconf to disable screen lock
sudo mkdir -p /etc/dconf/profile/
sudo tee /etc/dconf/profile/user <<EOF
user-db:user
system-db:local
EOF

sudo mkdir -p /etc/dconf/db/local.d/
sudo tee /etc/dconf/db/local.d/10disable-lock <<EOF
[org/gnome/desktop/session]
idle-delay=uint32 0
EOF

sudo dconf update

# Don't run initial user setup dialog; don't GUI prompt for updates
sudo apt -y remove update-manager gnome-initial-setup

sudo systemctl restart gdm3

uptime

exec bash
