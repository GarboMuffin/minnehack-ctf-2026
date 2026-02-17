#!/bin/bash
set -euo pipefail

# generate more secure host keys than the static ones in the image if we can
if [ -d "/data" ]; then
    echo "Found /data mounted - using host keys from storage"
    rm -fv /etc/ssh/ssh_host_*
    if [ ! -e /data/ssh_host_keys/.generated ]; then
        echo "No existing host keys found in /data - generating new ones"
        ssh-keygen -A
        mkdir -pv /data/ssh_host_keys
        cp -v /etc/ssh/ssh_host_* /data/ssh_host_keys/
        touch /data/ssh_host_keys/.generated
    fi
    cp -v /data/ssh_host_keys/ssh_host_* /etc/ssh/
else
    echo "No /data mounted - using default keys"
fi

# set up podman
if [ ! -S "/run/podman/podman.sock" ]; then
    echo "ERROR: /run/podman/podman.sock is not mounted correctly"
    exit 1
fi
chmod 766 /run/podman/podman.sock

# create privilege separation directory needed for debian's sshd
mkdir -v /run/sshd
chmod 700 /run/sshd

exec /usr/sbin/sshd -D -e -f ./sshd_config
