# Session Memory — autonomous agent vflow

> **File**: `.v-flow/features/001-autonomous-agent-vflow/_session.md`
> **Mục đích**: Working memory của feature trong một phiên làm việc — tạm thời, không phải Source of Truth.
> **Cập nhật bởi**: Mỗi Agent khi chuyển phase hoặc ra quyết định quan trọng.
> **Đọc bởi**: Mọi Agent khi bắt đầu làm việc với feature này (đọc sau spec.md, trước context.md).

---

## 📋 Tóm Tắt Nhanh (Quick Status)

> Agent điền khi bắt đầu mỗi phase

```
Phase hiện tại : [phase]
Bắt đầu lúc   : [datetime]
Agent đang làm : [agent name]
Spec version   : [vX.Y]
Validation     : [PASS | PASS_WITH_CONCERNS | FAIL | pending]
Tasks done     : [N/total]
```

---

## 🧠 Context Quan Trọng (Key Decisions Made)

> Ghi lại các quyết định đã được người dùng confirm — để Agent sau không hỏi lại

| # | Quyết định | Lý do | Ai confirm | Khi nào |
|---|-----------|-------|------------|---------|
| 1 | | | | |

---

## ❓ Câu Hỏi Đang Mở (Open Questions)

> Agent ghi câu hỏi vào đây thay vì tự đoán — người dùng trả lời

- [ ] [Câu hỏi 1] → *Đang chờ trả lời*
- [x] [Câu hỏi 2] → *Trả lời: ...*

---

## ⚡ Execution Trace (Phase-by-Phase Log)

> Tự động append bởi mỗi Agent khi hoàn thành phase

### [S.1] Specify — [YYYY-MM-DD]
- **Agent**: BA Agent
- **Input**: [mô tả yêu cầu đầu vào]
- **Output**: `spec.md v1.0`
- **Module cards used**: [module] v[X.Y], [module] v[X.Y]   ← version lúc chạy gate
- **Biz verification**: [passed | passed_with_warnings | failed | skipped] — [modules đã verify]
- **Highlights**: [điều gì đặc biệt/khác thường trong spec này?]
- **Prototype suggestion**: [yes — N ambiguity points | no]
- **Human checkpoint**: [approved by / pending]

### [S.1.5] Prototype — [YYYY-MM-DD] *(optional — skip nếu không chạy)*
- **Agent**: Prototype Agent
- **Branch**: [LOGIC | UI | skipped]
- **Question**: [câu hỏi prototype trả lời]
- **REQ refs**: [REQ-xxx, REQ-xxx]
- **Verdict**: [VALIDATED | REJECTED | INCONCLUSIVE | skipped]
- **Prototype location**: `.v-flow/features/001/prototype/`
- **Key findings**: [tóm tắt 1-2 câu]
- **Spec impact**: [no change | update needed | new REQ added]
- **Routing**: [→ /v.plan + /v.test | → /v.specify | → awaiting stakeholder | skipped]

### [B.0a] Plan — [YYYY-MM-DD]
- **Agent**: Plan Agent
- **Output**: `plan.md`, `tasks.md` ([N] tasks)
- **Key decisions**:
  - [Quyết định kiến trúc quan trọng]
- **Risks flagged**:
  - [Risk 1]
- **Human checkpoint**: [approved by / pending]

### [B.0b] Test — [YYYY-MM-DD]
- **Agent**: Test Agent
- **Output**: `test-cases.md` ([N] test cases)
- **Coverage gaps noted**: [nếu có]
- **Human checkpoint**: [approved by / pending]

### [R.0] Master Check — [YYYY-MM-DD]
- **Agent**: Master Check Agent
- **Verdict**: [PASS | PASS_WITH_CONCERNS | FAIL]
- **Critical issues**: [N]
- **Major issues**: [N]
- **Concerns to watch**: [list concerns nếu PASS_WITH_CONCERNS]
- **Routing decision**: [implement | re_specify | re_plan | re_test]
- **Route reason**: [lý do routing]

### [B.1] Implement — [YYYY-MM-DD]
- **Agent**: Implement Agent
- **Tasks completed**: [N/total]
- **Concerns addressed**:
  - [W-001] → [cách giải quyết]
- **Deviations from plan**: [nếu có, và lý do]
- **Tests passing**: [N/N]

### [R.1] Review — [YYYY-MM-DD]
- **Agent**: Review Agent
- **Verdict**: [APPROVED | APPROVED_WITH_NOTES | CHANGES_REQUIRED]
- **Issues found**: [N] (≥3 required)
- **Routing decision**: [deploy | fix_and_re_review]

---

## 🔄 Live Progress (Streaming)

> Agent cập nhật section này **TRONG LÚC** đang làm việc — không đợi xong mới ghi.
> Lấy cảm hứng từ LangGraph streaming modes (values, updates, tokens).

```
## 🔄 [Agent Name] đang chạy — [Phase]

**Started**: [HH:MM] | **Elapsed**: [N phút]

### Task Progress
- `[x]` T-001 Setup migration (2 phút)
- `[x]` T-002 Implement JWT (3 phút)  
- `[/]` T-003 Login endpoint ← **ĐANG LÀM** (3 phút)
  > Đang viết unit test cho edge case: expired token
- `[ ]` T-004 Refresh endpoint
- `[ ]` T-005 E2E test

**Tests**: 12/18 passing | **Coverage**: 67%

### ⚠️ Alerts (Log trong lúc làm)
- T-003 phức tạp hơn plan dự kiến → có thể +15 phút
- Found edge case not in spec → ghi vào Open Questions
```

> Sau khi agent hoàn thành, section này được clear và nội dung chuyển vào Execution Trace.

---

## ⚠️ Spec Change Log

> Ghi nhận thay đổi spec trong lúc pipeline đang chạy (Double-texting detection)

<!-- Append khi spec thay đổi -->

---

## 🚦 Concerns Tracker (Từ Master Check)

> Carry-forward từ validation-report.md — agent phải giải quyết khi implement

| ID | Mô tả | Trạng thái | Giải quyết bằng cách |
|----|-------|-----------|---------------------|
| W-001 | | `[ ] open` / `[x] resolved` | |

---

## 🔗 Links (Quick Reference)

- Spec: `.v-flow/features/001/spec.md`
- State: `.v-flow/features/001/.flow-state.yaml`
- Plan: `.v-flow/features/001/plan.md`
- Tasks: `.v-flow/features/001/tasks.md`
- Tests: `.v-flow/features/001/test-cases.md`
- Validation: `.v-flow/features/001/validation-report.md`

---

*Session file — không phải Source of Truth. Spec.md mới là Single Source of Truth.*

### [U.0→R.0] code-to-slice — 2026-11-03
- Zero-arg → feature `001-autonomous-agent-vflow`. Sinh context.md, constitution (draft), 4 Module Card (chỉ SKILL.md), spec (5 UC, 15 REQ, 14 AC), plan, tasks (16), test-cases (18).
- Slice: so main-first (12) vs per-flow (18) → chọn main-first, viết câu demo, khóa bởi AutoSystem.
- Master Check: PASS_WITH_CONCERNS (W-001…W-006). Routing: → /v.implement sau khi human duyệt spec.
