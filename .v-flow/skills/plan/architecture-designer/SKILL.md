---
name: architecture-designer
description: "Hướng dẫn Plan Agent thiết kế kiến trúc từ spec. Agent PHẢI đọc skill này khi /v.plan được gọi. Đảm bảo design tuân thủ constitution + không vi phạm No-Go Zones."
trigger: "Khi /v.plan được gọi, bắt đầu thiết kế kiến trúc"
phase: "B.0a"
used_by:
  - /v.plan
hooks:
  pre_design: "Load spec.md + constitution.md + context.md → extract constraints"
  post_design: "Cross-check plan vs No-Go Zones, verify pattern alignment"
---

# Architecture Designer — Thiết Kế Kiến Trúc Từ Spec

> ⚠️ Đây là **Skill bắt buộc** cho Plan Agent khi thiết kế.
> QUAN TRỌNG: Thiết kế PHẢI tuân thủ constitution và KHÔNG vi phạm No-Go Zones.
>
> → Xem `gotchas.md` cho lỗi thiết kế phổ biến.
> → Xem `examples/good/` cho mẫu plan chuẩn — và `examples/bad/` cho anti-pattern (đối chứng).
> → Xem `config.json` để customize (architecture style, layers).

---

## Khi nào KHÔNG áp dụng skill này

- Quick Fix (`/v.quickfix`) — không cần thiết kế kiến trúc, direct bugfix
- Hotfix (`/v.hotfix`) — minimal change, không redesign
- Documentation-only change — không có code change

> **Lite profile**: feature `quickfix`/`hotfix` (trong `.flow-state.yaml`) → plan tối giản; `v-flow validate` tự bỏ qua nudge Tech Decisions / NFR / file-structure. Vẫn giữ §6 File Changes + §3.4 DDL nếu đụng DB.

---

## Quy Trình Thiết Kế — Input → Design → Validate

> 💡 Phần này cung cấp **framework tư duy**, không phải step-by-step script.

### Phase 1: Constraint Extraction

Trước khi thiết kế, extract TẤT CẢ constraints:

```
Từ constitution.md:
  → Architecture pattern (MVC, Clean Architecture, Hexagonal...)
  → Layer rules (dependency direction, coupling limits)
  → Naming conventions (file, class, function)
  → Error handling pattern (Result type, exceptions, error codes)

Từ context.md (nếu legacy):
  → No-Go Zones (KHÔNG ĐƯỢC ĐỤNG)
  → Existing patterns (đang dùng pattern gì)
  → Tech debt (cẩn thận khu vực này)
  → Entry points (extend từ đâu)

Từ spec.md:
  → REQ → component mapping (REQ nào cần component mới?)
  → Data flow (data đi từ đâu đến đâu?)
  → Integration points (external systems?)
```

### Phase 2: Component Design

**Signals đúng:**
- Mỗi component có **single responsibility**
- Dependency direction tuân thủ constitution (thường: UI → Domain → Data)
- Interfaces tại boundaries (testable, mockable)
- No-Go Zone code KHÔNG bị modify — tạo adapter/wrapper nếu cần

**Signals sai:**
- Component làm quá nhiều việc (> 3 responsibilities)
- Circular dependency (A → B → C → A)
- Bypass layer (UI gọi thẳng DB)
- Modify No-Go Zone code trực tiếp

### Phase 3: File Structure

```markdown
Với mỗi component trong design:
  1. Xác định file path CHÍNH XÁC (không dùng "somewhere in src/")
  2. Xác định file là MỚI hay MODIFY
  3. Nếu MODIFY → check No-Go Zone → nếu trùng → DỪNG, redesign
  4. Ghi dependencies giữa files (import direction)
```

---

## Đặc Thù Và Quy Ước

> 💡 Phần này chứa patterns Plan Agent thường bỏ sót.

### 1. REQ → Component Traceability

Mỗi component trong plan PHẢI trace về ≥1 REQ:
- ❌ Component không có REQ → over-engineering, bỏ đi
- ❌ REQ không có component → gap, thiếu design
- ✅ Ma trận REQ ↔ Component rõ ràng trong plan.md

### 2. Greenfield vs Legacy Design

| Aspect | Greenfield | Legacy |
|--------|-----------|--------|
| Component mới | Tự do tạo | Phải fit existing structure |
| Patterns | Theo constitution | Theo existing patterns + constitution |
| No-Go Zones | Không có | **BẮT BUỘC check** mỗi file |
| Entry points | Tự định nghĩa | Extend từ existing entry points |
| Test strategy | Ideal (unit + integration) | Pragmatic (integration first) |

