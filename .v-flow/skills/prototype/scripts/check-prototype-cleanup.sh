#!/bin/bash
# check-prototype-cleanup.sh — Kiểm tra prototype code đã được cleanup chưa
# Usage: ./check-prototype-cleanup.sh <feature-number>
#        ./check-prototype-cleanup.sh 005
#
# Rule: Sau khi có verdict, thư mục prototype/ nên được xóa.
#       Chỉ prototype-notes.md là được phép còn lại.

FEATURE_NUM="${1}"

if [ -z "$FEATURE_NUM" ]; then
  # Auto-detect: tìm feature có prototype-notes.md
  ALL_FEATURES=$(ls -d .v-flow/features/*/ 2>/dev/null)
  if [ -z "$ALL_FEATURES" ]; then
    echo "❌ No feature directories found under .v-flow/features/"
    exit 1
  fi
  # Scan tất cả features
  FOUND_ANY=0
  TOTAL_ERRORS=0

  for FEATURE_DIR in $ALL_FEATURES; do
    PROTOTYPE_DIR="${FEATURE_DIR}prototype/"
    NOTES_FILE="${FEATURE_DIR}prototype-notes.md"

    if [ -f "$NOTES_FILE" ] && [ -d "$PROTOTYPE_DIR" ]; then
      FOUND_ANY=1
      echo "⚠️  STALE PROTOTYPE DETECTED: $FEATURE_DIR"
      echo "   prototype-notes.md exists (verdict captured) BUT prototype/ folder still present"
      echo "   Files in prototype/:"
      ls "$PROTOTYPE_DIR" | sed 's/^/     - /'
      echo "   → Run: rm -rf ${PROTOTYPE_DIR}"
      TOTAL_ERRORS=$((TOTAL_ERRORS+1))
    elif [ -d "$PROTOTYPE_DIR" ] && [ ! -f "$NOTES_FILE" ]; then
      FOUND_ANY=1
      echo "⚠️  PROTOTYPE WITHOUT NOTES: $FEATURE_DIR"
      echo "   prototype/ folder exists but prototype-notes.md is missing"
      echo "   → Capture verdict first, then cleanup"
      TOTAL_ERRORS=$((TOTAL_ERRORS+1))
    fi
  done

  if [ "$FOUND_ANY" -eq 0 ]; then
    echo "✅ No active prototype directories found — all clean"
    exit 0
  fi

  echo ""
  echo "📊 Total issues: $TOTAL_ERRORS"
  [ "$TOTAL_ERRORS" -gt 0 ] && exit 1 || exit 0
fi

# Single feature mode
PADDED=$(printf "%03d" "$FEATURE_NUM" 2>/dev/null || echo "$FEATURE_NUM")
FEATURE_DIR=$(ls -d .v-flow/features/${PADDED}-*/ 2>/dev/null | head -1)
if [ -z "$FEATURE_DIR" ]; then
  FEATURE_DIR=".v-flow/features/${FEATURE_NUM}/"
fi

PROTOTYPE_DIR="${FEATURE_DIR}prototype/"
NOTES_FILE="${FEATURE_DIR}prototype-notes.md"

echo "📋 Prototype Cleanup Check: $FEATURE_DIR"
echo "══════════════════════════════════════════"
ERRORS=0

# Check 1: prototype/ còn tồn tại không
echo ""
echo "### 1. Prototype Directory"
if [ ! -d "$PROTOTYPE_DIR" ]; then
  echo "   ✅ prototype/ directory not found — already cleaned up"
else
  if [ -f "$NOTES_FILE" ]; then
    echo "   ❌ prototype/ still exists after verdict was captured"
    echo "   Files:"
    ls "$PROTOTYPE_DIR" | sed 's/^/     - /'
    echo ""
    echo "   → To cleanup:"
    echo "     rm -rf ${PROTOTYPE_DIR}"
    ERRORS=$((ERRORS+1))
  else
    echo "   ⚠️  prototype/ exists but no prototype-notes.md yet"
    echo "      → Capture verdict first before cleanup"
    ERRORS=$((ERRORS+1))
  fi
fi

# Check 2: prototype-notes.md tồn tại
echo ""
echo "### 2. Prototype Notes (the one thing to keep)"
if [ -f "$NOTES_FILE" ]; then
  echo "   ✅ prototype-notes.md present"
  SIZE=$(wc -c < "$NOTES_FILE" | tr -d ' ')
  [ "$SIZE" -lt 200 ] && echo "   ⚠️  File is very small (${SIZE} bytes) — may be incomplete" && ERRORS=$((ERRORS+1))
else
  echo "   ⚠️  prototype-notes.md not found"
  echo "      → If prototype is done, create notes before deleting prototype/"
fi

echo ""
echo "══════════════════════════════════════════"
echo "📊 Errors: $ERRORS"
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ PASS — prototype cleanup complete"
  exit 0
else
  echo "❌ FAIL — cleanup needed"
  exit 1
fi
