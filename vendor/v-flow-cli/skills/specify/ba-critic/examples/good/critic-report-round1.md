# Ví dụ — BA Critic Report Round 1

> Đây là mẫu output chuẩn cho BA Critic Agent khi phản biện spec.

---

## 📋 BA Critic Report — Round 1

**Spec version reviewed**: spec.md (2026-04-15 15:30)
**Issues found**: 4 (≥3 required ✅)
**Verdict**: ❌ REVISE NEEDED

---

### Issues

#### CR-001: REQ-E01 thiếu error handling path
- **Severity**: 🔴 Critical
- **REQ affected**: REQ-E01 (Login)
- **Chiều phản biện**: Completeness
- **Mô tả**: REQ-E01 chỉ mô tả happy path (login success → redirect). Thiếu hoàn toàn các error cases: invalid email format, wrong password, account locked, rate limiting.
- **Đề xuất fix**: Tách thành REQ-E01 (success path) + REQ-E02 (invalid credentials) + REQ-E03 (account locked) + REQ-O01 (rate limit khi > 5 attempts).

#### CR-002: REQ-U01 mơ hồ — "password phải đủ mạnh"
- **Severity**: 🟡 Major
- **REQ affected**: REQ-U01
- **Chiều phản biện**: Ambiguity
- **Mô tả**: "Đủ mạnh" là chủ quan, không testable. 2 developer sẽ implement khác nhau.
- **Đề xuất fix**: Thay bằng: "Password phải có ≥8 ký tự, ≥1 uppercase, ≥1 number, ≥1 special character."

#### CR-003: REQ-E03 conflict với No-Go Zone
- **Severity**: 🔴 Critical
- **REQ affected**: REQ-E03
- **Chiều phản biện**: Feasibility
- **Mô tả**: REQ-E03 yêu cầu modify `auth-service/legacy-sso.js` — file nằm trong No-Go Zone theo context.md (rủi ro Cao, "SSO integration ổn định 2 năm").
- **Đề xuất fix**: Tạo adapter layer mới `auth-adapter.js` wrap legacy SSO, implement logic mới trong adapter.

#### CR-004: REQ-S01 thiếu exit condition
- **Severity**: 🟢 Minor
- **REQ affected**: REQ-S01
- **Chiều phản biện**: Testability
- **Mô tả**: "Trong khi user đang ở trang settings, hệ thống phải auto-save mỗi 30s." Thiếu: khi nào DỪNG auto-save? Navigate away? Close tab? Session timeout?
- **Đề xuất fix**: Thêm exit conditions: "Auto-save dừng khi user navigate khỏi trang hoặc session hết hạn."

---

### Summary
- Critical: 2
- Major: 1
- Minor: 1
- **Routing**: → BA Agent fix → Round 2
