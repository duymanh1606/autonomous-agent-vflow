# Autonomous Agent (V Flow + VSAF Hybrid)

Hệ thống Agent tự động hóa tương tác tin nhắn khách hàng đa nền tảng (TikTok Web), hỗ trợ giám sát thời gian thực qua Dashboard WebSocket và cơ chế chuyển giao người thật (Operator Takeover).

Dự án áp dụng quy trình phát triển kết hợp **V Flow (Spec-Driven Single-Repo)** và **VSAF (Vertical Slicing / WBS as-built)** được đóng gói hoàn toàn khép kín (**Self-Contained Turnkey**) trong 1 repo duy nhất.

---

## ⚡ Bắt đầu nhanh (Quickstart trong 1 bước)

Sau khi clone repo về, bạn chỉ cần chạy **1 lệnh duy nhất** để thiết lập toàn bộ môi trường (CLI, AI Skills, Python venv):

```bash
git clone https://github.com/duymanh1606/autonomous-agent-vflow.git
cd autonomous-agent-vflow

# Cài đặt tự động toàn bộ môi trường và v-flow CLI
./scripts/bootstrap.sh
```

---

## 🚀 Khởi chạy Quy trình Phát triển

Dự án đã nhúng sẵn:
- **`v-flow` CLI**: Tự động liên kết từ `vendor/v-flow-cli` (đã tích hợp module `import-vsaf`).
- **AI Skills & Agents**: Đầy đủ trong `.claude/`, `.cursor/`, `.agents/` (bao gồm cả skill `NTAPP-slice-planning`).

### Cách 1: Chạy tự động trong AI Chat (Claude Code / Cursor / Antigravity) — *Khuyên dùng*
Mở repo này trong công cụ AI của bạn và gõ:

```text
/v.code-to-vsaf-slice
```
*AI sẽ tự động thực thi tuần tự:*
1. **Dò code (U.0)**: Quét codebase sinh `context.md`, `constitution.md`, `Module Cards`.
2. **Tổng hợp WBS (U.1)**: Phân rã 78 Work Units as-built thành `.v-flow/architecture/project_wbs.md`.
3. **Đặc tả & Lập kế hoạch (S.1 & B.0)**: Sinh `spec.md` EARS, `plan.md`, `tasks.md`, `test-cases.md`.
4. **Chia lát cắt VSAF (B.0c)**: Gọi động cơ Seam Test + 8 Invariants chia thành 24 lát cắt dọc `SLICE-*.md`.
5. **Kiểm định chéo (R.0)**: Master Check kiểm tra ma trận và xuất báo cáo nghiệm thu.

### Cách 2: Chạy qua Terminal Script
```bash
./scripts/code-to-slice.sh
```

---

## 📁 Cấu trúc đóng gói khép kín trong Repo

```text
autonomous-agent-vflow/
├── bin/
│   └── v-flow                  # Executable wrapper tự động gọi CLI
├── vendor/
│   └── v-flow-cli/             # Lõi v-flow CLI kèm tính năng import-vsaf
├── scripts/
│   ├── bootstrap.sh            # Script cài đặt môi trường tự động
│   └── code-to-slice.sh        # Script khởi chạy pipeline
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
