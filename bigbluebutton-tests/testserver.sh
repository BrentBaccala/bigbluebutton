#!/bin/bash
#
# Install a Big Blue Button testing server on a VM

# I put an http proxy in cloud-init, but it doesn't save that configuration between
# boots.  They only way to get cloud-init to set the proxy is to provide a CD-ROM image.
# Just running cloud-init with "policy: enabled" isn't enough.

echo 'Acquire::http::Proxy "http://osito.freesoft.org:3128/";' | sudo tee /etc/apt/apt.conf.d/proxy.conf > /dev/null

# if these are running, our apt operations may error out unable to get a lock
sudo systemctl stop unattended-upgrades.service
echo Waiting for apt-daily.service and apt-daily-upgrade.service
sudo systemd-run --property="After=apt-daily.service apt-daily-upgrade.service" --wait /bin/true

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt -y upgrade

# the ubuntu.py script left some cruft owned by root
sudo chown -R ubuntu.ubuntu /home/ubuntu

# make a new certificate authority
sudo DEBIAN_FRONTEND=noninteractive apt -y install easy-rsa
make-cadir ca
cd ca
cp openssl-1.0.0.cnf openssl.cnf
sed -i '/cRLSign/asubjectAltName = DNS:freesoft.org' openssl.cnf
sed -i '/cRLSign/akeyUsage = critical, cRLSign, digitalSignature, keyCertSign' openssl.cnf
. vars
./clean-all

# create the CA certificate (the cp/update at least makes GET happy)
./pkitool --initca
sudo cp keys/ca.crt /usr/local/share/ca-certificates
sudo update-ca-certificates 

# create the server certificate and put everything where the bbb install scripts wants it
# (might want to actually create a full chain, which this currently isn't)
./pkitool --server test.freesoft.org
sudo mkdir -p /local/certs
sudo cp keys/test.freesoft.org.crt /local/certs/fullchain.pem
sudo cp keys/test.freesoft.org.key /local/certs/privkey.pem
sudo cp keys/ca.crt /local/certs/ca.crt

cd

# set hostname of server
sudo sed -i '1s/localhost/localhost test.freesoft.org/' /etc/hosts
echo test.freesoft.org | sudo tee /etc/hostname > /dev/null

# or bionic-230-dev
# suggested -w: firewall
# suggested -a: api demos
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | sudo bash -s -- -v bionic-23 -s test.freesoft.org -d -a

# nginx won't start without this change
sudo sed -i '/server_names_hash_bucket_size/s/^\(\s*\)# /\1/' /etc/nginx/nginx.conf

#wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | sudo bash -s -- -v bionic-23 -s test.freesoft.org -d
sudo systemctl start nginx
