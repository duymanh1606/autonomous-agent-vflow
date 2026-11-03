# Test Cases — autonomous-agent-vflow (baseline)

> Spec Version: v1.0

## 1. Test Matrix

| Requirement | AC | Test Case(s) | Loại | Priority | Trạng thái |
|---|---|---|---|:--:|:--:|
| REQ-U01 | AC-01 | TC-01 | Integration | P1 | ⬜ Chưa chạy |
| REQ-U01 | AC-01 | TC-02 | Integration | P1 | ⬜ Chưa chạy |
| REQ-E01 | AC-03 | TC-03 | Integration | P1 | ⬜ Chưa chạy |
| REQ-E01 | AC-03 | TC-04 | Integration | P1 | ⬜ Chưa chạy |
| REQ-U03 | AC-02 | TC-05 | Integration | P1 | ⬜ Chưa chạy |
| REQ-E02 | AC-04 | TC-06 | Unit | P2 | ⬜ Chưa chạy |
| REQ-E03 | AC-05 | TC-07 | Integration | P1 | ⬜ Chưa chạy |
| REQ-E04 | AC-06 | TC-08 | Unit | P1 | ⬜ Chưa chạy |
| REQ-U02 | AC-07 | TC-09 | Unit | P1 | ⬜ Chưa chạy |
| REQ-E05 | AC-08 | TC-10 | Integration | P1 | ⬜ Chưa chạy |
| REQ-E06 | AC-09 | TC-11 | Integration | P2 | ⬜ Chưa chạy |
| REQ-O02 | AC-10 | TC-12 | Integration | P1 | ⬜ Chưa chạy |
| REQ-S02 | AC-11 | TC-13 | Unit | P2 | ⬜ Chưa chạy |
| REQ-S01 | AC-11 | TC-14 | Unit | P2 | ⬜ Chưa chạy |
| REQ-E05 | AC-13 | TC-15 | Integration | P2 | ⬜ Chưa chạy |
| REQ-O03 | AC-12 | TC-16 | Integration | P1 | ⬜ Chưa chạy |
| REQ-E07 | AC-14 | TC-17 | Integration | P2 | ⬜ Chưa chạy |
| REQ-E07 | AC-14 | TC-18 | Unit | P2 | ⬜ Chưa chạy |

**Coverage**: 14/14 AC có test (100%). REQ-O01 phủ qua TC-09 (AC-07).

## 2. Test Cases

### TC-01: Schema + migration áp dụng trên DB trống

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-U01 |
| **AC** | AC-01 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | DB sạch |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Schema + migration áp dụng trên DB trống |
| **Kết quả** | ⬜ Chưa chạy |

### TC-02: Account A không đọc được dữ liệu account B

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-U01 |
| **AC** | AC-01 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | 2 account |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Account A không đọc được dữ liệu account B |
| **Kết quả** | ⬜ Chưa chạy |

### TC-03: Hội thoại chưa đọc → MessageEvent

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E01 |
| **AC** | AC-03 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | DOM fixture |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Hội thoại chưa đọc → MessageEvent |
| **Kết quả** | ⬜ Chưa chạy |

### TC-04: Tin mới → một trả lời đã validate được gửi

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E01 |
| **AC** | AC-03 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | fake adapter+LLM |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Tin mới → một trả lời đã validate được gửi |
| **Kết quả** | ⬜ Chưa chạy |

### TC-05: Restart không gửi trùng (ledger/lease)

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-U03 |
| **AC** | AC-02 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | ledger đã ghi |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Restart không gửi trùng (ledger/lease) |
| **Kết quả** | ⬜ Chưa chạy |

### TC-06: Placeholder → câu xác nhận đúng ngôn ngữ

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E02 |
| **AC** | AC-04 |
| **Loại** | Unit |
| **Priority** | P2 |
| **Tiền điều kiện** | tin placeholder |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Placeholder → câu xác nhận đúng ngôn ngữ |
| **Kết quả** | ⬜ Chưa chạy |

### TC-07: Yêu cầu người thật → escalation + sự kiện

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E03 |
| **AC** | AC-05 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | tin 'gặp nhân viên' |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Yêu cầu người thật → escalation + sự kiện |
| **Kết quả** | ⬜ Chưa chạy |

