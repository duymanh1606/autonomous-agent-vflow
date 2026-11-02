---
name: ba-critic
description: "Hướng dẫn BA Critic Agent phản biện spec adversarial. Agent PHẢI đọc skill này khi /v.ba-critic hoặc /v.specify --dual được gọi. Bắt buộc tìm ≥3 issues — KHÔNG có LGTM."
trigger: "Khi /v.ba-critic hoặc /v.specify --dual được gọi"
phase: "S.1"
used_by:
  - /v.ba-critic
  - /v.specify --dual
hooks:
  pre_review: "Load spec.md + constitution.md + context.md (nếu legacy)"
  post_review: "Verify ≥3 issues tìm được, mỗi issue có REQ reference"
---

# BA Critic — Adversarial Spec Review

> ⚠️ Đây là **Skill bắt buộc** cho BA Critic Agent.
> QUAN TRỌNG: Bắt buộc tìm **≥3 issues** mỗi round. "LGTM" và "Spec tốt rồi" BỊ CẤM.
>
> → Xem `gotchas.md` cho bias phổ biến khi review spec.
> → Xem `examples/good/` cho mẫu critic report chuẩn.
> → Xem `config.json` để customize (min_issues, focus_areas).
> → Chạy `.v-flow/skills/specify/ba-critic/scripts/check-spec-quality.sh <spec.md>` để pre-scan trước khi critic.

---

## Khi nào review KHÁC

- **Single BA mode** (`/v.specify`): Skill này KHÔNG được gọi. Chỉ ears-writer.
- **Quick Fix** (`/v.quickfix`): Critic round rút gọn — focus completeness + feasibility only.
- **Round 2+**: Fresh context — KHÔNG bị ảnh hưởng bởi round trước. Đọc spec MỚI.

---

## Chiều Phản Biện — Pattern Detection (toolkit tín hiệu)

> 💡 Phần này cung cấp **signals để tìm issues**, không phải checklist tuần tự.
> Agent tự quyết thứ tự và depth dựa trên loại feature.
> **Quan hệ với agent**: BA Critic Agent review theo **9 chiều** (xem `agents/ba-critic-agent.md` Bước 3 — gồm UC Detail, Flow Correctness, Exception Coverage, UI/Screen, EARS, Constitution). 5 nhóm tín hiệu dưới đây là công cụ phát hiện cho các chiều đó, KHÔNG phải danh sách chiều cố định.

### 1. 🎯 Ambiguity — Từ ngữ mơ hồ

**Grep patterns trong spec.md:**
```
Mơ hồ:     "nên", "hợp lý", "dễ dùng", "user-friendly", "nhanh", "tối ưu"
Thiếu số:  "hiệu suất tốt", "phản hồi nhanh" (không có ms/s)
Thiếu scope: "tất cả", "mọi", "luôn luôn" (thực sự TẤT CẢ?)
Passive:    "sẽ được xử lý", "data được lưu" (ai xử lý? lưu ở đâu?)
```

**Câu hỏi tự hỏi:**
- Nếu 2 developer đọc REQ này, họ có implement KHÁC nhau không?
- Acceptance criteria có verifiable bằng test tự động không?

### 2. 🕳️ Completeness — Lỗ hổng logic

**Signals cần tìm:**
- Có happy path nhưng thiếu error path? (POST valid → 201, nhưng POST invalid → ?)
- Có create nhưng thiếu delete/update?
- Có auth nhưng thiếu authorization level?
- Có input nhưng thiếu validation rules?
- Thiếu edge cases: empty state, maximum limits, concurrent access, timeout

**Checklist completeness chuyên sâu:**
```
[ ] Empty state defined? (0 items, first-time user)
[ ] Max limits defined? (max items, max size, max concurrent)
[ ] Error messages specified? (400, 401, 403, 404, 409, 500)
[ ] Timeout behavior? (network, processing, session)
[ ] Concurrency? (2 users edit same resource)
[ ] Pagination? (nếu list > N items)
[ ] Audit trail? (ai làm gì, khi nào)
```

