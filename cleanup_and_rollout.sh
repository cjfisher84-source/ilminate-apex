#!/usr/bin/env bash
# =============================================================================
# Ilminate APEX — Simplified cleanup for current structure
# - Current app is already in ilminate-apex (connected to Amplify d15dkeaak9f84h)
# - Just ensures everything is committed and pushed
# =============================================================================
set -euo pipefail
C0="$(printf '\033[0m')"; C1="$(printf '\033[36m')"; C2="$(printf '\033[32m')"; C3="$(printf '\033[33m')"; C4="$(printf '\033[31m')"
log() { printf "%s[%s]%s %s\n" "$C1" "$(date +%H:%M:%S)" "$C0" "$*"; }
ok() { printf "%s[OK ]%s %s\n" "$C2" "$C0" "$*"; }
warn() { printf "%s[WARN]%s %s\n" "$C3" "$C0" "$*"; }
err() { printf "%s[ERR ]%s %s\n" "$C4" "$C0" "$*"; }

START="$(date +%Y%m%d_%H%M%S)"
LOG=".apex_rollout_${START}.log"
exec > >(tee -a "$LOG") 2>&1

BASE_DIR="$PWD"
log "Current app directory: $BASE_DIR"
log "Connected to Amplify app: d15dkeaak9f84h"

# Ensure git is clean
if git diff-index --quiet HEAD --; then
  ok "Working tree is clean."
else
  warn "Uncommitted changes detected. Committing..."
  git add -A
  git commit -m "chore: automated commit before triage feature addition" || true
fi

# Push to remote
if git remote -v | grep -q origin; then
  log "Pushing current state to origin..."
  git push -u origin main
  ok "Pushed to remote."
else
  warn "No remote 'origin' configured."
fi

ok "Rollout check complete. Ready for next steps."
echo "Log: $LOG"

