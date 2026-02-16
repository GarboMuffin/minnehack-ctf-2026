#!/usr/bin/bash

set -euo pipefail
cd "$(dirname "$0")"

repo="$1"
number="$2"
title="$3"

# Top secret AI
if [[ "$title" == *"bug"* ]]; then
    gh issue comment --repo "$repo" "$number" -b "Thank you for creating an issue in this repository. It sounds like you're reporting a bug. Please make sure to include enough details for us to reproduce it."
elif [[ "$title" == *"feature"* ]]; then
    gh issue comment --repo "$repo" "$number" -b "Thank you for creating an issue in this repository. It sounds like you're requesting a new feature. Please keep in mind the team is very small so new features have to be chosen carefully."
else
    gh issue comment --repo "$repo" "$number" -b "Thank you for creating an issue in this repository. Our AI couldn't detect what kind of issue you're reporting. We'll take a look soon."
fi
