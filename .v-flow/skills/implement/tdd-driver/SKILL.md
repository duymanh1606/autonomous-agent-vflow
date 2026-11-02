---
name: tdd-driver
description: "Hướng dẫn Implement Agent tuân thủ TDD (Red-Green-Refactor) khi implement tasks. Agent PHẢI đọc skill này trước khi bắt đầu bất kỳ TASK nào."
trigger: "Khi bắt đầu implement task từ tasks.md"
phase: "B.1"
used_by:
  - /v.implement
hooks:
  pre_implement: "Map TC-xxx từ test-cases.md cho TASK hiện tại"
  post_implement: "Chạy full test suite, verify không regression"
---

# TDD Driver — Implement Đúng Quy Trình

> ⚠️ Đây là **Skill bắt buộc** cho Implement Agent.
> Đọc trước khi implement. TDD không phải suggestion — đây là RULE.
>
> → Xem `gotchas.md` cho lỗi phổ biến khi làm TDD.
> → Xem `examples/good/` cho mẫu TDD cycle đúng chuẩn.
> → Xem `config.json` để customize test framework, coverage target.
> → Xem `scripts/` cho automation (nếu có).

---

## Iron Law — Không code production khi chưa có test FAIL trước

```
KHÔNG VIẾT CODE PRODUCTION KHI CHƯA CÓ MỘT TEST ĐANG FAIL.
```

Lỡ viết code TRƯỚC test → **xóa code đó, làm lại từ test**. Không giữ "để tham khảo", không "chỉnh lại trong lúc viết test" (đó vẫn là test-after). Lý do cốt lõi: **nếu không tận mắt thấy test FAIL, bạn không biết nó có thực sự kiểm đúng thứ cần kiểm** — test viết sau code thường pass ngay và chứng minh số 0.

> ⚠️ Đây là chỗ agent hay **tự ngụy biện để bỏ qua**. Gặp ý nghĩ "thôi lần này bỏ TDD" = tín hiệu DỪNG, quay lại viết test trước. Bảng dưới đập lại từng cái:

| Ngụy biện | Sự thật |
|-----------|---------|
| "Đơn giản quá, khỏi test" | Code đơn giản vẫn hỏng. Test mất 30 giây. |
| "Test sau cũng vậy thôi" | Test-after = "code này làm gì?"; test-first = "code này NÊN làm gì?". Test-after thiên lệch theo cái đã viết. |
| "Tôi test tay rồi" | Tay = ad-hoc, không tái chạy được, không có dấu vết. |
| "Xóa mấy giờ code phí lắm" | Sunk cost. Giữ code chưa được test = nợ kỹ thuật. |
| "Giữ lại tham khảo, viết test trước" | Bạn sẽ "phỏng theo" nó → vẫn là test-after. Xóa là xóa. |
| "Test khó viết quá" | Khó test = thiết kế đang coupling/khó dùng. Nghe theo test → tách interface/DI. |
| "TDD cứng nhắc, tôi đang thực dụng" | TDD MỚI là thực dụng: bắt bug trước commit, chặn regression, refactor tự do. |

---

## Khi nào KHÔNG áp dụng strict TDD

- Tạo file config/constant (không có logic → không cần test trước)
- Chạy migration/DDL (test ở integration level, không unit)
- Viết documentation, comments

---

## Đặc Thù Và Quy Ước

> 💡 Phần này chứa thông tin Agent thường bỏ sót hoặc làm sai.

### 1. Nguồn test cases — quan hệ TC-xxx ↔ TDD block

> 🔑 Hai tầng **bổ sung nhau**, KHÔNG mâu thuẫn. Đừng đọc "không tự nghĩ test" thành "không được gõ test".

| Tầng | Ở đâu | Ai tạo | Vai trò |
|------|-------|--------|---------|
| `TC-xxx` | `test-cases.md` (B.0b) | Test Agent | Catalog **ý đồ test chính thức** (scenario), trace tới AC/REQ |
| TDD block | trong task ở `tasks.md` | Plan Agent (provisional) | Checklist Red→Green để Implement Agent **viết code test** hiện thực TC |

**Quy tắc:**
- "**KHÔNG tự nghĩ test mới**" = KHÔNG bịa scenario/ý đồ nằm ngoài spec/AC. **CÓ viết code test** — đó chính là việc của TDD.
- Task **có `TC-xxx`** → hiện thực đúng các TC đó (theo TDD block).
- Task **chưa có `TC-xxx` nhưng có TDD block** (provisional — Test Agent chạy song song B.0b) → **VẪN implement**: viết test theo TDD block (bám `Done khi`/AC), và ghi `_session.md`: `T-{N}: cần TC backfill ở R.0` để Test Agent đối soát sau. **KHÔNG hard-stop.**
- Chỉ **DỪNG (blocked)** khi task **không có CẢ `TC-xxx` LẪN TDD block VÀ không có AC** để bám → ghi `_session.md`: `T-{N} blocked — không có test spec lẫn AC`.

### 2. Concern resolution trong TDD cycle
- Đọc `_session.md` → tìm W-xxx concerns assigned cho task hiện tại
- Viết test cho concern scenario TRƯỚC khi implement fix
- Ghi kết quả: `W-xxx: Resolved — [mô tả fix]` vào `_session.md`

