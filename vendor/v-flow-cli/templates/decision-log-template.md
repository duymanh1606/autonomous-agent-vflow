# Template: Agent Decision Log

> Mỗi Agent tạo 1 decision log kèm theo output chính.
> Giúp human reviewer hiểu reasoning, audit, và cải tiến prompts.
> Lưu tại: `.v-flow/features/NNN-ten-feature/decision-logs/[agent-name]-decision-log.md`

## Thông tin

| Mục | Giá trị |
|-----|--------|
| **Agent** | [BA / Plan / Test / Master Check / Implement] Agent |
| **Feature** | #[NNN] — [Tên feature] |
| **Thời gian** | [YYYY-MM-DD HH:MM] |
| **Model** | [Model name + version] |
| **Temperature** | [X.X] |

---

## 1. Input Summary — Tóm tắt đầu vào

### Đã đọc
<!-- Liệt kê files/documents Agent đã đọc -->
- [ ] `constitution.md` — [tóm tắt ngắn điểm liên quan]
- [ ] [Input khác] — [tóm tắt]

### Hiểu được
<!-- Agent hiểu yêu cầu chính là gì? -->

### Câu hỏi / Unclear points
<!-- Điều gì không rõ? Giả định gì đã đặt ra? -->

---

## 2. Reasoning — Quá trình suy luận

### Các phương án đã xem xét
<!-- Agent đã cân nhắc những lựa chọn nào? -->

| Phương án | Ưu điểm | Nhược điểm | Quyết định |
|-----------|---------|------------|-----------|
| [A] | | | ✅ Chọn / ❌ Bỏ |
| [B] | | | ✅ Chọn / ❌ Bỏ |

### Lý do quyết định
<!-- Tại sao chọn phương án này? -->

### Trade-offs chấp nhận
<!-- Có trade-off nào không? -->

---

## 3. Key Decisions — Quyết định quan trọng

| # | Quyết định | Lý do | Constitution reference |
|---|-----------|--------|----------------------|
| 1 | [Decision] | [Rationale] | [Section N.N nếu có] |
| 2 | | | |

---

## 4. Assumptions — Giả định

| # | Giả định | Rủi ro nếu sai |
|---|---------|----------------|
| 1 | [Assumption] | [Risk] |
| 2 | | |

---

## 5. Confidence — Độ tự tin

| Phần output | Confidence (1-5) | Ghi chú |
|-------------|:-----------------:|---------|
| [Section 1] | /5 | |
| [Section 2] | /5 | |
| **Tổng thể** | **/5** | |

> Confidence thấp (< 3) = cần human review kỹ hơn.

---

## 6. Output Summary — Tóm tắt đầu ra

### Files tạo ra
- [ ] [output-file.md] — [mô tả ngắn]

### Metrics
| Metric | Giá trị |
|--------|--------|
| Processing time | [X phút] |
| Output length | [X dòng / words] |
| Revision number | [1st / 2nd / ...] |
