<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Database Schema: {Tên Module}
## 1. Danh Sách Bảng (Tables)
## 2. Chi Tiết Từng Bảng
### Bảng: `{table_thực}`
## 3. Mối Quan Hệ (Relationships)
## 4. DDL & Migrations Links
-->
# Database Schema: {Tên Module}

> **Audience chính**: Backend Dev, DBA, Data Analyst
> **AI generate**: Scan entity/model files, migrations, ORM annotations → auto-generate. Human verify constraints.

**Database**: {database thực — VD: PostgreSQL, MySQL, SQLite, MongoDB...}
**ORM**: {ORM thực — VD: TypeORM, Prisma, Sqflite, Mongoose...}

---

## 1. Danh Sách Bảng (Tables)

<!-- HƯỚNG DẪN: Liệt kê TẤT CẢ bảng/collection THỰC TẾ của module từ code.
Lấy từ entity files, migration files, hoặc CREATE TABLE statements.
TUYỆT ĐỐI KHÔNG copy bảng mẫu — phải scan code để tìm bảng thực.
-->

| Tên Bảng | Ý Nghĩa / Chức Năng | Entity/Model File | Số Cột | Ghi chú |
|---|---|---|---|---|
| `{table_thực_1}` | {mô tả chức năng} | `{entity_file_thực}` | {N} | {ghi chú} |
| `{table_thực_2}` | {mô tả chức năng} | `{entity_file_thực}` | {N} | {ghi chú} |

---

## 2. Chi Tiết Từng Bảng

### Bảng: `{table_thực_1}`

**Mô tả**: {mô tả bảng — lấy từ comment trong code hoặc suy luận từ tên + fields}
**Entity file**: `{entity_file_thực}`

<!-- HƯỚNG DẪN: Liệt kê TẤT CẢ columns từ entity/model definition.
Phải đọc file entity để lấy chính xác: tên cột, kiểu dữ liệu, constraints, default values.
-->

| Tên Cột | Kiểu Dữ Liệu | Constraints | Default | Ý Nghĩa | Ghi chú |
|---|---|---|---|---|---|
| `{column_thực}` | `{type_thực}` | {PK/FK/NN/UNIQUE} | {default} | {ý nghĩa} | {ghi chú} |

**Indexes** (nếu có):
- `{index_name}` — {type} on `{columns}`

### Bảng: `{table_thực_2}`

**Mô tả**: {mô tả}
**Entity file**: `{entity_file_thực}`

| Tên Cột | Kiểu Dữ Liệu | Constraints | Default | Ý Nghĩa |
|---|---|---|---|---|
| `{column_thực}` | `{type_thực}` | {constraints} | {default} | {ý nghĩa} |

---

## 3. Mối Quan Hệ (Relationships)

<!-- HƯỚNG DẪN: Scan foreign keys, @OneToMany, @ManyToOne, @BelongsTo, references... trong code.
Phải ghi rõ ON DELETE behavior thực tế.
-->

| Bảng A | Quan hệ | Bảng B | Khóa Ngoại (FK) | ON DELETE | Ghi chú |
|---|---|---|---|---|---|
| `{table_A}` | {1→n / n→1 / n→n} | `{table_B}` | `{fk_column}` → `{ref_table}.{ref_column}` | {CASCADE/SET NULL/RESTRICT} | {ghi chú} |

```mermaid
erDiagram
    {TABLE_A} ||--o{ {TABLE_B} : "{relationship}"
```

---

## 4. DDL & Migrations Links

<!-- HƯỚNG DẪN: Link đến migration files hoặc CREATE TABLE statements thực tế trong codebase.
Nếu không có migrations riêng (VD: tạo bảng trong code) → ghi rõ file + hàm tạo bảng.
-->

- [{mô tả migration}]({file:///path/thực/đến/migration})
