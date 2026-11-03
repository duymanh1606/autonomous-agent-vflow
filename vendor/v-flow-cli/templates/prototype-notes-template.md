# Prototype Notes — [Feature NNN: Feature Name]

> **Tạo lúc**: [YYYY-MM-DD HH:MM]
> **Phase**: S.1.5
> **Branch**: [LOGIC | UI]
> **Mode**: [N/A (LOGIC) | from-mockup | explore] _(UI only)_
> **Sub-shape**: [N/A | A — embedded in /existing-route | B — new route at /prototype/NNN] _(UI explore only)_
> **Prototype location**: `.v-flow/features/NNN/prototype/`
> **Render đã chốt**: [`.v-flow/features/NNN/ui/approved/UC-NN.*` | N/A] _(mode=from-mockup)_

---

## Câu hỏi cần trả lời

> [Câu hỏi cụ thể mà prototype này được tạo ra để trả lời]
> Lấy từ spec.md — không phải câu hỏi tổng quát.

**Liên quan đến**: [REQ-xxx, REQ-xxx]

---

## Branch: [LOGIC | UI]

### Nhánh chọn vì

[Lý do chọn LOGIC hoặc UI branch — behavior/state question vs UI/layout question]

### [LOGIC only] Runtime

[Node.js | TypeScript | Bun | Python | Java | Angular — detected from project files]

### [UI explore only] Sub-shape

[Sub-shape A (embed trong existing page) | Sub-shape B (new throwaway route)]
Lý do chọn: [tại sao chọn Sub-shape này?]

### [UI only] Design source

[project-root/DESIGN.md | .v-flow/DESIGN.md — file nào được dùng]

### [UI from-mockup] Reproduce — Mockup → Render

- **Mockup nguồn**: [`ui/mockups/UC-NN-*.png` — từ PYC/PTYC/Figma]
- **Mức ràng buộc**: [Định hướng (layout/thành phần/luồng) | Bắt buộc (pixel)]
- **Render đã chốt**: `ui/approved/UC-NN.*` (GIỮ làm contract — KHÔNG xóa)
- **Đối chiếu DESIGN.md**: [token nào dùng; có chỗ nào mockup mâu thuẫn design system không?]

---

## Run command

```bash
# [Exact command user cần chạy — không được thiếu]
# Ví dụ LOGIC: pnpm prototype:NNN
# Ví dụ UI HTML: mở index.html trong browser (double-click)
# Ví dụ UI Angular: ng serve → http://localhost:4200/route?variant=A
```

## Kết quả & Verdict

### Verdict: [VALIDATED | REJECTED | INCONCLUSIVE]

**Người duyệt**: [Tên + vai trò — VD: `Nguyễn A (BA/PO)`] · **Duyệt lúc**: [YYYY-MM-DD HH:MM]
> ⚠️ `VALIDATED` BẮT BUỘC ghi người duyệt thật. Thiếu người duyệt → verdict = `INCONCLUSIVE`, KHÔNG được lock `ui/approved/`.

### Kết quả interact (evidence)

> Mô tả cụ thể những case đã test — không cụ thể = verdict không đáng tin.

- [x] Case 1 — [mô tả và kết quả]
- [x] Case 2 — [mô tả và kết quả]
- [ ] Case chưa test — [lý do bỏ qua]

**Phát hiện quan trọng**: [key insight — lý do chính dẫn đến verdict]

### Những gì đã học được

- [Finding 1 — cụ thể, không chung chung]
- [Finding 2]
- [Finding 3 nếu có]

### Tác động đến Spec

- [ ] Không cần sửa spec — prototype xác nhận hướng hiện tại đúng
- [ ] Cần sửa [REQ-xxx]: [mô tả thay đổi cụ thể]
- [ ] Cần thêm requirement mới: [mô tả]

### Quyết định cần carry-forward vào Plan

> Plan Agent phải biết những điều này khi thiết kế architecture:

- [Quyết định 1 — e.g. "Dùng reducer pattern, không dùng class"]
- [Quyết định 2 — e.g. "Sidebar layout (Variant B) được chọn"]

---

## Routing

- [ ] **VALIDATED** → `/v.plan + /v.test` (chạy song song)
- [ ] **REJECTED** → `/v.specify` (update spec với findings trên)
- [ ] **INCONCLUSIVE** → Chờ stakeholder input: [câu hỏi còn mở]

---

## Cleanup Checklist

- [ ] *(Explore)* Prototype code tại `.v-flow/features/NNN/prototype/` đã được xóa
- [ ] Hoặc: logic module đã được absorb vào code thật (và marked production-ready)
- [ ] *(Reproduce)* Render `ui/approved/UC-NN.*` được **GIỮ** (đừng xóa) — đã cập nhật spec UI Intent "Render đã chốt"
- [ ] Verdict đã được ghi vào `_session.md` (execution trace)
- [ ] `.flow-state.yaml` đã update `artifacts.prototype.*` (mode, approved_ref, **approved_by + approved_at nếu VALIDATED**)
- [ ] Spec đã được update (nếu REJECTED)

---

*Prototype là throwaway. File này là thứ duy nhất đáng giữ.*
