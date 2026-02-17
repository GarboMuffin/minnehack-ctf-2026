#!/bin/bash

set -euo pipefail

PATH="$PATH:/usr/games"

read -p "Username: " username
read -p "Password: " -s password
echo
sleep 0.25
if [[ ! "$username" = "admin" ]] || [[ ! "$password" = "1234" ]]; then
    echo "Error: Unrecognized credentials"
    exit 1
fi

rm -f log.txt
echo 1 > status
python3 fake-backend.py &
trap 'jobs -p | xargs kill > /dev/null 2>&1' EXIT

echo "Welcome to the nuclear control panel v1.0" | cowsay -W 80 | lolcat 

while true; do
    echo
    echo "Select the number for what you want to do:"
    echo "1) Stop backend"
    echo "2) Start backend"
    echo "3) View backend status"
    echo "4) View backend logs"
    echo "5) Disconnect"
    echo -n "> "
    read action

    if [[ "$action" = "" ]]; then
        echo "Bye"
        exit 0
    elif [[ "$action" = "1" ]]; then
        if [[ "$(cat status)" == "1" ]]; then
            echo "Stopping backend..."
            sleep 1.5
            echo 0 > status
            echo "--- SERVER STOPPED ---" >> log.txt
            echo "Done"
        else
            echo "Already stopped"
        fi
        sleep 1
    elif [[ "$action" = "2" ]]; then
        if [[ "$(cat status)" == "0" ]]; then
            echo "Starting backend..."
            sleep 1.5
            echo 1 > status
            echo "--- SERVER STARTED ---" >> log.txt
            echo "Done"
        else
            echo "Already started"
        fi
        sleep 1
    elif [[ "$action" = "3" ]]; then
        if [[ "$(cat status)" == "0" ]]; then
            echo "Server status: OFF"
            echo "# of logs: $(wc -l < log.txt)"
        else
            echo "Server status: ON"
            echo "# of logs: $(wc -l < log.txt)"
        fi
        sleep 1
    elif [[ "$action" = "4" ]]; then
        less +G log.txt
    elif [[ "$action" = "5" ]]; then
        exit 0
    else
        echo "Error: Unknown command"
    fi
done
