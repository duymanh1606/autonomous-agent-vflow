# Template: API Contract

> Được tạo bởi **API Contract Agent** — Phase B.0 (optional, `--with-api`)
> Lưu tại `contracts/api-contract.md`
> Feature: [TÊN FEATURE]
> Spec Version: [vX.Y]

> 📌 Contract là **nguồn chuẩn** để FE và BE làm song song (xem skill Contract-first). Đóng băng contract TRƯỚC khi implement.

---

## 1. Tổng quan

- **Base URL**: `[https://api.example.com/v1]`
- **Auth**: [Bearer JWT / API key / none]
- **Content-Type**: `application/json`
- **Versioning**: [path `/v1` / header `Accept-Version`]

---

## 2. Endpoints

| Method | Path | Mô tả | Auth | New/Sửa | REQ |
|--------|------|-------|:----:|:-------:|-----|
| POST | `/auth/login` | Đăng nhập | ❌ | Mới | REQ-xxx |
| GET | `/products` | Danh sách (paginated) | ✅ | Mới | REQ-xxx |

---

## 3. Request / Response Schemas

### `POST /auth/login`

**Request**
```json
{ "email": "string", "password": "string" }
```

**Response 200**
```json
{ "token": "string", "refreshToken": "string" }
```

> Lặp lại block cho mỗi endpoint. Ghi rõ field bắt buộc/optional, kiểu, ràng buộc.

---

## 4. Error Codes

| HTTP | Code | Mô tả | Khi nào |
|:----:|------|-------|---------|
| 400 | `VALIDATION_ERROR` | Input sai | Field thiếu/sai định dạng |
| 401 | `AUTH_INVALID` | Sai credentials | Login fail |
| 429 | `RATE_LIMITED` | Quá giới hạn | Quá N request |

> Error envelope chuẩn: `{ "error": { "code": "...", "message": "...", "details": [] } }`

---

## 5. Tương thích & Versioning (nếu SỬA contract cũ)

| Endpoint | Field | Thay đổi | Trước | Sau | Breaking? |
|----------|-------|:--------:|-------|-----|:---------:|
| `POST /x` | `status` | Thêm | — | `enum(...)` | Không |

- **Breaking change** → bump version (`/v2`) hoặc Expand-Contract (thêm field mới, giữ field cũ tới khi consumer chuyển hết).
- **Consumer**: [ai đang gọi endpoint này — FE app / 3rd party]

---

> **Author**: API Contract Agent
> **Mandatory khi**: Feature expose API cho client/3rd party, hoặc có cả FE + BE (contract-first)
