# Good Example — Code Review Report

## Summary
- **Feature**: 002-legacy-crud (Refactor CRUD Products)
- **Files reviewed**: 7 files
- **Issues found**: 5 (1 critical, 2 major, 2 minor)
- **Verdict**: CHANGES REQUESTED
- **Concerns**: W-001 ✅ Resolved, W-002 ✅ Resolved

---

## Issues

### 🔴 CR-001: SQL injection risk in search query — Critical
**File**: `repositories/product.repo.js:45`
**Category**: Security
**Description**: `findByCategory()` uses template literal for category filter instead of parameterized query. This contradicts REQ-U01.
```javascript
// Current (vulnerable)
`SELECT * FROM products WHERE category = '${category}'`
// Fixed 
'SELECT * FROM products WHERE category = $1', [category]
```
**REQ**: REQ-U01

### 🟡 CR-002: Missing error class for 503 — Major
**File**: `errors/app-error.js`
**Category**: Architecture
**Description**: Plan specified `ServiceUnavailableError` for REQ-S01 (DB connection fail → 503), but only `AppError`, `NotFoundError`, `ValidationError` exist.
**Suggestion**: Add `ServiceUnavailableError extends AppError` with status 503.
**REQ**: REQ-S01

### 🟡 CR-003: Validation schema allows negative page — Major
**File**: `validation/product.js:12`
**Category**: Correctness
**Description**: QuerySchema has `page: Joi.number().default(1)` but missing `.min(1)`. Negative page values accepted.
**REQ**: REQ-E03

### 🟢 CR-004: Magic number in pagination — Minor
**File**: `services/product.service.js:28`
**Category**: Quality
**Description**: `if (limit > 100) limit = 100` — hardcoded 100. Use constant `MAX_PAGE_SIZE`.

### 🟢 CR-005: Missing JSDoc on public methods — Minor
**File**: `repositories/product.repo.js`
**Category**: Standards
**Description**: Public methods `findAll`, `findById`, `create`, `update`, `softDelete` missing JSDoc.

---

## Concerns Verification

| Concern | From R.0 | Resolution | Code Location | Verified? |
|---------|----------|-----------|---------------|:---------:|
| W-001 | Migration rollback missing | Added `rollback-deleted-at.sql` | `db/migrations/` | ✅ |
| W-002 | GET response format change | Tech Lead approved Option C (header-based) | `routes/products.js:15` | ✅ |
