---
name: ba-docs-scanner
description: "Hướng dẫn Import BA Docs Agent đọc sâu tài liệu BA để generate Module Card drafts có giá trị. Agent PHẢI đọc skill này trước khi generate bất kỳ draft nào."
trigger: "Khi /v.import-ba-docs cần generate AI drafts (Bước 5)"
phase: "U.0d"
used_by:
  - /v.import-ba-docs
---

# BA Docs Scanner — Chiến Lược Đọc Sâu Tài Liệu BA

> ⚠️ Đây là **Skill bắt buộc** cho Import BA Docs Agent khi generate module card drafts.
> Đọc trước khi generate bất kỳ draft nào. Không có chiến lược đọc → output chỉ paraphrase, vô giá trị.
>
> → Xem `gotchas.md` cho Anti-patterns (output vô giá trị) và Quality Gate.

---

## Nguyên tắc chung: Deep Document Reading

Đọc tài liệu BA **KHÁC HOÀN TOÀN** đọc code:

| Đọc Code (U.0b) | Đọc BA Docs (U.0d) |
|---|---|
| Grep `if`, `throw`, `validate` | Tìm câu "phải", "bắt buộc", "không được" |
| Enum definitions → states | Flowchart, bảng trạng thái trong doc |
| Controller → Service → DB | Actor → Action → Result |
| Code là truth | Doc có thể outdated — luôn gắn `[❓ CẦN BA VERIFY]` |

**5 nguyên tắc đọc BA docs:**

1. **Đọc TOÀN BỘ fulltext** — Không chỉ overview. Business rules thường nằm giữa hoặc cuối tài liệu.
2. **Tìm patterns ngôn ngữ** — Dùng bảng keywords bên dưới để nhận diện thông tin có giá trị.
3. **Cross-reference giữa sources** — Nhiều sources nói cùng 1 topic → merge + phát hiện mâu thuẫn.
4. **Trích dẫn nguyên văn** — Quote đoạn gốc, kèm tên source file. KHÔNG paraphrase.
5. **Chuyển text → structured data** — Đoạn văn mô tả → bảng, diagram, danh sách có cấu trúc.

---

## Thứ tự đọc Raw Materials

Đọc theo thứ tự ưu tiên để xây dựng understanding dần dần:

```
1. overview.md (briefing doc)     → Bức tranh tổng thể, hiểu module làm gì
2. domain-map.json (mind map)     → Hierarchy concepts, relationships giữa entities
3. study-guide.md (nếu có)        → Key concepts, Q&A giúp validate understanding
4. sources/*.txt (fulltext)        → Chi tiết: business rules, constraints, exceptions
```

**Cross-reference checklist:**
- [ ] Entities trong mind-map có match với entities mô tả trong fulltext?
- [ ] Q&A trong study-guide có bổ sung info nào mà fulltext không nói rõ?
- [ ] Có mâu thuẫn giữa các sources? → Gắn `[⚠️ CONFLICTING SOURCES: source_A vs source_B]`

---

## Bảng Keywords — Nhận Diện Thông Tin Có Giá Trị

> Dùng bảng này để scan fulltext. Khi gặp keywords → ĐỌC KỸ đoạn xung quanh → trích xuất structured data.

