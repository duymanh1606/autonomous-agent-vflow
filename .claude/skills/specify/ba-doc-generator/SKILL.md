---
name: ba-doc-generator
description: |
  Hỗ trợ Business Analyst tạo tài liệu BA chuyên nghiệp theo đúng template phù hợp với từng đối tượng nhận tài liệu. Nhận input là nội dung BA thô (requirement, spec, meeting notes, model...) và audience target, tự động chọn template đúng, adapt ngôn ngữ & mức độ chi tiết, rồi gen ra tài liệu hoàn chỉnh sẵn sàng gửi đi.

  Sử dụng skill này bất cứ khi nào BA cần tạo tài liệu để communicate với stakeholder, khi người dùng nói "tạo tài liệu cho dev", "viết spec cho tester", "làm báo cáo cho sếp", "tạo tài liệu cho C-level", "viết hướng dẫn cho user", "gen tài liệu BA", "tạo package cho stakeholder", "viết tài liệu review", "tạo tài liệu tích hợp cho partner", "làm tài liệu compliance", "tạo brief cho PM". Luôn dùng skill này khi BA cần communicate thông tin ra bên ngoài dù người dùng không nói rõ từ "skill".
---

# BA Document Generator Skill

Skill giúp BA tạo tài liệu phù hợp **từng đối tượng nhận** — đúng template, đúng ngôn ngữ, đúng mức độ chi tiết — dựa trên nội dung BA thô đầu vào.

---

## Quy trình thực hiện

### Bước 1 — Thu thập Input

Nếu người dùng chưa cung cấp đủ, hỏi lần lượt:

1. **Nội dung BA thô**: requirement, spec, meeting notes, model, elicitation results...
2. **Audience**: Đối tượng sẽ nhận tài liệu này là ai?
3. **Mục đích**: Review / Approval / Development / Testing / Training / Audit / Integration?
4. **Format output**: `.md` (mặc định) hay `.docx`?

> Nếu audience chưa rõ, hỏi: *"Tài liệu này sẽ được gửi cho ai — developer, tester, C-level, user cuối, hay đối tác bên ngoài?"*

---

### Bước 2 — Xác định Template

Dựa vào audience, chọn template tương ứng:

| Audience | Template File | Mục đích chính |
|----------|--------------|----------------|
| C-level / Sponsor / Ban lãnh đạo | `references/template-clevel.md` | Quyết định, phê duyệt ngân sách |
| Product Owner / PM | `references/template-pm.md` | Quản lý scope, timeline, risk |
| Developer / Tech Lead | `references/template-dev.md` | Implement solution |
| Tester / QA | `references/template-tester.md` | Viết test case, kiểm thử |
| End User / Trainer | `references/template-user.md` | Sử dụng hệ thống, đào tạo |
| Legal / Compliance | `references/template-compliance.md` | Audit, tuân thủ quy định |
| Stakeholder Review | `references/template-review.md` | Review & approval chính thức |
| External Partner / Tích hợp | `references/template-partner.md` | Tích hợp hệ thống |

> **Đọc file template tương ứng** trước khi gen tài liệu để áp dụng đúng cấu trúc và nguyên tắc.

---

### Bước 3 — Adapt nội dung

Khi gen tài liệu, luôn áp dụng các nguyên tắc adapt sau:

#### Ngôn ngữ
- **C-level / User**: Ngôn ngữ business, tránh thuật ngữ kỹ thuật, dùng ví dụ thực tế
- **Dev / Tester**: Ngôn ngữ kỹ thuật, chính xác, có thể dùng code/pseudocode
- **PM / PO**: Cân bằng business + technical, focus vào scope & impact
- **Legal**: Ngôn ngữ chính thức, trích dẫn điều khoản rõ ràng, có số hiệu

#### Mức độ chi tiết
- **C-level**: High-level, 1-2 trang, bullet points ngắn gọn
- **PM/PO**: Medium, có đủ context để ra quyết định
- **Dev/Tester**: Deep-dive, đầy đủ edge case, rule, data type
- **User**: Step-by-step, có screenshot placeholder, ví dụ cụ thể

#### Format
- **C-level / Review**: Slide-style hoặc executive summary
- **Dev**: Table + code block + diagram
- **Tester**: Bảng acceptance criteria + test scenario
- **User**: Numbered steps + note + warning box

---

### Bước 4 — Gen tài liệu

Tạo tài liệu theo đúng template đã chọn, điền đầy đủ nội dung từ input BA thô.

Cuối tài liệu luôn thêm:
```
---
📌 Ghi chú cho BA:
- Các phần đánh dấu [TBD] cần được điền thêm thông tin
- Các phần đánh dấu [?] cần confirm lại với stakeholder
- Phiên bản: v0.1 — Draft
```

---

### Bước 5 — Output

- Mặc định: xuất `.md` inline trong chat
- Nếu người dùng cần file `.docx`: tham khảo skill `docx` để xuất file Word
- Hỏi người dùng: *"Bạn cần tạo thêm phiên bản cho đối tượng nào khác không?"*

---

## Nguyên tắc quan trọng

1. **One audience, one document** — Không cố gắng viết 1 tài liệu cho nhiều audience, sẽ không phù hợp cho ai cả
2. **Preserve BA content** — Không tự ý thay đổi nội dung requirement, chỉ thay đổi cách trình bày
3. **Flag thông tin thiếu** — Dùng `[TBD]` khi thông tin chưa có, `[?]` khi cần confirm
4. **Không kỹ thuật hóa với non-tech** — Khi viết cho C-level hay User, tuyệt đối không dùng jargon kỹ thuật
5. **Không business hóa với tech** — Khi viết cho Dev/Tester, cần đủ chi tiết kỹ thuật, không được mơ hồ
