#!/bin/bash
#
# Install a Big Blue Button testing server on a VM

# if these are running, our apt operations may error out unable to get a lock
sudo systemctl stop unattended-upgrades.service
echo Waiting for apt-daily.service and apt-daily-upgrade.service
sudo systemd-run --property="After=apt-daily.service apt-daily-upgrade.service" --wait /bin/true

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade

DOMAIN=$(hostname --domain)
FQDN=$(hostname --fqdn)

EMAIL="root@$FQDN"

# /bbb-install.sh (the proper version; 2.5, 2.6, 2.7, or 3.0) is created by gns3-bbb.py
# INSTALL_OPTIONS, RELEASE, and BBB_MAJOR_VERSION get passed in the environment from gns3-bbb.py
#
# INSTALL_OPTIONS can include -w (firewall) -a (api demos; deprecated in 2.6) -r (repository)

sudo /bbb-install.sh -v $RELEASE -s $FQDN -e $EMAIL $INSTALL_OPTIONS

sudo bbb-conf --salt bbbci

# v2 uses Meteor which needs NODE_EXTRA_CA_CERTS in bbb-html5-with-roles.conf
# v3 replaced Meteor with a GraphQL stack; this file doesn't exist
if [ -f /usr/share/meteor/bundle/bbb-html5-with-roles.conf ]; then
    echo "NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/bbb-dev/bbb-dev-ca.crt" | sudo tee -a /usr/share/meteor/bundle/bbb-html5-with-roles.conf
fi

# bbb-conf --salt doesn't set the shared secret on the web demo
if [ -r /var/lib/tomcat9/webapps/demo/bbb_api_conf.jsp ]; then
   sudo sed -i '/salt/s/"[^"]*"/"bbbci"/'  /var/lib/tomcat9/webapps/demo/bbb_api_conf.jsp
fi

# if nginx didn't start because of a hash bucket size issue,
# certbot didn't work properly and we need to re-run the entire install script
if systemctl -q is-failed nginx; then
    sudo sed -i '/server_names_hash_bucket_size/s/^\(\s*\)# /\1/' /etc/nginx/nginx.conf
    sudo /bbb-install.sh -v $RELEASE -s $FQDN -e $EMAIL $INSTALL_OPTIONS
fi

# We can't restart if nginx isn't running.  It'll just complain "nginx.service is not active, cannot reload"
# sudo bbb-conf --restart
sudo bbb-conf --stop
sudo bbb-conf --start
