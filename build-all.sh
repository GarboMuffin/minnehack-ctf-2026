#!/bin/bash
set -euxo pipefail
cd "$(dirname "$0")"

(yes | podman system prune) || true

podman-compose build

podman build -t tutorial:1 tutorial:1

podman build -t binary:gets binary/gets
podman build -t binary:grid binary/grid
podman build -t binary:hello binary/hello

podman build -t kvdb:1 kvdb:1

podman build -t system-status:1 system-status:1
podman build -t system-status:2 system-status:2

./reverse-engineering/build-final.sh
