#!/bin/bash
# quick-security-scan.sh — Quét code cho security issues phổ biến
# Usage: ./quick-security-scan.sh <directory>
#
# Output: Danh sách potential issues cho Review Agent xem xét

DIR="${1:-.}"

echo "🔒 Security Scan: $DIR"
echo "════════════════════════════════════════"
echo ""

# 1. SQL Injection — SQL keyword + nối chuỗi trên cùng dòng (BẤT KỂ thứ tự).
# Bug cũ: regex yêu cầu concat ĐỨNG TRƯỚC keyword nên bỏ sót `"SELECT...id=" + id`
# (keyword đứng trước). Nay tách 2 grep: lọc dòng có SQL keyword, rồi lọc dòng có concat.
echo "### 1. Potential SQL Injection"
SQLI=$(grep -rnI --include="*.js" --include="*.ts" --include="*.py" -iE "(select|insert|update|delete)" "$DIR" 2>/dev/null \
  | grep -E "(\\\$\{|['\"][[:space:]]*\+|\+[[:space:]]*['\"])")
if [ -n "$SQLI" ]; then echo "$SQLI"; else echo "   ✅ None found"; fi
echo ""

# 2. Hardcoded secrets
echo "### 2. Hardcoded Secrets"
grep -rnI --include="*.js" --include="*.ts" --include="*.py" --include="*.json" \
  -E "(password|api_?key|secret|token)\s*[=:]\s*['\"][^'\"]{8,}" \
  "$DIR" 2>/dev/null | grep -v "node_modules\|\.env\.example\|test\|spec\|mock" || echo "   ✅ None found"
echo ""

# 3. Sensitive data in logs
echo "### 3. Sensitive Data in Logs"
grep -rnI --include="*.js" --include="*.ts" --include="*.py" \
  -E "console\.(log|info|debug|warn)\(.*([Pp]assword|[Tt]oken|[Ss]ecret|[Cc]redential)" \
  "$DIR" 2>/dev/null || echo "   ✅ None found"
echo ""

# 4. Missing input validation
echo "### 4. Direct req.body Usage (potential missing validation)"
# Bug cũ: `grep | head || echo` — head luôn exit 0 (kể cả input rỗng) nên "None found"
# không bao giờ in. Nay bắt vào biến rồi mới quyết định.
REQBODY=$(grep -rnI --include="*.js" --include="*.ts" -E "req\.body\.[a-zA-Z]+" "$DIR" 2>/dev/null | head -20)
if [ -n "$REQBODY" ]; then echo "$REQBODY"; else echo "   ✅ None found"; fi
echo ""

# 5. Dangerous functions
echo "### 5. Dangerous Functions"
grep -rnI --include="*.js" --include="*.ts" \
  -E "(eval\(|innerHTML\s*=|dangerouslySetInnerHTML|exec\(|child_process)" \
  "$DIR" 2>/dev/null || echo "   ✅ None found"
echo ""

echo "════════════════════════════════════════"
echo "📊 Scan complete. Review findings above."
