# Constitution Enforcer — Good Example

> Ví dụ output khi Implement Agent chạy constitution-enforcer trước khi commit.

## Input

**Constitution.md excerpts:**
```markdown
§1 Architecture: Clean Architecture — domain layer KHÔNG import từ data/presentation
§2 Code Standards: camelCase cho variables, PascalCase cho classes
§6 Naming: Files dùng kebab-case, test files dùng *.test.js
§7 No-Go Zones: lib/legacy-auth/** (không sửa, không import)
```

**Changed files:**
- `src/features/user/domain/user.entity.js`
- `src/features/user/data/user.repository.js`
- `src/features/user/presentation/user.controller.js`

## Output — Constitution Compliance Report

```markdown
## Constitution Compliance Report

### Summary
- Rules checked: 12
- Violations: 2 (1 error, 1 warning)
- Compliance score: 83%

### Violations

| # | Rule | File | Line | Description | Severity |
|---|------|------|------|-------------|----------|
| 1 | CONST-ARCH-001 | user.entity.js | 3 | `import { db } from '../../data/database'` — Domain layer importing from data layer | Error |
| 2 | CONST-NAME-002 | user.controller.js | 15 | Variable `user_name` uses snake_case instead of camelCase | Warning |

### Passed Rules

| Rule | Description | Files Checked |
|------|-------------|---------------|
| CONST-NAME-001 | File naming follows kebab-case | 3/3 ✅ |
| CONST-NAME-003 | Test files use *.test.js pattern | 1/1 ✅ |
| CONST-ARCH-002 | No imports from No-Go Zones (lib/legacy-auth) | 3/3 ✅ |
| CONST-SEC-001 | No hardcoded secrets detected | 3/3 ✅ |

### Recommendations
1. **CONST-ARCH-001**: Move database dependency to repository layer, inject via constructor
2. **CONST-NAME-002**: Rename `user_name` → `userName`
```

## Why This Is Good

1. ✅ Cụ thể — chỉ rõ file, line, và rule bị vi phạm
2. ✅ Actionable — mỗi violation có recommendation cụ thể
3. ✅ Balanced — liệt kê cả passed rules
4. ✅ Severity phân rõ — Error vs Warning giúp prioritize
5. ✅ Compliance score — metric đo lường trends
