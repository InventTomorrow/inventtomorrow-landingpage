#!/usr/bin/env bash
# Invent Tomorrow — single-command Git release (Windows Git Bash / macOS / Linux)
# Usage: bash release-safe.sh
# From main: makes a new feature/auto-* branch on every release.
# From an unfinished feature/auto-* branch: resumes it, preserving your work.
# Automatically fetches, commits, pushes, merges, tests, builds and pushes main.
# A successful push triggers the existing Vercel Git integration; Vercel readiness
# can only be verified automatically if GitHub CLI exposes a Vercel check.
set -Eeuo pipefail

say()  { printf '\n==> %s\n' "$*"; }
warn() { printf '\nWARNING: %s\n' "$*" >&2; }
stop() { printf '\nSTOP: %s\n' "$*" >&2; exit 1; }
on_error() {
  local status="$1" line="$2"
  printf '\nSTOPPED (exit %s, line %s). No force push or hard reset was used.\n' "$status" "$line" >&2
  printf 'Your changes remain in this repository. Current branch: %s\n' "$(git branch --show-current 2>/dev/null || echo unknown)" >&2
  printf 'After fixing the error, run: bash release-safe.sh\n' >&2
  exit "$status"
}
trap 'on_error "$?" "$LINENO"' ERR

command -v git >/dev/null 2>&1 || stop 'Git is missing.'
command -v npm >/dev/null 2>&1 || stop 'Node.js/npm is missing.'
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || stop 'Run inside the Git repository.'
cd "$ROOT"
[[ -f package.json ]] || stop 'No package.json found at the repository root.'
git remote get-url origin >/dev/null 2>&1 || stop 'Git remote origin is missing.'
git show-ref --verify --quiet refs/heads/main || stop 'Local main branch does not exist.'
[[ -z "$(git ls-files -u)" ]] || stop 'Resolve the unfinished merge first.'
for state in MERGE_HEAD REBASE_HEAD CHERRY_PICK_HEAD; do
  if git rev-parse -q --verify "$state" >/dev/null 2>&1; then
    stop "An unfinished Git operation ($state) must be completed first."
  fi
done

# Safety filter. This permits .env.example (a template) but never actual .env files.
# Also prevents accidental inclusion of generated output and the stray file you saw.
private_or_temporary() {
  local f="$1"
  case "$f" in
    .env.example|*/.env.example) return 1 ;;
    .env|.env.*|*/.env|*/.env.*|*.pem|*.p12|*.pfx|*.key|*.sqlite|*.db|*.log|\
    credentials.json|*/credentials.json|*secrets.json|*/secrets.json|\
    dist/*|*/dist/*|node_modules/*|*/node_modules/*|output/*|*/output/*|\
    coverage/*|*/coverage/*|.vercel/*|*/.vercel/*|.vscode/*|*/.vscode/*|\
    .aistudio/*|*/.aistudio/*|.DS_Store|*/.DS_Store|\
    website-text-copy.txt|before\ main\ merge*) return 0 ;;
  esac
  return 1
}

START="$(git branch --show-current)"
[[ -n "$START" ]] || stop 'Detached HEAD. Switch to main or the unfinished feature/auto branch first.'
case "$START" in
  main)
    BASE="feature/auto-$(date +%Y%m%d-%H%M%S)"
    RELEASE="$BASE"; n=2
    while git show-ref --verify --quiet "refs/heads/$RELEASE" || \
          git ls-remote --exit-code --heads origin "$RELEASE" >/dev/null 2>&1; do
      RELEASE="${BASE}-${n}"; n=$((n+1))
    done
    say "Creating fresh release branch: $RELEASE"
    git switch -c "$RELEASE"
    ;;
  feature/auto-*)
    RELEASE="$START"
    say "Resuming unfinished release branch: $RELEASE"
    ;;
  *)
    stop "Current branch is '$START'. Start from 'main', or resume a feature/auto-* branch. No files were changed."
    ;;
esac

say 'Staging project changes safely (never stage ignored folders)'
# Stage modifications/deletions of tracked files without walking node_modules/dist.
git add -u
# Stage NEW, non-ignored files individually. A blanket git add -A caused the earlier error.
while IFS= read -r -d '' file; do
  if ! private_or_temporary "$file"; then
    git add -- "$file"
  fi
done < <(git ls-files --others --exclude-standard -z)

# Undo already-staged paths that the previous/failed script may have left behind.
while IFS= read -r -d '' file; do
  if private_or_temporary "$file"; then
    git restore --staged -- "$file"
    warn "Skipped local/private file: $file"
  fi
done < <(git diff --cached --name-only -z)

# Uncommitted changes to TRACKED private files are a reason to stop before switching main.
while IFS= read -r -d '' file; do
  if private_or_temporary "$file"; then
    stop "A tracked private/temporary file has local changes: $file. Review it before releasing."
  fi