| Mục tiêu trích xuất | Keywords tiếng Việt | Keywords tiếng Anh | Extract thành |
|---|---|---|---|
| **Business Rules** | "phải", "bắt buộc", "không được", "chỉ khi", "nếu...thì", "quy định", "điều kiện", "ràng buộc" | "must", "required", "shall", "only if", "condition", "constraint" | → BR-xx trong use-cases.md |
| **States / Transitions** | "trạng thái", "chuyển sang", "sau khi", "trước khi", "quy trình", "bước", "luồng", "flow" | "status", "state", "transition", "workflow", "step", "after", "before" | → state-diagram.md |
| **Actors / Roles** | "người dùng", "quản lý", "admin", "nhân viên", "phê duyệt", "tạo bởi", "vai trò" | "user", "manager", "admin", "role", "approver", "creator" | → permissions.md |
| **Permissions** | "quyền", "được phép", "không được", "chỉ", "cấm", "hạn chế", "phân quyền" | "permission", "access", "deny", "restrict", "authorize" | → permissions.md |
| **Data / Entities** | "thông tin", "dữ liệu", "trường", "bảng", "danh sách", "mã", "ID", "thuộc tính" | "field", "table", "entity", "attribute", "data", "record" | → db.md |
| **SLAs / Constraints** | "trong vòng", "tối đa", "tối thiểu", "deadline", "thời hạn", "KPI", "SLA" | "within", "maximum", "minimum", "deadline", "SLA", "KPI" | → SKILL.md (Constraints) |
| **Exceptions** | "ngoại lệ", "trường hợp đặc biệt", "trừ khi", "tuy nhiên", "nhưng", "ngoại trừ" | "exception", "special case", "unless", "however", "except" | → BR-xx (Exceptions) |
| **Integrations** | "kết nối", "tích hợp", "đồng bộ", "gửi", "nhận", "API", "hệ thống khác" | "integrate", "sync", "send", "receive", "API", "external" | → cross-service.md |
| **UI / Screens** | "màn hình", "form", "nút", "giao diện", "hiển thị", "nhập", "chọn" | "screen", "form", "button", "UI", "display", "input", "select" | → ui-flows.md |
| **Glossary** | "viết tắt", "thuật ngữ", "định nghĩa", "gọi là", "tức là", "ký hiệu" | "abbreviation", "term", "definition", "aka", "means" | → SKILL.md (Glossary) |

---

## Scan Strategy cho từng file Module Card

### SKILL.md — Entry Point + Domain Glossary

**Cách đọc BA docs:**
1. Đọc `overview.md` → rút **mục đích module** (module tồn tại để giải quyết vấn đề gì cho business).
2. Scan tất cả sources → tìm **thuật ngữ đặc thù** (viết tắt, từ chuyên ngành, định nghĩa riêng).
3. Tìm **business constraints** — SLA, KPI, deadline, limits (số lượng tối đa, thời gian tối đa).
4. Tìm **stakeholders** — ai liên quan, vai trò gì, quyết định gì.
5. Đọc `domain-map.json` → entities chính và mối quan hệ.

**Output phải có:**
- **description**: KHÔNG phải "Module quản lý X". Phải mô tả GIÁ TRỊ NGHIỆP VỤ — VD: "Module xử lý vòng đời Phiếu công tác (Work Order) từ tạo mới → phê duyệt → thực hiện → hoàn thành, phục vụ quy trình bảo trì thiết bị tại các chi nhánh".
- **Quick Summary**: 3-4 câu tóm tắt từ góc BA — actors chính, luồng chính, hệ thống liên quan.
- **Key Business Rules**: Trích xuất TỪ TÀI LIỆU CỤ THỂ. Mỗi rule phải kèm **trích dẫn gốc** + tên source file.
  ```
  VD: BR-01: WO phải được Manager duyệt trước khi thực hiện
    - Trích dẫn: "Mọi phiếu công tác phải có sự phê duyệt của Trưởng bộ phận trước khi giao cho kỹ thuật viên"
    - Source: WO-spec.pdf, trang 12
    - [⚠️ AI-inferred from NotebookLM]
  ```
- **Key Entities**: Rút từ mind-map + fulltext, kèm description nghiệp vụ (không phải technical).
- **Domain Glossary**: Bảng thuật ngữ — Thuật ngữ, Định nghĩa, Viết tắt, Ghi chú.
- **Business Constraints & SLAs**: Bảng ràng buộc — Constraint, Mô tả, Giá trị, Source.
- **No-Go Zones**: `[❓ CẦN CODE SCAN — U.0d chỉ có tài liệu BA]`

---

### use-cases.md — Logic & Flow

**Cách đọc BA docs:**
1. Tìm **mô tả quy trình / workflow** — tài liệu BA thường mô tả luồng nghiệp vụ dạng text hoặc flowchart.
2. Với mỗi luồng: xác định **Trigger** (ai/cái gì kích hoạt), **Steps** (các bước tuần tự), **Result** (kết quả).
3. Tìm **business rules** bằng keywords: "phải", "bắt buộc", "không được", "chỉ khi" → trích xuất nguyên văn.
4. Tìm **exceptions / edge cases**: "trừ khi", "ngoại lệ", "trường hợp đặc biệt".
5. Tìm **mô tả trạng thái / state**: "trạng thái", "chuyển sang", "bước tiếp theo".

