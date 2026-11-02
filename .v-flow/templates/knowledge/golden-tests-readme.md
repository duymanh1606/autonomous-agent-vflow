# Golden Tests — Hướng Dẫn

> Golden tests là **bộ test tham chiếu** — input + expected output cố định — dùng để đảm bảo behavior không thay đổi sau khi refactor hoặc thêm tính năng.

---

## Khi Nào Cần Golden Test?

| Tình huống | Lý do |
|-----------|-------|
| API response format | Đảm bảo backward compatibility |
| Template generation output | Verify output không bị sai sau refactor |
| State machine transitions | Lock valid state transitions |
| Complex business rules | Document exact expected behavior |
| Data migration | Verify data transform đúng |

---

## Cấu Trúc Golden Test

```
knowledge/golden-tests/
├── README.md              ← File này
├── api-responses/
│   ├── get-user.input.json
│   ├── get-user.expected.json
│   ├── create-order.input.json
│   └── create-order.expected.json
├── state-transitions/
│   ├── order-lifecycle.input.yaml
│   └── order-lifecycle.expected.yaml
└── templates/
    ├── context-md.input.json
    └── context-md.expected.md
```

---

## Quy Tắc

1. **Tên file có ý nghĩa** — `{action}.input.{ext}` + `{action}.expected.{ext}`
2. **Không dùng mock** — Golden test dùng dữ liệu thật hoặc realistic fixtures
3. **Khi test fail → xác nhận** — Nếu expected output thay đổi là intentional → update golden file
4. **Ghi ngày tạo** — Trong comment hoặc metadata, ghi ngày golden test được tạo
5. **Liên kết REQ** — Mỗi golden test nên tham chiếu REQ-xxx nếu có

---

## Template Cho Golden Test

### Input file (`*.input.json`)

```json
{
  "_meta": {
    "created": "YYYY-MM-DD",
    "req": "REQ-xxx",
    "description": "Mô tả scenario"
  },
  "data": {
    // Input data cho function/API
  }
}
```

### Expected file (`*.expected.json`)

```json
{
  "_meta": {
    "approved_by": "Tên người approve",
    "approved_date": "YYYY-MM-DD"
  },
  "result": {
    // Expected output
  }
}
```

---

## Ví Dụ: Scan Codebase → context.md

**Input** (`context-md.input.json`):
```json
{
  "_meta": { "created": "2026-04-27", "req": "U.0", "description": "Scanner generates context.md" },
  "data": {
    "projectName": "my-app",
    "languages": ["TypeScript", "JavaScript"],
    "frameworks": ["Next.js", "React"],
    "testingTools": ["Jest"],
    "packageManager": "pnpm"
  }
}
```

**Expected** (`context-md.expected.md`):
```markdown
# context.md — Codebase Understanding Report
> **Dự án**: my-app
...
| **Ngôn ngữ chính** | TypeScript, JavaScript |
| **Framework** | Next.js, React |
```

---

## Tích Hợp Với CI

```yaml
# .github/workflows/golden-tests.yml
- name: Run Golden Tests
  run: npx jest tests/golden/ --ci
```
