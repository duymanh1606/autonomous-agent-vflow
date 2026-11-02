<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Phân Quyền & Vai Trò: {Tên Module}
## 1. Danh Sách Vai Trò (Roles)
## 2. Danh Sách Quyền (Permissions)
## 3. Ma Trận Phân Quyền (Role × Permission Matrix)
## 4. Phân Quyền Theo Dữ Liệu (Data Policies / VPS)
### 4.1 {Tên policy}
### 4.2 Bảng tổng hợp Data Scope
-->
# Phân Quyền & Vai Trò: {Tên Module}

> **Audience chính**: BA, Security, Backend Dev
> **AI generate**: Scan Auth Guards, Roles Decorators, RBAC/ABAC logic, middleware.
> ⚠️ Permissions phải lấy TỪ CODE THỰC TẾ (decorators, guards, middleware, config).

**Auth scheme**: {scheme thực — VD: JWT, Session, API Key, hoặc "N/A — local app"}
**RBAC implementation**: {implementation thực}
**Guard/Middleware file**: `{file_thực}`

---

## 1. Danh Sách Vai Trò (Roles)

> Source: `{enum_file_thực}` — enum `{RoleEnum_thực}`

<!-- HƯỚNG DẪN: Liệt kê roles TỪ CODE THỰC TẾ.
Scan enum definitions, role constants, @Roles decorators.
Nếu module KHÔNG có hệ thống roles → ghi rõ "Module không phân quyền theo roles" và điều chỉnh section.
-->

| Mã Role | Tên Vai Trò | Cấp Độ / Phạm Vi | Mô Tả | Cách xác định phạm vi |
|---|---|---|---|---|
| `{ROLE_thực}` | {tên} | {phạm vi} | {mô tả} | {cách filter data} |

---

## 2. Danh Sách Quyền (Permissions)

> Source: `{permission_file_thực}` — enum `{PermissionEnum_thực}`

| Mã Permission | Chức Năng Tương Ứng | API Endpoint / Method | Nhóm | Guard/Decorator |
|---|---|---|---|---|
| `{PERM_thực}` | {chức năng} | `{endpoint/method_thực}` | {nhóm} | `{guard thực}` |

---

## 3. Ma Trận Phân Quyền (Role × Permission Matrix)

> ⚠️ Mỗi ô phải ghi rõ điều kiện bổ sung (nếu có). Không chỉ ✅/❌.

<!-- HƯỚNG DẪN: Tạo ma trận với roles và permissions THỰC TẾ đã liệt kê ở trên.
Headers cột = roles thực, headers hàng = permissions thực.
-->

| Permission \ Role | `{ROLE_1}` | `{ROLE_2}` | `{ROLE_3}` | Điều kiện bổ sung |
|---|---|---|---|---|
| `{PERM_1}` | {✅/❌ + scope} | {✅/❌ + scope} | {✅/❌ + scope} | {điều kiện từ code} |

---

## 4. Phân Quyền Theo Dữ Liệu (Data Policies / VPS)

> ⚠️ Mô tả chi tiết cách hệ thống chặn dữ liệu theo Tenant/VPS/Owner. Ghi rõ implementation.
> Nếu module KHÔNG có data-level permissions → ghi rõ "Không có data filtering — tất cả users xem cùng data".

<!-- HƯỚNG DẪN: Scan WHERE clauses, filter logic, tenant_id, owner_id, branch_id trong queries.
Mô tả CHÍNH XÁC cách code filter data cho từng role.
-->

### 4.1 {Tên policy — VD: "Theo owner", "Theo tenant", "Theo branch"}

- **Ai áp dụng**: {role}
- **Cơ chế**: {mô tả cách filter}
- **Implementation**: 
  - File: `{file_thực}:{line}` — hàm `{function_thực}`
- **Edge case**: {edge case nếu có}

### 4.2 Bảng tổng hợp Data Scope

| Role | SELECT (View) | INSERT (Create) | UPDATE (Edit) | DELETE |
|---|---|---|---|---|
| `{ROLE_1}` | {scope} | {scope} | {scope} | {scope} |
| `{ROLE_2}` | {scope} | {scope} | {scope} | {scope} |
