# Ví dụ — Test Cases (User Login Feature)

> Đây là mẫu output chuẩn cho Test Agent.

---

## Coverage Matrix

| REQ | Description | TC Count | Types | Priority |
|-----|------------|----------|-------|----------|
| REQ-E01 | Login success | 3 | Unit, E2E | P1 |
| REQ-E02 | Invalid credentials | 2 | Unit | P1 |
| REQ-U01 | Password security | 2 | Unit | P1 |
| REQ-O01 | Rate limiting | 3 | Unit, Integration | P2 |

**Coverage**: 4/4 REQs (100%) ✅
**Total TCs**: 10

---

## Test Cases

### TC-E01-01: Login thành công với credentials hợp lệ

**Gắn với:** REQ-E01
**Loại:** Unit
**Priority:** P1

#### Preconditions
- User "test@example.com" tồn tại trong DB
- Password hash hợp lệ

#### Test Steps
1. Gọi LoginUseCase.execute(email: "test@example.com", password: "Valid1@pass")
2. Verify response

#### Expected Result
- Result = Success
- AuthToken not null, length ≥ 32
- User object contains email, id

---

### TC-E01-02: Login redirect về dashboard sau success

**Gắn với:** REQ-E01
**Loại:** E2E
**Priority:** P1

#### Preconditions
- User tồn tại, credentials hợp lệ

#### Test Steps
1. Navigate to /login
2. Nhập email + password hợp lệ
3. Click "Đăng nhập"

#### Expected Result
- Redirect to /dashboard
- Token stored in secure storage
- Loading indicator hiện trong lúc chờ

---

### TC-E02-01: Login fail với wrong password

**Gắn với:** REQ-E02
**Loại:** Unit
**Priority:** P1

#### Preconditions
- User "test@example.com" tồn tại
- Password sai

#### Test Steps
1. Gọi LoginUseCase.execute(email: "test@example.com", password: "wrong")

#### Expected Result
- Result = Failure(InvalidCredentials)
- Error message = "Email hoặc mật khẩu không đúng" (không reveal cái nào sai)

#### Edge Cases
- Email không tồn tại → same error message (không leak info)
- Empty password → validation error trước khi gọi API

---

### TC-O01-01: Rate limit sau 5 attempts thất bại

**Gắn với:** REQ-O01
**Loại:** Integration
**Priority:** P2

#### Preconditions
- User tồn tại, attempt counter = 0

#### Test Steps
1. Gọi login 5 lần với wrong password
2. Gọi login lần 6 với ĐÚNG password

#### Expected Result
- Lần 1-5: Result = Failure(InvalidCredentials)
- Lần 6: Result = Failure(RateLimited), message = "Quá nhiều lần thử, đợi 15 phút"
- Lần 6 KHÔNG check credentials (block trước khi authenticate)
