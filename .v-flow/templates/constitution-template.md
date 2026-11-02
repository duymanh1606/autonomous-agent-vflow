# Template: Constitution — Hiến pháp Dự án

> Tài liệu này thiết lập các nguyên tắc BẤT DI BẤT DỊCH cho dự án.
> Mọi Agent và thành viên đều phải tuân thủ.

## Thông tin dự án

| Mục | Giá trị |
|-----|--------|
| **Tên dự án** | [TÊN DỰ ÁN] |
| **Ngày tạo** | [YYYY-MM-DD] |
| **Phiên bản** | 1.0 |
| **Người tạo** | [Tech Lead / Architect] |
| **Lần cập nhật cuối** | [YYYY-MM-DD] |

---

## 1. Nguyên tắc Kiến trúc

### 1.1 Architecture Pattern
<!-- Ví dụ: Clean Architecture, MVVM, MVC, Microservices... -->
- [ ] Mô tả architecture pattern được sử dụng
- [ ] Định nghĩa layer structure và dependency rules

### 1.2 State Management
<!-- Ví dụ: Riverpod, BLoC, Redux, Vuex... -->
- [ ] Framework/library quản lý state

### 1.3 Module Structure
<!-- Ví dụ: Feature-first, Layer-first... -->
- [ ] Cách tổ chức module/package

---

## 2. Quy chuẩn Code

### 2.1 Naming Convention
<!-- Ví dụ: camelCase cho biến, PascalCase cho class... -->
<!-- Thêm [LINT:naming] tag để tự động enforce: v-flow validate --constitution -->
- [ ] Quy tắc đặt tên biến, hàm, class
- [ ] Ngôn ngữ dùng cho naming (Tiếng Anh bắt buộc?)
<!-- Ví dụ lintable rule:
- [LINT:naming] Tất cả files phải dùng kebab-case: `my-component.js`
- [LINT:naming] Components phải dùng PascalCase
-->

### 2.2 Testing
<!-- Ví dụ: Unit test coverage ≥ 80%, mọi API phải có integration test... -->
<!-- Thêm [LINT:test] tag để tự động kiểm tra test coverage -->
- [ ] Yêu cầu test coverage tối thiểu
- [ ] Loại test bắt buộc
<!-- Ví dụ lintable rule:
- [LINT:test:warn] Mỗi module trong src/ phải có test file tương ứng
-->

### 2.3 Linting & Formatting
<!-- Ví dụ: ESLint, Prettier, dart analyze... -->
- [ ] Tool linting
- [ ] Quy tắc format

### 2.4 Documentation
<!-- Ví dụ: JSDoc cho public API, README cho mỗi module... -->
- [ ] Yêu cầu documentation

---

## 3. Quy chuẩn UI/UX

### 3.1 Design System
<!-- Ví dụ: Material Design, Custom Design Kit... -->
- [ ] Design system / Component library

### 3.2 Spacing & Layout
<!-- Ví dụ: Bội số 4px, Grid 12 columns... -->
- [ ] Hệ thống spacing
- [ ] Layout grid

### 3.3 Typography
<!-- Ví dụ: Font Inter, 5 cấp heading... -->
- [ ] Font family
- [ ] Heading hierarchy

### 3.4 Color Palette
<!-- Ví dụ: Primary #1A73E8, Secondary #34A853... -->
- [ ] Bảng màu chính

---

## 4. Quy chuẩn API & Backend

### 4.1 API Design
<!-- Ví dụ: RESTful, GraphQL, gRPC... -->
- [ ] Kiểu API
- [ ] Format request/response

### 4.2 Error Handling
<!-- Ví dụ: RFC 7807, custom error codes... -->
- [ ] Chuẩn error response

### 4.3 Authentication & Security
<!-- Ví dụ: JWT, OAuth2, mã hóa bcrypt... -->
- [ ] Cơ chế authentication
- [ ] Quy tắc bảo mật

---

## 5. Quy chuẩn DevOps

### 5.1 Version Control
<!-- Ví dụ: Git Flow, Trunk-based... -->
- [ ] Branching strategy
- [ ] Commit message convention

### 5.2 CI/CD
<!-- Ví dụ: GitHub Actions, Jenkins... -->
- [ ] Pipeline CI/CD

### 5.3 Environments
<!-- Ví dụ: dev, staging, production... -->
- [ ] Các môi trường và quy tắc deploy

---

## 6. Quy tắc đặc biệt

<!-- Các quy tắc riêng của tổ chức/dự án không nằm trong các mục trên -->
- [ ] [Thêm quy tắc đặc biệt nếu có]

---

## 7. AI Agent Configuration Defaults

### 7.1 Preferred Models
<!-- Ví dụ: GPT-4o cho reasoning, Claude 3.5 cho coding... -->
- [ ] Model mặc định cho pipeline
- [ ] Có cần on-premise/private deployment không?

