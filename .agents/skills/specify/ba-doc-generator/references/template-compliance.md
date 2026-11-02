# Template: Compliance & Regulatory Document
> Dành cho: Legal / Compliance / Kiểm toán nội bộ
> Mục đích: Audit trail, tuân thủ quy định pháp lý / nội bộ

---

## Nguyên tắc viết cho Legal/Compliance
- Ngôn ngữ chính thức, chính xác, không mơ hồ
- Trích dẫn rõ số điều, khoản của văn bản pháp lý
- Mỗi yêu cầu compliance phải có trạng thái: Đáp ứng / Chưa đáp ứng / Không áp dụng
- Có evidence / bằng chứng đáp ứng
- Trace được từ requirement → thiết kế → implementation

---

## CẤU TRÚC TÀI LIỆU

```
# Báo cáo Tuân thủ: [Tên dự án / Tính năng]
**Ngày**: [Date] | **Chuẩn bị bởi**: [BA/Compliance Name]
**Phiên bản**: [v1.0] | **Phân loại**: [Nội bộ / Mật / Công khai]

---

## 1. Phạm vi & Mục đích
- **Phạm vi áp dụng**: [Hệ thống / Module / Quy trình nào]
- **Mục đích tài liệu**: [Audit / Review / Phê duyệt / Lưu trữ]
- **Đối tượng sử dụng**: [Phòng pháp chế / Kiểm toán / Regulator...]

---

## 2. Văn bản pháp lý & Quy định áp dụng
| # | Văn bản | Số hiệu | Ban hành | Điều khoản liên quan |
|---|---------|---------|---------|---------------------|
| 1 | [Tên luật / Nghị định] | [Số/YYYY/CP] | [Date] | Điều [X], Khoản [Y] |
| 2 | [Chính sách nội bộ] | [Mã chính sách] | [Date] | Mục [Z] |

---

## 3. Ma trận Tuân thủ

| # | Yêu cầu | Nguồn (Điều/Khoản) | Trạng thái | Cách đáp ứng | Evidence |
|---|---------|-------------------|------------|-------------|----------|
| C-01 | [Mô tả yêu cầu tuân thủ] | [Văn bản, Điều X] | ✅ Đáp ứng | [Mô tả cơ chế/tính năng đáp ứng] | [Link / Tài liệu] |
| C-02 | [Yêu cầu 2] | | ⚠️ Một phần | [Giải thích] | |
| C-03 | [Yêu cầu 3] | | ❌ Chưa đáp ứng | [Kế hoạch xử lý + deadline] | |
| C-04 | [Yêu cầu 4] | | N/A | [Lý do không áp dụng] | |

---

## 4. Kiểm soát Dữ liệu & Bảo mật
| Loại dữ liệu | Phân loại | Cách lưu trữ | Mã hóa | Thời gian lưu | Quyền truy cập |
|-------------|-----------|-------------|--------|--------------|---------------|
| [CCCD / Thông tin cá nhân] | Nhạy cảm | [Database X] | AES-256 | [X năm] | [Role có quyền] |
| [Dữ liệu giao dịch] | Nội bộ | | | | |

---

## 5. Audit Trail
Hệ thống ghi lại các hành động sau để phục vụ kiểm toán:
| Hành động | Thông tin ghi lại | Lưu trữ bao lâu |
|-----------|------------------|----------------|
| [Tạo / Sửa / Xóa dữ liệu] | User, Timestamp, IP, Old value, New value | [X năm] |
| [Đăng nhập / Đăng xuất] | User, Timestamp, IP | [X năm] |
| [Phê duyệt / Từ chối] | User, Timestamp, Lý do | [X năm] |

---

## 6. Gap Analysis & Kế hoạch xử lý
| Gap | Mức độ rủi ro | Deadline xử lý | Owner | Trạng thái |
|-----|--------------|---------------|-------|-----------|
| [Mô tả gap] | Cao/TB/Thấp | [Date] | [Tên] | In Progress |

---

## 7. Xác nhận & Phê duyệt
| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| BA soạn thảo | | | |
| Legal review | | | |
| Compliance Officer | | | |
| Phê duyệt cuối | | | |
```
