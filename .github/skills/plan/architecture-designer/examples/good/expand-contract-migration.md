# Ví dụ — Breaking migration zero-downtime (Expand-Contract) + chia release

> Minh hoạ đổi cột phá tương thích **mà không downtime**, tách 3 bước qua **2 release** (milestone). Đây là case template §3.4 mô tả nhưng ít được demo. Mỗi bước = 1 task `[DB]` riêng, có **DDL up+down thật**.

## Bối cảnh
Đổi `users.full_name` (1 cột) → tách `first_name` + `last_name`. Đổi/bỏ cột trực tiếp = breaking (app cũ còn đọc `full_name`). Dùng **Expand → Migrate → Contract**.

## §3.4 Database Migrations (3 bước)

| Bảng | Bước | New/ALTER | Cột | DDL |
|------|------|:---------:|-----|-----|
| `users` | 1 Expand | ALTER | `first_name`, `last_name` (nullable) | thêm cột mới, KHÔNG bỏ `full_name` |
| `users` | 2 Migrate | — | (backfill) | copy dữ liệu, app ghi cả cũ+mới, đọc cột mới |
| `users` | 3 Contract | ALTER | bỏ `full_name` | chỉ sau khi không còn consumer đọc cột cũ |

### DDL thật

```sql
-- Bước 1 — Expand (Release N)
-- up
ALTER TABLE users ADD COLUMN first_name text NULL;
ALTER TABLE users ADD COLUMN last_name  text NULL;
-- down
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;

-- Bước 2 — Migrate (Release N, sau khi deploy code ghi cả cũ+mới)
-- up
UPDATE users
   SET first_name = split_part(full_name, ' ', 1),
       last_name  = NULLIF(substring(full_name FROM position(' ' IN full_name) + 1), '')
 WHERE first_name IS NULL;
-- down: không cần (chỉ backfill; cột cũ vẫn còn)

-- Bước 3 — Contract (Release N+1, sau khi mọi consumer đã chuyển)
-- up
ALTER TABLE users DROP COLUMN full_name;
-- down
ALTER TABLE users ADD COLUMN full_name text;
UPDATE users SET full_name = concat_ws(' ', first_name, last_name);
```

## Phân rã task (qua 2 release)

| Task | Bước | `[DB]` | Release / Milestone | Ghi chú |
|------|------|--------|---------------------|---------|
| T-101 | Expand | thêm 2 cột nullable | M1 (Release N) | an toàn, không breaking |
| T-102 | App ghi cả cũ+mới | `[LOGIC]` | M1 | dual-write trước khi backfill |
| T-103 | Migrate/backfill | UPDATE | M1 | chạy sau khi T-102 deployed |
| T-104 | Chuyển đọc sang cột mới | `[LOGIC]` | M1 | |
| T-105 | Contract — bỏ `full_name` | `[DB]` `[GATE]` | **M2 (Release N+1)** | chỉ khi không còn consumer cột cũ |

## Vì sao chia release (Tech Decision)
- **KHÔNG** ALTER phá tương thích trong 1 bước → tránh downtime + rollback an toàn từng bước.
- Bước Contract (T-105) tách sang **release sau** + gắn `[GATE]` chờ xác nhận không còn ai đọc `full_name`.
- ❌ Anti-pattern: `ALTER TABLE users RENAME COLUMN full_name ...` trong 1 migration → app cũ vỡ ngay khi deploy.
