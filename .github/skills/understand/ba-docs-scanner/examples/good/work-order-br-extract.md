# Good Example — BA Docs Scanner Output cho `work-order` module

> Mẫu extract từ tài liệu BA (không phải code scan).
> Chú ý: MỌI thông tin kèm trích dẫn source + AI-inferred tag.

## Business Rule trích xuất

```markdown
### BR-01: Chỉ cho phép sửa WO ở trạng thái DRAFT

- **Trích dẫn gốc**: "Phiếu công tác chỉ được chỉnh sửa khi ở trạng thái
  Bản nháp. Sau khi gửi duyệt, mọi thay đổi phải thông qua quy trình
  từ chối và tạo lại."
- **Source**: WO-spec.pdf, mục 3.2 "Quy định chỉnh sửa"
- **Điều kiện**: status === DRAFT
- **Hành động**: Cho phép sửa tất cả fields
- **Ngoại lệ**: Admin có thể sửa ở mọi trạng thái?
  [❓ CẦN BA VERIFY — tài liệu không đề cập]
- [⚠️ AI-inferred from NotebookLM]
```

## Điểm đáng chú ý

✅ **Trích dẫn nguyên văn** — không paraphrase
✅ **Source file + section** — truy xuất được
✅ **Ngoại lệ ghi rõ** — [❓ CẦN BA VERIFY] khi thiếu info
✅ **AI-inferred tag** — mọi thông tin từ NotebookLM
❌ **KHÔNG nên**: "BR-01: Không cho sửa WO đã gửi" — quá ngắn, thiếu source
