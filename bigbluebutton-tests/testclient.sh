#!/bin/bash
#
# Install Big Blue Button testing client

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

# curl should respect this, but plenty of stuff insists on secure
# downloads that can't be cached
export http_proxy=http://osito.freesoft.org:3128/
export HTTP_PROXY=http://osito.freesoft.org:3128/
# export https_proxy=http://osito.freesoft.org:3128/
# export HTTPS_PROXY=http://osito.freesoft.org:3128/
# export WAREHOUSE_METEOR_URLBASE=http://warehouse.meteor.com

curl -s "https://get.sdkman.io" | bash

source "/home/ubuntu/.sdkman/bin/sdkman-init.sh"
sdk install gradle 5.5.1
sdk install grails 3.3.9
sdk install sbt 1.2.8
sdk install maven 3.5.0

curl https://install.meteor.com/ | sh

# use http for meteor downloads so they can be cached
meteor npm config set registry http://registry.npmjs.org/

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
