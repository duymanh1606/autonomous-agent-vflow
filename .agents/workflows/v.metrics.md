---
description: "Thu thập và phân tích Agent Metrics sau mỗi feature cycle"
phase: "M.0"
agent: "metrics-agent"
---

# /v.metrics

> Orchestration wrapper cho **Metrics Agent**. Đọc `agents/metrics-agent.md` để thực hiện core logic.

## Điều kiện tiên quyết
- Feature phải đã qua **R.1** (Code Review hoàn thành)
- `spec.md`, `tasks.md`, `validation-report.md` phải tồn tại
- `_session.md` nên có execution trace

## Execution
1. Đọc agent definition: `agents/metrics-agent.md`
2. Thực hiện toàn bộ quy trình trong agent definition
3. Tạo `metrics-report.md`
4. **Nếu feature có slice plan** (`slicing.active_variant`): thêm mục *Slice — dự đoán vs thực tế*
   - Thực tế, đọc từ `slices[]` của `.flow-state.yaml`: số vòng review (`review_rounds`), số lần recheck (`recheck_count`), demo được duyệt hay không — cho từng slice
   - Dự đoán: `v-flow slice show <feature> --json` → `metrics` (vd `rework_exposure`, `first_demo_points`)
   - So hai bên (vd tổng `recheck_count` vs `rework_exposure`) và ghi nhận xét — đây là vòng phản hồi cho thử nghiệm cách cắt

## Options

### (không có argument) — Feature hiện tại
Đo metrics cho feature đang active trong context.

### --aggregate — Tổng hợp nhiều features
```
/v.metrics --aggregate 5
```
Tổng hợp metrics từ 5 features gần nhất, phát hiện trends và rút ra improvement areas.

---

## 🔀 Routing Rules — Sau Metrics

```
Metrics report tạo xong
  → Route: /v.retrospective (nếu chưa chạy)
  → Hoặc: Feature complete — archive

Phát hiện Agent cần cải tiến urgently
  → Đề xuất sửa agent-config.md TRƯỚC feature tiếp theo
```

## Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "M.0"
phase_status: "done"
artifacts:
  metrics_report:
    exists: true
```

**Append vào `_session.md`**:
```markdown
### [M.0] Metrics — [YYYY-MM-DD]
- **Agent**: Metrics Agent
- **Output**: `metrics-report.md`
- **Key findings**: [top 3 findings]
- **Recommendations**: [top 3 recommendations]
- **Routing**: → /v.retrospective
```

---

## Ví dụ

```
/v.metrics
/v.metrics feature 001-user-login
/v.metrics --aggregate 5
```
