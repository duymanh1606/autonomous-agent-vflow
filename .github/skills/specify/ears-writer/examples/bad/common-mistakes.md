❌ "User có thể đăng nhập vào hệ thống bằng email và password"
→ Vấn đề: Feature description, không phải EARS requirement. Thiếu keyword, thiếu AC.

❌ "Hệ thống nên validate input trước khi lưu"
→ Vấn đề: "Nên" = optional behavior → không testable. Dùng "phải".

❌ "REQ-001: Hệ thống phải validate input và lưu vào DB và gửi email xác nhận"
→ Vấn đề: 3 actions trong 1 REQ. Tách thành 3 REQs riêng.

❌ "Hệ thống phải nhanh và dễ sử dụng"
→ Vấn đề: "Nhanh" và "dễ sử dụng" không measurable. Thay bằng số cụ thể.

❌ "REQ-E01: Hệ thống phải hash password"
→ Vấn đề: Dùng prefix Event-driven (E) nhưng nội dung là Ubiquitous (U). Sai loại.

❌ "Khi user login, hệ thống phải xử lý hợp lý"
→ Vấn đề: "Hợp lý" = mơ hồ. Mô tả CHÍNH XÁC behavior expected.
