# Gotchas — BA Docs Scanner

> Cập nhật liên tục khi Agent gặp edge case mới.
> Rule of thumb: Nếu Agent mắc cùng một lỗi 2 lần → bắt buộc phải có gotcha.

---

## Anti-patterns — Output VÔ GIÁ TRỊ từ BA Docs

| Anti-pattern | Ví dụ BAD | Ví dụ GOOD |
|---|---|---|
| Paraphrase overview | "Module này quản lý Work Order theo quy trình nghiệp vụ" | "Module xử lý vòng đời WO: DRAFT→duyệt→thực hiện→hoàn thành. 3 roles: User tạo, Manager duyệt, Admin toàn quyền. Tích hợp SAP khi duyệt." |
| Business rule không trích dẫn | "BR-01: Phải validate input [⚠️ AI-inferred]" | "BR-01: 'Mọi PCT phải có ít nhất 1 item công việc' (Source: WO-spec.pdf, mục 2.3) [⚠️ AI-inferred from NotebookLM]" |
| Liệt kê entities không mô tả | "Entities: WorkOrder, WoItem, User" | "WorkOrder — Phiếu công tác bảo trì, fields chính: mã (tự sinh), tiêu đề, mô tả lỗi, mức ưu tiên (4 cấp), trạng thái (7 states)" |
| State diagram bịa | "Có 3 trạng thái: Mới, Xử lý, Xong" | "Theo WO-flow.docx mục 4: 7 trạng thái — Bản nháp, Chờ duyệt, Đã duyệt, Từ chối, Đang thực hiện, Hoàn thành, Đã hủy" |
| Chỉ tóm tắt, không structured | "BA docs mô tả quy trình tạo và duyệt WO" | Bảng E2E Flow 5 bước + Bảng BR-xx 8 rules + Mermaid state diagram |

---

## Quality Gate — Tự kiểm tra trước khi output BA drafts

| Tiêu chí | Câu hỏi tự kiểm | Nếu KHÔNG → |
|---|---|---|
| **Depth** | "Tôi đã đọc TOÀN BỘ fulltext, hay chỉ đọc overview?" | Đọc lại tất cả sources/*.txt |
| **Extraction** | "Mỗi business rule có kèm TRÍCH DẪN NGUYÊN VĂN + source file?" | Thêm quote + source ref |
| **Structure** | "Tôi đã convert text mô tả → bảng/diagram chưa?" | Convert sang structured format |
| **Value-add** | "BA đọc draft thấy info ĐÃ ĐƯỢC TỔ CHỨC LẠI, hay chỉ là copy-paste?" | Phân tích, nhóm, cross-ref |
| **Completeness** | "Tôi đã cross-reference GIỮA các sources? Có source nào chưa đọc?" | Đọc thêm sources |
| **Actionability** | "Spec writer đọc xong có ĐỦ CONTEXT để viết spec không cần mở tài liệu gốc?" | Bổ sung chi tiết |
| **Honesty** | "Tôi có bịa? Mọi suy luận đã gắn [⚠️ AI-inferred]?" | Gắn nhãn, thêm [❓] |

---

## Gotchas phổ biến

1. ❌ ĐỪNG chỉ đọc overview.md rồi tóm tắt — phải đọc TOÀN BỘ fulltext trong sources/
2. ❌ ĐỪNG paraphrase tài liệu BA — phải TRÍCH DẪN NGUYÊN VĂN kèm source reference
3. ❌ ĐỪNG bịa state diagram — chỉ vẽ states thực sự được mô tả trong tài liệu
4. ❌ ĐỪNG tạo permissions.md nếu BA docs không đề cập roles/quyền → tạo placeholder
5. ❌ ĐỪNG quên cross-reference giữa overview, mind-map, study-guide và fulltext
6. ✅ Luôn gắn `[⚠️ AI-inferred from NotebookLM]` cho mọi suy luận
7. ✅ Gắn `[❓ CẦN BA VERIFY]` khi thiếu thông tin — không suy diễn
8. ✅ Chuyển text mô tả → bảng/diagram — đây là VALUE-ADD chính
9. ✅ Khi phát hiện mâu thuẫn giữa sources → gắn `[⚠️ CONFLICTING SOURCES]`
