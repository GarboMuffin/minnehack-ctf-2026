#!/usr/bin/bash

set -euxo pipefail
cd "$(dirname "$0")"

diff=$(mktemp)
gh pr checkout "$PR_NUMBER"
git diff origin/master > "$diff"

got_label=0
if grep -q "^\+\+\+ b/instrumentation/" "$diff"; then
    gh pr edit --repo "$GH_REPO" "$PR_NUMBER" --add-label "instrumentation"
    got_label=1
fi
if grep -q "^\+\+\+ b/injector/" "$diff"; then
    gh pr edit --repo "$GH_REPO" "$PR_NUMBER" --add-label "injector"
    got_label=1
fi
if [[ "$got_label" = "0" ]]; then
    gh pr edit --repo "$GH_REPO" "$PR_NUMBER" --add-label "other"
fi

./go-back-to-main.sh
