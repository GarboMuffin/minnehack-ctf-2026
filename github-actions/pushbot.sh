#!/bin/sh

set -u

update() {
    if [[ -z "$repo" ]]; then return 0; fi
    repo="$1"
    dir="$(mktemp -d)"
    ssh_file="$(mktemp)"

    echo "Processing $repo in $dir"

    privkey="$(grep "$repo" /data/deploy_keys.txt | awk '{print $2}' | base64 -d)"
    echo "$privkey" > "$ssh_file"
    export GIT_SSH_COMMAND="ssh -i $ssh_file -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

    cd "$dir"
    git init -b main
    git config user.name "Oblivious Bot"
    git config user.email "obliviousbot@muffin.ink"
    git remote add origin "git@github.com:$repo"
    git pull origin main
    
    date > current_date
    git stage .
    git commit -m "Good things happen when you push straight to main"
    git push origin main

    rm -rf "$dir" "$ssh_file"
}

echo "Started. Waiting a bit to start pushing."
sleep 30

while true; do
    echo "Awoken."
    while IFS= read -r repo; do
        update "$repo"
        sleep 5
    done < /data/repos.txt
    echo "Entering long slumber."
    sleep 1800
done