### 7.2 Agent Guidelines
<!-- Ví dụ: Output phải bằng tiếng Việt, dùng template bắt buộc... -->
- [ ] Ngôn ngữ output cho agents
- [ ] Yêu cầu format output đặc biệt

### 7.3 Privacy & Security
<!-- Ví dụ: Không gửi source code lên cloud API, dùng API key riêng... -->
- [ ] Dữ liệu nhạy cảm — cần model on-premise?
- [ ] API key management

> 📎 Xem chi tiết cấu hình Agent: [agent-config-template.md](agent-config-template.md)
> 📎 Xem hướng dẫn chọn model: [model-selection-guide.md](../docs/model-selection-guide.md)

---

## 8. AI Compliance & Model Risk

### 8.1 Model Risk Policy
<!-- Ví dụ: Chỉ dùng models đã được approved, không dùng models mới chưa evaluate... -->
- [ ] Danh sách models được phép sử dụng (approved list)
- [ ] Quy trình evaluate model mới trước khi đưa vào pipeline
- [ ] Yêu cầu tối thiểu: model phải pass golden test dataset

### 8.2 Data Handling
<!-- Ví dụ: Không gửi customer data lên cloud API... -->
- [ ] Loại dữ liệu nào KHÔNG được gửi cho AI model?
- [ ] Yêu cầu anonymize/mask data trước khi gửi?
- [ ] Data retention policy cho AI interactions?

### 8.3 Audit Trail
<!-- Ví dụ: Lưu lại tất cả AI interactions cho compliance review... -->
- [ ] Lưu decision logs cho mỗi Agent run?
- [ ] Retention period cho logs?
- [ ] Ai có quyền access audit logs?

### 8.4 Responsible AI
- [ ] Bias testing — kiểm tra output có bias không?
- [ ] Fairness requirements cụ thể?
- [ ] Transparency — agent phải giải thích reasoning?

---

## 9. Spec Change Policy (Double-texting)

> Quy tắc xử lý khi spec thay đổi trong lúc pipeline đang hoạt động.
> Lấy cảm hứng từ LangGraph's concurrency policies: Enqueue, Reject, Interrupt, Rollback.

### 9.1 Policy theo Phase

| Phase đang chạy | Spec thay đổi loại | Policy | Hành động |
|---|---|---|---|
| **S.1** Specify | Bất kỳ | **Accept** | Spec đang draft — tự do sửa |
| **B.0** Plan + Test | Minor (typo, clarification) | **Enqueue** | Kết thúc Plan/Test → `/v.sync` |
| **B.0** Plan + Test | Major (requirement mới/xóa) | **Interrupt** | Dừng Plan/Test → bump version → `/v.sync` → restart B.0 |
| **R.0** Master Check | Bất kỳ | **Rollback** | Hủy Check → `/v.sync` → restart `/v.check` |
| **B.1** Implement | Minor (clarification, wording) | **Enqueue** | Hoàn thành task đang làm → `/v.sync` → tiếp tục implement |
| **B.1** Implement | Major (requirement thay đổi) | **Interrupt** | Dừng implement → ghi chú task đang dang dở → `/v.sync` → re-evaluate impacts |
| **B.1** Implement | Critical (requirement xóa) | **Rollback** | Dừng implement → `/v.sync` → `/v.check` → có thể cần re-plan |
| **R.1** Review | Bất kỳ | **Reject** | KHÔNG ĐỔI spec khi đang review — hoàn thành review trước |

### 9.2 Phân loại Spec Change

```
Minor:
  - Typo, wording, clarification của requirement hiện có
  - Thêm/sửa acceptance criteria mà không đổi intent
  - → Chỉ cần /v.sync

Major:
  - Thêm requirement mới
  - Thay đổi behavior của requirement hiện có  
  - Thay đổi scope đáng kể
  - → /v.sync + có thể cần re-plan hoặc re-check

Critical:
  - Xóa requirement đang được implement
  - Thay đổi kiến trúc (e.g., REST → GraphQL)
  - → /v.sync + /v.check + có thể cần re-plan
```

### 9.3 Conflict Detection

Khi spec thay đổi, ghi vào `_session.md`:

```markdown
## ⚠️ Spec Change Detected
- **Spec version**: v1.2 → v1.3
- **Phase khi thay đổi**: B.1 (Implement, task T-007)
- **Change type**: Major — thêm REQ-E05 (email verification)
- **Policy áp dụng**: Interrupt
- **Impact**: T-007 (đang làm) + T-008 bị ảnh hưởng
- **Action**: Pause implement → /v.sync → re-evaluate
```

---

> **Lưu ý**: Constitution được tạo 1 lần và hiếm khi thay đổi. Mọi thay đổi phải được team review và đồng thuận.
