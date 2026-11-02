# V-Flow Patterns Library

> Reusable patterns cho development pipeline. Mỗi entry mô tả KHI NÀO dùng, CÁCH dùng, và GOTCHAS.

---

## 1. Adapter Pattern (No-Go Zone Workaround)

**Khi dùng**: Cần interact với No-Go Zone module mà không sửa nó.

```
// Thay vì sửa no-go-module trực tiếp
// Tạo adapter wrap interface cần thiết

// adapters/payment-adapter.js
const payment = require('../no-go/payment');
module.exports = {
  getStatus: (id) => payment.checkStatus(id),  // wrap method hiện có
  // Thêm method mới MÀ KHÔNG SỬA payment module
  getStatusFormatted: (id) => {
    const raw = payment.checkStatus(id);
    return { ...raw, formattedDate: formatDate(raw.date) };
  }
};
```

**Gotcha**: Adapter KHÔNG được modify behavior của original — chỉ wrap hoặc extend.

---

## 2. Concern Carry-Forward Pattern

**Khi dùng**: Master Check (R.0) phát hiện concern (W-xxx) → track qua B.1 → verify ở R.1.

```
R.0: validation-report.md
  → W-001: "Thiếu rate limiting"
  → Route: B.1, assigned_to: T-004

B.1: _session.md
  → Agent đọc concerns từ validation-report.md
  → Implement fix trong T-004
  → Ghi: "W-001: Resolved — added loginAttempts counter"

R.1: code-review-report.md
  → Review Agent verify W-001 resolved
  → Check implementation quality
```

**Gotcha**: KHÔNG skip concerns. Review Agent PHẢI verify mỗi W-xxx.

---

## 3. Regression Test Pattern

**Khi dùng**: Refactor legacy code — verify existing behavior giữ nguyên.

```
1. TRƯỚC refactor: capture current behavior
   - Record API responses cho tất cả endpoints
   - Document expected behavior

2. SAU refactor: run regression suite
   - Same inputs → same outputs
   - Performance không degrade
   - Error codes/messages giữ nguyên

3. ĐẶC BIỆT chú ý:
   - Response format changes (breaking!)
   - Side effects (events, notifications)
   - Error handling differences
```

**Gotcha**: "Same behavior" bao gồm cả error paths, không chỉ happy paths.

---

## 4. TDD Red-Green-Refactor Pattern

**Khi dùng**: Implement mọi task trong tasks.md.

```
🔴 RED:    test-cases.md → viết test → chạy → FAIL
🟢 GREEN:  viết code tối thiểu → chạy → PASS
🔵 REFACTOR: clean code → chạy → vẫn PASS
```

**Gotcha**: Nếu test PASS ngay ở RED → test sai, xem lại.

---

## 5. Dual BA Loop Pattern

**Khi dùng**: Feature phức tạp cần spec review kỹ — `/v.specify --dual`.

```
Round 1: BA Agent → draft spec.md
Round 2: BA Critic → phản biện (≥3 issues)
Round 3: BA Agent → revise spec
(Optional) Round 4: BA Critic → final check
```

**Gotcha**: BA Critic PHẢI fresh context mỗi round — không bị ảnh hưởng round trước.
