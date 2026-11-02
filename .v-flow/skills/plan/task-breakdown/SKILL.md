---
name: task-breakdown
description: "Hướng dẫn Plan Agent chia tasks từ plan.md. Agent PHẢI đọc skill này sau khi hoàn thành architecture design. Đảm bảo mọi task trace về REQ-xxx và có annotations đúng."
trigger: "Khi Plan Agent tạo tasks.md từ plan.md"
phase: "B.0a"
used_by:
  - /v.plan
hooks:
  pre_breakdown: "Load plan.md + spec.md → extract REQ-xxx list và component list"
  post_breakdown: "Verify: mỗi REQ có task, mỗi task có REQ, annotations đúng"
---

# Task Breakdown — Chia Tasks Có Traceability

> ⚠️ Đây là **Skill bắt buộc** cho Plan Agent khi tạo tasks.md.
> Mỗi task PHẢI trace về REQ-xxx. Task không có REQ = task thừa.
>
> → Xem `gotchas.md` cho lỗi phổ biến khi chia tasks.
> → Xem `examples/good/` cho mẫu tasks.md chuẩn — và `examples/bad/` cho anti-pattern (đối chứng).
> → Xem `config.json` để customize (max_task_size, annotation_rules).

---

## Khi nào KHÔNG cần task breakdown chi tiết

- Quick Fix (`/v.quickfix`) — 1-2 tasks trực tiếp từ spec
- Hotfix (`/v.hotfix`) — 1 task focus fix, 1 task test
- Task đã rõ ràng (chỉ 1-2 REQ, 1 component)

> **Lite profile**: `quickfix`/`hotfix` → được bỏ Dependency Graph / Execution Schedule nếu chỉ 1–2 task; nhưng mỗi task VẪN cần Type + `Done khi` (AC) + block TDD.

---

## Task Annotations — Hệ Thống Nhãn

> 💡 Annotations giúp Implement Agent biết THỨ TỰ và CÁCH implement.

| Annotation | Ý nghĩa | Ví dụ khi dùng |
|-----------|---------|-----------------|
| `[ENTRYPOINT]` | Bắt đầu từ task này | Task đầu tiên, không dependency |
| `[PARALLEL]` | Có thể làm song song với task khác | 2 tasks không share code |
| `[GATE]` | DỪNG chờ human review | Task modify sensitive area |
| `[CRITICAL]` | Ưu tiên cao nhất | Core business logic |
| `[RISKY]` | Cần test kỹ hơn | Touch legacy code, complex logic |
| `[DEPENDS: T-xxx]` | Chỉ start khi T-xxx xong | Data model trước, API sau |
| `[SPIKE]` | Điều tra/POC — chưa biết cách làm; output là quyết định, time-boxed | Đo benchmark 2 lib trước khi chọn |
| `[CLARIFY]` | Còn mơ hồ — Implement Agent hỏi human trước khi code | Spec thiếu business rule, edge case chưa rõ |

### Quy tắc annotation

1. Mỗi task list PHẢI có đúng 1 `[ENTRYPOINT]` (validator enforce — không 0, không >1)
2. `[GATE]` tasks phải DỪNG — Implement Agent chờ human approve
3. `[DEPENDS]` tạo DAG — KHÔNG được có circular dependency (validator detect cycle + dangling ref)
4. `[PARALLEL]` chỉ khi tasks THỰC SỰ independent (không share state)
5. `[CLARIFY]` khi còn điểm mơ hồ — kèm **Câu hỏi mở**; thà hỏi còn hơn đoán sai
6. `[SPIKE]` khi cách làm chưa rõ — điều tra TRƯỚC, kết quả feed lại plan; đứng trước task phụ thuộc nó. Liên kết với mã rủi ro plan §7 (vd `Risk: R-01`)

> Mẫu `[SPIKE]` + `[CLARIFY]` + chia milestone: `examples/good/spike-clarify-tasks.md`.

---

## Task Type — Loại thay đổi (gắn kèm annotations)

> Annotations nói **THỨ TỰ**; Task Type nói task đụng **BỀ MẶT nào** → quyết định chi tiết bắt buộc trong body.

| Type | Bề mặt | Body task PHẢI có |
|------|--------|-------------------|
| `[UI]` | Màn hình, component | Màn hình, widget/component, trạng thái, token `DESIGN.md` |
| `[API]` | Endpoint | Method+path, field request/response thêm/đổi |
| `[DB]` | Schema, migration | Bảng (new/alter), cột (tên/kiểu/null/default), **DDL up+down (câu lệnh thật)**, rollback |
| `[LOGIC]` | Service, use case | Hàm/class, hiện trạng → mong muốn |
| `[REFACTOR]` | Cấu trúc (behavior giữ nguyên) | Phạm vi, đảm bảo test cũ vẫn pass |
| `[TEST]` | Test | Loại test, kịch bản |

