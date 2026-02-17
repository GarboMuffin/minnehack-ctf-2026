#!/bin/bash

set -euo pipefail

if [ ! -d "/server" ]; then
    echo "!!!!!!!!!!!!!!!!!!!!!!"
    echo "/server is not mounted"
    echo "   CAN NOT CONTINUE"
    echo "!!!!!!!!!!!!!!!!!!!!!!"
    exit 42
fi

cd /server

if [ ! -f "eula.txt" ]; then 
    echo "Pre-filling eula.txt"
    echo "eula=true" > eula.txt
fi

if [ ! -f "server.properties" ]; then
    echo 'Pre-filling server.properties'
    echo 'enforce-secure-profile=false' >> server.properties
    echo 'allow-flight=true' >> server.properties
    echo 'resource-pack=https\://minecraft-resource-pack.ctf.minnehack.com/resource-pack.zip' >> server.properties
    echo "resource-pack-id=$(uuidgen)" >> server.properties
    echo 'resource-pack-prompt="The entities in this resource pack look a bit weird."' >> server.properties
    echo 'require-resource-pack=true' >> server.properties
    echo 'enable-rcon=true' >> server.properties
    echo 'white-list=true' >> server.properties
    echo 'max-players=20' >> server.properties
    # secure enough because the port is only accessible internally ...
    echo 'rcon.password=1234' >> server.properties
fi

if [ ! -f "ops.json" ]; then
    echo "Pre-filling ops.json to ensure spawn protection always works"
    cat << EOF > ops.json
    [
        {
            "uuid": "00000000-0000-0000-0000-000000000000",
            "name": "a",
            "level": 0,
            "bypassesPlayerLimit": false
        }
    ]
EOF
fi

if [ ! -f "server-icon.png" ]; then
    echo "Pre-filling server-icon.png"
    cp /app/server-icon.png .
fi

stop() {
    echo "Sending stop signal to game"
    /app/mcrcon.out -p 1234 "save-all flush"
    /app/mcrcon.out -p 1234 "stop"
}

trap stop SIGTERM
trap stop SIGINT

FLAGS="-Xms2048M -Xmx2048M -XX:+AlwaysPreTouch -XX:+DisableExplicitGC -XX:+ParallelRefProcEnabled -XX:+PerfDisableSharedMem -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1HeapRegionSize=8M -XX:G1HeapWastePercent=5 -XX:G1MaxNewSizePercent=40 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1NewSizePercent=30 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15 -XX:MaxGCPauseMillis=200 -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true"
java $FLAGS -jar /app/server.jar nogui &
child=$!
wait "$child"
