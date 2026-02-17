#!/bin/bash
set -euo pipefail
shopt -s globstar
echo "flag{eb60d601-3e08-4a1d-9314-b02d2ce5209b}" | qrencode -o qr.png
python3 corrupt-png.py qr.png
find resourcepack/assets/minecraft/textures/entity -type f -name '*.png' | while read f; do
    cp -v qr.png "$f"
done

cp -v pack.mcmeta-easy resourcepack/pack.mcmeta

cd resourcepack
zip -r ../resourcepack.zip .
echo Zipped
cd ..

rm -v resourcepack/pack.mcmeta

sha1=$(sha1sum resourcepack.zip | awk '{print $1}')
echo "SHA1: $sha1"

if [ -d /home/thomas/.var/app/org.prismlauncher.PrismLauncher ]; then
    echo "Installing into instance"
    cp -v resourcepack.zip /home/thomas/.var/app/org.prismlauncher.PrismLauncher/data/PrismLauncher/instances/1.21.11/minecraft/resourcepacks/minnehack.zip
fi

mv -v resourcepack.zip ../nginx/www/minecraft-resource-pack/resource-pack.zip
