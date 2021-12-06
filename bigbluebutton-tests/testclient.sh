#!/bin/bash
#
# Install Big Blue Button testing client

# which version of the repository should we use as the client
BRANCH=v2.4-rc-1

# I put an http proxy in cloud-init, but it doesn't save that configuration between
# boots.  They only way to get cloud-init to set the proxy is to provide a CD-ROM image.
# Just running cloud-init with "policy: enabled" isn't enough.

echo 'Acquire::http::Proxy "http://osito.freesoft.org:3128/";' | sudo tee /etc/apt/apt.conf.d/proxy.conf

echo Waiting for apt-daily.service and apt-daily-upgrade.service
sudo systemd-run --property="After=apt-daily.service apt-daily-upgrade.service" --wait /bin/true

sudo apt -y install git-core ant ant-contrib openjdk-8-jdk-headless zip unzip

# We don't need the whole git history, like this command would do:
#    git clone https://github.com/bigbluebutton/bigbluebutton.git
# so instead we do this to pick up a single revision:
mkdir bigbluebutton
cd bigbluebutton
git init
git remote add origin https://github.com/bigbluebutton/bigbluebutton.git
#git fetch --depth 1 origin develop
#git checkout -t origin/develop
git fetch --depth 1 origin $BRANCH
git checkout FETCH_HEAD

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
# meteor npm config set registry http://registry.npmjs.org/

cd /home/ubuntu/bigbluebutton/bigbluebutton-html5
meteor update --allow-superuser --release 1.10.2

cd /home/ubuntu/bigbluebutton/bigbluebutton-tests/puppeteer
meteor npm install
meteor npm install jest
export PATH=$PATH:$PWD/node_modules/.bin

cd

# Install this if you want to test with the Chromium distributed with Ubuntu.
sudo DEBIAN_FRONTEND=noninteractive apt -y install chromium-browser

# We need this to either test with Chrome directly, or pick up the shared libraries needed by Puppeteer's built-in Chromium
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo DEBIAN_FRONTEND=noninteractive apt -y install -f

# setup .env file
cd /home/ubuntu/bigbluebutton/bigbluebutton-tests/puppeteer
cp .env-template .env
sed -i -e '/BBB_SERVER_URL/s|""|"https://test.freesoft.org/"|' .env
SECRET=$(grep sharedSecret /etc/bigbluebutton/bbb-apps-akka.conf | sed 's/^.*=//')
sed -i -e "/BBB_SHARED_SECRET/s|\"\"|$SECRET|" .env
sed -i -e '/STRESS_TEST/s/=/=false/' .env
sed -i -e '/BROWSERLESS_URL/d' .env
sed -i -e '/BROWSERLESS_TOKEN/d' .env
sed -i -e 's/#.*//' .env

# find /home/ubuntu/.meteor/packages -name jest
# could export like this, but the export doesn't carry over to other logins
# export PATH=$PATH:/home/ubuntu/.meteor/packages/meteor-tool/.2.5.0.9pm7h0.w0mo++os.linux.x86_64+web.browser+web.browser.legacy+web.cordova/mt-os.linux.x86_64/dev_bundle/bin

#mkdir -p ~/.local/bin
#ln -s /home/ubuntu/.meteor/packages/meteor-tool/.2.5.0.9pm7h0.w0mo++os.linux.x86_64+web.browser+web.browser.legacy+web.cordova/mt-os.linux.x86_64/dev_bundle/bin/* ~/.local/bin
