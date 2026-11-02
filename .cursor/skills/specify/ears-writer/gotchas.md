# Gotchas — EARS Writer

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns Phổ Biến

1. ❌ **Trộn nhiều actions**: "Hệ thống phải validate, hash, và lưu" → Tách 3 REQs.
   - **Hậu quả**: Test Agent không biết test cái nào, Plan Agent không biết split task.

2. ❌ **Thiếu error case**: Chỉ viết happy path "Khi login thành công" → Quên REQ cho login fail.
   - **Hậu quả**: Implement Agent skip error handling → bug production.

3. ❌ **Copy-paste prefix**: Dùng REQ-E cho tất cả → Mất ý nghĩa phân loại.
   - **Dấu hiệu**: Toàn bộ spec chỉ có REQ-E → chắc chắn sai.

4. ❌ **AC không measurable**: "- [ ] Login nhanh" → Không test được.
   - **Fix**: "- [ ] Login response < 3s" hoặc "- [ ] Test pass với mock delay 2s".

5. ❌ **Viết technical trong spec**: "Dùng SHA-256 với salt 16 bytes, bcrypt cost 12"
   - **Fix**: Spec: "mã hóa mật khẩu". Plan quyết algorithm. Spec nói WHAT, không nói HOW.

6. ❌ **Quên actors**: Mọi REQ đều "Hệ thống phải..." — không rõ ai trigger.
   - **Fix**: Event-driven REQ phải nói rõ: "Khi **Admin** nhấn Delete..."

7. ❌ **REQ quá vague nhưng có AC quá cụ thể**: REQ mơ hồ + AC chi tiết = inconsistency.
   - **Fix**: REQ phải đủ cụ thể để AC derive tự nhiên.

8. ❌ **Quên cross-reference No-Go Zones**: Viết REQ cần sửa file No-Go → sẽ bị block ở B.1.
   - **Fix**: Khi viết REQ → đọc context.md No-Go Zones → verify REQ khả thi.

---

## Edge Cases Hay Quên

- Empty state: App mới không có data → UI hiện gì?
- Timeout: API call > timeout → hiện gì?
- Concurrent access: 2 users edit cùng 1 record → gì xảy ra?
- Network error: Offline → retry? Cache?
- Boundary values: limit = 0? price = 0? string = 255 chars?
- Unicode/emoji: Tên chứa emoji? Address chứa ký tự đặc biệt?
