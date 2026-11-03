<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# UI Flows: {Tên Module}
## 1. Danh Sách Màn Hình
## 2. Chi Tiết Từng Màn Hình
### Màn hình: {Tên màn hình thực}
-->
# UI Flows: {Tên Module}

> **Audience chính**: BA, Frontend Dev
> **AI generate**: Scan components, routes, state management → draft. Human bổ sung UX context.

**App(s)**: {web / mobile / cả hai}
**Framework**: {framework thực — VD: Flutter, React, Vue...}
**State Management**: {state management thực — VD: Riverpod, BLoC, Redux...}

---

## 1. Danh Sách Màn Hình

<!-- HƯỚNG DẪN: Scan route definitions, navigation, GoRouter, Navigator.push...
Liệt kê TẤT CẢ màn hình/screens/pages thuộc module.
-->

| # | Màn hình | Route/Path | Component/Widget chính | State Manager | Mô tả chức năng |
|---|---|---|---|---|---|
| 1 | {tên màn hình thực} | {route thực} | {widget/component thực} | {state manager thực} | {mô tả} |

---

## 2. Chi Tiết Từng Màn Hình

### Màn hình: {Tên màn hình thực}

**Route**: {route thực}
**Component**: `{WidgetThực}` — File: `{file_thực}`
**State**: `{StateManagerThực}` — File: `{state_file_thực}`

**UI Elements chính:**

| Element | Loại | Behavior | State liên quan |
|---|---|---|---|
| {element thực từ code} | {loại widget} | {behavior mô tả từ code} | `{state_field_thực}` |

**Fields Mapping (UI → API → DB):**

<!-- HƯỚNG DẪN: So sánh tên fields trong UI form/display với tên fields trong API DTO và DB columns.
Tạo bảng mapping CHÍNH XÁC từ code thực tế.
-->

| UI Label | UI Component | API Field (Request) | API Field (Response) | DB Column | Validation |
|---|---|---|---|---|---|
| "{label thực}" | {component} | `{api_field}` | `{response_field}` | `{db_column}` | {validation} |

**User Flow:**

<!-- HƯỚNG DẪN: Mô tả step-by-step thao tác người dùng.
Phải phản ánh đúng UX thực tế trong code (navigation, loading states, error handling).
-->

1. {bước 1 — action người dùng}
2. {bước 2 — hệ thống phản hồi}
3. {bước 3 — action tiếp theo}

**API Calls:**

| Action | Endpoint / Method Call | Trigger | Loading State | Error Handling |
|---|---|---|---|---|
| {action} | `{endpoint/method thực}` | {trigger} | `{loading_state_thực}` | {error handling} |

---

### Màn hình: {Tên màn hình thực 2}

**Route**: {route thực}
**Component**: `{WidgetThực}` — File: `{file_thực}`

**UI Elements chính:**

| Element | Loại | Behavior | Điều kiện hiển thị |
|---|---|---|---|
| {element thực} | {loại} | {behavior} | {điều kiện} |

**Conditional UI (nếu có phân quyền):**

<!-- HƯỚNG DẪN: Chỉ điền section này nếu UI thay đổi theo role/status.
Nếu không có conditional UI → bỏ section này.
-->

| Điều kiện | UI thay đổi | File reference |
|---|---|---|
| {điều kiện từ code} | {UI element thay đổi} | `{file_thực}:{line}` |