> 1 task có thể có nhiều type nếu cùng 1 component (vd `[API]` + `[DB]`); nếu tách được nên tách để dễ review.

---

## Đặc Thù Và Quy Ước

### 1. Task Granularity vs Specificity

> ⚠️ **Granularity ≠ Specificity**. Granularity = **KÍCH THƯỚC** task (≈ 1 component). Specificity = **ĐỘ CHI TIẾT bên trong** task (vị trí symbol, hiện trạng → mong muốn). Task đúng kích thước NHƯNG vẫn phải chi tiết bên trong — đây là chỗ hay bị bỏ sót khiến dev phải hỏi lại.

**Granularity — kích thước:**
- Quá lớn (❌): "T-001: Implement login feature" → quá rộng, không biết khi nào xong.
- Quá nhỏ (❌): "T-001: Create file login.dart" → micromanage từng file.
- Vừa đúng (✅): "T-001: Implement LoginUseCase — validate credentials, call repository" → 1 component, 1-2 REQs.
- **Rule of thumb**: 1 task ≈ 1 component ≈ 1-3 REQs ≈ 1 TDD cycle.

**Specificity — task SỬA code có sẵn** (granularity component, nhưng body PHẢI cụ thể):
- Vị trí (symbol): hàm / class / widget / endpoint
- Hiện trạng → Mong muốn
- ❌ "T-0X: Update ProductScreen" → dev không biết sửa gì.
- ✅ "T-0X: `ProductScreen.build()` — hiện render list phẳng → thêm `FilterBar` + cột `Trạng thái` (badge); filter theo status."

### 2. Dependency Graph

Tasks phải có dependency rõ ràng:
```
T-001 [ENTRYPOINT] [CRITICAL]: Data models
T-002 [DEPENDS: T-001]: Repository implementation
T-003 [DEPENDS: T-001] [PARALLEL]: API service (parallel với T-002)
T-004 [DEPENDS: T-002, T-003]: Use case layer
T-005 [DEPENDS: T-004]: UI/Presentation
T-006 [DEPENDS: T-005] [GATE]: Integration test + human review
```

**Contract-first** (khi có cả `[UI]` và `[API]`): task chốt **data model + API contract** đứng sớm (entrypoint hoặc dependency chung); FE và BE đều `[DEPENDS]` vào nó rồi mới `[PARALLEL]`. Không để FE/BE chạy song song khi contract chưa đóng băng → tránh đoán field lệch nhau.

### 3. REQ ↔ Task Traceability

```markdown
Mỗi task PHẢI có:
  **Gắn với**: REQ-xxx, REQ-yyy    ← trace ngược về spec
  **Component**: LoginUseCase       ← trace về plan
  **Test cases**: TC-xxx, TC-yyy    ← trace về test-cases.md (sau B.0b)
```

### 4. Complexity Tiers (thay cho ước tính giờ)

> Executor là AI agent → "mất bao nhiêu giờ" không còn ý nghĩa. Gắn mỗi task một tier S/M/L để biết task nào cần tách / cần soi kỹ.

| Tier | Nghĩa | Dấu hiệu điển hình |
|:----:|-------|--------------------|
| **S** | Nhỏ, đường đi rõ | Data model/entity, 1 endpoint đơn giản, 1 widget thuần — ~1 TDD cycle |
| **M** | Vừa | Use case có validation + error, repository + mapping, UI nhiều trạng thái — 2–3 TDD cycle |
| **L** | Lớn | Logic nhiều edge case, tích hợp 3rd-party, đụng nhiều file liên quan |

- Task mức **L** → cân nhắc tách nhỏ. Không tách được → gắn `[RISKY]` + nêu lý do.
- **Sizing tổng** (quyết định chia milestone): quy đổi **S=1, M=2, L=4** điểm → Σ. Tổng **> ~24 điểm** (hoặc **> 20 task**) → đề xuất tách thành nhiều phase/milestone thay vì 1 feature khổng lồ.

### 5. Calibration từ lịch sử

Trước khi chia task cho feature mới, đọc `task-history.log` (+ `plan-history.log`) của feature tương tự để hiệu chỉnh:
- Feature cùng loại thường ~bao nhiêu task? phân bố Complexity (S/M/L) ra sao?
- Rủi ro / `[RISKY]` nào hay lặp lại → chủ động gắn `[SPIKE]`/`[RISKY]` sớm.
- Sau khi xong, ghi 1 dòng vào `task-history.log` (format ở `config.json` → `memory`) để feature sau calibrate tiếp.

> 📒 Log này là **plaintext do agent tự ghi/đọc** (không có CLI enforce). Consumer chính là `/v.retrospective` — Retrospective Agent đọc `plan-history.log`/`task-history.log` để rút xu hướng giữa các feature.

