---
description: "Trọn gói từ dò code tới chia slice: Understand (U.0) -> Specify (S.1) -> Plan & Test (B.0) -> Slice Planning (B.0c) -> Master Check (R.0)"
phase: "U.0 → S.1 → B.0 → B.0c → R.0"
agents: ["understand-agent", "ba-agent", "plan-agent", "test-agent", "master-check-agent"]
---

# /v.code-to-slice [feature-name]

> Lệnh một bước trọn gói trong V Flow: Tự động chạy từ **dò code hiện tại** cho tới **chia slice và kiểm định chất lượng**.
> ⚡ **Zero-Argument Mode (Tự động 100% không cần tham số):** Nếu người dùng không truyền `feature-name` (chỉ gõ `/v.code-to-slice`), agent **TUYỆT ĐỐI KHÔNG HỎI LẠI**, tự động lấy tên thư mục dự án (`autonomous-agent-vflow`) hoặc gán `system-baseline` để tự chạy xuyên suốt từ Bước 1 tới Bước 5.

---

## 📋 Pipeline Flow

```text
1. Understand (U.0)  --> 2. Specify (S.1) --> 3. Plan & Test (B.0) --> 4. Slice Planning (B.0c) --> 5. Master Check (R.0)
   (context.md +            (spec.md)             (plan.md + tasks.md       (slicing/variants +          (PASS verdict)
    Module Cards)                                  + test-cases.md)          slices.md --lock)
```

---

## 🚀 Execution Steps

### Bước 1: Dò code & Hiểu hệ thống (Understand - Phase U.0)

* Kiểm tra file `.v-flow/context.md`:
  * Nếu chưa có: Tự động chạy tương đương `/v.understand --all` để quét toàn bộ codebase, sinh `context.md` (Tech stack, Architecture, No-go zones).
  * Kiểm tra `.v-flow/modules/`: Nếu chưa có Module Cards, quét code theo domain để sinh Module Cards (`SKILL.md`, `use-cases.md`, `api-specs.md`, `db.md`).
* Kiểm tra `.v-flow/constitution.md`: Nếu chưa có, chạy tương đương `/v.constitute` để draft luật dự án.

### Bước 2: Đặc tả tính năng (Specify - Phase S.1)

* Bạn đóng vai **BA Agent**:
  * Đọc `context.md` + Module Cards liên quan.
  * Tự động khởi tạo thư mục `.v-flow/features/<feature-name>/`.
  * Tự động bóc tách các luồng nghiệp vụ viết thành tài liệu đặc tả `spec.md` chuẩn EARS.
  * Khởi tạo file trạng thái `.flow-state.yaml` và bộ nhớ làm việc `_session.md`.

### Bước 3: Lập kế hoạch kỹ thuật & Kịch bản Test (Phase B.0a & B.0b)

* **Plan Agent (B.0a):**
  * Đọc `spec.md`, thiết kế giải pháp kỹ thuật ghi vào `plan.md`.
  * Phân rã công việc chi tiết thành `tasks.md` (có ánh xạ `REQ-xxx` và gán tag luồng `UC-xx.main`).
* **Test Agent (B.0b):**
  * Đọc `spec.md`, sinh danh sách kiểm thử `test-cases.md` bao phủ toàn bộ các Acceptance Criteria.

### Bước 4: Chia lát cắt dọc (Slice Planning - Phase B.0c)

* Chạy công cụ slicing của V Flow:

```bash
v-flow slice graph <feature-name>
v-flow slice plan <feature-name> --strategy main-first
v-flow slice plan <feature-name> --strategy per-flow
v-flow slice compare <feature-name>
```

* **Khóa phương án lát cắt:** Tự động chọn variant tối ưu nhất (mặc định `main-first`) và chạy lệnh khóa:

```bash
v-flow slice use <feature-name> main-first --lock --by "AutoSystem"
```

### Bước 5: Kiểm định chéo Master Check (Phase R.0)

* Bạn đóng vai **Master Check Agent**:
  * Kiểm định chéo ma trận: `spec.md` ↔ `plan.md` ↔ `tasks.md` ↔ `test-cases.md` ↔ `slices.md`.
  * Ghi báo cáo `validation-report.md`.
  * Kết luận phán quyết:
    * `PASS`: Sẵn sàng để lập trình viên gõ `/v.implement`.
    * `PASS_WITH_CONCERNS`: Có cảnh báo cần lưu ý trước khi code.
    * `FAIL`: Chỉ rõ điểm đứt gãy để sửa trước khi code.
