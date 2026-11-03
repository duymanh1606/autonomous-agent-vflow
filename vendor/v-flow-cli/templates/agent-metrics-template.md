# Template: Agent Metrics Report

> Điền sau mỗi feature cycle (**M.0**).
> Lưu tại: `.v-flow/features/NNN-ten-feature/metrics-report.md`

## Thông tin Feature

| Mục | Giá trị |
|-----|--------|
| **Feature** | [#NNN — Tên feature] |
| **Ngày bắt đầu** | [YYYY-MM-DD] |
| **Ngày hoàn thành** | [YYYY-MM-DD] |
| **Tổng thời gian** | [X giờ / ngày] |
| **Pipeline type** | Full / Quick Fix / Hotfix |
| **Người đánh giá** | [Tên] |

---

## 1. Metrics theo Agent

### 1.1 Agent Performance Matrix

| Agent | Pass lần 1? | Revisions | Thời gian | Quality (1-5) | Target | Trend |
|-------|:----------:|:---------:|:---------:|:------------:|:------:|:-----:|
| BA Agent | ✅/❌ | [N] | [N]m | /5 | ≥4 | ↑↓→ |
| BA Critic | N/A | [N] rounds | [N]m | /5 | ≥4 | ↑↓→ |
| Plan Agent | ✅/❌ | [N] | [N]m | /5 | ≥4 | ↑↓→ |
| Test Agent | ✅/❌ | [N] | [N]m | /5 | ≥4 | ↑↓→ |
| Master Check | PASS/FAIL | [N] | [N]m | /5 | ≥4 | ↑↓→ |
| Implement Agent | ✅/❌ | [N] | [N]m | /5 | ≥4 | ↑↓→ |
| Review Agent | ✅/❌ | [N] | [N]m | /5 | ≥4 | ↑↓→ |

### 1.2 Agent Targets (Chuẩn hiệu suất)

| Agent | Tiêu chí | Target | Actual | Met? |
|-------|---------|:------:|:------:|:----:|
| BA Agent | First-pass approval | ≥70% | [XX]% | ✅/❌ |
| Plan Agent | First-pass approval | ≥80% | [XX]% | ✅/❌ |
| Test Agent | REQ coverage | 100% | [XX]% | ✅/❌ |
| Master Check | Catch rate | ≥90% | [XX]% | ✅/❌ |
| Implement Agent | Tests pass rate | 100% | [XX]% | ✅/❌ |
| Review Agent | Issues found | ≥3 | [N] | ✅/❌ |

---

## 2. Metrics Pipeline

| Metric | Giá trị |
|--------|--------|
| **Master Check kết quả** | PASS / PASS WITH CONCERNS / FAIL (lần thứ ___) |
| **Tổng cycle time** | [N] giờ |
| **Phase bottleneck** | [Phase nào mất nhiều thời gian nhất] |
| **Rework cycles** | [N] — quay lại phase: [phase list] |
| **Code review rounds** | [N] |
| **Concerns generated (R.0)** | [N] |
| **Concerns resolved (B.1)** | [N]/[N] |
| **UAT result** | Pass / Fail |
| **Bugs found after deploy** | [N] |

---

## 2.5 Cost Metrics

| Agent | Model | Tokens (Input) | Tokens (Output) | Chi phí (USD) |
|-------|-------|:--------------:|:---------------:|:-------------:|
| BA Agent | [model] | | | $ |
| BA Critic | [model] | | | $ |
| Plan Agent | [model] | | | $ |
| Test Agent | [model] | | | $ |
| Master Check | [model] | | | $ |
| Implement Agent | [model] | | | $ |
| Review Agent | [model] | | | $ |
| **Tổng cộng** | | | | **$** |

> 💡 Thu thập từ API usage logs hoặc provider dashboard.
> So sánh cost/feature để tối ưu model selection.

---

## 3. Requirements Coverage

| Metric | Số lượng |
|--------|---------|
| Requirements trong spec | [N] |
| Tasks mapped to REQ | [N/N] |
| Test cases mapped to REQ | [N/N] |
| Tests pass | [N] |
| Tests fail | [N] |
| Coverage % | [XX]% |

### Ground Truth Comparison (tùy chọn)

| Agent | Golden test pass? | Score | Ghi chú |
|-------|:-----------------:|:-----:|---------| 
| BA Agent | ✅/❌ | /100 | So với golden spec |
| Plan Agent | ✅/❌ | /100 | So với golden plan |
| Test Agent | ✅/❌ | /100 | So với golden test cases |

> 📎 Golden test datasets lưu tại `.v-flow/knowledge/golden-tests/`

---

## 4. Trend Analysis (so sánh N features gần nhất)

| Metric | Feature N-2 | Feature N-1 | **Feature N** | Trend |
|--------|:----------:|:----------:|:------------:|:-----:|
| Cycle time (giờ) | | | | ↑↓→ |
| Rework cycles | | | | ↑↓→ |
| Master Check pass lần 1 | | | | ↑↓→ |
| Code Review pass lần 1 | | | | ↑↓→ |
| Cost per feature | | | | ↑↓→ |
| Post-deploy bugs | | | | ↑↓→ |
| Avg Quality score | | | | ↑↓→ |

> ↑ = improving, ↓ = degrading, → = stable

---

## 5. Vấn đề & Bài học

### Vấn đề gặp phải
<!-- Liệt kê vấn đề phát sinh trong cycle -->
1. [Mô tả vấn đề] → [Giải pháp / Workaround]

### Bài học rút ra
<!-- Kinh nghiệm cho cycles tiếp theo -->
1. [Bài học]

### Đề xuất cải tiến Agent Config
<!-- Thay đổi agent config, prompt, model nếu cần -->

| Đề xuất | Agent | Thay đổi | Priority | Lý do |
|---------|-------|---------|:--------:|-------|
| [mô tả] | [agent] | [model/temp/prompt] | High/Med/Low | [data-driven reason] |

---

## 6. Đánh giá tổng thể

| Tiêu chí | Điểm (1-5) | Target |
|----------|:-----------:|:------:|
| Chất lượng spec | /5 | ≥4 |
| Chất lượng plan | /5 | ≥4 |
| Chất lượng test cases | /5 | ≥4 |
| Chất lượng code | /5 | ≥4 |
| Hiệu quả pipeline tổng thể | /5 | ≥4 |
| Cost efficiency | /5 | ≥3 |
| **Trung bình** | **/5** | **≥4** |

> **So sánh với feature trước:** Tốt hơn / Tương đương / Kém hơn — [giải thích ngắn dùng data]
