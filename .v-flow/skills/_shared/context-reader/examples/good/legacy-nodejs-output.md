# Good Example — Context Reader Output cho Legacy Project

> Mẫu output khi context-reader load context.md.

```markdown
## ⚠️ Legacy Context Active

**Project**: E-Commerce API (Node.js + Express)
**Stack**: Node.js 14, Express 4, PostgreSQL 12, no ORM (raw SQL)
**Architecture**: Monolith — routes/ → mixed logic (no service layer)
**Last Updated**: 2026-03-15 (40 ngày trước — ⚠️ có thể outdated)

### 🚫 No-Go Zones (CRITICAL)
- 🔴 `routes/payment.js` (487 LOC) — PCI compliance, đã audit
- 🔴 `middleware/auth.js` (156 LOC) — 12 routes depend on this
- 🟡 `config/db.js` (45 LOC) — Connection pool, system-wide impact

### ⚡ Technical Debt (6 items)
- 🔴 SQL injection risk in `routes/products.js:45` (string concatenation)
- 🔴 No input validation — req.body used directly
- 🟡 0% test coverage — no test files exist
- 🟡 Hardcoded secrets in `config/env.js`
- 🟢 No error classes — errors are plain strings
- 🟢 Mixed SQL styles (template literal + string concat)

### 📊 Test Coverage
- Current: 0%
- Untested: ALL files
- Priority: routes/products.js, routes/orders.js

### Patterns
- Direct SQL queries (no ORM, no query builder)
- Express middleware chain
- Callback-style error handling
```
