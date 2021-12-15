#!/bin/bash
#
# Install browsers for a Big Blue Button testing server on a VM

# In addition to the system root CA store in /usr/local/share/ca-certificates (used by curl and others),
# we need to update root CA stores for two common browsers that don't use the system store.

# Get Firefox (already installed) to use private CA certificates
# Method suggested by https://askubuntu.com/a/1036637/71866
sudo mv /usr/lib/firefox/libnssckbi.so /usr/lib/firefox/libnssckbi.so.distrib
sudo dpkg-divert --add /usr/lib/firefox/libnssckbi.so
sudo ln -s /usr/lib/x86_64-linux-gnu/pkcs11/p11-kit-trust.so /usr/lib/firefox/libnssckbi.so

# This works for chromium/chrome
sudo DEBIAN_FRONTEND=noninteractive apt -y install chromium-browser libnss3-tools
mkdir --parents /home/ubuntu/.pki/nssdb
certutil -d sql:/home/ubuntu/.pki/nssdb -N --empty-password
certutil -d sql:/home/ubuntu/.pki/nssdb -A -t 'C,,' -n fort -i ca/keys/ca.crt

# Download Chrome, and pick up the shared libraries needed by Puppeteer's built-in Chromium
cd
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo DEBIAN_FRONTEND=noninteractive apt -y install -f
