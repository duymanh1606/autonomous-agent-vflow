# Mẫu Prototype Notes — ❌ Thiếu thông tin

> Đây là mẫu `prototype-notes.md` **KHÔNG ĐẠT** — thiếu các thông tin quan trọng.
> Xem `good/prototype-notes.md` để biết format chuẩn.

---

## ❌ Ví dụ xấu

```markdown
# Prototype Notes — Order Cancellation

Đã chạy prototype. State machine hoạt động ổn.

Verdict: VALIDATED

→ Tiếp tục /v.plan
```

## Tại sao đây là thiếu thông tin

| Thiếu | Hậu quả |
|---|---|
| Không ghi **câu hỏi cụ thể** được trả lời | Plan Agent không biết prototype kiểm tra gì |
| Không ghi **REQ refs** | Không trace được finding về spec |
| Không ghi **run command** | Không ai có thể reproduce |
| Không ghi **kết quả interact** cụ thể | Verdict không có evidence — không đáng tin |
| Không ghi **spec impact** | BA Agent không biết cần sửa REQ nào |
| Không ghi **decisions to carry-forward** | Plan Agent mất context quan trọng |
| Không có **cleanup checklist** | flow-state.yaml có thể không được update |

---

## ❌ Ví dụ xấu thứ 2 — Verdict thiếu context

```markdown
# Prototype Notes — Dashboard UI

Branch: UI
Variants thử: A (card grid), B (table), C (kanban)
Winner: B

Verdict: VALIDATED
```

## Tại sao đây cũng thiếu

| Thiếu | Hậu quả |
|---|---|
| Không ghi **lý do tại sao B thắng** | Next engineer không hiểu decision rationale |
| Không ghi **Sub-shape** đã dùng (A hay B) | Không biết prototype có real context không |
| Không ghi **spec impact** | Có cần update UI spec/wireframe không? |
| Không ghi **"tôi muốn header của B với sidebar của C"** type feedback | Mất design insight quan trọng |

---

## Checklist tự kiểm tra trước khi submit

```
[ ] Có câu hỏi cụ thể (lấy từ spec REQ-xxx)
[ ] Có REQ refs (REQ-xxx, REQ-yyy)
[ ] Có run command cụ thể
[ ] Có mô tả kết quả interact (không chỉ "hoạt động ổn")
[ ] Có verdict rõ ràng: VALIDATED / REJECTED / INCONCLUSIVE
[ ] Có spec impact (no change | update REQ-xxx AC | new REQ needed)
[ ] Có decisions to carry-forward
[ ] Có cleanup checklist (_session, flow-state, prototype/ folder)
```
