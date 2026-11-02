---
name: prototype
description: >
  Tạo throwaway prototype để resolve ambiguity trong spec trước khi lên plan.
  Hai nhánh: LOGIC (validate state machine/data model qua terminal TUI)
  hoặc UI (gen multi-variant UI dùng design tokens của dự án).
  Chỉ dùng khi spec có câu hỏi chưa trả lời được bằng văn bản.
phase: "S.1.5"
trigger: "Khi /v.prototype hoặc BA Agent gợi ý prototype do phát hiện ambiguity trong spec"
used_by:
  - /v.prototype
  - /v.specify (ba-agent-ambiguity-suggest)
hooks:
  pre_prototype: "Đọc spec.md → xác định câu hỏi + REQ refs → chọn branch"
  post_prototype: "Chạy thử (test-run) để verify → Ghi prototype-notes.md → append _session.md → update .flow-state.yaml → gợi ý cleanup"
output:
  - "prototype-notes.md"
  - "_session.md append"
  - ".flow-state.yaml update"
---

# Prototype Skill

> ⚠️ Đây là **Skill bắt buộc** cho Prototype Agent khi được kích hoạt.
> Đọc skill này TRƯỚC khi tạo bất kỳ prototype code nào.
>
> → Xem `gotchas.md` cho các lỗi phổ biến — đặc biệt G-001, G-002, G-005.
> → Xem `examples/good/` và `examples/bad/` cho mẫu `prototype-notes.md` chuẩn.
> → Xem `config.json` để customize (default_variants, default_framework, ambiguity_markers).
> → Chạy scripts validate trước khi routing:
>   - **Linux/macOS**: `.v-flow/skills/prototype/scripts/check-prototype-notes.sh`
>   - **Windows (PowerShell)**: `.v-flow/skills/prototype/scripts/check-prototype-notes.ps1`

---

## Khi nào KHÔNG cần Prototype

- Spec đã rõ ràng — mọi REQ có AC cụ thể, không có ambiguity markers
- Câu hỏi có thể trả lời bằng văn bản trong spec (≤ 2 câu giải thích)
- Quick Fix hoặc Hotfix flow — không đủ time budget cho prototype
- Prototype của feature tương tự đã được chạy trong cùng epic (có thể tái dùng verdict)

---

## Pick a branch

Identify which question is being answered — từ spec.md, từ `--question`, từ `--req`, hoặc hỏi thẳng user:

- **"Logic/behavior/state model có đúng không?"** → [LOGIC.md](LOGIC.md). Terminal TUI cho phép drive state machine qua real cases.
- **"UI nên trông như thế nào?"** → [UI.md](UI.md). Multi-variant web UI switchable qua URL param.

Nếu câu hỏi genuinely ambiguous và user không available, áp dụng theo thứ tự:

```
1. --req hoặc --question được chỉ định?  → Dùng câu đó, bỏ qua bước 2-4
2. Chỉ có 1 REQ với ambiguity marker?    → Dùng REQ đó
3. Nhiều REQ có ambiguity markers?       → Ưu tiên theo REQ type: S > E > U > O
                                            Cùng type → chọn REQ đầu tiên trong spec
4. Không detect được REQ nào?            → Báo user: "Spec khá sạch, prototype có thể không cần"
```

**Chọn branch khi ambiguous** (xem `config.json` §auto_rules cho đầy đủ):

| Context signal | Branch |
|---|---|
| REQ type E hoặc S | LOGIC |
| Ambiguity nằm trong UI/Layout section của spec | UI |
| AC có từ khóa state/flow ("trạng thái", "transition", "khi nào") | LOGIC |
| Module là backend service / API | LOGIC |
| Module là frontend page / component | UI |
| Không detect được | LOGIC _(safer default — TUI ít side-effects hơn UI variant)_ |

**Bắt buộc khi AFK**: Ghi rõ assumption ở đầu prototype README:
```
# ASSUMPTION (User AFK): Defaulted to LOGIC branch
# Signal detected: REQ-S02 is State type
# Override: Re-run with --ui nếu assumption sai
```


---

## V Flow Integration Layer

### Input

Khi được kích hoạt, agent phải đọc theo thứ tự:

1. **`spec.md`** — extract câu hỏi cần prototype trả lời (tìm REQ-xxx có ambiguity markers)
   - Nếu user dùng `--req REQ-E01` → focus vào REQ đó, không cần scan toàn bộ spec
   - Nếu user dùng `--question "..."` → dùng câu đó, liên kết ngược về REQ gần nhất
2. **`DESIGN.md`** (chỉ UI branch) — lookup order:
   - `[project-root]/DESIGN.md` — project override (nếu tồn tại, ưu tiên)
   - `[project-root]/.v-flow/DESIGN.md` — fallback (auto-copy lúc `v-flow init`)
2b. **`ui/mockups/` + UI Intent (spec §2)** (chỉ UI mode `from-mockup`) — ảnh mockup + Bố cục/Kế thừa trang/Mức ràng buộc. **Cấu trúc** render lấy từ đây; **style** lấy từ `DESIGN.md` (không copy pixel từ ảnh).
3. **`config.json`** (optional) — override default behavior (variants, framework, subshape)

