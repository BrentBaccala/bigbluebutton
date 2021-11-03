#!/bin/bash

# gns3.py's screen_script is a Python fstring, so we can embed Python variable names,
# and use this to get a callback notification faster than phone_home, which won't
# run until these scripts terminate, which right now is probably never (i.e,

# wget --post-data 'Running /screen.sh' {notification_url}

# I don't do this with cloud-init because it waits for the packages to be installed before
# running per-once scripts or even phone_home notifying.

sudo apt update
sudo apt -y install git-core ant ant-contrib openjdk-8-jdk-headless zip unzip

# We don't need the whole git history, like this command would do:
#    git clone https://github.com/bigbluebutton/bigbluebutton.git
# so instead we do this to pick up a single revision:
mkdir bigbluebutton
cd bigbluebutton
git init
git remote add origin https://github.com/bigbluebutton/bigbluebutton.git
git fetch --depth 1 origin develop
git checkout -t origin/develop

curl -s "https://get.sdkman.io" | bash

source "/home/ubuntu/.sdkman/bin/sdkman-init.sh"
sdk install gradle 5.5.1
sdk install grails 3.3.9
sdk install sbt 1.2.8
sdk install maven 3.5.0

curl https://install.meteor.com/ | sh

cd /home/ubuntu/bigbluebutton/bigbluebutton-html5
meteor update --allow-superuser --release 1.10.2

cd /home/ubuntu/bigbluebutton/bigbluebutton-tests/puppeteer
meteor npm install -g jest
meteor npm install

# Install this if you want to test with the Chromium distributed with Ubuntu.
# sudo apt -y install chromium-browser

# We need this to pick up the shared libraries needed by Puppeteer's built-in Chromium
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo DEBIAN_FRONTEND=noninteractive apt -y install -f

uptime

# setup .env file

# find /home/ubuntu/.meteor/packages -name jest
# could export like this, but the export doesn't carry over to other logins
# export PATH=$PATH:/home/ubuntu/.meteor/packages/meteor-tool/.2.5.0.9pm7h0.w0mo++os.linux.x86_64+web.browser+web.browser.legacy+web.cordova/mt-os.linux.x86_64/dev_bundle/bin

mkdir -p ~/.local/bin
ln -s /home/ubuntu/.meteor/packages/meteor-tool/.2.5.0.9pm7h0.w0mo++os.linux.x86_64+web.browser+web.browser.legacy+web.cordova/mt-os.linux.x86_64/dev_bundle/bin/* ~/.local/bin

exec bash
