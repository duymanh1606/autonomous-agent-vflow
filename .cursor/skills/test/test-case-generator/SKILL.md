---
name: test-case-generator
description: "Hướng dẫn Test Agent tạo test cases từ spec.md. Agent PHẢI đọc skill này khi /v.test được gọi. Đảm bảo 100% REQ coverage + edge cases + traceability."
trigger: "Khi /v.test được gọi, tạo test cases từ spec"
phase: "B.0b"
used_by:
  - /v.test
hooks:
  pre_generate: "Load spec.md → extract TẤT CẢ REQ-xxx + AC, tạo coverage matrix"
  post_generate: "Verify: mỗi REQ có ≥1 TC, mỗi AC có TC, edge cases covered"
---

# Test Case Generator — Tạo Test Cases Toàn Diện

> ⚠️ Đây là **Skill bắt buộc** cho Test Agent.
> Mỗi REQ PHẢI có ≥1 Test Case. REQ không có TC = gap nguy hiểm.
>
> → Xem `gotchas.md` cho lỗi phổ biến khi viết test cases.
> → Xem `examples/good/` cho mẫu test-cases.md chuẩn.
> → Xem `config.json` để customize (coverage_target, tc_format).

---

## Khi nào KHÔNG tạo test cases

- Documentation-only change — không có code logic
- Config/constant change — test ở integration level, nhưng vẫn cần TC cho behavior

---

## REQ Type → Test Strategy Mapping

> 💡 Mỗi loại REQ gợi ý strategy test khác nhau (từ EARS notation).

| REQ Type | Test Strategy | Ví dụ |
|----------|--------------|-------|
| **REQ-U** (Ubiquitous) | Test ở MỌI entry point — always true | "Password always hashed" → test ở create, update, import |
| **REQ-E** (Event-driven) | Given trigger → expect action | "Khi login → redirect" → test trigger + verify action |
| **REQ-S** (State-driven) | While in state → verify behavior | "Trong khi offline → queue requests" → set state + verify |
| **REQ-O** (Optional) | Branch test: condition true + false | "Nếu admin → show panel" → test admin = true + false |

---

## Đặc Thù Và Quy Ước

### 1. Test Case ID Convention

```
TC-NN (đánh số tuần tự toàn file): TC-01, TC-02, TC-03 ...
```

Traceability KHÔNG nhúng vào ID mà qua field **Gắn với: REQ-xxx** + **AC: AC-NN** trong mỗi TC — khớp `test-cases-template.md` và Master Check matrix (REQ + AC-NN).

### 2. Test Layers

Mỗi REQ nên có test ở ≥1 layer:

| Layer | Khi nào dùng | Ví dụ |
|-------|-------------|-------|
| **Unit** | Business logic, pure functions | UseCase, Repository, Validation |
| **Integration** | Cross-component interaction | API → DB → Response |
| **E2E** | User-facing flows | Login → Dashboard redirect |

**Rule**: Unit tests cho MỌI REQ. Integration cho cross-component REQ. E2E cho critical path.

### 3. Edge Case Generation — 7 Categories

Mỗi REQ, quét qua 7 categories để tìm edge cases:

| Category | Câu hỏi | Test cases cần có |
|----------|---------|-------------------|
| **Empty** | Input rỗng? List 0 items? | TC cho null, "", [], {} |
| **Boundary** | Min/max values? Off-by-one? | TC cho 0, 1, MAX, MAX+1 |
| **Error** | Network fail? Invalid input? | TC cho timeout, 400, 500 |
| **Concurrent** | 2 requests cùng lúc? | TC cho race condition |
| **Auth** | Không có token? Wrong role? | TC cho 401, 403 |
| **State** | First time? After reset? | TC cho initial state, reset |
| **Performance** | Large dataset? Slow network? | TC cho 10K items, 3s timeout |

### 4. Test Case Completeness Check

Trước khi submit test-cases.md:

```
[ ] Mỗi REQ-xxx có ≥1 TC (happy path)
[ ] Mỗi REQ Error path có TC riêng
[ ] Mỗi AC trong spec có TC verify
[ ] ≥1 edge case per REQ (từ 7 categories)
[ ] Test priority assigned (P1/P2/P3)
[ ] Test type assigned (Unit/Integration/E2E)
```

### 5. Priority Assignment

| Priority | Criteria | PHẢI test |
|----------|---------|-----------|
| **P1** | Core business logic, security, data integrity | ✅ Bắt buộc |
| **P2** | Important flows, edge cases | ✅ Nên có |
| **P3** | Nice-to-have, optimization verify | ⚠️ Tùy scope |

---

## Test Case Template

```markdown
### TC-NN: {Tên test case mô tả behavior}

**Gắn với:** REQ-{xxx}
**AC:** AC-NN (tiêu chí chấp nhận spec §4 mà TC này verify — bắt buộc để cross-check AC↔TC)
**Loại:** Unit / Integration / E2E
**Priority:** P1 / P2 / P3

#### Preconditions
- {Trạng thái ban đầu cần thiết}

#### Test Steps
1. {Action 1}
2. {Action 2}

#### Expected Result
- {Kết quả mong đợi — measurable}

#### Edge Cases
- {Biến thể của test case này}
```

---

## Coverage Matrix Template

> Đặt ở đầu test-cases.md để overview.

```markdown
## Coverage Matrix

| REQ | AC | Description | TC Count | Types | Priority |
|-----|----|------------|----------|-------|----------|
| REQ-E01 | AC-01 | Login success | 3 | Unit, E2E | P1 |
| REQ-E02 | AC-02 | Login error | 2 | Unit | P1 |
| REQ-U01 | AC-03 | Password hash | 1 | Unit | P1 |
| REQ-O01 | AC-04 | Rate limit | 2 | Unit, Integration | P2 |

**Coverage**: 4/4 REQs (100%) ✅
**Total TCs**: 8
```

---

## V-Flow Integration Points

- **spec.md** (S.1) → Input: REQs + ACs
- **ears-notation skill** → REQ type → test strategy mapping
- **plan.md** (B.0a) → Component info cho integration test scope
- **tasks.md** (B.0a) → Test Agent map TC → TASK cho Implement Agent
- **cross-validator skill** → Master Check verify TC coverage

---

## Gotchas

→ Xem `gotchas.md` cho lỗi phổ biến khi viết test cases — cập nhật liên tục.