**Output phải có:**
- **E2E Flows**: Mô tả LUỒNG NGHIỆP VỤ (không phải code flow vì chưa có code). Format:
  ```
  ### Flow 1: Tạo Work Order mới
  
  **Trigger**: Kỹ thuật viên phát hiện thiết bị cần bảo trì
  **Actor chính**: Kỹ thuật viên (USER role)
  
  **Các bước nghiệp vụ:**
  1. Kỹ thuật viên mở hệ thống, chọn "Tạo phiếu công tác mới"
  2. Điền thông tin: tiêu đề, mô tả lỗi, thiết bị, mức ưu tiên
     - Trường bắt buộc: tiêu đề, thiết bị, mức ưu tiên (Source: WO-spec.pdf)
  3. Hệ thống tạo phiếu với trạng thái DRAFT, sinh mã tự động WO-YYYYMMDD-SEQ
  4. Kỹ thuật viên "Gửi duyệt" → hệ thống chuyển trạng thái sang PENDING_APPROVAL
  5. Gửi thông báo cho Manager cùng chi nhánh
  
  **Kết quả**: Phiếu công tác được tạo, Manager nhận thông báo duyệt
  **SLA**: [❓ CẦN BA BỔ SUNG — có thời hạn duyệt không?]
  [⚠️ AI-inferred from NotebookLM — Source: WO-flow.docx]
  ```

- **Business Rules**: TRÍCH DẪN NGUYÊN VĂN từ tài liệu, kèm phân tích:
  ```
  ### BR-01: Chỉ cho phép sửa WO ở trạng thái DRAFT
  
  - **Trích dẫn gốc**: "Phiếu công tác chỉ được chỉnh sửa khi ở trạng thái Bản nháp. 
    Sau khi gửi duyệt, mọi thay đổi phải thông qua quy trình từ chối và tạo lại."
  - **Source**: WO-spec.pdf, mục 3.2 "Quy định chỉnh sửa"
  - **Điều kiện**: status === DRAFT
  - **Hành động**: Cho phép sửa tất cả fields
  - **Ngoại lệ**: Admin có thể sửa ở mọi trạng thái? [❓ CẦN BA VERIFY — tài liệu không đề cập]
  - [⚠️ AI-inferred from NotebookLM]
  ```

- **State Machine**: Vẽ mermaid stateDiagram-v2 NẾU tài liệu BA mô tả trạng thái. Ghi rõ trạng thái nào lấy từ doc, trạng thái nào suy luận.

---

### state-diagram.md — State Machine (NẾU BA docs mô tả)

**Cách đọc BA docs:**
1. Tìm **danh sách trạng thái** — bảng, bullet list, hoặc mô tả trong text.
2. Tìm **quy tắc chuyển đổi** — "sau khi duyệt, chuyển sang...", "nếu từ chối, quay lại..."
3. Tìm **ai được phép** trigger transition — "Manager duyệt", "Admin hủy".
4. Tìm **side-effects** — "sau khi duyệt, gửi email", "khi hoàn thành, đồng bộ SAP".
5. Tìm **trạng thái cuối** (terminal states) — "đã hoàn thành", "đã hủy".

**Output phải có:**
- Mermaid stateDiagram-v2 với states từ tài liệu (KHÔNG BỊA).
- Bảng States: Mã, Tên hiển thị, Ý nghĩa — lấy nguyên văn từ BA docs.
- Bảng Transitions: Từ → Sang, Event, Guards, Actor — kèm source reference.
- Side-Effects: Liệt kê từ tài liệu (email, notification, sync...).
- `[⚠️ AI-inferred from NotebookLM — CẦN CODE SCAN VERIFY enum values]`

**Khi nào KHÔNG tạo**: Nếu tài liệu BA không đề cập trạng thái → bỏ qua, KHÔNG bịa.

---