---

## Task Template

> Dùng **đúng một** schema này — trùng với `.v-flow/templates/tasks-template.md` (nguồn chuẩn). Task ID `T-NNN`, Complexity S/M/L (không ghi giờ).
>
> **3 trường test/done bổ sung nhau** (không thay thế nhau): `Done khi` = bám **AC-NN spec §4** (ghi rõ mã AC, định nghĩa "xong" nghiệp vụ) · `Test liên quan: TC-xx` = **test chính thức** ở `test-cases.md` (Test Agent tạo B.0b) · `TDD` = checklist **Red→Green** ngay trong task. Implement chạy theo TDD → mỗi task `[LOGIC]`/`[UI]`/`[API]`/`[DB]` nên có block `TDD`.

```markdown
#### T-NNN: {Tên task cụ thể} `[TYPE]` `[ANNOTATIONS]`
- **Mô tả**: {Mục tiêu — 1 câu}
- **Files**: `path/to/file.ext`
- **Vị trí (symbol)**: `Class.method()` / `Widget` / `METHOD /path`  ← task SỬA
- **Thay đổi cụ thể**:
  - Hiện trạng: {behavior hiện tại — bỏ trống nếu tạo mới}
  - Mong muốn: {kết quả sau khi xong}
  - Các bước: 1) … 2) …
- {Block theo Type — [UI]: màn hình/component/trạng thái/token · [API]: endpoint+field · [DB]: bảng+cột+migration+rollback}
- **Dependency**: T-{M} (hoặc Không)
- **REQ / UC mapping**: REQ-{xxx} (UC-{xx})
- **Done khi**: đáp ứng **AC-NN** tương ứng trong spec §4 (ghi rõ mã, không chỉ "test pass")
- **Test liên quan**: TC-{xx}
- **TDD** (Red→Green) — viết test TRƯỚC, rồi code cho pass:
  - [ ] Test: {kịch bản 1 — chạy fail trước khi có code}
  - [ ] Test: {kịch bản 2}
  - [ ] Impl: {code tối thiểu để các test trên pass}
- **Complexity**: S / M / L
- **Câu hỏi mở** (chỉ khi `[CLARIFY]`): {điều cần làm rõ}
- **Trạng thái**: [ ]
```

**Checklist "done" gợi ý** (bám theo Acceptance Criteria của REQ trong spec, không chỉ "tests pass"):
- [ ] Unit tests written + pass (TDD Red → Green)
- [ ] Đáp ứng AC cụ thể của REQ liên quan
- [ ] Code follows constitution naming/patterns
- [ ] No-Go Zones not violated
- [ ] _session.md updated

---

## Self-Review — soi lại danh sách task bằng "mắt mới" (bắt buộc)

> 💡 Chia xong → đọc lại tasks.md đối chiếu plan + spec, bắt gap ngữ nghĩa TRƯỚC khi giao Implement Agent. Checklist tự chạy (không subagent); KHÔNG đẩy validator sang semantics.

1. **Phủ AC/REQ 2 chiều**: mỗi `AC-NN` & `REQ-xxx` của spec được ≥1 task phủ (thiếu = gap); **và** mỗi task trace ngược về ≥1 REQ (task không REQ = task thừa → bỏ).
2. **Quét placeholder**: không còn task mơ hồ kiểu "Update X"/"xử lý sau" — task SỬA phải có `Vị trí` + `Hiện trạng → Mong muốn`.
3. **Nhất quán ký hiệu giữa các task**: cùng một symbol gọi cùng một tên qua mọi task. `clearLayers()` ở T-003 nhưng `clearFullLayers()` ở T-007 = bug; `users` ở task này mà `user` ở task kia = bug.
4. **DAG hợp lệ**: đúng 1 `[ENTRYPOINT]`; `[DEPENDS]` không vòng lặp, không trỏ task không tồn tại; task `[PARALLEL]` thật sự không share file/state.
5. **Mỗi code task có block TDD + `Done khi` (AC-NN)**: không task `[LOGIC]/[UI]/[API]/[DB]` nào thiếu Red→Green hoặc thiếu mã AC cụ thể.

Thấy lỗi → sửa tại chỗ. Đây là tầng bắt sớm; validator lint cấu trúc, Master Check soi ngữ nghĩa sâu hơn ở hạ nguồn.

---

## V-Flow Integration Points

- **plan.md** (B.0a) → Input: component list, file structure
- **spec.md** (S.1) → Input: REQ-xxx list cho traceability
- **test-cases.md** (B.0b) → Test Agent sẽ map TC → TASK
- **_session.md** → Ghi task dependency rationale
- **Implement Agent** → Consumer: follow task order + annotations

---

## Gotchas

→ Xem `gotchas.md` cho lỗi phổ biến khi chia tasks — cập nhật liên tục.
