# Autonomous Agent (V Flow + VSAF Hybrid)

Hệ thống Agent tự động hóa tương tác tin nhắn khách hàng đa nền tảng (TikTok Web), hỗ trợ giám sát thời gian thực qua Dashboard WebSocket và cơ chế chuyển giao người thật (Operator Takeover).

Dự án áp dụng quy trình phát triển kết hợp **V Flow (Spec-Driven Single-Repo)** và **VSAF (Vertical Slicing / WBS as-built)** được đóng gói hoàn toàn khép kín (**Self-Contained Turnkey**) trong 1 repo duy nhất.

---

## ⚡ Hướng dẫn chạy nhanh (3 bước)

Chỉ cần chạy tuần tự các lệnh sau:

```bash
# 1. Clone repository
git clone https://github.com/duymanh1606/autonomous-agent-vflow.git
cd autonomous-agent-vflow

# 2. Thiết lập môi trường trọn gói tự động
./scripts/bootstrap.sh

# 3. Chạy quy trình (Dò code -> WBS as-built -> Chia 24 slices)
./scripts/code-to-slice.sh
```

> **Mẹo**: Nếu dùng AI CLI/IDE (**Claude Code**, **Cursor**, **Antigravity**), ở Bước 3 bạn có thể mở repo và gõ trực tiếp trong cửa sổ chat:
> ```text
> /v.code-to-vsaf-slice
> ```

---

## 🔍 Tác dụng của lệnh `scripts/bootstrap.sh`

Lệnh `./scripts/bootstrap.sh` là **script khởi tạo môi trường trọn gói 1 bước**. Nó giải quyết bài toán phụ thuộc ngoài để người mới clone repo về có thể chạy ngay mà không gặp lỗi thiếu công cụ:

1. **Kiểm tra môi trường Node.js**: Xác thực máy đã có Node.js (khuyến nghị $\ge$ v18).
2. **Kích hoạt `v-flow` CLI nội bộ (`vendor/v-flow-cli`)**:
   - Tự động cài đặt thư viện phụ thuộc cho gói CLI được nhúng sẵn trong repo (đã tích hợp module `import-vsaf` chuẩn VSAF).
   - Thiết lập binary `v-flow` (qua `npm link` hoặc wrapper thực thi trực tiếp tại [`bin/v-flow`](bin/v-flow)) để terminal và các agent AI có thể gọi `v-flow` ngay lập tức mà không phụ thuộc gói npm public.
3. **Tự động cấu hình file `.env`**: Khởi tạo file cấu hình `.env` từ `.env.example` nếu chưa có.
4. **Chuẩn bị môi trường Python**:
   - Tự nhận diện và chạy `uv sync` (nếu máy có `uv`).
   - Nếu không có `uv`, tự tạo virtual environment `.venv` và cài đặt các dependencies cần thiết cho agent.

---

## 📁 Cấu trúc đóng gói khép kín trong Repo

```text
autonomous-agent-vflow/
├── bin/
│   └── v-flow                  # Executable wrapper tự động gọi CLI nội bộ
├── vendor/
│   └── v-flow-cli/             # Lõi v-flow CLI (kèm tính năng import-vsaf)
├── scripts/
│   ├── bootstrap.sh            # Script cài đặt môi trường tự động
│   └── code-to-slice.sh        # Script khởi chạy pipeline 1 lệnh
├── .bmm-config.yaml            # Cầu nối 3-layer cascade tích hợp VSAF vào Single-Repo
├── .v-flow/
│   ├── context.md              # Kiến trúc hệ thống & No-go zones
│   ├── constitution.md         # Luật lập trình & testing
│   ├── architecture/
│   │   ├── project_wbs.md      # 78 Work Units as-built chuẩn VSAF
│   │   ├── wbs-task-map.yaml   # Ánh xạ Work Unit ↔ Task
│   │   └── vsaf-slice-comparison.md # Đối chiếu 24 slices với VSAF gốc
│   ├── slices/                 # Bộ 24 slice manifest chuẩn VSAF (SLICE-1..24)
│   └── modules/                # Thẻ nghiệp vụ (Module Cards)
├── .claude/                    # Slash Commands, Agents & Skills (đã bao gồm NTAPP-slice-planning)
├── agent/                      # Mã nguồn Python Core Agent
├── core/                       # LangGraph State Machine
├── dashboard_api/              # FastAPI Backend
└── dashboard/                  # React Vite Frontend Dashboard
```

---

## 🛠️ Vận hành Ứng dụng Sản phẩm

```bash
# Khởi động Backend + Agent
python main.py
# Hoặc chạy script dev
./dev.sh

# Khởi động Frontend Dashboard
cd dashboard && npm install && npm run dev
```
