---
name: metrics-collector
version: "1.0"
agent: metrics
phase: M.0
triggers:
  - post_review
  - manual_collection
dependencies:
  - _shared/constitution-reader
input:
  - .flow-state.yaml
  - _session.md
  - validation-report.md
  - code-review-report.md (if exists)
  - git log / timestamps
output:
  - metrics-report.md
complexity: medium
---

# Metrics Collector Skill

> **Purpose**: Thu thập và phân tích Agent performance metrics sau mỗi feature cycle.
> **Khi nào dùng**: Sau khi R.1 (Review) hoàn tất — chạy `/v.metrics`.

## Quick Reference

```
Input:  .flow-state.yaml + _session.md + validation/review reports
Output: metrics-report.md
Agent:  Metrics Agent
Phase:  M.0 (post R.1)
```

## What This Skill Does

1. **Collect Timeline Data** — Timestamps từ `.flow-state.yaml` phase_history
2. **Count Iterations** — Bao nhiêu lần revision tại mỗi phase
3. **Measure Quality** — First-pass approval rates, Master Check verdict
4. **Analyze Bottlenecks** — Phase nào mất thời gian nhất
5. **Generate Report** — Structured metrics-report.md

## Metrics Categories

### Per-Agent Metrics

| Metric | Source | Formula |
|--------|--------|---------|
| **First-pass approval rate** | `.flow-state.yaml` phase_history | phases_passed_first_try / total_phases |
| **Revision count** | `_session.md` execution trace | Count re-entries per phase |
| **Processing time** | `.flow-state.yaml` timestamps | exited_at - entered_at per phase |
| **Quality score** | `validation-report.md` | (PASS=100, WITH_CONCERNS=70, FAIL=0) |

### Per-Pipeline Metrics

| Metric | Source | Formula |
|--------|--------|---------|
| **Total cycle time** | `.flow-state.yaml` | last_phase.exited_at - first_phase.entered_at |
| **Master Check pass rate** | `.flow-state.yaml` routing | PASS_count / total_check_count |
| **Rework rate** | Phase history | phases_with_rework / total_phases |
| **Concern resolution rate** | `_session.md` | concerns_resolved / concerns_raised |

### Per-Feature Metrics

| Metric | Source | Formula |
|--------|--------|---------|
| **Requirements count** | `spec.md` | Count REQ-xxx |
| **Test coverage** | `test-cases.md` | tests_count / requirements_count |
| **Spec change count** | `.flow-state.yaml` spec_version | Version number (v1.0 → v1.2 = 2 changes) |

## How to Use

### Step 1: Gather Data Sources

```markdown
Đọc các file sau từ feature directory:
1. .flow-state.yaml → phase_history, artifacts, routing
2. _session.md → execution trace, decisions, open questions
3. validation-report.md → verdict, concerns
4. spec.md → requirements count
5. test-cases.md → test count
```

### Step 2: Calculate Metrics

```markdown
Cho mỗi phase trong phase_history:
- Tính duration = exited_at - entered_at
- Đếm số lần phase xuất hiện (revision count)
- Kiểm tra verdict/approval status

Tổng hợp:
- Total cycle time
- Bottleneck phase (longest duration)
- First-pass vs revision phases
```

### Step 3: Generate Report

```markdown
## 📊 Metrics Report — [Feature Name]

### Summary
| Metric | Value |
|--------|-------|
| Total cycle time | X days |
| Phases completed | Y/Z |
| First-pass rate | XX% |
| Rework rate | XX% |
| Requirements | N |
| Test cases | M |

### Phase Timeline
| Phase | Duration | Revisions | Verdict |
|-------|----------|-----------|---------|
| S.1 | 2h | 0 | approved |
| B.0a | 1h | 0 | - |
| R.0 | 30m | 1 | PASS_WITH_CONCERNS |
| B.1 | 4h | 0 | - |
| R.1 | 1h | 0 | APPROVED |

### Recommendations
1. [Based on bottleneck analysis]
2. [Based on rework patterns]
```

## Gotchas

1. **Missing timestamps** — Nếu `.flow-state.yaml` không có đủ timestamps, ước tính từ git log
2. **Manual phases** — Một số phases (e.g., human approval) không có agent metrics
3. **Cross-feature comparison** — Chỉ so sánh features cùng project_type (greenfield vs legacy)
4. **First feature bias** — Feature đầu tiên thường chậm hơn do setup overhead
