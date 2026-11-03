---
description: "Trọn gói code → slice chuẩn VSAF: Understand (U.0) → WBS (U.1) → Specify (S.1) → Plan & Test (B.0) → Slice VSAF (B.0c) → Master Check (R.0)"
phase: "U.0 → U.1 → S.1 → B.0 → B.0c → R.0"
agents: ["understand-agent", "wbs-agent", "ba-agent", "plan-agent", "test-agent", "master-check-agent"]
---

# /v.code-to-vsaf-slice [feature-name]

> Bản VSAF của pipeline "code → slice": thay vì cắt lát theo **đồ thị Use-Case/Task**, lệnh này
> phân rã hệ thống thành **WBS as-built** rồi cắt lát bằng động cơ của VSAF (seam test + 8
> invariant gate). Hướng dẫn: [`docs/vsaf-hybrid-slicing.md`](../docs/vsaf-hybrid-slicing.md).
>
> ⚡ **Zero-Argument Mode**: không truyền `feature-name` thì **KHÔNG hỏi lại** — lấy tên thư mục
> dự án, hoặc `system-baseline` nếu không xác định được, rồi chạy xuyên suốt.

---

## 📋 Pipeline

```text
1. Understand (U.0) → 2. WBS (U.1) → 3. Specify (S.1) → 4. Plan & Test (B.0) → 5. Slice VSAF (B.0c) → 6. Master Check (R.0)
   context.md +         project_wbs.md   spec.md          plan.md + tasks.md     .v-flow/slices/SLICE-*.md   validation-report.md
   Module Cards         wbs-task-map     .flow-state      test-cases.md          → slicing/variants/vsaf.yaml
                                                                                 → slices.md (--lock)
```

Mỗi bước **idempotent**: artifact đã có và còn khớp code thì bỏ qua, không dựng lại.

---

## 🚀 Execution Steps

### Bước 1 — Understand (U.0)
Thiếu `.v-flow/context.md` → chạy tương đương `/v.understand --all`; thiếu `.v-flow/modules/` →
sinh Module Cards; thiếu `constitution.md` → `/v.constitute`.

### Bước 2 — WBS Synthesis (U.1)
Đóng vai **WBS Agent**, chạy tương đương `/v.wbs`:
- Thiếu `.bmm-config.yaml` ở gốc repo → **tạo từ** `.v-flow/templates/bmm-config-template.yaml`.
  Đây là cầu nối duy nhất giúp skill VSAF ghi vào `.v-flow/` mà không cần Dual-Repo.
- Sinh `.v-flow/architecture/project_wbs.md` + `.v-flow/architecture/wbs-task-map.yaml`.
- Tự kiểm coverage: mọi thư mục mã nguồn cấp 1 có unit nhận trách nhiệm.
- Điền cổng duyệt `approved_by: AutoSystem (V-Flow WBS Synthesizer)` cho baseline as-built.

### Bước 3 — Specify (S.1)
Đóng vai **BA Agent**: đọc `context.md` + Module Cards, khởi tạo `.v-flow/features/<feature>/`,
viết `spec.md` chuẩn EARS, khởi tạo `.flow-state.yaml` + `_session.md`.

### Bước 4 — Plan & Test (B.0a ∥ B.0b)
**Plan Agent** → `plan.md` + `tasks.md` (mapping tới `REQ-xxx` và tới **mức luồng** `UC-xx.main`).
**Test Agent** → `test-cases.md` phủ toàn bộ AC.
Xong Plan thì **cập nhật `wbs-task-map.yaml`** để unit WBS trỏ được sang `T-xxx` vừa sinh.

### Bước 5 — Slice Planning chuẩn VSAF (B.0c)

```bash
v-flow slice graph <feature>                    # dựng task graph, bắt tham chiếu hỏng
```

1. **Động cơ VSAF** — chạy skill `ntapp-slice-planning` (path đã trỏ sẵn qua `.bmm-config.yaml`):
   áp **GROUP-không-MERGE**, **seam test** (Ownership / Trust-auth / Resilience / Read-write) và
   **G1–G8**, emit `.v-flow/slices/SLICE-<n>-<slug>.md`.
   Zero-argument mode: agent tự đóng vai owner Stage 2b, **trình bảng audit G1–G8 + bảng slice ra
   màn hình** rồi mới emit, và điền `approved_by: AutoSystem`. Đó là bản ghi để người soát lại sau.
2. **Nạp vào V-Flow** (CLI làm mọi phép tính — agent không tự tính):
   ```bash
   v-flow slice import-vsaf <feature> --check     # audit G1–G5 + in ánh xạ, không ghi
   v-flow slice import-vsaf <feature>             # ghi variants/vsaf.yaml + slicing/vsaf-map.md
   v-flow slice check <feature> --variant vsaf    # luật R1–R11
   v-flow slice compare <feature>                 # đặt vsaf cạnh main-first / per-flow
   ```
3. **Chọn + khóa**:
   ```bash
   v-flow slice use <feature> vsaf --lock --by "AutoSystem"
   ```
   > ⚠️ Feature đang khóa một variant khác → CLI từ chối đổi. Phải thêm
   > `--unlock --reason "<lý do>"` (lý do được ghi vào `_session.md`). Đây là **cổng duyệt của
   > người**: agent chỉ chạy `--unlock` khi người dùng nói rõ muốn đổi cách cắt đã khóa.

### Bước 6 — Master Check (R.0)
Đóng vai **Master Check Agent**: kiểm chéo `spec.md` ↔ `plan.md` ↔ `tasks.md` ↔ `test-cases.md`
↔ `project_wbs.md` ↔ `slices.md`, ghi `validation-report.md`, kết luận
`PASS` / `PASS_WITH_CONCERNS` / `FAIL` kèm `fail_reason` + `route_decision`.

---

## 🔀 Routing Rules

```
PASS / PASS_WITH_CONCERNS      → /v.implement --slice SLICE-1   (tracer bullet trước tiên)
FAIL vì WBS lệch code          → /v.wbs --refresh rồi /v.slice --vsaf
FAIL vì G1–G5 (import-vsaf)    → sửa .v-flow/slices/SLICE-*.md rồi import lại
FAIL vì R1–R11                 → thường do wbs-task-map.yaml thiếu/sai → sửa map, import lại
Variant khác đang khóa         → xin xác nhận người dùng trước khi --unlock
```

---

## Ví dụ

```
/v.code-to-vsaf-slice
/v.code-to-vsaf-slice 001-user-login
```