done < <(git diff --name-only -z)

if ! git diff --cached --quiet; then
  say 'Committing changes'
  git diff --cached --stat
  git diff --cached --check || warn 'Whitespace warnings in staged changes; continuing.'
  git -c core.editor=true commit -m "Website updates ($(date +%Y-%m-%d))"
else
  if [[ "$START" == main ]]; then
    stop 'No new changes found. Nothing to publish.'
  fi
  # Don't accidentally release a feature branch containing no real changes.
  if git merge-base --is-ancestor HEAD main; then
    stop 'This feature branch has no commits ahead of main and no new changes.'
  fi
  say 'No uncommitted changes; resuming already-committed work'
fi

say 'Fetching latest GitHub main'
git fetch origin main
say 'Merging the latest main into the release branch (no editor)'
git -c core.editor=true merge --no-edit origin/main

say 'Pushing release branch to GitHub (creates Vercel preview if configured)'
git push -u origin "$RELEASE"

checks() {
  # Install dependencies if this machine has never installed them.
  if [[ ! -d node_modules ]]; then
    say 'Installing npm dependencies'
    npm ci --no-audit --no-fund
  fi
  say 'Running lint / TypeScript checks'
  npm run lint
  say 'Running all automated tests'
  npm test
  say 'Building website'
  npm run build
  git diff --quiet && git diff --cached --quiet || stop 'Tests/build modified tracked files. Review before deployment.'
}
checks

say 'Confirming remote main has not changed during tests'
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  say 'New changes landed in main: merging, pushing and testing again'
  git -c core.editor=true merge --no-edit origin/main
  git push origin "$RELEASE"
  checks
fi

# Optional, noninteractive Vercel signal through the GitHub checks API.
# This is not a substitute for live n8n/email and API endpoint testing.
check_vercel() {
  local kind="$1" sha repo data i
  if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
    warn "Cannot automatically verify $kind Vercel deployment (authenticated GitHub CLI 'gh' unavailable)."
    return 0
  fi
  repo="$(git remote get-url origin | sed -E 's#^(git@github.com:|https?://github.com/)##; s#\.git$##')"
  if [[ "$repo" != */* || "$repo" == *:* ]]; then
    warn 'Git remote is not a recognized GitHub repository; Vercel status check skipped.'
    return 0
  fi
  sha="$(git rev-parse HEAD)"
  say "Checking $kind Vercel status on GitHub (when published)"
  for ((i=1;i<=24;i++)); do
    # GitHub can expose Vercel as a legacy commit status and/or a check-run.
    data="$(gh api "repos/$repo/commits/$sha/status" --jq '.statuses[] | select(.context | ascii_downcase | contains("vercel")) | .state' 2>/dev/null || true)"
    data+=$'\n'
    data+="$(gh api "repos/$repo/commits/$sha/check-runs" --jq '.check_runs[] | select(.name | ascii_downcase | contains("vercel")) | (.conclusion // .status)' 2>/dev/null || true)"
    if printf '%s\n' "$data" | grep -Eq '^(failure|error|cancelled|timed_out|action_required)$'; then
      stop "Vercel $kind check failed. Check Vercel build logs; main has not been force-pushed."
    fi
    if printf '%s\n' "$data" | grep -Eq '^success$' && \
       ! printf '%s\n' "$data" | grep -Eq '^(pending|queued|in_progress)$'; then
      say "Vercel $kind check successful"
      return 0
    fi
    if [[ $i -eq 3 && -z "$(printf '%s' "$data" | tr -d '[:space:]')" ]]; then
      warn "No Vercel $kind check was published. Continuing; deployment readiness is unverified."
      return 0
    fi
    sleep 10
  done
  stop "Vercel $kind check didn't finish. Inspect the deployment before another release."
}
check_vercel preview

say 'Switching to main and automatically pulling GitHub main'
git switch main
git pull --ff-only origin main

say "Merging tested branch $RELEASE into main (no editor)"
git -c core.editor=true merge --no-ff --no-edit "$RELEASE"
checks

say 'Checking GitHub main again before pushing'
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  stop 'Someone pushed to main during final tests. Nothing pushed to production; review and rerun from feature branch.'
fi

say 'Pushing production main to GitHub (triggers Vercel Git integration)'
git push origin main
check_vercel production

say 'FINISHED: GitHub main updated'
git log -1 --oneline
printf '\nRelease branch: %s\n' "$RELEASE"
printf 'Current branch: %s\n' "$(git branch --show-current)"
printf '\nNOTE: The Git push is automatic. Vercel must be configured for Git deploys.\n'
printf 'If Vercel checks were unavailable, inspect the production deployment and test live n8n/email.\n'
