#!/bin/bash
# check-nogo-zones.sh — Kiểm tra file có nằm trong No-Go Zone
# Usage: ./check-nogo-zones.sh <file_path> [context.md_path]
#
# Exit codes:
#   0 = File OK (không trong No-Go Zone; hoặc chỉ khớp mức 🟢 Thấp → LOG, được phép)
#   1 = File BLOCKED (🔴 Strict — HOẶC zone không đánh mức → mặc định Strict, fail-safe)
#   2 = File WARNING (🟡 cần Tech Lead approval)

FILE="$1"
CONTEXT="${2:-.v-flow/context.md}"

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file_path> [context.md_path]"
  exit 0
fi

if [ ! -f "$CONTEXT" ]; then
  echo "✅ No context.md found — greenfield project, no No-Go Zones"
  exit 0
fi

# Extract No-Go Zones section from context.md
# Dùng `sed '$d'` (POSIX) thay cho `head -n -1` (GNU-only) — trên macOS/BSD `head -n -1`
# lỗi → section rỗng → guard FAIL OPEN (báo PASS cho file cấm). Đây là bug an toàn.
NOGO_SECTION=$(sed -n '/No-Go Zones/,/^##[^#]/p' "$CONTEXT" | sed '$d')

if [ -z "$NOGO_SECTION" ]; then
  echo "✅ No No-Go Zones defined in context.md"
  exit 0
fi

# path_matches FILE ZONE → 0 nếu FILE LÀ zone, NẰM TRONG zone (dir), hoặc zone là 1
# path-segment trọn vẹn của FILE. Dùng so khớp theo ranh giới path — KHÔNG substring
# (tránh false positive: zone `auth.js` KHÔNG còn chặn nhầm `oauth.js`).
path_matches() {
  local file="$1" zone="$2"
  zone="${zone#./}"; zone="${zone%/}"
  case "$file" in
    "$zone") return 0 ;;        # khớp path tuyệt đối
    "$zone"/*) return 0 ;;      # file nằm trong thư mục zone
    */"$zone") return 0 ;;      # zone là segment cuối (file/dir)
    */"$zone"/*) return 0 ;;    # zone là segment giữa đường dẫn
  esac
  return 1
}

# Check 5: test file của 1 module No-Go cũng là No-Go.
# Map ngược test file → source: test/payment.test.js → payment.js ; foo.spec.ts → foo.ts
src_of_test() {
  echo "$1" | sed -E 's#(^|/)(__tests__|__test__|tests?|spec)/##; s#\.(test|spec)\.([A-Za-z]+)$#.\2#'
}

# is_test_of FILE ZONE → 0 nếu FILE là test file có basename source == basename zone.
# Heuristic theo basename (test path không mang thư mục source) — over-block an toàn cho zone.
is_test_of() {
  local file="$1" zone="$2" src
  case "$zone" in */) return 1 ;; esac      # zone là thư mục, không phải file → bỏ
  src=$(src_of_test "$file")
  [ "$src" = "$file" ] && return 1          # không phải test file
  [ "$(basename "$src")" = "$(basename "$zone")" ] && return 0
  return 1
}

# Phân loại từng zone theo marker mức độ TRÊN DÒNG chứa nó. FAIL-SAFE: một path trong
# backtick KHÔNG có marker (hoặc đánh 🔴/Cao/strict/critical) → STRICT (block). CHỈ hạ cấp
# khi có marker rõ ràng: 🟡/Trung bình/warning → WARN; 🟢/Thấp → LOG. Tránh để vùng cấm
# lọt qua chỉ vì tác giả quên đánh dấu mức độ (trước đây không marker = exit 0 im lặng).
STRICT_ZONES=""; WARN_ZONES=""; LOG_ZONES=""
while IFS= read -r line; do
  zones=$(printf '%s\n' "$line" | grep -oE '`[^`]+`' | tr -d '`')
  [ -z "$zones" ] && continue
  if printf '%s' "$line" | grep -qi "🟢\|Thấp"; then
    LOG_ZONES="$LOG_ZONES
$zones"
  elif printf '%s' "$line" | grep -qi "🟡\|Trung bình\|warning"; then
    WARN_ZONES="$WARN_ZONES
$zones"
  else
    STRICT_ZONES="$STRICT_ZONES
$zones"
  fi
done <<EOF
$NOGO_SECTION
EOF

# Check 1/2/5 — Strict (🔴) → BLOCK
while IFS= read -r zone; do
  [ -z "$zone" ] && continue
  if path_matches "$FILE" "$zone"; then
    echo "🚫 BLOCKED: '$FILE' matches Strict No-Go Zone: '$zone'"
    echo "   Action: STOP — cannot edit this file"
    exit 1
  fi
  if is_test_of "$FILE" "$zone"; then
    echo "🚫 BLOCKED: '$FILE' là test của module No-Go '$zone' (Check 5)"
    echo "   Action: STOP — test file của module No-Go cũng là No-Go"
    exit 1
  fi
done <<EOF
$STRICT_ZONES
EOF

# Check 1/2/5 — Warning (🟡) → cần Tech Lead approval
while IFS= read -r zone; do
  [ -z "$zone" ] && continue
  if path_matches "$FILE" "$zone" || is_test_of "$FILE" "$zone"; then
    echo "⚠️  WARNING: '$FILE' matches Warning No-Go Zone: '$zone'"
    echo "   Action: Needs Tech Lead approval before editing"
    exit 2
  fi
done <<EOF
$WARN_ZONES
EOF

# 🟢 Thấp → LOG (được phép, chỉ ghi nhận — KHÔNG block, KHÔNG cần duyệt)
while IFS= read -r zone; do
  [ -z "$zone" ] && continue
  if path_matches "$FILE" "$zone" || is_test_of "$FILE" "$zone"; then
    echo "📝 LOG: '$FILE' thuộc No-Go Zone mức Thấp (🟢): '$zone' — được phép sửa, đã ghi nhận."
    exit 0
  fi
done <<EOF
$LOG_ZONES
EOF

# Check 3 (advisory) — file có import/require module No-Go không?
if [ -f "$FILE" ] && [ -n "$STRICT_ZONES" ]; then
  IMPORTED=""
  while IFS= read -r zone; do
    [ -z "$zone" ] && continue
    base=$(basename "$zone"); base="${base%.*}"
    [ -z "$base" ] && continue
    if grep -Eq "(require|import|from)[^A-Za-z0-9_]+['\"][^'\"]*${base}" "$FILE" 2>/dev/null; then
      IMPORTED="$IMPORTED $zone"
    fi
  done <<EOF
$STRICT_ZONES
EOF
  if [ -n "$IMPORTED" ]; then
    echo "ℹ️  NOTE: '$FILE' import module No-Go:$IMPORTED"
    echo "   Import READ-ONLY OK — KHÔNG sửa behavior module No-Go, chỉ wrap/adapter."
    echo "   (Check 4 — config side-effect — cần agent tự rà thủ công.)"
  fi
fi

echo "✅ '$FILE' is NOT in any No-Go Zone"
exit 0
