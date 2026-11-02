# Gotchas — Adversarial Reviewer

> Cập nhật liên tục sau MỖI review cycle.
> Đây là "institutional memory" — issues **THỰC SỰ** hay gặp nhất.

---

## Top 10 Issues Phổ Biến (Historical)

1. ❌ **Missing error handling async** — `await doSomething()` không có try-catch.
   - **Severity**: 🔴 Critical — unhandled promise rejection → crash.

2. ❌ **Hardcoded values** — Magic numbers, URLs, timeouts trong code.
   - **VD**: `if (retries > 3)` → `MAX_RETRIES`, `setTimeout(5000)` → `TIMEOUT_MS`.

3. ❌ **Missing null/empty checks** — `.length` trên array có thể null.
   - **VD**: `users.length` → crash nếu users = null. Check trước.

4. ❌ **N+1 queries** — `for (user of users) { await db.getOrders(user.id) }`.
   - **Fix**: Batch query `WHERE user_id IN (...)`.

5. ❌ **Sensitive data logged** — `console.log('Login:', { email, password })`.
   - **Fix**: Mask hoặc exclude sensitive fields.

6. ❌ **Missing input validation** — API chấp nhận mọi input, pass thẳng DB.
   - **Check**: Trace req.body → db.query — có validation layer giữa?

7. ❌ **Race condition** — 2 concurrent requests modify same record.
   - **Signal**: UPDATE without version check hoặc lock.

8. ❌ **Memory leak** — EventListener added nhưng không removeEventListener.
   - **Check**: Trong React: useEffect return cleanup? Trong Node: .on() có .off()?

9. ❌ **Breaking backward compat** — Response format change không versioned.
   - **Signal**: API response structure khác format cũ → consumer break.

10. ❌ **Test chỉ happy path** — Tests chỉ cover success, not error/edge.
    - **Check**: Có test cho 400, 404, 500? Có test cho empty input?

---

## False Positives Cần Tránh

- ✅ Console.log trong dev environment → OK nếu có log level control
- ✅ `any` type trong TypeScript → OK nếu có JSDoc comment giải thích
- ✅ Large function → OK nếu linear flow (không complex branching)