### 3. Test naming convention
- **Pattern**: `should_<expected_behavior>_when_<condition>`
- VD: `should_return_404_when_product_not_found`
- KHÔNG: `test1`, `testLogin`, `it_works`

### 4. Mocking strategy
- Mock **external dependencies** (DB, API, file system) trong unit tests
- KHÔNG mock module đang test (test real behavior)
- Document mock behavior trong test file header comment
- Đọc `config.json → test_framework` để biết mock library phù hợp
- **Test anti-patterns — TRÁNH** (test phải kiểm hành vi THẬT, không kiểm hành vi của mock):
  - ❌ **Assert lên mock** (vd `getByTestId('sidebar-mock')`) → chỉ chứng minh mock tồn tại. Sửa: test component thật / assert lên `role`/hành vi thật.
  - ❌ **Method test-only trong class production** (vd `destroy()` chỉ test gọi) → đẩy sang `test-utils/`, đừng làm bẩn production (YAGNI).
  - ❌ **Mock khi chưa hiểu dependency** → mock nuốt mất side-effect mà test phụ thuộc. Chạy test với impl thật TRƯỚC, hiểu nó cần gì, rồi mock ở **tầng thấp nhất** (cái chậm/external), không mock hàm cấp cao test đang dựa vào.
  - ❌ **Mock thiếu field** → mirror ĐẦY ĐỦ cấu trúc API thật, không chỉ field test này dùng (downstream đọc field thiếu → fail âm thầm).

### 5. V-Flow Integration Points
- **test-cases.md** (B.0b) → nguồn TC. KHÔNG tự nghĩ TC mới
- **plan.md** (B.0a) → architecture cần follow khi implement
- **constitution.md** → naming convention, patterns
- **_session.md** → ghi trace mỗi TDD cycle completion
- **No-Go Zone Guard** → cross-check TRƯỚC khi tạo file mới

### 6. Coverage Tracking
- Đọc target từ `.v-flow/config.yaml → coverage_target` (đáp án setup đã resolve); thiếu file → fallback default `config.json` = 80%
- Sau mỗi task: verify coverage ≥ target (gate này nằm ở `implement-agent.md` Bước 4)
- Nếu dưới target → viết thêm tests cho untested branches
- Ghi vào `tdd-history.log`: task, tests written, coverage delta

> ⚠️ `hooks: pre_implement/post_implement` ở frontmatter chỉ là **ý định** — harness KHÔNG tự fire. Implement Agent tự thực hiện trong quy trình B.1.

---

## Red-Green-Refactor — Signals Nhận Biết

| Phase | Signal đúng | Signal sai |
|-------|------------|-----------|
| 🔴 **RED** | Test FAIL với expected reason | Test FAIL vì syntax error |
| 🔴 **RED** | Test FAIL vì function chưa tồn tại | Test PASS ngay → test sai |
| 🟢 **GREEN** | Test PASS sau khi viết code tối thiểu | Test PASS nhưng code quá complex |
| 🟢 **GREEN** | ALL tests pass (cũ + mới) | Chỉ test mới pass, test cũ break |
| 🔵 **REFACTOR** | Code cleaner, tests vẫn pass | Tests break → undo refactor |
| 🔵 **REFACTOR** | Naming/structure theo constitution | Thêm feature mới (không phải refactor) |

---

## Per-Task Verification Signals

Agent tự verify trước khi chuyển task. Nếu BẤT KỲ signal nào ❌ → không chuyển task:

| Signal | Verify bằng cách | Nếu fail |
|--------|------------------|----------|
| Spec-fit (đúng & đủ) | Diff task khớp ĐÚNG `AC-NN`/`TC-xx` của task — **không thiếu** (đủ AC) **và không thừa** (không thêm field/flag/endpoint/abstraction không ai yêu cầu) | Thiếu → bổ sung; Thừa → gỡ bỏ (over-build vi phạm YAGNI) |
| TC mapped | Grep TC-xxx trong test-cases.md cho TASK hiện tại | Có TDD block/AC → vẫn code, log "TC backfill R.0". Không có gì để bám → DỪNG, báo Test Agent |
| Test wrote first | Git diff: test file created TRƯỚC impl file | Nếu ngược → commit history sai |
| Red confirmed | Test output showed FAIL trước khi viết impl | Nếu pass ngay → test sai, fix test |
| Green confirmed | ALL tests pass (cũ + mới) | Nếu test cũ break → regression |
| Refactored | Code follows constitution naming/patterns | Nếu skip → tech debt |
| No-Go safe | File list không overlap No-Go Zones | Nếu overlap → BLOCK |
| Concerns | W-xxx resolved nếu có | Nếu skip → R.1 sẽ reject |
| Trace logged | _session.md có entry cho task | Nếu thiếu → audit trail mất |

---

## Edge Cases

### Test quá khó viết
→ **Signal**: Design problem. Tightly coupled code = hard to test.
→ **Action**: Ghi vào `_session.md`, suggest refactor approach. Viết simplest possible test.

### External dependency không mock được
→ **Action**: Tạo interface/adapter, mock interface. Test real implementation ở integration level.

### Task quá lớn cho 1 TDD cycle
→ **Action**: Split sub-tasks. Mỗi sub-task = 1 TDD cycle. Update `tasks.md`.

---

## Gotchas

→ Xem `gotchas.md` để tránh lỗi phổ biến — cập nhật liên tục.
