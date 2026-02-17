#!/bin/bash
set -euo pipefail
shopt -s globstar

echo "flag{74f040ee-96ce-4744-a67d-a6ea66e08200}" | qrencode -o qr.png
find resourcepack/assets/minecraft/textures/entity -type f -name '*.png' | while read f; do
    cp -v qr.png "$f"
done

cp -v pack.mcmeta-easy resourcepack/pack.mcmeta
python3 zip.py
rm resourcepack/pack.mcmeta

sha1=$(sha1sum resourcepack.zip | awk '{print $1}')
echo "SHA1: $sha1"

if [ -d /home/thomas/.var/app/org.prismlauncher.PrismLauncher ]; then
    echo "Installing into instance"
    cp -v resourcepack.zip /home/thomas/.var/app/org.prismlauncher.PrismLauncher/data/PrismLauncher/instances/1.21.11/minecraft/resourcepacks/minnehack-hard.zip
fi

mv -v resourcepack.zip ../nginx/www/minecraft-resource-pack/i-was-told-this-is-way-too-hard.zip
