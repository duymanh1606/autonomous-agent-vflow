#!/bin/bash
# check-constitution.sh — Phần CƠ HỌC (tool-enforced) của Constitution compliance.
# KHÔNG thay thế LLM review cho rule semantic (architecture/layering/API) — chỉ chạy
# các check có thể tự động hóa: (1) scan hardcoded secret, (2) chạy linter của dự án.
#
# Usage:
#   ./check-constitution.sh [--base <git-ref>] [--lint "<command>"]
#   --base   : so changed files với ref này (mặc định: HEAD + staged)
#   --lint   : lệnh lint tường minh; nếu bỏ → đọc .v-flow/config.yaml → lint_command,
#              rồi autodetect (npm run lint / flutter analyze / ruff). Không có → skip.
#
# Exit: 0 = PASS · 1 = FAIL (secret tìm thấy hoặc lint fail)

set -u
BASE=""
LINT_CMD=""
while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="$2"; shift 2 ;;
    --lint) LINT_CMD="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

FAIL=0

# ── Danh sách changed files ──────────────────────────────────────────────
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ℹ️  Không phải git repo — bỏ qua phần changed-files; chỉ chạy lint nếu có."
  CHANGED=""
else
  if [ -n "$BASE" ]; then
    CHANGED=$(git diff --name-only --diff-filter=ACM "$BASE" 2>/dev/null)
  else
    CHANGED=$( (git diff --name-only --diff-filter=ACM HEAD 2>/dev/null; \
                git diff --cached --name-only --diff-filter=ACM 2>/dev/null) | sort -u)
  fi
fi

# ── Check 1: Hardcoded secrets (deterministic) ───────────────────────────
echo "── Secret scan (changed files) ──"
SECRET_RE='(AKIA[0-9A-Z]{16})|(-----BEGIN [A-Z ]*PRIVATE KEY-----)|(([Aa][Pp][Ii]_?[Kk][Ee][Yy]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Tt][Oo][Kk][Ee][Nn]|[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd])[[:space:]]*[:=][[:space:]]*['"'"'"][^'"'"'"]{8,}['"'"'"])'
# Allowlist: env-var, ví dụ, placeholder — bỏ qua để giảm false positive
ALLOW_RE='process\.env|os\.environ|getenv|import\.meta\.env|example|placeholder|changeme|dummy|<your|xxxx|REDACTED|\$\{'
SECRET_HITS=0
if [ -n "$CHANGED" ]; then
  while IFS= read -r f; do
    [ -z "$f" ] || [ ! -f "$f" ] && continue
    case "$f" in *.lock|*.png|*.jpg|*.svg|*.min.js) continue ;; esac
    hits=$(grep -EnI "$SECRET_RE" "$f" 2>/dev/null | grep -Ev "$ALLOW_RE")
    if [ -n "$hits" ]; then
      echo "🚫 Hardcoded secret nghi vấn trong $f:"
      echo "$hits" | sed 's/^/     /'
      SECRET_HITS=$((SECRET_HITS+1))
    fi
  done <<EOF
$CHANGED
EOF
fi
if [ "$SECRET_HITS" -eq 0 ]; then echo "✅ Không thấy hardcoded secret."; else FAIL=1; fi

# ── Check 2: Linter của dự án ────────────────────────────────────────────
echo "── Linter ──"
if [ -z "$LINT_CMD" ] && [ -f .v-flow/config.yaml ]; then
  LINT_CMD=$(grep -E '^[[:space:]]*lint_command:' .v-flow/config.yaml 2>/dev/null \
             | head -1 | sed -E 's/^[^:]*:[[:space:]]*//; s/^["'"'"']//; s/["'"'"']$//')
fi
if [ -z "$LINT_CMD" ]; then
  if [ -f package.json ] && grep -q '"lint"' package.json 2>/dev/null; then LINT_CMD="npm run -s lint"
  elif [ -f pubspec.yaml ]; then LINT_CMD="flutter analyze"
  elif command -v ruff >/dev/null 2>&1 && ls ./*.py >/dev/null 2>&1; then LINT_CMD="ruff check ."
  fi
fi
if [ -z "$LINT_CMD" ]; then
  echo "⚠️  Không xác định được lệnh lint — set .v-flow/config.yaml → lint_command hoặc dùng --lint. (skip)"
else
  echo "▶  $LINT_CMD"
  if eval "$LINT_CMD"; then echo "✅ Lint pass."; else echo "🚫 Lint FAIL."; FAIL=1; fi
fi

echo "────────────────────────────"
if [ "$FAIL" -eq 0 ]; then
  echo "✅ check-constitution: PASS (phần cơ học). Rule semantic vẫn cần LLM/human review."
  exit 0
else
  echo "🚫 check-constitution: FAIL — sửa trước khi commit."
  exit 1
fi
