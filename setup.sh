#!/bin/sh

# apt-get
sudo apt-get update
sudo apt-get upgrade

# Install node
sudo apt-get install nodejs
sudo apt-get install npm
#sudo update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
sudo npm cache clean
sudo npm install n -g
sudo n stable
sudo ln -sf /usr/local/bin/node /usr/bin/node
sudo apt-get purge -y nodejs npm

# Install Avahi
sudo apt-get install libavahi-compat-libdnssd-dev

# Node modules global path
NODE_PATH = `npm -g root`

# Install dependencies
sudo npm install -g --unsafe-perm homebridge hap-nodejs node-gyp
cd $NODE_PATH/homebridge/
sudo npm install --unsafe-perm bignum
cd $NODE_PATH/hap-nodejs/node_modules/mdns
sudo node-gyp BUILDTYPE=Release rebuild

# Install config server and multi plugin 
sudo npm install -g homebridge-config-server
sudo npm install -g homebridge-multi
cd $NODE_PATH/homebridge-config-server/
npm install
