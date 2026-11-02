# context.md — Project Overview (Tầng 1)

> **Phase**: U.0a (Understand — Project Overview)
> **Dự án**: [Tên dự án]
> **Ngày tạo**: YYYY-MM-DD | **Cập nhật lần cuối**: YYYY-MM-DD
> **Người review**: [Tech Lead / Architect]

> ⚠️ File này là **Tầng 1** trong Multi-Layer Understanding System.
> Chỉ chứa thông tin tổng quan (~50-100 dòng). Chi tiết từng module xem tại `.v-flow/modules/`.
> Nội dung file này sẽ được auto-inject vào AGENTS.md để AI agent luôn có sẵn.

---

## 1. Tech Stack

| Hạng mục | Công nghệ | Phiên bản |
|----------|-----------|-----------|
| **Ngôn ngữ** | | |
| **Framework** | | |
| **Database** | | |
| **Message Queue** | | |
| **CI/CD** | | |

---

## 2. Kiến Trúc Tổng Quan

> Mô tả kiến trúc AS-IS (1-3 câu). Không lý tưởng hóa.

```
project/
├── [thư mục chính 1]/  ← [vai trò]
├── [thư mục chính 2]/  ← [vai trò]
└── ...
```

**Pattern chính**: [Monolith / Microservices / Modular Monolith / ...]

---

## 3. Entry Points

| Entry Point | File | Ghi chú |
|-------------|------|---------|
| API chính | | |
| Background jobs | | |
| CLI / Scripts | | |

---

## 4. 🚫 No-Go Zones

> **Đây là luật**: Agent KHÔNG được tự ý sửa các vùng này.
> **Mức độ** (cột bắt buộc — `check-nogo-zones.sh` đọc để phân loại): 🔴 Strict = BLOCK · 🟡 Warning = cần Tech Lead duyệt · 🟢 Thấp = LOG (được phép, ghi nhận). **Ô trống = mặc định 🔴 Strict** (fail-safe — không để vùng lọt qua).

| Vùng code | Mức độ | Lý do | Rủi ro |
|-----------|:------:|-------|--------|
| `[file/module]` | 🔴 | | |

---

## 5. Technical Debt (Top 3-5)

| # | Mô tả | Mức độ |
|---|-------|--------|
| 1 | | 🔴/🟠/🟡 |
| 2 | | |

---

## 6. Module Index

> Danh sách module cards có sẵn. Agent đọc module liên quan trước khi làm feature.

| Module | Mô tả 1 dòng | Đường dẫn |
|--------|--------------|-----------|
| | | `.v-flow/modules/domain-xxx/SKILL.md` |
| | | `.v-flow/modules/domain-yyy/SKILL.md` |

---

## 7. Quy ước quan trọng

- **Naming**: [camelCase / snake_case / PascalCase]
- **Error handling**: [pattern đang dùng]
- **Test coverage ước tính**: ~X%

---

## Lịch Sử Cập Nhật

| Ngày | Người | Lý do |
|------|-------|-------|
| YYYY-MM-DD | | Tạo mới (U.0a) |
