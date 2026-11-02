<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Business Quiz: {Tên Module}
## ⚠️ Hướng Dẫn Sử Dụng
## MUST — Câu Hỏi Bắt Buộc
### Q{NN}: {Tên ngắn của câu hỏi}
## SHOULD — Câu Hỏi Nâng Cao
### Q{NN}: {Tên ngắn của câu hỏi}
## Changelog
-->

---
module: domain-{tên-module}
module_version: "{version}"         # Version của module card lúc tạo file này
created_at: "YYYY-MM-DD"
created_by: "v.understand"          # "v.understand" | "human"
last_reviewed_by: null              # Human BA/PO đã review câu hỏi chưa?
last_reviewed_at: null
status: "draft"                     # "draft" | "ready" (ready = đã được Human review)
---

# Business Quiz: {Tên Module}

> ⚠️ **FILE NÀY KHÔNG CHỨA ĐÁP ÁN**
> Human BA/PO là answer key — đánh giá câu trả lời của AI bằng domain knowledge của mình.
> AI Agent: Đọc câu hỏi, trả lời dựa trên hiểu biết từ module cards (`use-cases.md`, `SKILL.md`...). **KHÔNG** dùng nội dung file này làm đáp án.

---

## ⚠️ Hướng Dẫn Sử Dụng

**Dành cho Human BA/PO (khi review câu hỏi):**
- Xóa nhãn `[⚙️ AI draft]` và thay bằng `[✅ Human verified]` khi câu hỏi đã đúng
- Chỉnh sửa câu hỏi nếu AI draft chưa đúng trọng tâm
- Thêm câu hỏi mới nếu cần (đặc biệt: "bẫy nghiệp vụ" mà AI dễ hiểu sai)
- Đặt `status: "ready"` trong frontmatter khi hoàn tất review
- Câu hỏi tốt: test *reasoning về ý nghĩa nghiệp vụ*, KHÔNG phải *biết API endpoint hay tên bảng*

**Dành cho AI Agent (khi trả lời):**
- Đọc câu hỏi → trả lời dựa trên module cards, KHÔNG đọc file này để lấy gợi ý
- Trả lời bằng ngôn ngữ tự nhiên, giải thích reasoning
- Nếu không chắc → nói thẳng, đừng đoán

> ⛔ **QUY TẮC NGÔN NGỮ (cưỡng chế bằng máy):** Câu hỏi phải viết bằng **ngôn ngữ nghiệp vụ**, người không-code đọc được. **CẤM** dính token code trong câu hỏi: `backtick`, `camelCase`, `snake_case`, `TÊN_HẰNG`, `tênHàm()`, endpoint `/api/...`, đuôi file (`.dart/.js`…). Nếu phải nói tới một khái niệm code → diễn đạt lại bằng nghiệp vụ ("trạng thái đơn hàng" thay vì `OrderStatus`). Kiểm bằng: `v-flow validate --module-cards` (cảnh báo; `--strict` chặn).

---

## MUST — Câu Hỏi Bắt Buộc

> Tất cả câu hỏi MUST phải được AI trả lời đúng → mới được proceed `/v.specify`.
> Trả lời sai bất kỳ câu MUST nào → FAILED → dừng lại, không viết spec.

<!-- HƯỚNG DẪN: Viết 3-5 câu hỏi về business rules/flows QUAN TRỌNG NHẤT của module.
     Câu hỏi phải:
     - Yêu cầu AI giải thích ý nghĩa nghiệp vụ (WHY), không chỉ mô tả code (WHAT)
     - Có liên quan trực tiếp đến spec sắp viết
     - Không thể trả lời đúng chỉ bằng cách đọc tên hàm/endpoint
     - Ưu tiên KHUNG TÌNH HUỐNG (scenario) — tự nó là ngôn ngữ nghiệp vụ:
       dùng 5 dạng trong docs/business-quiz-guide.md (WHY / EXCEPTION / OWNERSHIP / IMPACT / CROSS-MODULE)
     - KHÔNG dính token code (xem QUY TẮC NGÔN NGỮ ở trên) → `v-flow validate --module-cards` cảnh báo
     Ví dụ tốt: "Khách gọi 45 phút sau khi đặt đòi đổi địa chỉ giao — hệ thống cho phép gì và vì sao? Ai quyết định mốc thời gian này?"
     Ví dụ tệ: "Enum OrderStatus có những giá trị nào?"
-->

### Q01: {Tên ngắn — ví dụ: "Điều kiện hủy đơn hàng"} [⚙️ AI draft]

**Câu hỏi**: {Câu hỏi mở về business rule/flow quan trọng nhất — yêu cầu giải thích WHY và ai chịu trách nhiệm}

**Lý do quan trọng**: {Nếu AI hiểu sai điều này → spec sẽ sai ở đâu? Ảnh hưởng gì?}

---

### Q02: {Tên ngắn} [⚙️ AI draft]

**Câu hỏi**: {Câu hỏi về edge case hoặc business constraint ít rõ ràng từ code}

**Lý do quan trọng**: {Tại sao điều này quan trọng với feature sắp viết spec}

---

### Q03: {Tên ngắn} [⚙️ AI draft]

**Câu hỏi**: {Câu hỏi về actor, permission, hoặc ownership trong domain này}

**Lý do quan trọng**: {Hiểu sai actor → spec có thể thiếu/sai use case}

---

## SHOULD — Câu Hỏi Nâng Cao

> Câu hỏi SHOULD: Trả lời sai → PASSED WITH WARNING, không block.
> Agent ghi concern vào `_session.md` và tiếp tục.

<!-- HƯỚNG DẪN: 2-3 câu hỏi về business context nâng cao:
     - Integration với module khác
     - Exceptional cases ít phổ biến
     - Business rationale đằng sau thiết kế hiện tại
-->

### Q04: {Tên ngắn} [⚙️ AI draft]

**Câu hỏi**: {Câu hỏi về tích hợp với module khác hoặc exceptional case}

**Lý do quan trọng**: {Bỏ qua điều này sẽ ảnh hưởng gì đến chất lượng spec}

---

### Q05: {Tên ngắn} [⚙️ AI draft]

**Câu hỏi**: {Câu hỏi về business rationale hoặc lịch sử quyết định thiết kế}

**Lý do quan trọng**: {Context này giúp spec tốt hơn ở điểm nào}

---

## Changelog

| Version | Ngày | Thay đổi | Bởi |
|---|---|---|---|
| 1.0 | {date} | Khởi tạo từ AI scan | v.understand |
