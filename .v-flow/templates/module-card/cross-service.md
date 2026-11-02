<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Cross-Service Integration: {Tên Module}
## 1. HTTP/REST Calls
### Outgoing (Module này GỌI ra ngoài)
### Incoming (Service khác GỌI module này)
## 2. Message Queue (nếu có)
### Publish (Module này GỬI event)
### Consume (Module này NHẬN event)
## 3. Shared Database (nếu có)
## 4. External Integrations (hệ thống ngoài, nếu có)
## 5. Dependency Map (Tổng quan)
-->
# Cross-Service Integration: {Tên Module}

> **Audience**: Dev, Architect
> **AI generate**: Có Graph → cross-service calls auto-detected. Không Graph → scan HTTP clients, message consumers, external SDK imports.
> ⚠️ Mỗi integration phải ghi rõ: file nào gọi, endpoint/topic gì, payload gì, có retry/fallback không.

---

## 1. HTTP/REST Calls

> Scan: Grep `HttpClient`, `fetch`, `axios`, `dio`, `RestTemplate`, `http.get/post`, `@HttpService` trong module.

### Outgoing (Module này GỌI ra ngoài)

<!-- HƯỚNG DẪN: Liệt kê TẤT CẢ HTTP calls RA NGOÀI module.
Phải scan code tìm http client calls, dio requests, fetch calls...
Ghi rõ file + line number thực tế.
-->

| # | Target Service | Endpoint | Method | Mục đích | File thực hiện gọi | Timeout | Retry? | Circuit Breaker? |
|---|---|---|---|---|---|---|---|---|
| 1 | {service_thực} | `{endpoint_thực}` | {method} | {mục đích} | `{file_thực}:{line}` | {timeout} | {✅/❌} | {✅/❌} |

**Payload chi tiết (nếu có):**

#### Call #1: {mô tả}
```json
// Request
{METHOD} {/endpoint/thực}
{
  "{field}": "{type — mô tả}"
}

// Response
{
  "{field}": "{type — mô tả}"
}

// Error handling: {mô tả cách xử lý lỗi thực tế từ code}
```

### Incoming (Service khác GỌI module này)

| # | Caller Service | Endpoint bị gọi | Method | Mục đích | Controller/Handler |
|---|---|---|---|---|---|
| 1 | {service_thực} | `{endpoint_thực}` | {method} | {mục đích} | `{file_thực}:{line}` |

---

## 2. Message Queue (nếu có)

> Scan: Grep `publish`, `emit`, `subscribe`, `consume`, `@EventHandler`, `@OnEvent`, `Kafka`, `RabbitMQ`, `@MessagePattern`.
> Nếu module KHÔNG dùng message queue → ghi "Không sử dụng" và bỏ chi tiết.

### Publish (Module này GỬI event)

| # | Topic / Queue | Event Name | Khi nào publish | Payload chính | File publish | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | `{topic_thực}` | `{EVENT_thực}` | {điều kiện} | `{fields chính}` | `{file_thực}:{line}` | |

### Consume (Module này NHẬN event)

| # | Topic / Queue | Event Name | Xử lý gì | File consumer | Error handling |
|---|---|---|---|---|---|
| 1 | `{topic_thực}` | `{EVENT_thực}` | {xử lý gì} | `{file_thực}:{line}` | {error handling} |

---

## 3. Shared Database (nếu có)

> ⚠️ Shared DB là antipattern. Ghi lại để awareness và risk management.
> Nếu module KHÔNG share DB → ghi "Không có" và bỏ chi tiết.

| Table | Dùng chung với Module | Đọc/Ghi | Rủi ro | File access |
|---|---|---|---|---|
| `{table_thực}` | {module khác} | {R/W} | {rủi ro} | `{file_thực}:{line}` |

---

## 4. External Integrations (hệ thống ngoài, nếu có)

| # | System | Protocol | Mục đích | SLA / Timeout | Auth | File xử lý | Fallback khi fail |
|---|---|---|---|---|---|---|---|
| 1 | {system_thực} | {protocol} | {mục đích} | {timeout} | {auth} | `{file_thực}` | {fallback} |

---

## 5. Dependency Map (Tổng quan)

<!-- HƯỚNG DẪN: Vẽ mermaid graph với tên service/module THỰC TẾ từ codebase.
KHÔNG copy graph mẫu — phải phản ánh dependencies thực tế đã scan ở trên.
-->

```mermaid
graph LR
    subgraph "Module: {Tên Module}"
        M[{ServiceChính}]
    end

    subgraph "Internal"
        I1[{DependencyNội1}]
    end

    subgraph "External"
        E1[{DependencyNgoài1}]
    end

    M -->|{cách gọi}| I1
    M -->|{cách gọi}| E1

    style M fill:#4CAF50,color:#fff
    style E1 fill:#FF9800,color:#fff
```
