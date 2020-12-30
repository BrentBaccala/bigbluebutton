#!/bin/bash -ex

# Copyright (c) 2018 BigBlueButton Inc.
# Copyright (c) 2020 Brent Baccala
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.

# BigBlueButton is an open source conferencing system.  For more information see
#    http://www.bigbluebutton.org/.
#
# This bootstrap.sh script automates many of the installation and configuration
# steps at
#    http://docs.bigbluebutton.org/2.2/dev.html
#
# It is based on the bbb-install.sh script, but has been modified to prepare a
# development instead of a production environment.
#
# It's recommended usage is to run it after bbb-install.sh has been used to
# prepare a BigBlueButton server, which can then be used for development.
#
# This script can also be used by itself to prepare a server for building
# packages.

main() {

  # check_root
  SUDO="sudo -E"
  export DEBIAN_FRONTEND=noninteractive

  DISTRO=bionic

  if [ "$DISTRO" == "bionic" ]; then 
    check_ubuntu 18.04
  fi
  check_mem

  need_pkg curl

  if [ "$DISTRO" == "bionic" ]; then
    if [ ! -f /etc/apt/sources.list.d/nodesource.list ]; then
      curl -sL https://deb.nodesource.com/setup_12.x | $SUDO bash -
    fi
    if ! apt-cache madison nodejs | grep -q node_12; then
      err "Did not detect nodejs 12.x candidate for installation"
    fi

  fi

  $SUDO apt-get update
  $SUDO apt-get dist-upgrade -yq

  need_pkg nodejs build-essential dpkg-dev dh-exec libpng-dev zip
  need_pkg git-core ant ant-contrib openjdk-8-jdk-headless

  $SUDO update-java-alternatives --jre-headless -s java-1.8.0-openjdk-amd64
  # apt-get auto-remove -y

  if [ ! -x /usr/local/bin/meteor ]; then
    curl https://install.meteor.com/ | sh
  fi

  if [ ! -r "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
    curl -s "https://get.sdkman.io" | bash
  fi
  source "$HOME/.sdkman/bin/sdkman-init.sh"

  if [ ! -r "$HOME/.sdkman/candidates/sbt" ]; then
    sdk install sbt 1.2.8
  fi
  if [ ! -r "$HOME/.sdkman/candidates/gradle" ]; then
    sdk install gradle 5.5.1
  fi
  if [ ! -r "$HOME/.sdkman/candidates/grails" ]; then
    sdk install grails 3.3.9
  fi
  if [ ! -r "$HOME/.sdkman/candidates/maven" ]; then
    sdk install maven 3.5.0
  fi
}

say() {
  echo "bootstrap: $1"
}

err() {
  say "$1" >&2
  exit 1
}

check_root() {
  if [ $EUID != 0 ]; then err "You must run this command as root."; fi
}

check_mem() {
  MEM=`grep MemTotal /proc/meminfo | awk '{print $2}'`
  MEM=$((MEM/1000))
  if (( $MEM < 3940 )); then err "Your server needs to have (at least) 4G of memory."; fi
}

check_ubuntu(){
  RELEASE=$(lsb_release -r | sed 's/^[^0-9]*//g')
  if [ "$RELEASE" != $1 ]; then err "You must run this command on Ubuntu $1 server."; fi
}

need_x64() {
  UNAME=`uname -m`
  if [ "$UNAME" != "x86_64" ]; then err "You must run this command on a 64-bit server."; fi
}

need_pkg() {
  # check_root

  if [ ! "$SOURCES_FETCHED" = true ]; then
    $SUDO apt-get update
    SOURCES_FETCHED=true
  fi

  if ! dpkg -s ${@:1} >/dev/null 2>&1; then
    LC_CTYPE=C.UTF-8 $SUDO apt-get install -yq ${@:1}
  fi
}

main "$@" || exit 1
