#!/bin/bash
# check-spec-quality.sh — Pre-scan spec.md trước khi BA Critic phản biện adversarial.
# Usage: ./check-spec-quality.sh <spec.md_path>
#
# KHÔNG thay thế critic (LLM). Chỉ surface "smell" cấu trúc để critic neo ≥3 issues
# và không tốn lượt vào lỗi hiển nhiên. Checks: counts (REQ/AC/UC), ambiguity (từ mơ hồ),
# completeness (error path, REQ↔AC), testability (AC mơ hồ).

SPEC="${1:-spec.md}"

if [ ! -f "$SPEC" ]; then
  echo "❌ File not found: $SPEC"
  exit 1
fi

echo "🔎 Spec Quality Pre-Scan: $SPEC"
echo "════════════════════════════════════════"
HINTS=0   # số smell phát hiện → gợi ý cho critic (KHÔNG phải verdict)

# 1. Overview counts — đếm token bằng `grep -o | wc -l` (mỗi match 1 dòng).
echo ""
echo "### 1. Overview"
REQ=$(grep -oE "REQ-[A-Za-z][0-9]+" "$SPEC" | sort -u | wc -l | tr -d ' ')
AC=$(grep -oE "\bAC-[0-9]+\b" "$SPEC" | sort -u | wc -l | tr -d ' ')
UC=$(grep -oE "\bUC-[0-9]+\b" "$SPEC" | sort -u | wc -l | tr -d ' ')
echo "   REQ: $REQ · AC-NN: $AC · UC: $UC"
[ "$REQ" -eq 0 ] && echo "   ⚠️  Không thấy REQ-xxx — spec có thể chưa đặc tả requirement" && HINTS=$((HINTS+1))
[ "$AC" -eq 0 ] && echo "   ⚠️  Không thấy mã AC-NN — Acceptance Criteria chưa đánh mã (§4)" && HINTS=$((HINTS+1))

# 2. Ambiguity — từ mơ hồ (đồng bộ với '5 Chiều Phản Biện' → Ambiguity của SKILL.md).
echo ""
echo "### 2. Ambiguity (từ mơ hồ)"
AMB=0
for word in "nên" "should" "hợp lý" "dễ dùng" "user-friendly" "nhanh" "tối ưu" "linh hoạt" "đơn giản"; do
  count=$(grep -ci "$word" "$SPEC")   # grep -c luôn in số nguyên (0 nếu không có)
  [ "$count" -gt 0 ] && echo "   ⚠️  '$word' xuất hiện $count lần — cần định lượng/làm rõ" && AMB=$((AMB+count))
done
[ "$AMB" -eq 0 ] && echo "   ✅ Không thấy từ mơ hồ phổ biến"
HINTS=$((HINTS+AMB))

# 3. Completeness — có error/exception path không? (signal cho Completeness dimension)
echo ""
echo "### 3. Completeness"
ERRPATH=$(grep -ciE "lỗi|error|ngoại lệ|exception|4[0-9][0-9]|5[0-9][0-9]|timeout|invalid" "$SPEC")
if [ "$ERRPATH" -eq 0 ]; then
  echo "   ⚠️  Không thấy đề cập error/exception path — kiểm tra REQ chỉ có happy path?"
  HINTS=$((HINTS+1))
else
  echo "   ✅ Có đề cập error/exception ($ERRPATH tín hiệu)"
fi
# REQ↔AC: mỗi REQ nên có ≥1 AC. So sánh số đếm (heuristic, critic xác nhận ngữ nghĩa).
if [ "$REQ" -gt 0 ] && [ "$AC" -lt "$REQ" ]; then
  echo "   ⚠️  AC-NN ($AC) ít hơn REQ ($REQ) — có REQ chưa có acceptance criterion?"
  HINTS=$((HINTS+1))
fi

# 4. Testability — AC mơ hồ ("đúng"/"tốt"/"hoạt động" không có expected output cụ thể).
echo ""
echo "### 4. Testability"
VAGUEAC=$(grep -ciE "hoạt động đúng|hoạt động tốt|chính xác|như mong đợi|phù hợp" "$SPEC")
if [ "$VAGUEAC" -gt 0 ]; then
  echo "   ⚠️  $VAGUEAC tiêu chí dạng 'đúng/tốt/phù hợp' — thiếu expected output đo được?"
  HINTS=$((HINTS+1))
fi
[ "$VAGUEAC" -eq 0 ] && echo "   ✅ Không thấy AC mơ hồ kiểu 'đúng/tốt'"

echo ""
echo "════════════════════════════════════════"
echo "📊 Pre-scan hints: $HINTS"
echo "→ Đây CHỈ là gợi ý cấu trúc. Critic vẫn phải tìm ≥3 issues (gồm ambiguity/completeness/"
echo "  consistency/feasibility/testability) bằng phán đoán — KHÔNG dừng ở pre-scan này."
exit 0
