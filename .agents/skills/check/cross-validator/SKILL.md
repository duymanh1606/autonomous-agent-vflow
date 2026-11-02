---
name: cross-validator
description: "Hướng dẫn Master Check Agent cross-validate Spec ↔ Plan ↔ Tests. Agent PHẢI đọc skill này khi /v.check được gọi. Đảm bảo traceability 100% và phát hiện gaps/conflicts."
trigger: "Khi /v.check được gọi"
phase: "R.0"
used_by:
  - /v.check
hooks:
  pre_check: "Load spec.md + plan.md + tasks.md + test-cases.md → build traceability matrix"
  post_check: "Output validation-report.md với verdict + routing + concerns"
---

# Cross Validator — Kiểm Tra Chéo Có Hệ Thống

> ⚠️ Đây là **Skill bắt buộc** cho Master Check Agent.
> QUAN TRỌNG: Verdict PHẢI dựa trên EVIDENCE, không phải cảm tính.
>
> → Xem `gotchas.md` cho bias phổ biến khi validate.
> → Xem `examples/good/` cho mẫu validation-report chuẩn.
> → Xem `config.json` để customize (strictness, concern_threshold).

---

## Khi nào KHÔNG cần full cross-validation

- Quick Fix (`/v.quickfix`) — simplified check: spec → code direct
- Hotfix (`/v.hotfix`) — minimal check: correctness + security only
- Documentation-only — no code change, no check needed

---

## 3-Phase Validation Engine

> 💡 Agent PHẢI thực hiện tất cả 3 phases. Kết quả mỗi phase ảnh hưởng verdict.

### Phase 1: Traceability Matrix — REQ ↔ Task ↔ TC

**Build ma trận (REQ + AC-NN):**
```
Bước 1: Extract tất cả REQ-xxx + AC-NN từ spec.md (§4 Acceptance Criteria)
Bước 2: Map REQ-xxx / AC-NN → T-NNN từ tasks.md (field "REQ / UC mapping" + "Done khi: AC-NN")
Bước 3: Map REQ-xxx → TC-xx từ test-cases.md (Test Matrix §1)
Bước 4: Tạo matrix:

| REQ / AC | Task(s) | TC(s) | Status |
|----------|---------|-------|--------|
| REQ-E01 / AC-01 | T-001, T-004 | TC-01, TC-02 | ✅ Full |
| REQ-E02 / AC-02 | T-004 | TC-03 | ✅ Full |
| REQ-U01 / AC-03 | — | TC-04 | ❌ Missing Task |
| REQ-O01 / AC-04 | T-004 | — | ❌ Missing TC |
```

**Verdict impact:**
- ✅ REQ + mọi AC-NN có Task + TC = FULL → OK
- ⚠️ REQ có Task nhưng không TC = WARNING (concern)
- ❌ REQ **hoặc** AC-NN không có task nào phủ = CRITICAL GAP → FAIL (mọi AC-NN PHẢI có ≥1 task)

### Phase 2: Consistency Check — Spec vs Plan Alignment

**Kiểm tra:**

| Kiểm tra | Signal sai | Action |
|----------|-----------|--------|
| Architecture vs Constitution | Plan dùng pattern khác constitution | FAIL |
| File paths vs existing code | Plan modify file không tồn tại | WARNING |
| No-Go Zone compliance | Plan modify No-Go Zone code | FAIL |
| Dependency direction | Plan vi phạm layer rules | WARNING |
| Error handling completeness | Plan thiếu error architecture | WARNING |
| Security section | Feature cần auth nhưng plan không có | FAIL nếu security-critical |

### Phase 3: Quality Assessment — Plan + Tasks + Tests Quality

**Kiểm tra:**

| Kiểm tra | Criteria | Action |
|----------|---------|--------|
| Task annotations | Có đúng 1 ENTRYPOINT? Có circular DEPENDS? | WARNING/FAIL |
| Task granularity | Nhiều task Complexity **L** (nên tách)? Σ sizing quá lớn? | WARNING |
| TDD trong task | Mỗi task có block **TDD (Red→Green)** + **Done khi (AC-NN)**? | WARNING nếu thiếu |
| AC coverage | Mọi **AC-NN** (spec §4) được ≥1 task phủ? | FAIL nếu có AC chưa phủ |
| Tech Decisions | Quyết định không tầm thường có ghi ở plan §13 (lý do + phương án loại)? | WARNING nếu thiếu |
| Test coverage | ≥1 TC per REQ? Edge cases covered? | FAIL nếu < 100% |
| Test types | Có unit + integration cho critical paths? | WARNING |
| TC priority | Có P1 cho core logic + security? | WARNING |