### permissions.md — Roles & Permissions (NẾU BA docs mô tả)

**Cách đọc BA docs:**
1. Tìm **danh sách vai trò** — "người dùng", "quản lý", "admin", bảng phân quyền.
2. Tìm **ma trận quyền** — "được phép xem/tạo/sửa/xóa", "chỉ truy cập data..."
3. Tìm **phạm vi dữ liệu** — "chỉ xem data chi nhánh mình", "chỉ data do mình tạo".
4. Tìm **quy tắc phê duyệt** — "cần Manager duyệt", "Admin có toàn quyền".

**Output phải có:**
- Bảng Roles: Mã, Tên, Phạm vi, Mô tả — từ tài liệu BA.
- Ma trận Role × Chức năng: ✅/❌ kèm điều kiện bổ sung.
- Data Scope: Mô tả cách phân quyền data (VPS, owner, global).
- `[⚠️ AI-inferred from NotebookLM — CẦN CODE SCAN VERIFY guards/decorators]`

**Khi nào KHÔNG tạo**: Nếu tài liệu BA không đề cập vai trò/quyền → bỏ qua.

---

### db.md — Database / Data Model (NẾU BA docs mô tả)

**Cách đọc BA docs:**
1. Tìm **ERD, data dictionary, bảng dữ liệu** — BA docs thường có mô tả entity/fields.
2. Tìm **mô tả entities** — "thông tin phiếu công tác gồm: mã, tiêu đề, mô tả, trạng thái..."
3. Tìm **relationships** — "mỗi phiếu có nhiều items", "phiếu thuộc 1 chi nhánh".
4. Tìm **constraints** — "mã phiếu không trùng", "tiêu đề bắt buộc".

**Output phải có:**
- Bảng Entities: Tên, Mô tả nghiệp vụ — từ góc BA không phải kỹ thuật.
- Fields chính: Tên field (nghiệp vụ), Mô tả, Bắt buộc?, Ghi chú.
- Relationships: Entity A → Quan hệ → Entity B — bằng ngôn ngữ nghiệp vụ.
- ER Diagram (mermaid) nếu đủ thông tin.
- `[⚠️ AI-inferred from NotebookLM — CẦN CODE SCAN VERIFY schema thực tế]`

**Khi nào KHÔNG tạo**: Nếu tài liệu BA không mô tả data model → bỏ qua.

---

### ui-flows.md — UI / Screens (NẾU BA docs mô tả)

**Cách đọc BA docs:**
1. Tìm **wireframes, mockups** — hình ảnh, mô tả giao diện.
2. Tìm **mô tả màn hình** — "màn hình danh sách", "form tạo mới", "trang chi tiết".
3. Tìm **user flow** — "user mở app → chọn menu → thấy danh sách → tap vào 1 item".
4. Tìm **form fields** — "trường tiêu đề", "dropdown chọn loại", "nút submit".

**Output phải có:**
- Danh sách màn hình: Tên, Mô tả chức năng — từ tài liệu BA.
- User Flow: Step-by-step thao tác người dùng.
- Form Fields: Tên field, Loại input, Bắt buộc?, Validation rules — từ BA docs.
- `[⚠️ AI-inferred from NotebookLM — CẦN CODE SCAN VERIFY component thực tế]`

**Khi nào KHÔNG tạo**: Nếu tài liệu BA không mô tả giao diện → bỏ qua.

---

### cross-service.md — Integrations

**Cách đọc BA docs:**
1. Tìm **hệ thống liên quan** — "đồng bộ với SAP", "gửi email", "kết nối hệ thống nhân sự".
2. Tìm **data exchange** — "gửi thông tin WO sang ERP", "nhận danh sách nhân viên từ HR".
3. Tìm **triggers** — "khi duyệt xong, tự động sync".
4. Tìm **fallback / error handling** — "nếu đồng bộ thất bại..."

**Output phải có:**
- Bảng integrations: System, Direction (gửi/nhận), Mục đích, Trigger.
- Payload mô tả (nếu BA docs có chi tiết): fields gửi đi / nhận về.
- Error handling / SLA (nếu có).
- `[⚠️ AI-inferred from NotebookLM]`
