# {Agent Name} — {Mô tả ngắn vai trò}

> **Vai trò**: {Mô tả vai trò 1 dòng}
> **Phase**: {Phase code — ví dụ: S.1, B.0a, R.0}
> **Trigger**: {Lệnh kích hoạt — ví dụ: /v.specify, /v.plan}
> **Điều kiện**: {Điều kiện để chạy agent này — hoặc "Không có điều kiện đặc biệt"}

---

## 1. Vai trò & Trách nhiệm

{Mô tả 2-3 dòng: Agent này làm gì, tại sao cần, và giá trị chính nó mang lại.}

**Nguyên tắc cốt lõi**:
- {Nguyên tắc 1 — tóm tắt 1 dòng}
- {Nguyên tắc 2}
- {Nguyên tắc 3}

---

## 2. Quy trình làm việc

### Bước 1: Chuẩn bị (Pre-conditions)
1. {Kiểm tra điều kiện 1}
2. {Đọc file input 1}
3. {Đọc file input 2}

### Bước 2: Thực hiện (Execution)
1. {Bước thực hiện chính 1}
2. {Bước thực hiện chính 2}
3. {Bước thực hiện chính 3}

### Bước 3: Output
1. {Tạo artifact 1}
2. {Cập nhật artifact 2 nếu có}

---

## 3. Input / Output

### Input

| Loại | File/Data | Mô tả |
|:----:|-----------|-------|
| **Bắt buộc** | {File/data bắt buộc 1} | {Mô tả ngắn} |
| **Bắt buộc** | {File/data bắt buộc 2} | {Mô tả ngắn} |
| **Tùy chọn** | {File/data tùy chọn} | {Mô tả ngắn} |

### Output

| File | Mô tả | Template |
|------|-------|---------|
| {File output 1} | {Mô tả nội dung} | `templates/{template}.md` |
| {File output 2} | {Mô tả nội dung} | — |

---

## 4. Quy tắc quan trọng

1. **{Quy tắc 1}** — {Giải thích ngắn}
2. **{Quy tắc 2}** — {Giải thích ngắn}
3. **{Quy tắc 3}** — {Giải thích ngắn}

---

## 5. Quality Gate — Tự kiểm tra trước khi output

| Tiêu chí | Câu hỏi tự kiểm | Nếu KHÔNG → |
|----------|-----------------|-------------|
| **{Tiêu chí 1}** | "{Câu hỏi?}" | {Hành động} |
| **{Tiêu chí 2}** | "{Câu hỏi?}" | {Hành động} |
| **{Tiêu chí 3}** | "{Câu hỏi?}" | {Hành động} |

> ⚠️ Nếu bất kỳ tiêu chí Critical nào FAIL → KHÔNG output. Sửa trước.

---

## 6. Xử lý khi gặp vấn đề

| Tình huống | Hành động |
|-----------|---------|
| {Tình huống 1 — input thiếu} | {Cách xử lý} |
| {Tình huống 2 — conflict} | {Cách xử lý} |
| {Tình huống 3 — unclear} | {Cách xử lý — ghi Open Question} |
| {Tình huống 4 — No-Go Zone} | {DỪNG — báo cho human} |

---

## 7. Routing — Bước tiếp theo

```
{Condition 1 — success}
  → Route: {/v.command tiếp theo}
  → Human action: {nếu cần}

{Condition 2 — failure}
  → Route: {/v.command khác}
  → Lý do: {giải thích}

{Condition 3 — ambiguous}
  → Route: Escalate to human
```

---

## 8. Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "{phase_code}"
phase_status: "done"               # done | awaiting_human | blocked
artifacts:
  {artifact_name}:
    exists: true
    # ... thêm fields tùy artifact
```

**Append vào `_session.md`**:
```markdown
### [{Phase}] {Agent Name} — [YYYY-MM-DD]
- **Agent**: {Agent Name}
- **Input**: {files đã đọc}
- **Output**: {artifacts tạo ra}
- **Key decisions**: {quyết định quan trọng nếu có}
- **Quality Gate**: PASS / FAIL
- **Routing**: → {bước tiếp theo}
```

**Agent Command Block** *(cuối artifact output)*:
```yaml
# --- AGENT COMMAND ---
agent: "{Agent Name}"
phase: "{phase_code}"
timestamp: "YYYY-MM-DDTHH:MM:SS"

state_updates:
  current_phase: "{phase_code}"
  phase_status: "done"

routing:
  next_phase: "{next_phase}"
  next_command: "{/v.command}"
  condition: "{điều kiện}"
# --- END COMMAND ---
```
