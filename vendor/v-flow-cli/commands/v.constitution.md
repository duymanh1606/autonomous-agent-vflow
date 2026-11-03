---
description: "Thiết lập Constitution — bộ nguyên tắc nền tảng cho dự án (Interactive mode)"
phase: "S.0a"
note: "Interactive mode — hỏi user từng bước. Xem /v.constitute cho AI-draft mode."
---

# /v.constitution

Thiết lập hoặc cập nhật **Constitution** — tài liệu thiết lập các nguyên tắc BẤT DI BẤT DỊCH cho dự án. Mọi Agent và thành viên đều phải tuân thủ.

## Điều kiện tiên quyết
- `.v-flow/` phải tồn tại (đã chạy `v-flow init`)
- User phải sẵn sàng trả lời câu hỏi về tech stack, coding standards, etc.

## Hướng dẫn

Bạn là **Constitution Architect** trong quy trình V Flow. Nhiệm vụ của bạn:

1. **Thu thập thông tin** từ user về dự án:
   - Tên dự án, tech stack, architecture pattern
   - Coding standards, naming conventions
   - UI/UX design system, typography, color palette
   - API design, security requirements
   - DevOps practices, CI/CD pipeline
   - AI agent preferences (model, language)

2. **Tạo file `constitution.md`** tại `.v-flow/constitution.md` theo cấu trúc sau:
   - **Nguyên tắc Kiến trúc**: Architecture pattern, state management, module structure
   - **Quy chuẩn Code**: Naming, testing, linting, documentation
   - **Quy chuẩn UI/UX**: Design system, spacing, typography, colors
   - **Quy chuẩn API & Backend**: API design, error handling, security
   - **Quy chuẩn DevOps**: Version control, CI/CD, environments
   - **AI Agent Configuration**: Preferred models, output language, privacy
   - **AI Compliance & Model Risk**: Approved models, data handling, audit trail

3. **Quy tắc**:
   - Hỏi user nếu thiếu thông tin quan trọng
   - Điền giá trị mặc định hợp lý cho các mục user chưa trả lời
   - Đánh dấu `[x]` cho mục đã điền, `[ ]` cho mục cần bổ sung
   - Constitution phải cụ thể, không chung chung

## Input cần thiết
- Yêu cầu tổ chức, quy chuẩn công ty
- Tech stack dự định sử dụng
- Thông tin dự án (tên, phạm vi, team size)

## Output
- `.v-flow/constitution.md`

---

## 🔀 Routing — Sau Constitution

```
Constitution tạo xong
  → Tech Lead review và hoàn thiện
  → Sau đó: /v.constitute (AI nâng cấp lên v2) hoặc /v.specify
```

## Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "S.0a"
phase_status: "done"
```

**Append vào `_session.md`**:
```markdown
### [S.0a] Constitution (Interactive) — [YYYY-MM-DD]
- **Mode**: Interactive
- **Output**: `constitution.md` v1
- **Sections filled**: [N]/7
- **Routing**: → Tech Lead review → /v.specify
```

---

## Ví dụ

```
/v.constitution Dự án mobile app Flutter, Clean Architecture, 
sử dụng Riverpod cho state management, REST API, Material Design 3
```
