#!/bin/bash

set -euxo pipefail
cd "$(dirname "$0")"

podman build . -t reverse-engineering-build-env
podman run --rm -it -v .:/app reverse-engineering-build-env "/app/internal-build.sh"

c() {
    out="../portal/src/challenge-static/$2"
    mkdir -p $(dirname $out)
    cp $1 $out
}

c intro.out rev-intro/intro.out
c scramble.out rev-scramble/scramble.out
c bakers-dozen.out rev-bakers-dozen/bakers-dozen.out
c leaves.out rev-leaves/leaves.out
c bytecode.out rev-bytecode/bytecode.out