### 3. Plan phải gồm Error Architecture

- Error types: liệt kê error types cho feature này
- Error flow: error propagate qua layers như thế nào
- Error response: format cho API/UI consumers
- Error logging: cái nào log, cái nào swallow

### 4. Security Architecture Section

Nếu feature involve auth/data → plan PHẢI có section Security:
- Authentication flow
- Authorization checks (WHERE trong code)
- Data validation layer
- Sensitive data handling

### 5. Brownfield — Đặc tả thay đổi mức symbol

Với mỗi file **SỬA** (không phải tạo mới), KHÔNG ghi "cập nhật logic". PHẢI có:
- **Vị trí**: hàm / class / widget / endpoint cụ thể
- **Hiện trạng**: behavior/code hiện tại
- **Mong muốn**: sau khi sửa
- **Loại**: Thêm / Sửa / Xóa / Refactor

- ❌ "Sửa AuthService để hỗ trợ role" → mơ hồ, dev phải hỏi lại.
- ✅ "`AuthService.login()`: hiện trả token ngay sau khi verify password → thêm bước check `user.role ∈ allowed` trước khi cấp token; ném `ForbiddenError` nếu fail."

### 6. Screen Changes — lấy từ spec, không bịa

Đọc **"Mô tả màn hình"** của từng `UC-xx` trong spec → đưa vào plan §5:
- Màn hình nào **New/Sửa**, thay đổi gì
- Component / widget liên quan
- Các trạng thái: empty / loading / error / success
- Token tham chiếu từ `DESIGN.md` (`button-primary`, `input-default`...) — KHÔNG hardcode hex/size

### 7. Migration — khi đụng schema có sẵn

Nếu data model đụng bảng đã tồn tại → tách rõ trong plan §3.4:
- Bảng **MỚI** vs **ALTER** bảng cũ
- Cột: tên / kiểu / null / default / index
- File migration + rollback + backfill (nếu cần)
- Mỗi schema change thường là 1 task `[DB]` riêng (đầu chuỗi).
- **DDL thật (up + down)**: ghi câu lệnh copy-paste-được trong §3.4 (`ALTER/CREATE…` hoặc lệnh ORM tương đương) — dev không phải đoán. DDL là *đặc tả schema*, không phải code logic → không vi phạm "plan không chứa code".
- **Breaking change → Expand-Contract** (zero-downtime): đổi/bỏ cột hoặc thêm NOT NULL → tách Expand (thêm cột nullable, ghi cả cũ+mới) → Migrate (backfill + đọc cột mới) → Contract (bỏ cột cũ release sau). KHÔNG ALTER phá tương thích trong 1 bước. → mẫu đầy đủ (DDL + chia release): `examples/good/expand-contract-migration.md`.

### 8. Contract-first — khi có cả Frontend và Backend

Nếu feature đụng **cả `[UI]` lẫn `[API]`** (FE gọi BE), phải **đóng băng contract TRƯỚC** để hai bên làm song song an toàn:
- Chốt **data model** + **API contract** (request/response, error codes) → ghi vào `data-model.md` (theo `.v-flow/templates/data-model-template.md`) + `contracts/` (theo `.v-flow/templates/api-contract-template.md`).
- Contract trở thành **một task sớm** (entrypoint hoặc dependency chung); task `[UI]` và `[API]` đều `[DEPENDS]` vào nó **trước khi** chạy `[PARALLEL]`.
- ❌ FE và BE `[PARALLEL]` mà contract chưa chốt → hai bên đoán field khác nhau → rework.
- ✅ Contract `[GATE]`/`[CRITICAL]` ở đầu → FE mock theo contract, BE implement theo contract, ghép không vỡ.

### 9. NFR — đừng để Yêu cầu phi chức năng rơi rụng

Mỗi `UC-xx` trong spec có mục **"Yêu cầu đặc biệt"** (perf / security / a11y / audit). Plan PHẢI kéo từng NFR vào §10 và gắn cách đáp ứng + nơi verify:
- **Perf** → ngân sách (p95/throughput) → task `[TEST]` đo budget.
- **A11y** → tiêu chí trong task `[UI]` (keyboard, label, contrast).
- **Audit/Compliance** → task `[LOGIC]` (interceptor/log) — không nhét rải rác.
- ❌ NFR chỉ nằm trong spec mà không có task → chắc chắn bị bỏ khi code.

### 10. Observability & Rollout — feature lên production

