---
name: codebase-scanner
description: "Hướng dẫn Understand Agent scan sâu code để generate Module Cards có giá trị. Agent PHẢI đọc skill này trước khi scan bất kỳ module nào."
trigger: "Khi /v.understand cần generate module cards (Bước 4)"
phase: "U.0b"
used_by:
  - /v.understand
---

# Codebase Scanner — Chiến lược Scan Chi Tiết

> ⚠️ Đây là **Skill bắt buộc** cho Understand Agent khi generate module cards.
> Đọc trước khi scan bất kỳ module nào. Không có chiến lược scan → output sơ sài.
>
> → Xem `gotchas.md` cho Anti-patterns (output vô giá trị) và Quality Gate.
> → Xem `examples/good/` cho mẫu output module card.
> → Chạy `.v-flow/skills/understand/codebase-scanner/scripts/scan-project-structure.sh <dir>` để pre-scan cấu trúc.

---

## Nguyên tắc chung: Deep Code Reading

Với MỌI file module card, bạn phải:

1. **Đọc toàn bộ file code quan trọng** — KHÔNG CHỈ đọc tên file hoặc vài dòng đầu. Đọc ĐỦ SÂU để hiểu logic.
2. **Trích xuất logic từ if/else, switch, try/catch** — Đây là nơi chứa business rules thực sự.
3. **Theo dõi data flow** — Input vào từ đâu → xử lý qua hàm nào → output ra đâu → lưu DB bảng nào.
4. **Ghi nguồn tham chiếu** — Luôn kèm `file:line` hoặc tên hàm cụ thể.
5. **Gắn nhãn suy luận** — `[⚠️ AI-inferred]` khi suy đoán, `[❓ CẦN HUMAN BỔ SUNG]` khi thiếu context.

---

## 🗂️ Module Lớn — Đầy Đủ & Đúng (nhiều file / LOC lớn)

> ⚠️ Áp dụng khi module có **>~30 file** hoặc **>~5k LOC** — lúc 1 context không nhồi hết → dễ ra card **nông, thiếu**.
> Quy trình thực thi (inventory → fan-out theo card → reconcile) nằm ở `agents/understand-agent.md` **Bước 4.0**. Mục này là **chuẩn chất lượng + kỷ luật đọc** mà mỗi (sub-)agent phải theo.

**"Đầy đủ" & "đúng" nghĩa là gì — đo được, không cảm tính:**

| | Định nghĩa cụ thể | Kiểm bằng |
|---|---|---|
| **Đầy đủ** | Phủ HẾT inventory: mọi endpoint · entity/bảng · state + transition · E2E flow · permission · cross-service call | Đối chiếu card vs `_inventory.md` — không còn mục trống |
| **Đúng** | Mọi claim/rule kèm `Source: file:line`; suy đoán → `[⚠️ AI-inferred]`; thiếu context → `[❓ CẦN HUMAN]` | Ref resolve được trong code/graph |

> ❌ "Đầy đủ" KHÔNG đo bằng "đã đọc hết file". Module 30k LOC vẫn chỉ có hữu hạn endpoint/entity/state — phủ hết *cái đó* mới là đủ.

**Kỷ luật đọc cho mỗi (sub-)agent — đọc SÂU đúng chỗ, không trải mỏng:**

- ✅ **Đọc sâu** (nơi chứa logic thật): entry points (controller/route), service nhiều `if/throw/validate`, entity + migration, enum status + nơi mutate, symbol blast-radius cao (`gitnexus impact`).
- ⏭️ **Table-scan là đủ** (đừng tốn ngân sách đọc sâu): DTO, generated code, boilerplate, test (chỉ đọc tên).
- 🦴 **Graph làm xương sống** khi có GitNexus: `query` (flow → use-cases) · `impact` (No-Go + dev-quiz target) · `context` (verify data flow controller→service→repo). Không đọc file tuần tự.