### TC-08: LLM lỗi/validator từ chối → không gửi nội dung chưa kiểm

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E04 |
| **AC** | AC-06 |
| **Loại** | Unit |
| **Priority** | P1 |
| **Tiền điều kiện** | LLM giả lỗi |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | LLM lỗi/validator từ chối → không gửi nội dung chưa kiểm |
| **Kết quả** | ⬜ Chưa chạy |

### TC-09: Giá/tồn kho khớp dữ liệu sản phẩm

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-U02 |
| **AC** | AC-07 |
| **Loại** | Unit |
| **Priority** | P1 |
| **Tiền điều kiện** | product sp001 |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Giá/tồn kho khớp dữ liệu sản phẩm |
| **Kết quả** | ⬜ Chưa chạy |

### TC-10: Takeover chặn auto-reply, release khôi phục

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E05 |
| **AC** | AC-08 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | hội thoại mở |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Takeover chặn auto-reply, release khôi phục |
| **Kết quả** | ⬜ Chưa chạy |

### TC-11: Tin operator vào lịch sử và được gửi

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E06 |
| **AC** | AC-09 |
| **Loại** | Integration |
| **Priority** | P2 |
| **Tiền điều kiện** | đang takeover |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Tin operator vào lịch sử và được gửi |
| **Kết quả** | ⬜ Chưa chạy |

### TC-12: Không quyền → 403, trạng thái không đổi

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-O02 |
| **AC** | AC-10 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | user không quyền |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Không quyền → 403, trạng thái không đổi |
| **Kết quả** | ⬜ Chưa chạy |

### TC-13: Follow-up đúng một lần mỗi tin cuối của khách

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-S02 |
| **AC** | AC-11 |
| **Loại** | Unit |
| **Priority** | P2 |
| **Tiền điều kiện** | hội thoại im lặng |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Follow-up đúng một lần mỗi tin cuối của khách |
| **Kết quả** | ⬜ Chưa chạy |

### TC-14: Bỏ qua khi đã nudge/takeover/ngoài giờ

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-S01 |
| **AC** | AC-11 |
| **Loại** | Unit |
| **Priority** | P2 |
| **Tiền điều kiện** | 3 tình huống |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Bỏ qua khi đã nudge/takeover/ngoài giờ |
| **Kết quả** | ⬜ Chưa chạy |

### TC-15: Start/stop/pause/resume + hub đẩy status

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E05 |
| **AC** | AC-13 |
| **Loại** | Integration |
| **Priority** | P2 |
| **Tiền điều kiện** | supervisor test |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Start/stop/pause/resume + hub đẩy status |
| **Kết quả** | ⬜ Chưa chạy |

### TC-16: Sai mật khẩu/quota/JWT CF sai bị từ chối

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-O03 |
| **AC** | AC-12 |
| **Loại** | Integration |
| **Priority** | P1 |
| **Tiền điều kiện** | user, token sai |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Sai mật khẩu/quota/JWT CF sai bị từ chối |
| **Kết quả** | ⬜ Chưa chạy |

### TC-17: Tạo/cập nhật đơn theo account

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E07 |
| **AC** | AC-14 |
| **Loại** | Integration |
| **Priority** | P2 |
| **Tiền điều kiện** | account có sp |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Tạo/cập nhật đơn theo account |
| **Kết quả** | ⬜ Chưa chạy |

### TC-18: Webhook lỗi không chặn thao tác đơn

| Mục | Chi tiết |
|---|---|
| **Requirement** | REQ-E07 |
| **AC** | AC-14 |
| **Loại** | Unit |
| **Priority** | P2 |
| **Tiền điều kiện** | webhook giả lỗi |
| **Bước thực hiện** | Thiết lập tiền điều kiện → thực thi hành động → quan sát |
| **Expected Output** | Webhook lỗi không chặn thao tác đơn |
| **Kết quả** | ⬜ Chưa chạy |

## 3. Edge Cases & Error Cases

### EC-01: Tin đến đúng lúc agent restart
Expected: ledger/lease ngăn xử lý trùng (AC-02).

### EC-02: Hội thoại bị takeover giữa lúc sinh trả lời
Expected: không gửi tin tự động (AC-08).

## 4. Negative Tests
- Khách spam tin placeholder → mỗi tin tối đa một ack.
- Webhook Sheet không cấu hình → bỏ qua im lặng (AC-14).

## 5. Test Data
- `data/products/sp001`, `tests/fixtures`, `tests/support.py`; mock: fake `PlatformAdapter`, fake `LLM`, webhook giả.

## 6. Tổng kết
18 TC · 14 AC · 14 REQ chính được phủ.
