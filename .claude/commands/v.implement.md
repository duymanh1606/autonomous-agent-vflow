---
description: "Implement Agent — Coding theo Plan & Test Cases (TDD)"
phase: "B.1"
agent: "implement-agent"
---

# /v.implement

> Orchestration wrapper cho **Implement Agent**. Đọc `agents/implement-agent.md` để thực hiện core logic.

## Điều kiện tiên quyết BẮT BUỘC
- `validation-report.md` phải tồn tại với kết quả = **PASS** hoặc **PASS WITH CONCERNS**
- Nếu = **FAIL** → **DỪNG LẠI**, báo cho user chạy `/v.check` trước

## Execution
1. Đọc agent definition: `agents/implement-agent.md`
2. Thực hiện toàn bộ quy trình trong agent definition
3. Áp dụng command options bên dưới (nếu có)

## Options

### --yolo (YOLO Mode)

> Kích hoạt khi bạn muốn AI tự động implement toàn bộ, không hỏi xác nhận.

**YOLO Mode sẽ**:
- Bỏ qua các bước hỏi xác nhận giữa các tasks
- Tự động implement toàn bộ tasks theo thứ tự dependency
- Tự động đánh dấu `[x]` mỗi task khi hoàn thành
- Chạy test sau mỗi task — dừng lại nếu test fail
- Báo cáo kết quả tổng hợp khi hoàn thành

**YOLO Mode KHÔNG bỏ qua** (đây là *correctness gate*, không phải bước confirm):
- Kiểm tra spec Status block (vẫn phải ✅)
- Kiểm tra `validation-report.md` = **PASS** hoặc **PASS WITH CONCERNS**
- Version drift: `plan/tasks.synced_to_spec` lệch `spec_version_latest` → vẫn dừng, đề xuất `/v.sync`
- No-Go Zones trong `context.md` (script exit 1/2 → vẫn BLOCK)
- Task `[GATE]` → vẫn **DỪNG**, chờ human review
- Task `[CLARIFY]` → vẫn **DỪNG, hỏi human** "Câu hỏi mở"; TUYỆT ĐỐI không tự đoán business rule
- Task `[RISKY]` → vẫn test kỹ + chạy fallback plan nếu fail
- `gitnexus_impact` HIGH/CRITICAL trên symbol → vẫn cảnh báo human trước khi sửa
- Test failures (sẽ dừng và báo cáo)

> ⚠️ Sau YOLO Mode, luôn chạy `/v.review` trước khi merge.

### --slice SLICE-n (Slice Planning — B.0c)

> Chỉ áp dụng khi feature có `slicing.active_variant` trong `.flow-state.yaml`. Không có active variant → bỏ qua `--slice`, chạy như hiện nay (cả feature là một slice).

1. **Mở slice**: `v-flow slice mark <feature> SLICE-n start`
   - Lệnh từ chối nếu còn `depends_on` chưa `done` (nêu tên slice còn thiếu) hoặc slice đang `needs_recheck` → **DỪNG**, báo human
2. **Giới hạn ngữ cảnh**: chỉ đọc task (`units`) của slice trong `slices.md` / `slicing/variants/<active>.yaml`, cùng AC và TC suy ra cho slice đó (`v-flow slice show <feature>` → mục "Chi tiết"). Không implement task của slice khác
3. Implement theo quy trình bình thường (TDD, `[GATE]`, `[CLARIFY]`…) — chỉ trên các task đó
4. **Xong slice**: `v-flow slice mark <feature> SLICE-n submit` → route `/v.review --slice SLICE-n`

---

## 🔀 Routing Rules — Sau Implement

```
Tất cả tasks [x]
  → Route: /v.review

--slice SLICE-n: tất cả task của slice [x]
  → v-flow slice mark <feature> SLICE-n submit
  → Route: /v.review --slice SLICE-n

Có task fail / blocked
  → Báo cáo cho human review
```

## Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "B.1"
phase_status: "done"
artifacts:
  tasks:
    completed: [N]
    in_progress: 0
active_concerns:
  - id: "W-001"
    resolved: true
    resolved_how: "[mô tả cách xử lý]"
```

**Append vào `_session.md`**:
```markdown
### [B.1] Implement — [YYYY-MM-DD]
- **Tasks hoàn thành**: [N/total]
- **Tests passing**: [N/N]
- **Concerns addressed**:
  - [W-001] → [cách giải quyết]
- **Deviations from plan**: [none | mô tả nếu có lý do]
- **Routing**: → /v.review
```

---

## Ví dụ

```
/v.implement Feature 001-user-login
/v.implement --yolo
/v.implement --slice SLICE-1
```
