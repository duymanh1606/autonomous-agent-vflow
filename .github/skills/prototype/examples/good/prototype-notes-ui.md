# Mẫu Prototype Notes — ✅ Tốt (UI Branch)

> Đây là mẫu `prototype-notes.md` đúng format cho **UI branch**.
> Xem `good/prototype-notes.md` cho mẫu LOGIC branch.

---

```markdown
# Prototype Notes — Feature 012: Dashboard Analytics Panel

**Date**: 2026-05-20
**Agent**: Prototype Agent
**Branch**: UI
**Phase**: S.1.5

## Câu hỏi được trả lời

> "Dashboard analytics panel nên hiển thị theo layout nào?
> REQ-U03 nêu 'user có thể xem tổng quan metrics' nhưng không chỉ định
> layout — sidebar metrics vs card grid vs table view đều khả thi."

**REQ refs**: REQ-U03, REQ-O01

## Sub-shape

**Sub-shape A** — Embedded vào existing route `/dashboard`

Lý do: Feature analytics panel sẽ nằm trong `/dashboard` đã có. Đặt variants
vào existing page để kiểm tra xem layout nào hoạt động tốt với header/sidebar
thật, không phải trong vacuum.

## Design source

`/DESIGN.md` — project override (tồn tại ở project root)

## Run command

```bash
# Dev server phải đang chạy (Angular)
ng serve

# Mở trình duyệt tại:
# http://localhost:4200/dashboard?variant=A   ← Card Grid
# http://localhost:4200/dashboard?variant=B   ← Sidebar Metrics
# http://localhost:4200/dashboard?variant=C   ← Table View
```

## Variants

| Variant | Mô tả | Primary affordance |
|---|---|---|
| A | Card Grid — 4 metric cards across top, chart below | Glance metrics |
| B | Sidebar Metrics — left sidebar với numbers, main area là chart | Deep analysis |
| C | Table View — tất cả metrics trong sortable table, no chart | Export-friendly |

## Kết quả thực hiện

User đã flip qua 3 variants với real data (~20 phút):

- [x] **Variant A** — "Card grid trông đẹp nhưng mất quá nhiều vertical space. Chart bị đẩy xuống dưới fold."
- [x] **Variant B** — "Sidebar layout tốt hơn — chart luôn visible. Nhưng sidebar quá rộng trên mobile."
- [x] **Variant C** — "Table useful cho export nhưng không phải default view người dùng cần."
- [x] **Feedback quan trọng**: "Tôi muốn header của B (sidebar) nhưng sidebar collapse được trên mobile"

## Verdict

**VALIDATED** ✅

Variant B (Sidebar Metrics) được chọn làm hướng chính, với yêu cầu bổ sung:
sidebar phải responsive/collapsible trên mobile.

## Spec impact

- **REQ-U03**: Cần cập nhật AC: "Analytics panel dùng sidebar layout. Sidebar collapse trên màn hình < 768px."
- **REQ-O01**: Không thay đổi — Table View (Variant C) sẽ là secondary view/export mode

## Decisions to carry-forward → _session.md

1. **Layout pattern**: Sidebar left (240px desktop) + main chart area — không phải card grid
2. **Responsive**: Sidebar collapse về hamburger menu trên mobile (`< 768px`)
3. **Variant C insight**: Table view được giữ lại làm "Export mode" — Plan Agent cần thêm toggle
4. **Design token**: Dùng `--surface-secondary` từ DESIGN.md cho sidebar background

## Routing

→ Sửa REQ-U03 trong `spec.md` (thêm sidebar AC + mobile collapse AC)
→ Sau khi sửa spec → `/v.plan + /v.test` (song song)

## Cleanup

- [ ] Xóa `.v-flow/features/012/prototype/` sau khi Plan Agent đọc notes này
- [ ] Xóa `VariantA`, `VariantB`, `VariantC` components khỏi `/dashboard`
- [ ] Xóa `PrototypeSwitcher` khỏi `/dashboard` route
- [x] `prototype-notes.md` đã được ghi đầy đủ
- [x] `_session.md` đã được append
- [x] `.flow-state.yaml` đã được update: `artifacts.prototype.verdict = VALIDATED`
```

---

## Tại sao mẫu này tốt

| Điểm | Lý do |
|---|---|
| Ghi rõ **Sub-shape A** và lý do | Tránh G-005 — không tạo route mới khi có existing page |
| Liệt kê **3 variants với mô tả rõ** | Plan Agent hiểu design space đã được explore |
| **Feedback verbatim** ("Tôi muốn header của B...") | Ghi lại insight thật, không chỉ "B tốt hơn" |
| **Spec impact cụ thể** | BA Agent biết chính xác AC nào cần thêm |
| **Cleanup checklist đầy đủ** | Không để variant components rot trong codebase |
