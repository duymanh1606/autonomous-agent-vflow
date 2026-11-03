#!/bin/bash
# nogo-precommit.sh — Batch No-Go gate over the git diff (pre-commit / CI).
#
# Wraps check-nogo-zones.sh across every changed file so a commit/PR that
# touches a 🔴 Strict No-Go Zone is BLOCKED mechanically — not left to the
# agent reading context.md and "remembering". This is the file-path enforcement
# leg that turns No-Go from documentation into a guard rail.
#
# Usage:
#   nogo-precommit.sh                      # staged files (default — pre-commit)
#   nogo-precommit.sh --base origin/main   # files changed vs a base ref (CI/PR)
#   nogo-precommit.sh --strict-warn        # treat 🟡 Warning zones as blocking too
#   nogo-precommit.sh --context path/to/context.md
#
# Exit 0 = clean (or only 🟢 Low / advisory).
# Exit 1 = a 🔴 Strict zone was touched (or 🟡 Warning under --strict-warn),
#          or the guard is misconfigured (fail-safe: block rather than allow).

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK="$SCRIPT_DIR/check-nogo-zones.sh"

BASE=""
STRICT_WARN=0
CONTEXT=".v-flow/context.md"

while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="$2"; shift 2 ;;
    --strict-warn) STRICT_WARN=1; shift ;;
    --context) CONTEXT="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [ ! -f "$CHECK" ]; then
  echo "🚫 No-Go guard misconfigured: not found: $CHECK"
  exit 1   # fail-safe — block rather than silently allow
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "✅ Not a git repo — No-Go batch gate skipped"
  exit 0
fi

# Determine the changed-file list.
if [ -n "$BASE" ]; then
  FILES=$(git diff --name-only "$BASE"...HEAD 2>/dev/null || git diff --name-only "$BASE" HEAD)
else
  FILES=$(git diff --cached --name-only)
  [ -z "$FILES" ] && FILES=$(git diff --name-only HEAD)   # manual run convenience
fi

if [ -z "$FILES" ]; then
  echo "✅ No changed files — No-Go gate clean"
  exit 0
fi

BLOCKED=""
WARNED=""

while IFS= read -r file; do
  [ -z "$file" ] && continue
  out=$(bash "$CHECK" "$file" "$CONTEXT")
  code=$?
  case "$code" in
    1) BLOCKED="$BLOCKED\n  $file" ; echo "$out" ;;
    2) WARNED="$WARNED\n  $file" ; echo "$out" ;;
  esac
done <<EOF
$FILES
EOF

echo ""
echo "── No-Go Batch Gate ──"

if [ -n "$BLOCKED" ]; then
  echo -e "🚫 BLOCKED — changed files in 🔴 Strict No-Go Zone:$BLOCKED"
  echo "   Commit/PR rejected. Move the change out of the zone, or get Tech Lead sign-off + update context.md."
  exit 1
fi

if [ -n "$WARNED" ]; then
  echo -e "⚠️  WARNING — changed files in 🟡 No-Go Zone (cần Tech Lead duyệt):$WARNED"
  if [ "$STRICT_WARN" -eq 1 ]; then
    echo "   --strict-warn: treated as blocking."
    exit 1
  fi
  echo "   Advisory (không chặn). Dùng --strict-warn để chặn ở CI."
  exit 0
fi

echo "✅ No changed file touches a Strict/Warning No-Go Zone"
exit 0
