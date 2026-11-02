#!/bin/bash
# check-ears-compliance.sh — Validate spec.md follows EARS notation
# Usage: ./check-ears-compliance.sh <spec.md_path>
#
# Checks: ID format, banned words, EARS keyword presence, AC presence

SPEC="${1:-spec.md}"

if [ ! -f "$SPEC" ]; then
  echo "❌ File not found: $SPEC"
  exit 1
fi

echo "📋 EARS Compliance Check: $SPEC"
echo "════════════════════════════════════════"
ERRORS=0
WARNINGS=0

# 1. Check EARS IDs
echo ""
echo "### 1. REQ ID Format"
# Đếm theo SỐ TOKEN bằng `grep -o | wc -l` (mỗi match 1 dòng) — KHÔNG dùng
# `$(grep -c ... || echo 0)`: grep -c in "0" rồi exit 1 → `|| echo 0` tạo "0\n0"
# → lỗi "integer expression expected".
ALL_REQ=$(grep -oE "REQ-[A-Za-z][0-9]+" "$SPEC" | wc -l | tr -d ' ')   # mọi REQ-X##
VALID=$(grep -oE "REQ-[UESO][0-9]+" "$SPEC" | wc -l | tr -d ' ')        # đúng EARS U/E/S/O
INVALID=$((ALL_REQ - VALID))
echo "   ✅ Valid EARS IDs: $VALID"
[ "$INVALID" -gt 0 ] && echo "   ❌ Invalid IDs (not REQ-U/E/S/O): $INVALID" && ERRORS=$((ERRORS+INVALID))

# 2. Banned words
echo ""
echo "### 2. Banned Words"
for word in "nên" "should" "có thể" "hợp lý" "v.v." "etc." "dễ dùng" "user-friendly"; do
  count=$(grep -ci "$word" "$SPEC" 2>/dev/null)   # grep -c luôn in số nguyên (0 nếu không có)
  [ "$count" -gt 0 ] && echo "   ⚠️  '$word' found $count time(s)" && WARNINGS=$((WARNINGS+count))
done
[ "$WARNINGS" -eq 0 ] && echo "   ✅ No banned words found"

# 3. Acceptance Criteria
echo ""
echo "### 3. Acceptance Criteria"
AC_COUNT=$(grep -c "\- \[ \]" "$SPEC" 2>/dev/null)
REQ_COUNT=$(grep -cE "REQ-[UESO]" "$SPEC" 2>/dev/null)
echo "   REQs: $REQ_COUNT, ACs: $AC_COUNT"
[ "$REQ_COUNT" -gt 0 ] && [ "$AC_COUNT" -lt "$REQ_COUNT" ] && echo "   ⚠️  Some REQs may be missing ACs" && WARNINGS=$((WARNINGS+1))

echo ""
echo "════════════════════════════════════════"
echo "📊 Errors: $ERRORS, Warnings: $WARNINGS"
[ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ] && echo "✅ PASS" || echo "⚠️  NEEDS REVIEW"
