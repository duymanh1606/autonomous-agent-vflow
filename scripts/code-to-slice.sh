#!/usr/bin/env bash
# code-to-slice.sh: Lệnh một bước trọn gói từ dò code tới chia slice trong V Flow
# Usage: ./scripts/code-to-slice.sh <feature-name> [variant]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Nếu người dùng không truyền tên, tự động lấy tên dự án hiện tại
PROJECT_NAME="$(basename "$PROJECT_DIR")"
FEATURE="${1:-$PROJECT_NAME}"
VARIANT="${2:-main-first}"

echo "=========================================================="
echo "🚀 V FLOW — KHỞI CHẠY TRỌN GÓI: TỪ DÒ CODE TỚI CHIA SLICE"
echo "   Feature: $FEATURE | Default Variant: $VARIANT"
echo "=========================================================="

# 1. Kiểm tra môi trường V-Flow
if [ ! -d ".v-flow" ]; then
  echo "▶ Khởi tạo cấu trúc .v-flow/..."
  v-flow init
fi

# 2. Khởi tạo feature nếu chưa có
FEATURE_DIR=".v-flow/features/$FEATURE"
if [ ! -d "$FEATURE_DIR" ]; then
  echo "▶ Tạo cấu trúc feature: $FEATURE..."
  v-flow feature create "$FEATURE" --type legacy
fi

# 3. Thông báo cho người dùng
echo "▶ Trạng thái Feature: $FEATURE đã sẵn sàng."
echo "▶ Để AI chạy tự động trọn gói từ dò code (U.0) -> Spec (S.1) -> Plan (B.0) -> Slice (B.0c):"
echo "   👉 Gõ lệnh trong chat: /v.code-to-slice $FEATURE"
echo "=========================================================="
