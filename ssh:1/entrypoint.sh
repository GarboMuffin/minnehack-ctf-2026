#!/bin/bash

# ensure these variables are always "defined" before we enter set -u mode
SSH_TTY="$SSH_TTY"
SSH_ORIGINAL_COMMAND="$SSH_ORIGINAL_COMMAND"

set -euo pipefail

if [[ -z "$SSH_TTY" ]]; then
    echo "WARNING: A TTY could not be created for some reason. Some challenges may not be possible in this configuration."
    echo
fi

export CONTAINER_HOST=unix:///run/podman/podman.sock
run_container() {
    local name="ctf-ssh-$(od -An -tx1 -N16 /dev/urandom | tr -d ' \n')"
    trap "podman rm -f '$name' 2>/dev/null" EXIT
    podman run \
        -it \
        --rm \
        --init \
        --name "$name" \
        --log-driver=none \
        --stop-timeout=0 \
        --memory=64m \
        --memory-swap=64m \
        --cpus=1 \
        --network=none \
        --pids-limit=10 \
        $@
    trap - EXIT
}

case "$SSH_ORIGINAL_COMMAND" in
    tVDZNI7N4apIuFYAmELo2ynX) run_container tutorial:1 ;;

    zR37URyJ3mJ5K7vfeOnDIJ5A) run_container binary:gets ;;
    fiymDAzBJ5GjiouRB4AK0Rz1) run_container binary:grid ;;
    N4onoYe1R584oDuGHN7zPo4x) run_container binary:hello ;;

    10IcQTKIP8vqC0eOykSZauBX) run_container kvdb:1 ;;

    80Qe6kahplMwTOurqwJUdulo) run_container crypto-ecb:1 ;;
    BDjU1HRhzt1TrUI8T0P3LKiO) run_container crypto-feistel:1 ;;

    QYpR0k0sRTR1crniSem4GJw9) run_container system-status:1 ;;
    nRVa4gcnpvoBdbKWfhgjnaw2) run_container system-status:2 ;;

    *)
        echo "ERROR: Unknown challenge."
        exit 1
        ;;
esac
