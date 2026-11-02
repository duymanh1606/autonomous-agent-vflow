# Metrics Collector — Good Example

> Ví dụ output chuẩn của Metrics Agent sau khi feature cycle hoàn tất.

## Input Context

**Feature:** 005-user-notifications
**Pipeline:** S.1 → B.0a ∥ B.0b → R.0 → B.1 → R.1 → M.0
**Outcome:** Deployed successfully

## Output — metrics-report.md

```markdown
## 📊 Metrics Report — 005-user-notifications

**Generated**: 2026-04-25 14:30
**Pipeline**: Full Flow (with Dual BA)
**Outcome**: ✅ Deployed

### Summary

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Total cycle time | 6.5 hours | 4-8 hours | ✅ Normal |
| Phases completed | 7/7 | 7/7 | ✅ Complete |
| First-pass rate | 71% (5/7) | >60% | ✅ Good |
| Rework rate | 29% (2/7) | <40% | ✅ Acceptable |
| Requirements | 8 (3U + 2E + 2S + 1O) | — | — |
| Test cases | 15 | — | 1.88 per REQ |
| Spec changes | 2 (v1.0 → v1.2) | <3 | ✅ Normal |

### Phase Timeline

| Phase | Duration | Revisions | Verdict | Notes |
|-------|----------|-----------|---------|-------|
| S.1 Spec | 1.5h | 1 | approved v1.2 | Dual BA: 2 rounds to converge |
| B.0a Plan | 45m | 0 | approved | Clean architecture applied |
| B.0b Test | 30m | 0 | approved | 15 TCs (8 happy, 4 edge, 3 error) |
| R.0 Check | 20m | 1 | PASS_WITH_CONCERNS | [W-001] Missing pagination spec |
| B.1 Implement | 2.5h | 0 | — | TDD: all 15 tests pass |
| R.1 Review | 40m | 0 | APPROVED_WITH_NOTES | 4 issues (0 critical, 1 major, 3 minor) |
| M.0 Metrics | 15m | 0 | — | This report |

### Per-Agent Analysis

| Agent | First-pass? | Quality | Insight |
|-------|:-----------:|---------|---------|
| BA Agent | ❌ (rev 1) | Good | Spec v1.0 thiếu error paths → v1.2 after BA Critic |
| Plan Agent | ✅ | Excellent | Components mapped 100% to REQs |
| Test Agent | ✅ | Good | Coverage 1.88 TC/REQ — above target |
| Master Check | ❌ (rev 1) | Good | Caught [W-001] → resolved in B.1 |
| Implement Agent | ✅ | Excellent | TDD discipline maintained |
| Review Agent | ✅ | Good | Found 1 major (missing index) |

### Concern Resolution

| Concern | Source | Resolution | Verified |
|---------|--------|------------|:--------:|
| [W-001] Missing pagination | R.0 | Added pagination in B.1 (limit=20, offset) | ✅ R.1 |

### Bottleneck Analysis

```
Phase Duration Distribution:
S.1  ████████████████████ 1.5h (23%)  ← Longest — Dual BA overhead
B.1  ██████████████████████████████████ 2.5h (38%)  ← Expected — most work
B.0a ██████████ 45m (12%)
R.1  █████████ 40m (10%)
B.0b ██████ 30m (8%)
R.0  ████ 20m (5%)
M.0  ██ 15m (4%)
```

**Bottleneck**: S.1 (23%) — Dual BA review added ~45m overhead.
**Action**: Consider using single BA for features with <5 requirements.

### Recommendations

1. **BA Agent**: Pre-define error paths in initial spec to reduce Dual BA rounds
2. **Master Check**: Pagination should be in standard checklist for list APIs
3. **Review Agent**: Database index check should be automated (add to constitution)
4. **Overall**: Cycle time within normal range — no urgent improvements needed

### Trend (last 3 features)

| Feature | Cycle Time | First-pass | Rework | REQs |
|---------|-----------|-----------|--------|------|
| 003-export | 4.0h | 83% | 17% | 5 |
| 004-dashboard | 7.5h | 57% | 43% | 12 |
| **005-notifications** | **6.5h** | **71%** | **29%** | **8** |
| **Average** | **6.0h** | **70%** | **30%** | **8.3** |
```

## Why This Is Good

1. ✅ **Quantitative** — tất cả metrics đều có số liệu cụ thể
2. ✅ **Benchmarked** — so sánh với benchmark biết normal hay không
3. ✅ **Actionable** — recommendations cụ thể cho từng agent
4. ✅ **Visual** — bar chart cho bottleneck analysis
5. ✅ **Trending** — so sánh với features trước để thấy xu hướng
6. ✅ **Concern tracking** — chứng minh concerns đã resolved
