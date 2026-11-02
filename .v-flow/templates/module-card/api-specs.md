<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# API Specs: {Tên Module}
## 1. Endpoints
### {Nhóm chức năng}
#### `{METHOD}` {/path/thực}
## 2. Data Contracts (DTOs)
### {TênDTO_thực}
## 3. Enums & Constants
## 4. Error Codes (Module-specific)
-->
# API Specs: {Tên Module}

> **Audience chính**: Dev
> **AI generate**: Scan controllers, DTOs, entities → auto-generate. Human review accuracy.

**Service**: {tên service thực}
**Base path**: {base path thực từ code}
**Auth scheme**: {scheme thực — VD: Bearer JWT, API Key, Session, hoặc "N/A — local app"}

---

## 1. Endpoints

> ⚠️ Liệt kê TẤT CẢ endpoints trong module. Mỗi endpoint phải có đủ: Method, Path, Auth, Request, Response, Error cases.
> Nếu module KHÔNG có REST API (VD: mobile-only, library module) → ghi rõ và liệt kê internal method calls thay thế.

### {Nhóm 1: tên nhóm chức năng}

<!-- HƯỚNG DẪN: Với mỗi endpoint, mô tả ĐẦY ĐỦ:
- Chức năng cụ thể (không chung chung)
- Auth: role cụ thể từ code
- Controller file + line number
- Request Body/Params: TỪNG field với type, required, validation
- Response: format JSON thực tế
- Errors: error codes + điều kiện trigger cụ thể
-->

#### `{METHOD}` {/path/thực/từ/code}

- **Chức năng**: {mô tả cụ thể}
- **Auth**: {role cụ thể từ code}
- **Controller**: `{file_thực}:{line}` → hàm `{function_thực}`
- **Request Body**:
  ```json
  {
    "{field_thực_1}": "{type} ({required/optional}, {validation})",
    "{field_thực_2}": "{type} ({required/optional}, {validation})"
  }
  ```
- **Response {status_code}**:
  ```json
  {
    "{field_thực}": "{type — mô tả}"
  }
  ```
- **Errors**:
  | Code | Điều kiện | Message |
  |---|---|---|
  | {code} | {điều kiện từ code} | "{message từ code}" |

#### `{METHOD}` {/path/thực/từ/code/2}

- **Chức năng**: {mô tả}
- **Auth**: {roles}
- **Query Params** (nếu GET):
  | Param | Type | Required | Mô tả | Default |
  |---|---|---|---|---|
  | `{param}` | {type} | {✅/❌} | {mô tả} | {default} |

---

## 2. Data Contracts (DTOs)

> ⚠️ Liệt kê CHI TIẾT từng field. Không bỏ sót validation rules.

### {TênDTO_thực}

| Field | Type | Required | Validation | Ghi chú |
|---|---|---|---|---|
| `{field_thực}` | `{type}` | {✅/❌} | `{validation annotation thực}` | {mô tả} |

---

## 3. Enums & Constants

| Enum | Values | Ý nghĩa | File reference |
|---|---|---|---|
| `{EnumName_thực}` | `{VALUE_1}`, `{VALUE_2}`, ... | {ý nghĩa} | `{file_thực}:{line}` |

---

## 4. Error Codes (Module-specific)

| HTTP Code | Error Code | Message | Điều kiện trigger | File reference |
|---|---|---|---|---|
| {code} | `{ERROR_CODE_thực}` | "{message thực}" | {điều kiện từ code} | `{file_thực}:{line}` |