> 🔎 Spot-check sau khi xong (tùy chọn): `score-card` — `structural` + `grounded` là tín hiệu chất lượng có ích; `coverage` thấp trên module lớn là **bình thường**, ĐỪNG nhồi card để chạy theo nó. Score là nhiệt kế, không phải mục tiêu.

---

## Scan Strategy cho từng file Module Card

### SKILL.md — Entry Point

**Cách scan:**
1. Đọc README, package description, hoặc comment đầu file chính để hiểu mục đích module.
2. Đếm số files, LOC (lines of code) ước tính để đánh giá Complexity.
3. Grep `if`, `throw`, `assert`, `validate` trong service/business logic files → trích xuất Key Business Rules.
4. Grep entity/model files → liệt kê Key Entities kèm fields chính.
5. Tìm files >500 LOC không có test, files có `// TODO`, `// HACK` → No-Go Zones.

**Output phải có:**
- **description**: Không phải "Module quản lý X". Phải là "Module xử lý CRUD cho X, tích hợp với Y để Z, sử dụng pattern A".
- **Quick Summary**: 3-4 câu phân tích kiến trúc thực tế (VD: "Sử dụng BLoC pattern, gọi API qua Repository layer, cache local bằng Hive. Không có unit test cho business logic.")
- **Key Business Rules**: Trích xuất TỪ CODE CỤ THỂ. VD: `BR-01: Nếu trạng thái WO là COMPLETED thì không cho phép chỉnh sửa (file: wo_service.dart:145, hàm updateWo)` [⚠️ AI-inferred]
- **Key Entities**: Kèm schema/fields quan trọng, VD: `WorkOrder — id, status (enum: DRAFT|PENDING|APPROVED), assigneeId, createdAt`
- **No-Go Zones**: Chỉ đích danh file + lý do, VD: "`auth_interceptor.dart` — 650 LOC, không có test, xử lý token refresh phức tạp"

---

### use-cases.md — Logic & Flow

**Cách scan:**
1. **Tìm entry points** (controllers, handlers, route definitions) → liệt kê tất cả actions/endpoints.
2. **Với mỗi action quan trọng**: Đọc code từ controller → service → repository → DB. Vẽ lại luồng chạy.
3. **Tìm business rules**: Grep `if`, `when`, `switch`, `throw`, `guard`, `validate`, `check` trong service files. ĐỌC context xung quanh mỗi câu lệnh điều kiện để hiểu rule.
4. **Tìm state transitions**: Grep các enum status/state, tìm nơi chúng được thay đổi (setter, update, transition).
5. **Tìm permissions/roles**: Grep `@Roles`, `@Guard`, `authorize`, `permission`, `role`, `canAccess` trong module.

**Output phải có:**
- **E2E Flows**: VẼ RA LUỒNG CHẠY CỤ THỂ dạng: `Controller (POST /api/x) -> Service A (validate input, check permission) -> Repository (query DB, join table X+Y) -> Response (status 201, body: {id, status})`. Dùng mermaid sequence diagram cho flow phức tạp.
- **Business Rules**: KHÔNG liệt kê chung chung. Phải có dạng: "BR-01: Khi amount > 1000, hệ thống yêu cầu approval từ Manager (file: order_service.ts:89, hàm createOrder, `if (dto.amount > 1000) { await this.approvalService.request(...) }`)".
- **State Machine**: Vẽ mermaid stateDiagram-v2 với CÁC TRẠNG THÁI THỰC TẾ từ code (không bịa). Liệt kê transitions kèm điều kiện và actor.

---

### api-specs.md — Contracts