### Ambiguity markers cần detect trong spec

```
Keywords VI: "chưa rõ", "cần thảo luận", "phụ thuộc", "có thể là A hoặc B",
             "TBD", "tùy thiết kế", "xem mockup", "cần xác nhận", "đang xem xét"
Keywords EN: "unclear", "to be decided", "pending", "tbc", "needs clarification"
Patterns:    Acceptance Criteria trống hoặc quá vague
             State transitions có nhiều nhánh chưa được validate
             UI section không có wireframe hoặc reference
```

### Output bắt buộc

- **`prototype-notes.md`** → lưu tại `.v-flow/features/NNN/prototype-notes.md`
- **Append verdict block** vào `_session.md` (xem template bên dưới)
- **Update `.flow-state.yaml`** — điền `artifacts.prototype.*`

### Verdict levels

| Verdict | Ý nghĩa | Routing |
|---------|---------|---------|
| `VALIDATED` | Prototype xác nhận hướng đúng | Tiếp tục → `/v.plan + /v.test` |
| `REJECTED` | Prototype phát hiện hướng sai | Sửa spec → `/v.specify` |
| `INCONCLUSIVE` | Chưa đủ thông tin | Tạm dừng, chờ stakeholder |

### Session append block

Sau khi có verdict, append vào `_session.md`:

```markdown
### [S.1.5] Prototype — [YYYY-MM-DD]
- **Agent**: Prototype Agent
- **Branch**: [LOGIC | UI]
- **Mode**: [N/A (LOGIC) | from-mockup | explore]
- **Sub-shape**: [N/A | A — embedded in existing page | B — new throwaway route]
- **Question**: [câu hỏi prototype trả lời]
- **REQ refs**: [REQ-xxx, REQ-xxx]
- **Verdict**: [VALIDATED | REJECTED | INCONCLUSIVE]
- **Prototype location**: `.v-flow/features/NNN/prototype/[logic|ui]/`
- **Approved render**: [`ui/approved/UC-NN.*` (mode=from-mockup) | N/A]
- **Key findings**: [tóm tắt 1-2 câu]
- **Spec impact**: [no change | update needed | new REQ added]
- **Routing**: [→ /v.plan + /v.test | → /v.specify | → awaiting stakeholder]
```

---

## Nguyên tắc cốt lõi (applies to both branches)

1. **Throwaway từ đầu** — đặt tên rõ là prototype, không nhầm với production code
2. **One command to run** — user chạy được ngay, không cần giải thích path phức tạp
3. **No persistence by default** — state ở memory, không phụ thuộc DB
4. **Skip the polish** — không cần test, error handling, abstraction
5. **Surface the state** — sau mỗi action (LOGIC) hoặc variant switch (UI), hiển thị state đầy đủ
6. **Delete or absorb when done** — *(Explore)* verdict là thứ duy nhất đáng giữ. *(Reproduce / `--from-mockup`)* render `ui/approved/UC-NN.*` được **GIỮ** làm contract — không xóa.

Locate prototype code at **`.v-flow/features/NNN/prototype/logic/`** or **`.v-flow/features/NNN/prototype/ui/`** — trong feature folder, gần spec/plan/test-cases.

---

## V-Flow Integration Points

| File | Role |
|------|------|
| `spec.md` | Input chính — source of ambiguity questions + REQ refs + UI Intent |
| `DESIGN.md` | Design tokens cho UI branch (style authority) |
| `ui/mockups/` | [from-mockup] Ảnh mockup — nguồn cấu trúc/layout |
| `ui/approved/` | [from-mockup] Render đã chốt — visual contract (GIỮ) |
| `config.json` | Customize prototype behavior per-project |
| `prototype-notes.md` | **Output chính** — verdict + findings (file duy nhất đáng giữ) |
| `_session.md` | Execution trace — carry-forward cho Plan Agent |
| `.flow-state.yaml` | Machine-readable state — `artifacts.prototype.*` |
| `.v-flow/templates/prototype-notes-template.md` | Format chuẩn cho prototype-notes.md |
| `.v-flow/skills/prototype/scripts/check-prototype-notes.sh` / `.ps1` | Validate prototype-notes.md đủ fields trước khi routing |
| `.v-flow/skills/prototype/scripts/check-flow-state.sh` / `.ps1` | Verify .flow-state.yaml đã được update |
| `.v-flow/skills/prototype/scripts/check-prototype-cleanup.sh` / `.ps1` | Kiểm tra prototype/ code đã được cleanup |

---

## When done

The _answer_ is the only thing worth keeping *(Explore)* — capture it in `prototype-notes.md` trước khi xóa prototype code. *(Reproduce)* ngoài verdict, render `ui/approved/UC-NN.*` cũng được giữ làm contract. Verdict + (nếu có) render chốt là input cho Plan Agent — carry-forward qua `_session.md`.

---

## Gotchas

→ Xem `gotchas.md` cho các lỗi phổ biến khi tạo prototype — cập nhật liên tục.
