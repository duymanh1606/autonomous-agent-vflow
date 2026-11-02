<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Dev Quiz: {Tên Module}
## ⚠️ Hướng Dẫn Sử Dụng
## MUST — Câu Hỏi Bắt Buộc
### DQ{NN}: {Tên ngắn} [target: {symbol} | direction: {upstream|downstream}]
## Changelog
-->

---
module: domain-{tên-module}
module_version: "{version}"
created_at: "YYYY-MM-DD"
created_by: "v.understand"
status: "draft"
---

# Dev Quiz: {Tên Module}

> ⚙️ **ANSWER KEY = GRAPH, KHÔNG PHẢI CON NGƯỜI.**
> Khác business-quiz (human chấm intent nghiệp vụ), dev-quiz **chấm máy** theo GitNexus:
> mỗi câu khai báo `target` symbol; đáp án đúng = blast-radius thật từ `gitnexus impact`.
> Sinh answer key: `v-flow dev-quiz <module>` · Chấm: `v-flow dev-quiz <module> --answers <file>`.

---

## ⚠️ Hướng Dẫn Sử Dụng

**Cho người viết câu hỏi (Tech Lead / v.understand):**
- Mỗi câu hỏi PHẢI khai báo `[target: <tên symbol thật> | direction: upstream|downstream]` ở heading.
  - `upstream` = ai phụ thuộc vào symbol (đổi nó thì gãy đâu) — dùng cho câu "blast-radius".
  - `downstream` = symbol phụ thuộc vào ai.
- `target` phải là **symbol có thật trong graph** (hàm/method/class) — nếu sai tên → `v-flow dev-quiz` báo `unverified`.
- Câu hỏi test **khả năng suy luận tác động**, thứ phân biệt dev senior với junior.

**Cho người/agent trả lời:** liệt kê các symbol bị ảnh hưởng dưới `**Answer**:` (phân tách bằng dấu phẩy). Chấm bằng F1 so với graph.

---

## MUST — Câu Hỏi Bắt Buộc

<!-- HƯỚNG DẪN: 3-5 câu về tác động/kiến trúc. target = symbol QUAN TRỌNG / rủi ro cao của module.
     Ví dụ: ### DQ01: Tác động khi đổi hủy đơn [target: cancelOrder | direction: upstream]
     **Câu hỏi**: Nếu thay đổi logic hủy đơn, những thành phần nào sẽ bị ảnh hưởng trực tiếp/gián tiếp?
-->

### DQ01: {Tên ngắn} [target: {symbol} | direction: upstream]

**Câu hỏi**: {Nếu đổi `target`, những đâu sẽ gãy? Liệt kê thành phần phụ thuộc.}

---

### DQ02: {Tên ngắn} [target: {symbol} | direction: upstream]

**Câu hỏi**: {Câu hỏi blast-radius cho symbol rủi ro thứ 2}

---

## Changelog

| Version | Ngày | Thay đổi | Bởi |
|---|---|---|---|
| 1.0 | {date} | Khởi tạo từ AI scan | v.understand |
