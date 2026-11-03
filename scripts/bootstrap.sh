#!/usr/bin/env bash
# bootstrap.sh: Khởi tạo toàn bộ môi trường (CLI, Python, Tooling) cho V-Flow
# Usage: ./scripts/bootstrap.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "🚀 V-FLOW BOOTSTRAP — CÀI ĐẶT MÔI TRƯỜNG TỰ ĐỘNG 1 BƯỚC"
echo "=========================================================="

# 1. Kiểm tra Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Lỗi: Chưa tìm thấy Node.js. Vui lòng cài đặt Node.js >= 18." >&2
  exit 1
fi
echo "✔ Node.js: $(node --version)"

# 2. Cài đặt thư viện cho v-flow CLI (vendor nội bộ)
echo "▶ Cài đặt thư viện cho v-flow CLI..."
if [ -d "$ROOT_DIR/vendor/v-flow-cli" ]; then
  (cd "$ROOT_DIR/vendor/v-flow-cli" && npm install --silent)
  # Thử link toàn cục để gõ trực tiếp `v-flow` ở mọi nơi
  npm link ./vendor/v-flow-cli 2>/dev/null || npm install -g ./vendor/v-flow-cli 2>/dev/null || true
fi

# Đảm bảo bin/v-flow có quyền thực thi và có trong PATH
chmod +x "$ROOT_DIR/bin/v-flow" 2>/dev/null || true
export PATH="$ROOT_DIR/bin:$PATH"

if command -v v-flow &> /dev/null; then
  echo "✔ v-flow CLI: $(v-flow --version) (sẵn sàng)"
else
  echo "✔ v-flow CLI: Wrapper tại ./bin/v-flow (sẵn sàng)"
fi

# 3. Cấu hình file môi trường
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "▶ Tạo tệp cấu hình .env từ .env.example..."
  cp .env.example .env
fi

# 4. Cài đặt môi trường Python ứng dụng (nếu có uv hoặc python3)
echo "▶ Kiểm tra môi trường Python..."
if command -v uv &> /dev/null; then
  echo "✔ Tìm thấy uv, tiến hành đồng bộ dependencies..."
  uv sync || true
elif command -v python3 &> /dev/null; then
  if [ ! -d ".venv" ]; then
    echo "▶ Tạo virtual environment .venv..."
    python3 -m venv .venv
  fi
  source .venv/bin/activate
  if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt || true
  fi
  echo "✔ Môi trường Python đã sẵn sàng."
fi

echo "=========================================================="
echo "🎉 HOÀN TẤT THIẾT LẬP MÔI TRƯỜNG!"
echo ""
echo "Bạn có thể chạy ngay luồng V-Flow:"
echo "👉 Cách 1 (AI Chat trong Claude Code / Cursor / Antigravity):"
echo "   Gõ: /v.code-to-vsaf-slice"
echo ""
echo "👉 Cách 2 (Terminal CLI):"
echo "   Chạy: ./scripts/code-to-slice.sh"
echo "=========================================================="
