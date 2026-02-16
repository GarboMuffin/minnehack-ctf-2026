#!/bin/bash
set -euxo pipefail
cd "$(dirname "$0")"
make clean
make -j
