# Gotchas — WBS Synthesizer

Mỗi mục dưới đây là một lỗi đã thấy làm **bước cắt lát phía sau sai**, không phải lỗi hình thức.

---

## 1. Gộp hợp đồng external vào unit backend tiêu thụ nó

```
✗ BE-SUP-14  Google Sheet Export (gồm cả webhook Apps Script)
✓ BE-SUP-14  Google Sheet Export        ← in-house
  INT-SHEET-01  Apps Script Webhook     ← bên thứ ba
```

**Hậu quả**: seam **Ownership** không nhìn thấy ranh giới in-house ↔ external, nên động cơ slice
không tách được nhánh AFK khỏi nhánh HITL. Một unit external bị gộp sẽ kéo **cả slice** thành HITL —
đúng thất bại mà G6 (AFK/HITL purity) sinh ra để bắt.

---

## 2. Khai `consumes` một chiều

A ghi `consumes: B` nhưng B không ghi `used_by: A`.

**Hậu quả**: G8 Precedence tính bằng `consumes`, còn fan-in hub (unit bị nhiều slice tiêu thụ) phát
hiện bằng `used_by`. Thiếu một chiều thì hoặc provider bị xếp **sau** consumer, hoặc một unit hub
không được đánh dấu `growable` và bị xé ra nhiều slice (vi phạm G1).

---

## 3. Một màn hình = nhiều unit "view" và "actions"

```
✗ SCR-HOME-VIEW  +  SCR-HOME-ACTIONS
✓ SCR-HOME  (đánh dấu growable khi cắt lát, mở rộng qua extension story)
```

**Hậu quả**: vi phạm G1 trực tiếp. Màn hình gom nhiều hành động là **hub growable** — nó được build
một lần ở slice của hành vi đầu tiên rồi lớn lên qua `hub_extends` / `enhanced_by`, chứ không được
chẻ đôi ở tầng WBS.

---

## 4. Đánh số lại khi chạy `--refresh`

**Hậu quả**: mọi `SLICE-*.md`, `wbs-task-map.yaml` đang trỏ tới ID cũ bị lệch im lặng — slice vẫn
load được, chỉ là trỏ sai unit. Đây là loại sai không có thông báo lỗi nào.

---

## 5. Chọn một file "tiêu biểu" cho `evidence_path`

```
✗ evidence_path: `storage/repositories.py`
✓ evidence_path: `storage/repositories.py`, `storage/conversation_context.py`,
                 `storage/reply_timings.py`, `memory/conversation_store.py`
```

**Hậu quả**: các file còn lại không có unit nào nhận → tự kiểm coverage báo PASS giả, và khi build slice thì
không ai biết file đó thuộc trách nhiệm của ai.

---

## 6. Viết mô tả "nên có" thay vì "đang có"

WBS là **as-built**. Thấy code thiếu retry thì ghi đúng là thiếu (hoặc `<TODO: người xác nhận>`),
đừng ghi "có retry/circuit breaker".

**Hậu quả**: seam **Resilience** cắt sai — động cơ tưởng đã có đường phục hồi nên không xếp nó vào
cùng call tiêu thụ đầu tiên, và consumer chạy "trần" ở production.

---

## 7. Bỏ qua thư mục trông như "không phải code"

`configs/`, `data/`, `.github/workflows/`, `scripts/`, `deploy/` đều mang hành vi chạy thật và đều
phải có unit (thường là `OPS-*`).

**Hậu quả**: slice hạ tầng thiếu mảnh, đến lúc demo mới phát hiện không có đường cấu hình / CI.
