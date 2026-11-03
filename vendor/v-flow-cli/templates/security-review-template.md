# Template: Security Review

> Được tạo bởi **Security Agent** — Phase B.0 (optional)
> Feature: [TÊN FEATURE]
> Spec Version: [vX.Y]
> Ngày review: [YYYY-MM-DD]

---

## 1. Authentication & Authorization

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| Có authentication flow? | ✅ / ❌ / N/A | |
| Auth tokens an toàn? (JWT, expiry, refresh) | ✅ / ❌ / N/A | |
| Role-based access control? | ✅ / ❌ / N/A | |
| API endpoints đều yêu cầu auth? | ✅ / ❌ / N/A | |

---

## 2. Input Validation

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| SQL Injection protected? | ✅ / ❌ / N/A | |
| XSS protected? | ✅ / ❌ / N/A | |
| Input sanitization đầy đủ? | ✅ / ❌ / N/A | |
| File upload validation? | ✅ / ❌ / N/A | |
| Rate limiting? | ✅ / ❌ / N/A | |

---

## 3. Data Protection

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| Sensitive data encrypted at rest? | ✅ / ❌ / N/A | |
| HTTPS / TLS enforced? | ✅ / ❌ / N/A | |
| PII handled correctly? | ✅ / ❌ / N/A | |
| Logging không chứa sensitive data? | ✅ / ❌ / N/A | |

---

## 4. Infrastructure

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| CORS configured đúng? | ✅ / ❌ / N/A | |
| CSP headers? | ✅ / ❌ / N/A | |
| Environment secrets an toàn? | ✅ / ❌ / N/A | |
| Dependencies không có known vulnerabilities? | ✅ / ❌ / N/A | |

---

## 5. Phân loại Issues

### 🔴 Critical Security Issues
*(Không có)* / Liệt kê nếu có:
- **[SEC-C001]** [Mô tả] → Fix: [Đề xuất]

### 🟠 Major Security Issues
*(Không có)* / Liệt kê nếu có:
- **[SEC-M001]** [Mô tả] → Fix: [Đề xuất]

### 🟡 Security Concerns
*(Không có)* / Liệt kê nếu có:
- **[SEC-W001]** [Mô tả] → Implement Agent cần chú ý

### 🔵 Recommendations
- **[SEC-R001]** [Gợi ý cải thiện]

---

## 6. Verdict

**Security Review**: ✅ PASS / ⚠️ PASS WITH CONCERNS / ❌ FAIL

> **FAIL** nếu có ít nhất 1 Critical hoặc Major security issue.
> **PASS WITH CONCERNS** nếu có concerns cần Implement Agent chú ý.

---

> **Reviewer**: Security Agent
> **Mandatory khi**: Feature có auth, payment, user data, hoặc external API integration