**Cách scan:**
1. **Tìm tất cả route/endpoint definitions**: Grep `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `router.get`, `app.post`, `@RequestMapping`, hoặc route file.
2. **Với mỗi endpoint**: Đọc handler/controller → xác định request params, body DTO, response format.
3. **Đọc DTO/Request/Response classes**: Liệt kê CHI TIẾT fields, types, validation rules (grep `@IsNotEmpty`, `@Min`, `@Max`, `required`, `@Field`).
4. **Tìm error responses**: Grep `throw`, `HttpException`, `BadRequest`, `Forbidden`, `NotFound` → liệt kê error codes và điều kiện.
5. **Tìm enums**: Grep `enum`, `const`, status codes → liệt kê values và ý nghĩa.

**Output phải có:**
- Bảng endpoints đầy đủ: Method, Path, Auth (role cụ thể), Mô tả ngắn.
- DTOs với TỪNG FIELD: name, type, required?, validation rules, default value.
- Error codes đặc thù kèm điều kiện trigger.

---

### ui-flows.md — Frontend (nếu có)

**Cách scan:**
1. **Tìm route/navigation definitions**: Grep `Route`, `GoRouter`, `Navigator`, `router`, `path:` → liệt kê tất cả màn hình.
2. **Với mỗi màn hình**: Đọc widget/component chính → xác định UI elements, form fields, buttons, lists.
3. **Tìm state management**: Grep `BLoC`, `Provider`, `Cubit`, `useState`, `Redux`, `Vuex` → xác định state nào quản lý data gì.
4. **Tìm API calls trong UI**: Grep `fetch`, `http`, `dio`, `axios`, `repository`, `api` trong component files → map component → API endpoint.
5. **Tìm field mapping**: So sánh form field names với DTO/entity field names → tạo bảng mapping UI field → DB column.

**Output phải có:**
- Bảng màn hình: Route, Component chính, Mô tả chức năng.
- Chi tiết UI Elements + behavior (VD: "Nút Submit → disabled khi form chưa valid, hiển thị loading spinner khi đang gọi API").
- **Fields Mapping**: Bảng rõ ràng: UI Label → API Field → DB Column → Validation.
- User Flow: Mô tả step-by-step thao tác người dùng.

---

### tech-context.md — Technical Details

**Cách scan:**
1. **List tất cả files trong module** → phân nhóm theo vai trò (controller, service, repository, entity, DTO, util).
2. **Với mỗi file cốt lõi**: Đọc code, viết 1-2 câu giải thích trách nhiệm CỤ THỂ (không chỉ "xử lý logic").
3. **Phân tích patterns**: Module dùng Repository pattern? Service layer? Event-driven? Direct DB access? Middleware chain?
4. **Tìm dependencies**: Grep `import`, `require`, `from`, `use` → lọc ra các module/service KHÁC đang được gọi.
5. **Tìm tech debt**: Grep `TODO`, `FIXME`, `HACK`, `WORKAROUND`, `DEPRECATED`. Đếm LOC lớn, cyclomatic complexity cao (files >300 LOC, hàm >50 LOC).
6. **Kiểm tra test coverage**: Tìm test files tương ứng (`*.test.*`, `*.spec.*`, `*_test.*`). Liệt kê files KHÔNG có test.

**Output phải có:**
- Bảng Key Files: File path, Vai trò CỤ THỂ (VD: "Xử lý CRUD cho WorkOrder, validate business rules trước khi save"), LOC, Có test?
- Patterns: Giải thích CÁCH module dùng pattern (VD: "Repository pattern — nhưng service layer bypass repository ở 3 chỗ để query trực tiếp DB").
- Dependencies: Bảng Target → Cách gọi → Mục đích.
- Tech Debt: Danh sách cụ thể kèm severity và file reference.

---

### cross-service.md — Integrations (nếu có)

**Cách scan:**
1. **Tìm HTTP calls ra ngoài**: Grep `HttpClient`, `fetch`, `axios`, `dio`, `RestTemplate`, `http.get/post` → xác định target service, endpoint, mục đích.
2. **Tìm message queue**: Grep `publish`, `emit`, `subscribe`, `consume`, `@EventHandler`, `@OnEvent`, `Kafka`, `RabbitMQ`, `Redis pub/sub`.
3. **Tìm shared resources**: Grep bảng DB được nhiều module đọc/ghi (cross-reference với db.md).
4. **Tìm external APIs**: Grep URLs, API keys, third-party SDKs.

**Output phải có:**
- Bảng HTTP Calls: Direction, Target, Endpoint cụ thể, Mục đích, Có retry/circuit breaker?
- Bảng Message Queue: Direction, Topic/Queue, Event name, Payload fields chính.
- External Integrations: System, Protocol, SLA/Timeout config.

---

### db.md — Database & Schema

**Cách scan:**
1. **Tìm entity/model definitions**: Grep `@Entity`, `@Table`, `@Model`, `@Collection`, class definitions kế thừa từ ORM base class.
2. **Với mỗi entity**: Đọc TẤT CẢ fields/columns — type, constraints (PK, FK, NOT NULL, UNIQUE, DEFAULT), annotations.
3. **Tìm relationships**: Grep `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@BelongsTo`, `@HasMany`, `@JoinColumn`, `references`, `foreign_key`.
4. **Tìm migration/DDL files**: List files trong `migrations/`, `database/`, `schema/`.
5. **Tìm indexes**: Grep `@Index`, `createIndex`, `INDEX` trong DDL.

**Output phải có:**
- Bảng Tables: Tên bảng, Mô tả mục đích, Entity file tham chiếu.
- Chi tiết từng bảng: TẤT CẢ columns — tên, type, constraints, default, ý nghĩa.
- Relationships: Bảng A → Quan hệ (1-1, 1-n, n-n) → Bảng B, Foreign key cụ thể, ON DELETE behavior.
- Links đến migration files (nếu có).

---

### state-diagram.md — State Machine

**Cách scan:**
1. **Tìm enum/const định nghĩa states**: Grep `enum.*Status`, `enum.*State`, `const.*STATUS`, `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`.
2. **Tìm nơi state thay đổi**: Grep setter hoặc assignment của status field → đọc context xung quanh để hiểu điều kiện chuyển state.
3. **Tìm side-effects**: Khi state thay đổi, có gửi notification? Update bảng khác? Gọi API? Grep trong cùng hàm/method.
4. **Tìm guards/conditions**: Điều kiện nào phải thỏa mãn trước khi chuyển state? (VD: "Phải có approval trước khi PENDING → APPROVED").

**Output phải có:**
- Mermaid stateDiagram-v2 với TẤT CẢ states thực tế từ code.
- Bảng States: Mã enum, Tên hiển thị, Ý nghĩa/Định nghĩa.
- Bảng Transitions: State hiện tại → Event → State mới → Điều kiện/Guards → Actor (ai được phép).
- Side-Effects: Hệ quả cụ thể khi chuyển state (email, notification, sync, audit log...).

---

### permissions.md — Authorization

**Cách scan:**
1. **Tìm role definitions**: Grep `enum.*Role`, `ROLE_`, `role:`, `@Roles`.
2. **Tìm permission definitions**: Grep `enum.*Permission`, `PERMISSION_`, `canAccess`, `authorize`, `@RequirePermission`.
3. **Tìm guards/middleware**: Grep `@Guard`, `@UseGuards`, `middleware`, `interceptor`, `canActivate` → đọc logic kiểm tra quyền.
4. **Tìm data-level permissions**: Grep `branch_id`, `tenant_id`, `owner_id`, `created_by` trong WHERE clauses hoặc query filters.
5. **Tìm RBAC config**: File config permissions, seed data, hoặc database table chứa role-permission mapping.

**Output phải có:**
- Bảng Roles: Mã, Tên, Phạm vi, Mô tả.
- Bảng Permissions: Mã permission, Chức năng tương ứng, Nhóm.
- Ma trận Role x Permission: Bảng chi tiết với ✅/❌ và điều kiện bổ sung.
- Data Policies: Giải thích cách hệ thống chặn data theo tenant/VPS/owner.

---

## 🛑 Pre-Write Validation Gate (BẮT BUỘC)

> ⚠️ **TRƯỚC KHI GHI MỖI FILE**, agent PHẢI tự kiểm tra output. Đây là bước cuối cùng trước khi write.

### Checklist bắt buộc:

1. **Placeholder Check**: File output CÓ CHỨA các placeholder chưa thay thế không?
   - Tìm: `{Tên Module}`, `{file}:{line}`, `{functionName}`, `{tên service}`, `{table_name}`, `{EntityName}`
   - Nếu CÓ → ❌ DỪNG, quay lại scan code và điền data thực

2. **Example Data Check**: File output CÓ CHỨA data mẫu từ template không?
   - Tìm: `work_orders`, `wo_items`, `wo_approval_logs`, `WoService`, `WoStatus`, `WoController`, `SAP ERP`, `wo.service.ts`, `wo.entity.ts`, `WoListBloc`, `WoDetailBloc`
   - Nếu CÓ và module đang scan KHÔNG phải work-order → ❌ DỪNG, xóa data mẫu, thay bằng data thực

3. **Structure Check**: Heading structure (##, ###) có khớp template không?
   - So sánh với template tương ứng trong `.v-flow/templates/module-card/`
   - Nếu KHÔNG khớp → ❌ DỪNG, sửa lại

4. **Relevance Check**: Module không có feature tương ứng?
   - VD: Mobile app không có REST API → bỏ `api-specs.md` hoặc ghi rõ "N/A"
   - VD: Module không có state machine → bỏ `state-diagram.md` hoặc mô tả UI states

5. **Existing File Check**: File output ĐÃ TỒN TẠI với nội dung thực?
   - Nếu CÓ → MERGE: đọc file cũ, bổ sung chi tiết mới, KHÔNG overwrite bằng template
   - Nếu file cũ CÒN PLACEHOLDER → tạo lại từ đầu

6. **Heading Text Check** (QUAN TRỌNG): So sánh TỪNG heading (`##`, `###`) trong file output với `<!-- HEADING MAP -->` trong template tương ứng.
   - Heading PHẢI GIỐNG NGUYÊN VĂN template (bao gồm: numbering, emoji, ngoặc đơn, ngôn ngữ VN)
   - Chỉ thay phần `{placeholder}` bằng data thực
   - Nếu heading **dùng `—` thay `:` (VD: `# Database Schema — X` thay vì `# Database Schema: X`)** → ❌ SAI
   - Nếu heading **thiếu numbering (VD: `## E2E Flows` thay vì `## 1. Luồng Nghiệp Vụ E2E`)** → ❌ SAI
   - Nếu heading **viết EN thay VN (VD: `## Relationships` thay vì `## 3. Mối Quan Hệ (Relationships)`)** → ❌ SAI
   - Nếu heading **thiếu emoji (VD: `## No-Go Zones` thay vì `## ⚠️ No-Go Zones (trong module này)`)** → ❌ SAI

