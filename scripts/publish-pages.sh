#!/usr/bin/env bash
# Publish the files recorded in a Git commit to the Jaisalmer Visit Pages project.
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:-}" in
  preview) deploy_branch=review ;;
  production) deploy_branch=main ;;
  *) echo 'Usage: bash scripts/publish-pages.sh preview|production' >&2; exit 2 ;;
esac

if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Commit the release and build outputs before publishing.' >&2
  exit 1
fi
revision=$(git rev-parse HEAD)
if [[ "$deploy_branch" == main ]]; then
  git fetch --quiet origin refs/heads/main
  if [[ "$(git branch --show-current)" != main || "$(git rev-parse FETCH_HEAD)" != "$revision" ]]; then
    echo 'Production requires the commit currently on origin/main.' >&2
    exit 1
  fi
fi

uv run --no-project --python 3.12 python scripts/check_release.py
eval "$(fnm env --shell bash)"
fnm use 24 --silent-if-unchanged
if [[ -n "${LOCALAPPDATA:-}" ]] && command -v cygpath >/dev/null; then
  project_config="$(cygpath -m "$LOCALAPPDATA")/JaisalmerVisit/Cloudflare"
  if [[ -d "$project_config" ]]; then export XDG_CONFIG_HOME="$project_config"; fi
fi

# Only tracked files under public/ are eligible for upload. Each export is isolated.
mkdir -p .wrangler/releases
staging=$(mktemp -d ".wrangler/releases/$revision.XXXXXX")
git archive "$revision" public | tar -x -C "$staging"
npm exec --yes --package=wrangler@4.166.0 -- wrangler pages deploy "$staging/public" \
  --project-name jaisalmervisit --branch "$deploy_branch" --commit-hash "$revision" \
  --commit-message "$(git log -1 --format=%s)"
