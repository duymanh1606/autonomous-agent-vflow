# Autonomous Agent (V Flow)

Hệ thống Agent tự động hóa tương tác tin nhắn khách hàng đa nền tảng (TikTok Web), hỗ trợ giám sát thời gian thực qua Dashboard WebSocket và cơ chế chuyển giao người thật (Operator Takeover). Dự án được chuẩn hóa phát triển theo quy trình **V Flow** (Spec-Driven Development).

---

## 🚀 Tính năng cốt lõi

1. **Messaging Agent (`messaging-agent`)**:
   - Tự động nhận diện và phản hồi tin nhắn khách hàng TikTok.
   - Tự động xử lý tin nhắn ảnh/sticker không hỗ trợ và hỏi đáp giá/tồn kho.
2. **TikTok Platform Adapter (`tiktok-platform`)**:
   - Kết nối và duy trì phiên làm việc TikTok Web tự động, chống checkpoint/khóa tài khoản.
3. **Operator Handoff (`handoff-escalation`)**:
   - Cho phép nhân viên (Operator) tiếp quản cuộc hội thoại khi gặp ca phức tạp.
   - Tự động tạm ngưng bot trong lúc nhân viên chat và hoàn trả quyền khi xong.
4. **Silent Follow-up (Nudge Engine)**:
   - Tự động gửi tin nhắn chăm sóc/nhắc nhở khách hàng im lặng sau thời gian cấu hình.
5. **Dashboard & Supervisor (`dashboard-supervisor`)**:
   - Giao diện giám sát đa tài khoản, bật/tắt/tạm dừng agent thời gian thực qua WebSocket.
   - Quản lý đơn hàng và đồng bộ tự động về Google Sheet.

---

## 📁 Cấu trúc quy trình V Flow (`.v-flow/`)

Dự án áp dụng mô hình **Spec-Driven Development** với các tài liệu đã được trích xuất và phân tích tự động:

```text
.v-flow/
├── context.md              # Tổng quan kiến trúc & các vùng cấm chạm (No-go zones)
├── constitution.md         # Quy chuẩn lập trình, format code và testing
├── agent-config.md         # Cấu hình gán model cho 14 agent (Sonnet tier)
├── modules/                # Thẻ nghiệp vụ (Module Cards) bóc tách từ code
│   ├── messaging-agent/
│   ├── tiktok-platform/
│   ├── handoff-escalation/
│   └── dashboard-supervisor/
└── features/001-autonomous-agent-vflow/
    ├── spec.md             # Đặc tả 15 yêu cầu kỹ thuật (REQ-01..15) & 14 AC chuẩn EARS
    ├── plan.md & tasks.md  # Kế hoạch kỹ thuật và phân rã 16 tasks (T-001..T-016)
    ├── test-cases.md       # 18 test cases (TC-01..TC-18) bao phủ 100% AC
    ├── validation-report.md# Báo cáo Master Check (Verdict: PASS_WITH_CONCERNS, Quality 88%)
    └── slices.md           # Kế hoạch 12 lát cắt dọc demo được (đã khóa 🔒)
```

---

## 🗺️ Lộ trình triển khai lát cắt (Slice Roadmap)

Dự án được phân rã thành **12 lát cắt dọc (Vertical Slices)** theo chiến lược `main-first`:

* **`SLICE-0`**: Nền tảng Database, schema migration, cô lập dữ liệu đa tài khoản.
* **`SLICE-1` (Tracer Bullet)**: Tự động trả lời tin nhắn TikTok (luồng chính demo thông UI -> DB).
* **`SLICE-2`**: Nhân viên tiếp quản (Operator takeover) và hoàn trả hội thoại.
* **`SLICE-3`**: Tự động follow-up khách hàng im lặng.
* **`SLICE-4`**: Bảng điều khiển vận hành tài khoản qua WebSocket Dashboard.
* **`SLICE-5`**: Quản lý đơn hàng và đồng bộ Google Sheet.
* **`SLICE-6`..`SLICE-11`**: Xử lý các luồng ngoại lệ (tin ảnh/sticker, tồn kho, phân quyền, lỗi webhook).

---

## 🛠️ Hướng dẫn sử dụng

### 1. Điều khiển quy trình AI (V Flow)
Trong cửa sổ chat (Claude CLI / Antigravity IDE):
* **Chạy trọn gói từ dò code tới chia slice (1 lệnh duy nhất):**
  ```text
  /v.code-to-slice
  ```
  *(hoặc chạy script terminal: `./scripts/code-to-slice.sh`)*
* **Bắt đầu viết code TDD theo từng slice:**
  ```text
  /v.implement
  ```
* **Kiểm định chất lượng chéo:**
  ```text
  /v.check
  ```

### 2. Chạy ứng dụng Python
```bash
# Cài đặt môi trường với uv
uv sync

# Cấu hình môi trường
cp .env.example .env
# Điền các API keys và thông tin cấu hình vào .env

# Chạy ứng dụng
python main.py
# Hoặc chạy script dev
./dev.sh
```

