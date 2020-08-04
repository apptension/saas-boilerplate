#!/bin/bash
set -e

mkdir -p ~/.ssh
mkdir -p /run/sshd
touch ~/.ssh/authorized_keys
echo "$SSH_PUBLIC_KEY" > ~/.ssh/authorized_keys
env >> /etc/environment

echo "Running ssh server..."

/usr/sbin/sshd -D