### 3. ⚔️ Consistency — Mâu thuẫn nội bộ

**Signals cần tìm:**
- REQ-A nói "email unique" nhưng REQ-B cho phép merge accounts?
- REQ-A nói "phải delete" nhưng REQ-B nói "phải giữ audit trail"?
- REQ-A nói "real-time" nhưng tech context là REST (polling)?
- Constitution nói pattern X nhưng spec imply pattern Y?
- Context.md No-Go Zone conflict với REQ scope?

### 4. 🔧 Feasibility — Khả thi kỹ thuật

**Signals cần tìm:**
- REQ yêu cầu modify No-Go Zone code?
- REQ yêu cầu technology không có trong tech stack?
- REQ yêu cầu real-time nhưng architecture là batch?
- Performance requirement (< 100ms) với current DB/infra có khả thi?
- External API dependency không ổn định?

### 5. 🧪 Testability — Có test được không

**Signals cần tìm:**
- AC chỉ nói "hệ thống hoạt động đúng" → đúng LÀ GÌ?
- AC không có expected output cụ thể
- REQ phụ thuộc vào external system không mock được
- REQ yêu cầu human judgment ("đẹp", "tốt")

---

## Issue Severity Reference

| Severity | Criteria | Action Required |
|:--------:|---------|----------------|
| 🔴 **Critical** (`R[N]-C00x`) | Ambiguity gây implement sai, missing security REQ, infeasible | **MUST fix** — block spec ký duyệt |
| 🟠 **Major** (`R[N]-M00x`) | Missing error path, incomplete edge cases, consistency conflict | **SHOULD fix** — spec chưa ready |
| 🟡 **Minor** (`R[N]-m00x`) | Wording tweak, better AC, suggestion optimization | **CAN fix** — tùy BA Agent |

**Rule**: ≥3 issues tổng mỗi round. Ít nhất 1 phải Major hoặc Critical (nếu spec thực sự có vấn đề).

---

## Fresh Context Protocol

> 💡 Đây là quy tắc QUAN TRỌNG NHẤT để tránh bias.

Mỗi round review:
1. **ĐỌC SPEC MỚI NHẤT** — BA Agent có thể đã sửa từ round trước
2. **KHÔNG nhớ issues round trước** — review từ zero, không confirm fix
3. **TÌM issues MỚI** — nếu issues round trước đã fix, tìm issues KHÁC
4. **Fresh perspective** — giả vờ chưa bao giờ đọc spec này

```
Round N: Tìm issues A, B, C
BA Agent fix → Spec v2
Round N+1: ĐỌC Spec v2 fresh → Tìm issues D, E, F (KHÔNG check A, B, C)
```

---

## V-Flow Integration Points

- **spec.md** (S.1) → Input chính cần phản biện
- **constitution.md** → Cross-check spec vs project rules
- **context.md** → Cross-check spec vs No-Go Zones và tech constraints
- **ears-notation skill** → Validate EARS compliance
- **spec-review-log.md** → Append critic report mỗi round

---

## Output Format

Minimum required sections trong critic report:

```markdown
## 📋 BA Critic Report — Round {N}

**Spec version reviewed**: {hash hoặc timestamp}
**Issues found**: {N} (≥3 required)
**Verdict**: ✅ CONVERGED | ⚠️ ITERATE | 🛑 ESCALATE

### Issues

#### R[N]-C001: {Tên issue}
- **Severity**: 🔴 Critical / 🟠 Major / 🟡 Minor (khớp ký hiệu ID: C/M/m, N = round)
- **REQ affected**: REQ-xxx
- **Chiều phản biện**: [1 trong 9 chiều — xem `agents/ba-critic-agent.md` Bước 3]
- **Mô tả**: ...
- **Đề xuất fix**: ...

### Summary
- Critical: {N}
- Major: {N}
- Minor: {N}
```

---

## Gotchas

→ Xem `gotchas.md` cho bias phổ biến khi review spec — cập nhật liên tục.
