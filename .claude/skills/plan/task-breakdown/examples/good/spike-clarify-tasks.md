# Ví dụ — Tasks có `[SPIKE]` + `[CLARIFY]` + chia milestone

> Minh hoạ 3 pattern ít được demo: **`[SPIKE]`** (điều tra, output = quyết định), **`[CLARIFY]`** (chặn đoán mò), và **chia milestone** khi sizing lớn. Schema task khớp `.v-flow/templates/tasks-template.md`.

## Task Overview

| Tổng tasks | `[SPIKE]` | `[CLARIFY]` | Sizing (Σ điểm) | Milestone |
|:----------:|:---------:|:-----------:|:---------------:|:---------:|
| 9 | 1 | 1 | 26 (>24 → tách) | M1, M2 |

> Σ 26 điểm > 24 → tách **M1** (chốt nền + spike) và **M2** (tích hợp). Xem skill task-breakdown §4 (sizing).

---

## Milestone 1 — Nền tảng + điều tra

#### T-001: SPIKE — chọn thư viện hàng đợi `[SPIKE]` `[ENTRYPOINT]`
- **Mô tả**: Chưa rõ dùng BullMQ hay native SQS cho job retry — điều tra trước khi thiết kế.
- **Files**: `docs/spikes/queue-choice.md` (output là **kết luận**, KHÔNG phải code production)
- **Thay đổi cụ thể**:
  - Mong muốn: benchmark 2 lib (throughput, retry, ops), chốt 1 + ghi lý do vào `_session.md`.
  - Các bước: 1) POC 2 lib 2) đo p95 + chi phí vận hành 3) ra quyết định.
- **Dependency**: Không
- **REQ / UC mapping**: REQ-E03 (UC-02)
- **Done khi**: có **quyết định** lib + lý do; nếu đổi hướng thiết kế → đề xuất quay lại `/v.plan` (AC-07, spec §4)
- **Risk**: R-01 (plan §7) — chọn sai lib → rework tích hợp
- **Complexity**: M (time-boxed 1 ngày)
- **Trạng thái**: [ ]

> `[SPIKE]`: output là **kết luận/quyết định**, time-boxed, đứng TRƯỚC task phụ thuộc nó. KHÔNG ép ra code production.

#### T-002: Schema job table `[DB]` `[DEPENDS: T-001]`
- **Mô tả**: Bảng lưu job + trạng thái retry.
- **Files**: `migrations/20260602_create_jobs.sql`
- **[DB]**: `jobs` NEW · cột `id, type, payload, status, attempts, created_at` · index `idx_jobs_status`
- **DDL**: `CREATE TABLE jobs (...); CREATE INDEX idx_jobs_status ON jobs(status);` (up) / `DROP TABLE jobs;` (down)
- **Dependency**: T-001
- **REQ / UC mapping**: REQ-E03 (UC-02)
- **Done khi**: bảng + index tồn tại, rollback chạy (AC-08, spec §4)
- **TDD** (Red→Green):
  - [ ] Test: cột + index tồn tại sau migration
  - [ ] Impl: DDL
- **Complexity**: S
- **Trạng thái**: [ ]

#### T-003: Business rule tính phí trễ hạn `[LOGIC]` `[CLARIFY]` `[DEPENDS: T-002]`
- **Mô tả**: Tính phí khi job quá hạn — nhưng spec chưa rõ mốc tính.
- **Files**: `src/billing/late_fee.ts`
- **Thay đổi cụ thể**:
  - Mong muốn: hàm `lateFee(job)` theo đúng business rule (chốt sau khi human trả lời).
  - Các bước: (chỉ bắt đầu sau khi có câu trả lời).
- **Dependency**: T-002
- **REQ / UC mapping**: REQ-E04 (UC-02)
- **Done khi**: khớp business rule đã chốt (AC-09, spec §4)
- **Complexity**: M
- **Câu hỏi mở**: Phí trễ tính theo **ngày lịch** hay **ngày làm việc**? Có trần tối đa không? → Implement Agent **DỪNG, hỏi human** trước khi code, KHÔNG tự đoán.
- **Trạng thái**: [ ]

> `[CLARIFY]`: kèm **Câu hỏi mở**; thà hỏi còn hơn giả định sai. Plan còn `[CLARIFY]` chưa coi là "ready" hoàn toàn.

---

## Milestone 2 — Tích hợp (sau khi M1 chốt spike + clarify)

#### T-004 … T-009: (worker, API trigger, retry, observability, integration test `[GATE]`)
> Lược — mỗi task vẫn đủ Type · Done khi (AC) · TDD · Complexity như schema chuẩn.