Nếu feature chạy thật → plan §11 phải trả lời: làm sao biết nó **chạy đúng/đổ vỡ**, và **tung ra an toàn**:
- Feature flag (bật dần), metrics cần emit, logs (không lộ dữ liệu nhạy cảm), alerts (ngưỡng), rollout/rollback.
- Gieo mầm cho `metrics-agent` / `operations` agent hạ nguồn.

### 11. Truy vấn quan trọng (Key Queries) — đừng để dev đoán access pattern

Truy vấn có pattern **không hiển nhiên** (filter/join/phân trang/soft-delete/aggregate) → ghi vào plan §3.5: **bảng · predicate chính** (vd `WHERE deleted_at IS NULL`) **· index dùng**. Ghi **hình dạng, KHÔNG full SQL** — giữ nguyên tắc "plan không chứa code logic". CRUD đơn giản theo PK → bỏ qua. (DDL migration thì NGƯỢC lại — ghi câu lệnh đầy đủ, vì DDL là đặc tả schema.)

---

## Plan Output Structure

→ Xem `examples/good/plan-structure.md` cho format chuẩn.

Minimum required sections:
```
1. Overview — mô tả kiến trúc 1 đoạn
2. Component Diagram — mermaid hoặc ASCII
3. File Structure — path chính xác, new/modify (file SỬA: vị trí symbol + hiện trạng→mong muốn)
4. REQ ↔ Component Matrix — traceability
5. Data Migrations (nếu đụng schema) — bảng new/alter, cột, **DDL thật up+down**, rollback; + **Key Queries** (§3.5) nếu truy vấn không hiển nhiên
6. Screen Changes (nếu có UI) — màn hình, component, trạng thái, token DESIGN.md
7. Dependencies — external deps + internal imports
8. Error Architecture — error types, flow, response
9. Security (nếu applicable) — auth, validation, data
10. Tech Decisions — WHY chọn approach này + **phương án đã cân nhắc/loại** (alternatives) + đánh đổi (plan §13)
11. NFR (nếu spec có Yêu cầu đặc biệt) — perf/a11y/audit → cách đáp ứng + verify
12. Observability & Rollout (nếu lên production) — flags, metrics, alerts, rollout
13. Assumptions & Open Questions — gom giả định thiết kế + câu hỏi `[CLARIFY]` về một chỗ
```

---

## Self-Review — soi lại bằng "mắt mới" (bắt buộc trước khi handoff)

> 💡 Viết xong plan → ĐỌC LẠI spec một lượt như chưa từng thấy plan, bắt gap **ngữ nghĩa** mà validator (structural) không thấy. Đây là **checklist tự chạy**, KHÔNG dispatch subagent, KHÔNG đẩy validator sang kiểm semantics (giữ phân vai: validator = lint cấu trúc · Master Check = ngữ nghĩa · human = phán xét).

1. **Phủ spec 2 chiều**: lướt từng REQ/UC/NFR của spec → mỗi cái trỏ được tới ≥1 component/section trong plan? (thiếu = gap). **Và ngược lại**: mỗi component trong plan trace về ≥1 REQ? (thừa = over-engineering → bỏ).
2. **Quét placeholder**: không còn `TBD`/`TODO`/"xử lý sau"/"thêm validation phù hợp"/"tương tự phần trên" — thay bằng nội dung thật, hoặc gắn `[CLARIFY]` + Câu hỏi mở nếu thật sự chưa rõ.
3. **Nhất quán ký hiệu (symbol/naming)**: tên class/hàm/endpoint/bảng/token dùng ở section sau KHỚP đúng tên đã đặt ở section trước. `AuthService.login()` ở §3 mà thành `AuthSvc.signIn()` ở §8 = bug → sửa cho khớp.
4. **DDL/contract khớp design**: §3.4 DDL up+down chạy được & khớp cột mô tả ở §3; §4.2 field contract khớp data model.

Thấy lỗi → **sửa tại chỗ**, không cần review lại. Thiếu task/section cho 1 REQ → thêm. Mục tiêu: bắt drift NGAY, trước khi sang task-breakdown / Master Check.

---

## V-Flow Integration Points

- **spec.md** (S.1) → Input: REQs + ACs
- **constitution.md** → Constraint: patterns, conventions
- **context.md** → Constraint: No-Go Zones, existing patterns
- **task-breakdown skill** → Output plan → input cho task skill
- **_session.md** → Ghi tech decisions + open questions

---

## Gotchas

→ Xem `gotchas.md` cho lỗi thiết kế phổ biến — cập nhật liên tục.
