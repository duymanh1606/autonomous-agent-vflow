# Template: Sprint Status — Bảng theo dõi Sprint

> Được tạo bởi **Sprint Planning Agent**
> Sprint: [N]
> Ngày bắt đầu: [YYYY-MM-DD]
> Ngày dự kiến kết thúc: [YYYY-MM-DD]

---

## Sprint Goal

> [1-2 câu mô tả mục tiêu sprint]

---

## 1. Sprint Backlog

### Feature: [NNN-feature-name]

| Task ID | Mô tả | Priority | Estimation | Status | Assignee |
|---------|--------|:--------:|:----------:|:------:|----------|
| T-001 | [mô tả] | Must | [N]h | [ ] / [/] / [x] | [AI/Human] |
| T-002 | [mô tả] | Should | [N]h | [ ] | [AI/Human] |
| T-003 | [mô tả] | Nice | [N]h | [ ] | [AI/Human] |

### Feature: [NNN-feature-name-2] *(nếu multi-feature sprint)*

| Task ID | Mô tả | Priority | Estimation | Status | Assignee |
|---------|--------|:--------:|:----------:|:------:|----------|
| T-001 | [mô tả] | Must | [N]h | [ ] | [AI/Human] |

---

## 2. Capacity Planning

| Metric | Giá trị |
|--------|--------|
| Tổng tasks | [N] |
| Must-have tasks | [N] |
| Should-have tasks | [N] |
| Nice-to-have tasks | [N] |
| Ước tính tổng | [N] giờ |
| Capacity khả dụng | [N] giờ |
| Utilization | [XX]% |

---

## 3. Cross-Feature Dependencies

```mermaid
graph LR
    F001[001-login] -->|auth API| F002[002-dashboard]
    F002 -->|user data| F003[003-profile]
```

| Dependency | From | To | Status | Blocker? |
|-----------|------|-----|:------:|:--------:|
| Auth API | 001-login | 002-dashboard | ✅ / ❌ | ⚠️ / ✅ |

---

## 4. Daily Progress

### Day [N] — [YYYY-MM-DD]

| Feature | Tasks Done | Total | Progress | Blockers |
|---------|:----------:|:-----:|:--------:|----------|
| 001 | [N] | [N] | [XX]% | [none / mô tả] |
| 002 | [N] | [N] | [XX]% | [none / mô tả] |

---

## 5. Sprint Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| [mô tả risk] | High/Med/Low | High/Med/Low | [plan] |

---

## 6. Sprint Summary *(điền khi kết thúc sprint)*

| Metric | Planned | Actual |
|--------|:-------:|:------:|
| Tasks completed | [N] | [N] |
| Story points | [N] | [N] |
| Velocity | — | [N] pts/sprint |
| Carry-over tasks | — | [N] |

### Sprint Health

| Indicator | Status |
|-----------|:------:|
| Goal achieved | ✅ / ❌ |
| All Must-have done | ✅ / ❌ |
| No critical blockers | ✅ / ❌ |
| Team satisfaction | [1-5]/5 |

---

> **Bước tiếp theo**: `/v.retrospective --sprint [N]`
