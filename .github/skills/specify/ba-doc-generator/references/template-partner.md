# Template: Integration Specification
> Dành cho: External Partner / Đối tác tích hợp / Third-party
> Mục đích: Tài liệu kỹ thuật tích hợp hệ thống

---

## Nguyên tắc viết cho Partner/Integration
- Ngôn ngữ chính thức, rõ ràng, không ambiguous
- API contract phải đầy đủ: endpoint, method, header, request, response, error codes
- Có SLA và contact point rõ ràng
- Bao gồm security requirements (auth method, encryption)
- Có môi trường test để partner tích hợp trước khi production

---

## CẤU TRÚC TÀI LIỆU

```
# Integration Specification: [Tên tích hợp]
**Ngày**: [Date] | **Phiên bản**: [v1.0]
**Bên cung cấp**: [Tên công ty / hệ thống của bạn]
**Bên tiếp nhận**: [Tên đối tác]
**Phân loại**: [Confidential / Internal]

---

## 1. Tổng quan tích hợp
- **Mục đích**: [Tích hợp này dùng để làm gì]
- **Loại tích hợp**: REST API / SOAP / File-based / Message Queue
- **Chiều dữ liệu**: [A → B] / [A ↔ B] / [B → A]
- **Tần suất**: Real-time / Batch [X lần/ngày] / Event-driven

---

## 2. Môi trường

| Môi trường | Base URL | Mục đích |
|-----------|----------|----------|
| Development | https://dev-api.[domain].com | Phát triển & unit test |
| Staging | https://staging-api.[domain].com | Integration test |
| Production | https://api.[domain].com | Live |

---

## 3. Authentication & Security

- **Phương thức xác thực**: [API Key / OAuth 2.0 / JWT / Basic Auth]
- **Truyền credential**: Header `Authorization: Bearer {token}`
- **HTTPS**: Bắt buộc cho tất cả môi trường
- **IP Whitelist**: [Danh sách IP nếu có]
- **Cách lấy credential**:
  1. [Bước 1]
  2. [Bước 2]

---

## 4. API Endpoints

### 4.1 [Tên API 1 — ví dụ: Tạo đơn hàng]

| | |
|--|--|
| **Endpoint** | `POST /api/v1/orders` |
| **Content-Type** | `application/json` |
| **Timeout** | 30 giây |

**Request Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
X-Request-ID: {unique_request_id}
```

**Request Body:**
```json
{
  "order_code": "string (required, max 50 chars)",
  "customer_id": "string (required)",
  "amount": "number (required, > 0)",
  "currency": "string (required, ISO 4217: VND/USD)",
  "items": [
    {
      "product_id": "string",
      "quantity": "integer",
      "unit_price": "number"
    }
  ],
  "metadata": {
    "reference_id": "string (optional)"
  }
}
```

**Response 200 — Success:**
```json
{
  "success": true,
  "data": {
    "order_id": "string",
    "status": "PENDING",
    "created_at": "ISO8601 timestamp"
  },
  "request_id": "string"
}
```

**Error Responses:**
| HTTP Code | Error Code | Mô tả | Cách xử lý |
|-----------|-----------|-------|-----------|
| 400 | INVALID_INPUT | Dữ liệu đầu vào không hợp lệ | Kiểm tra lại request body |
| 401 | UNAUTHORIZED | Token không hợp lệ / hết hạn | Refresh token |
| 409 | DUPLICATE_ORDER | order_code đã tồn tại | Dùng order_code khác |
| 429 | RATE_LIMIT | Vượt giới hạn request | Retry sau X giây |
| 500 | INTERNAL_ERROR | Lỗi hệ thống | Liên hệ support |

---

### 4.2 [Tên API 2]
...

---

## 5. Data Dictionary
| Field | Type | Format | Mô tả | Ví dụ |
|-------|------|--------|-------|-------|
| order_code | String | Alphanumeric, max 50 | Mã đơn hàng duy nhất | "ORD-2024-001" |
| amount | Decimal | 15,2 | Số tiền, không âm | 150000.00 |
| currency | String | ISO 4217 | Mã tiền tệ | "VND" |

---

## 6. SLA & Giới hạn

| Chỉ số | Giá trị |
|--------|---------|
| Uptime cam kết | 99.5% |
| Response time (p95) | < 2 giây |
| Rate limit | 100 requests/phút |
| Batch size tối đa | 1000 records/request |
| File size tối đa | 10MB |

---

## 7. Xử lý lỗi & Retry

- **Idempotency**: Dùng `X-Request-ID` để tránh duplicate khi retry
- **Retry policy**: Retry tối đa 3 lần, exponential backoff (1s → 2s → 4s)
- **Không retry**: HTTP 400, 401, 403, 409 (lỗi client)
- **Có thể retry**: HTTP 429, 500, 502, 503, 504

---

## 8. Changelog & Versioning
| Phiên bản | Ngày | Thay đổi |
|-----------|------|---------|
| v1.0 | [Date] | Initial release |

---

## 9. Contact & Support
| Vai trò | Họ tên | Email | Hotline |
|---------|--------|-------|---------|
| BA / Solution Owner | [Tên] | [Email] | |
| Technical Support | [Tên] | [Email] | [Phone] |
| Escalation | [Tên] | [Email] | |
| Giờ hỗ trợ | | | [Thứ 2-6, 8h-17h30] |
```