---

## 3-Level Verdict System

| Verdict | Điều kiện | Routing |
|---------|-----------|---------|
| ✅ **PASS** | 0 Critical + 0 Major | → B.1 (Implement) |
| ⚠️ **PASS WITH CONCERNS** | 0 Critical + có Warning(s) | → B.1 + carry concerns [W-xxx] |
| ❌ **FAIL** | Có ≥1 Critical gap/conflict | → Routing tùy `fail_reason` |

### Fail Routing Logic

```
fail_reason = "missing_tasks"     → route: /v.plan (Plan Agent tạo tasks thiếu)
fail_reason = "missing_tests"     → route: /v.test (Test Agent tạo TCs thiếu)
fail_reason = "spec_conflict"     → route: /v.specify (BA Agent fix spec)
fail_reason = "plan_conflict"     → route: /v.plan (Plan Agent redesign)
fail_reason = "nogo_violation"    → route: /v.plan (Plan Agent redesign around No-Go)
fail_reason = "constitution_violation" → route: /v.plan (Plan Agent align constitution)
```

---

## Concerns System — [W-xxx]

Concerns là issues KHÔNG đủ nghiêm trọng để FAIL nhưng PHẢI được addressed:

```markdown
### W-001: {Tên concern}
- **Type**: Coverage / Consistency / Quality
- **Severity**: Low / Medium
- **Description**: {Mô tả concern}
- **Assigned to**: {Phase/Agent nào cần resolve}
- **Must verify at**: R.1 (Review Agent phải check)
```

**Rules:**
- Concerns PHẢI được carry-forward vào `_session.md`
- Implement Agent PHẢI resolve W-xxx assigned cho mình
- Review Agent PHẢI verify W-xxx resolved ở R.1
- Nếu W-xxx không resolved → Review Agent tạo issue tương ứng

---

## Đặc Thù Và Quy Ước

### 1. Evidence-Based Verdict

Mỗi quyết định trong report PHẢI có evidence:
- ❌ "Plan looks good" → không có evidence
- ✅ "4/4 REQs có task + TC, traceability 100%. Constitution alignment verified." → evidence

### 2. Không Suy Đoán

- Nếu spec mơ hồ → flag MƠ HỒ, không tự interpret
- Nếu plan thiếu detail → flag THIẾU, không tự bổ sung
- Nếu TC coverage unclear → flag GAP, không tự assume covered

### 3. Cross-check Constitution

Luôn verify:
- Architecture pattern match
- Naming convention match
- Error handling pattern match
- Security requirements covered (nếu constitution yêu cầu)

---

## Output — Validation Report Structure

```markdown
# Validation Report — Feature {NNN}

**Ngày:** {date}
**Verdict:** ✅ PASS / ⚠️ PASS WITH CONCERNS / ❌ FAIL

## 1. Traceability Matrix
| REQ | Task(s) | TC(s) | Status |
|-----|---------|-------|--------|
(matrix)

## 2. Consistency Checks
(spec vs plan alignment findings)

## 3. Quality Assessment
(plan + tasks + tests quality)

## 4. Concerns [W-xxx]
(if PASS WITH CONCERNS)

## 5. Issues Found
### Critical (blocks PASS)
### Major (requires action)
### Minor (suggestions)

## 6. Verdict Rationale
(evidence-based explanation)

## 7. Routing Decision
fail_reason: "{reason}"
route_decision: "{/v.xxx}"
```

---

## V-Flow Integration Points

- **spec.md** → Source of truth: REQ list
- **plan.md** → Design: components, file paths
- **tasks.md** → Implementation plan: task list, dependencies
- **test-cases.md** → Test coverage: TC list, REQ mapping
- **constitution.md** → Rules: patterns, conventions
- **context.md** → Constraints: No-Go Zones
- **_session.md** → Output: concerns carry-forward
- **validation-report.md** → Output: full report

---

## Gotchas

→ Xem `gotchas.md` cho bias phổ biến khi validate — cập nhật liên tục.
