#!/bin/bash
# check-flow-state.sh — Kiểm tra .flow-state.yaml đã được update sau prototype
# Usage: ./check-flow-state.sh <feature-number>
#        ./check-flow-state.sh 005
#
# Checks: artifacts.prototype.* fields tồn tại và có giá trị

FEATURE_NUM="${1}"

if [ -z "$FEATURE_NUM" ]; then
  # Auto-detect từ thư mục features có prototype-notes.md
  FEATURE_DIR=$(ls -d .v-flow/features/*/ 2>/dev/null | while read d; do
    [ -f "${d}prototype-notes.md" ] && echo "$d" && break
  done)
  if [ -z "$FEATURE_DIR" ]; then
    echo "❌ Cannot find feature directory with prototype-notes.md"
    echo "   Usage: $0 <feature-number>  (e.g. $0 005)"
    exit 1
  fi
  FLOW_STATE="${FEATURE_DIR}.flow-state.yaml"
else
  # Zero-pad nếu cần (005, 012, etc.)
  PADDED=$(printf "%03d" "$FEATURE_NUM" 2>/dev/null || echo "$FEATURE_NUM")
  FEATURE_DIR=$(ls -d .v-flow/features/${PADDED}-*/ 2>/dev/null | head -1)
  if [ -z "$FEATURE_DIR" ]; then
    FEATURE_DIR=".v-flow/features/${FEATURE_NUM}/"
  fi
  FLOW_STATE="${FEATURE_DIR}.flow-state.yaml"
fi

if [ ! -f "$FLOW_STATE" ]; then
  echo "❌ .flow-state.yaml not found: $FLOW_STATE"
  exit 1
fi

echo "📋 Flow State Check (prototype section): $FLOW_STATE"
echo "════════════════════════════════════════════════════"
ERRORS=0
WARNINGS=0

# 1. Section artifacts.prototype tồn tại
echo ""
echo "### 1. Prototype Section Exists"
if grep -q "prototype" "$FLOW_STATE"; then
  echo "   ✅ 'prototype' section found"
else
  echo "   ❌ No 'prototype' section in .flow-state.yaml"
  echo "      Add: artifacts.prototype.verdict, artifacts.prototype.branch, etc."
  ERRORS=$((ERRORS+1))
fi

# 2. Verdict đã được điền
echo ""
echo "### 2. Verdict Field"
VERDICT=$(grep -A5 "prototype" "$FLOW_STATE" | grep -i "verdict" | grep -oiE "VALIDATED|REJECTED|INCONCLUSIVE|null|~|\"\"" | head -1)
if [ -z "$VERDICT" ]; then
  echo "   ⚠️  verdict field not found under prototype section"
  WARNINGS=$((WARNINGS+1))
elif echo "$VERDICT" | grep -qiE "null|~|\"\""; then
  echo "   ❌ verdict is empty/null — prototype not yet concluded"
  ERRORS=$((ERRORS+1))
else
  echo "   ✅ verdict: $VERDICT"
fi

# 3. Branch đã được điền
echo ""
echo "### 3. Branch Field"
BRANCH=$(grep -A5 "prototype" "$FLOW_STATE" | grep -i "branch" | grep -oiE "LOGIC|UI|null|~|\"\"" | head -1)
if [ -z "$BRANCH" ] || echo "$BRANCH" | grep -qiE "null|~|\"\""; then
  echo "   ⚠️  branch field empty/missing (should be LOGIC or UI)"
  WARNINGS=$((WARNINGS+1))
else
  echo "   ✅ branch: $BRANCH"
fi

# 4. Phase hiện tại có tiến sang B.0 chưa
echo ""
echo "### 4. Pipeline Phase"
CURRENT_PHASE=$(grep -i "current_phase\|phase:" "$FLOW_STATE" | head -1 | grep -oE "S\.[0-9.]+|B\.[0-9.]+|R\.[0-9.]+")
if [ -z "$CURRENT_PHASE" ]; then
  echo "   ⚠️  Cannot determine current phase"
  WARNINGS=$((WARNINGS+1))
else
  echo "   ℹ️  Current phase: $CURRENT_PHASE"
  if [[ "$CURRENT_PHASE" == "S.1.5" ]]; then
    echo "   ⚠️  Still at S.1.5 — have you routed to /v.plan yet?"
    WARNINGS=$((WARNINGS+1))
  fi
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "📊 Errors: $ERRORS | Warnings: $WARNINGS"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo "✅ PASS — .flow-state.yaml correctly updated"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo "⚠️  PASS WITH WARNINGS — check warnings above"
  exit 0
else
  echo "❌ FAIL — .flow-state.yaml needs to be updated before continuing"
  exit 1
fi
