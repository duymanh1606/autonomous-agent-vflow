#!/bin/bash
# check-prototype-notes.sh — Validate prototype-notes.md có đủ required fields
# Usage: ./check-prototype-notes.sh <prototype-notes.md path>
#
# Checks: required fields, verdict value, REQ refs, spec impact, routing

NOTES="${1:-.v-flow/features/*/prototype-notes.md}"

# Nếu dùng glob, lấy file đầu tiên tìm được
if [[ "$NOTES" == *"*"* ]]; then
  NOTES=$(ls .v-flow/features/*/prototype-notes.md 2>/dev/null | head -1)
fi

if [ ! -f "$NOTES" ]; then
  echo "❌ File not found: $NOTES"
  echo "   Usage: $0 <path/to/prototype-notes.md>"
  exit 1
fi

echo "📋 Prototype Notes Compliance Check: $NOTES"
echo "════════════════════════════════════════════"
ERRORS=0
WARNINGS=0

# 1. Required fields
echo ""
echo "### 1. Required Fields"
REQUIRED_FIELDS=("Branch" "Question" "Verdict" "REQ refs" "Spec impact" "Routing")
for field in "${REQUIRED_FIELDS[@]}"; do
  if grep -qi "$field" "$NOTES"; then
    echo "   ✅ '$field' present"
  else
    echo "   ❌ '$field' MISSING"
    ERRORS=$((ERRORS+1))
  fi
done

# 2. Verdict value phải hợp lệ
echo ""
echo "### 2. Verdict Value"
VERDICT=$(grep -i "verdict" "$NOTES" | grep -oiE "VALIDATED|REJECTED|INCONCLUSIVE" | head -1)
if [ -z "$VERDICT" ]; then
  echo "   ❌ No valid verdict found (must be VALIDATED | REJECTED | INCONCLUSIVE)"
  ERRORS=$((ERRORS+1))
else
  echo "   ✅ Verdict: $VERDICT"
fi

# 3. REQ refs có format đúng không
echo ""
echo "### 3. REQ References"
REQ_COUNT=$(grep -oE "REQ-[UESO][0-9]+" "$NOTES" | wc -l | tr -d ' ')
if [ "$REQ_COUNT" -eq 0 ]; then
  echo "   ⚠️  No REQ-xxx references found (should link to spec requirements)"
  WARNINGS=$((WARNINGS+1))
else
  echo "   ✅ REQ refs found: $REQ_COUNT ($(grep -oE 'REQ-[UESO][0-9]+' "$NOTES" | sort -u | tr '\n' ' '))"
fi

# 4. Run command documented
echo ""
echo "### 4. Run Command"
if grep -qiE "(run command|cách chạy|npm run|pnpm|tsx|python|bun)" "$NOTES"; then
  echo "   ✅ Run command documented"
else
  echo "   ⚠️  No run command found (user needs to know how to start the prototype)"
  WARNINGS=$((WARNINGS+1))
fi

# 5. Kết quả interact (evidence for verdict)
echo ""
echo "### 5. Interact Evidence"
if grep -qiE "(\[x\]|\[✓\]|✅|✔|case|test|interact|kết quả|result|finding)" "$NOTES"; then
  echo "   ✅ Interact results present"
else
  echo "   ⚠️  No evidence of user interaction (verdict without evidence is unreliable)"
  WARNINGS=$((WARNINGS+1))
fi

# 6. Cleanup checklist
echo ""
echo "### 6. Cleanup Checklist"
if grep -qiE "(cleanup|flow-state|_session|prototype/)" "$NOTES"; then
  echo "   ✅ Cleanup references present"
else
  echo "   ⚠️  No cleanup checklist (flow-state.yaml, _session.md may not be updated)"
  WARNINGS=$((WARNINGS+1))
fi

echo ""
echo "════════════════════════════════════════════"
echo "📊 Errors: $ERRORS | Warnings: $WARNINGS"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo "✅ PASS — prototype-notes.md is complete"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo "⚠️  PASS WITH WARNINGS — review warnings before routing to next phase"
  exit 0
else
  echo "❌ FAIL — fix $ERRORS error(s) before continuing pipeline"
  exit 1
fi
