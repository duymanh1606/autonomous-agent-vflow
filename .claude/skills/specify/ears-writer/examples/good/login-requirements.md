REQ-E01 [Event-driven]
Khi người dùng nhấn nút "Đăng nhập", hệ thống phải:
  a) Validate email format theo RFC 5322
  b) Kiểm tra credentials với auth service trong vòng 3 giây
  c) Redirect về /dashboard nếu thành công
  d) Hiển thị "Email hoặc mật khẩu không đúng" nếu thất bại (không nói cái nào sai)

Acceptance Criteria:
  - [ ] Login thành công trong <3s
  - [ ] Error message không reveal thông tin credential cụ thể
  - [ ] Email không hợp lệ → hiển thị inline error ngay

---

REQ-U01 [Ubiquitous]
Hệ thống phải mã hóa mật khẩu bằng thuật toán hash an toàn trước khi lưu vào database.

Acceptance Criteria:
  - [ ] Không có plaintext password trong database
  - [ ] Hash output khác nhau cho cùng password (có salt)

---

REQ-S01 [State-driven]
Trong khi hệ thống đang gọi API đăng nhập, hệ thống phải:
  a) Hiển thị loading indicator
  b) Disable nút Đăng nhập để tránh submit trùng

Acceptance Criteria:
  - [ ] Loading indicator visible khi isLoading = true
  - [ ] Nút Đăng nhập disabled khi đang loading

---

REQ-O01 [Optional]
Nếu người dùng đã có access token hợp lệ trong storage, hệ thống phải
tự động redirect về /dashboard mà không hiển thị màn hình đăng nhập.

Acceptance Criteria:
  - [ ] Có valid token → skip login screen
  - [ ] Token expired → hiển thị login screen bình thường