> 💡 **Quy tắc đơn giản**: Đọc lại file output — nếu Dev đọc mà confused "đây là data của module nào?" → file đó SAI.
> 💡 **Heading check nhanh**: Đếm số headings `##` trong output. Nếu ít hơn số headings `##` trong template → thiếu sections.

### Verify bằng CLI (tùy chọn — khi cần, KHÔNG phải cổng sinh card)

Checklist ở trên (Pre-Write Gate) là self-check bằng mắt và là điều kiện trước khi ghi file.
CLI dưới đây là kiểm tra **máy on-demand** — KHÔNG chạy xen kẽ lúc sinh card; chạy khi muốn
đối chiếu nhanh, vd **trước Tech Lead review / handoff**:

```bash
v-flow validate --module-cards <module>   # cấu trúc + heading + business-quiz
v-flow score-card <module> --oracle gitnexus --repo <repo>   # điểm objective + "👉 Cần làm gì tiếp"
v-flow dev-quiz <module> --repo <repo>     # answer key từ graph — target phải resolve
```

> ✅ "Scan xong" 1 module = **đủ bộ file card + đạt Quality Gate chiều sâu** (dev đọc hiểu logic
> không cần mở code), KHÔNG phải "validate sạch issue". `validate`/`score-card` chỉ để tham khảo on-demand.
> Cần `gitnexus` trên PATH (hoặc env `VFLOW_GITNEXUS_BIN`); `--repo` khi máy index nhiều repo.
