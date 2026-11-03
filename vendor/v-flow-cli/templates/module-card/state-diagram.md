<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# State Machine: {Tên Module}
## 1. Sơ Đồ Trạng Thái (State Diagram)
## 2. Chi Tiết Các Trạng Thái (States)
## 3. Quy Tắc Chuyển Đổi (Transitions & Triggers)
## 4. Side-Effects (Hệ quả khi chuyển state)
-->
# State Machine: {Tên Module}

> **Audience chính**: BA, Backend Dev
> **AI generate**: Scan Enums, transition logic, side-effects trong code.
> ⚠️ States và transitions phải lấy TỪ CODE THỰC TẾ. Không bịa.

**Enum file**: `{file_thực}` — enum `{EnumName_thực}`
**Transition logic**: `{service_file_thực}` — các hàm xử lý chuyển state

---

## 1. Sơ Đồ Trạng Thái (State Diagram)

<!-- HƯỚNG DẪN: Vẽ stateDiagram với các states LẤY TỪ ENUM/CONST THỰC TẾ trong code.
Scan: enum Status, enum State, const STATUS_*, và các nơi state được thay đổi.
TUYỆT ĐỐI KHÔNG copy states mẫu (DRAFT, PENDING_APPROVAL...) nếu code không có.
Nếu module KHÔNG có state machine → ghi "Module không có state machine rõ ràng" và mô tả UI states thay thế.
-->

```mermaid
stateDiagram-v2
    [*] --> {STATE_THỰC_1} : {event tạo — từ code}
    {STATE_THỰC_1} --> {STATE_THỰC_2} : {event — từ code}
    {STATE_THỰC_2} --> {STATE_THỰC_3} : {event — từ code}
    {STATE_THỰC_3} --> [*]
```

---

## 2. Chi Tiết Các Trạng Thái (States)

| Trạng Thái (Mã Enum) | Tên Hiển Thị (UI) | Ý Nghĩa / Định Nghĩa | Có thể chuyển tiếp? |
|---|---|---|---|
| `{STATE_THỰC_1}` | {tên UI} | {ý nghĩa} | {✅ mô tả / ❌ final state} |

---

## 3. Quy Tắc Chuyển Đổi (Transitions & Triggers)

> ⚠️ Mỗi transition phải có file reference + điều kiện cụ thể từ code.

| # | Trạng Thái Hiện Tại | Event Kích Hoạt | Trạng Thái Mới | Điều Kiện (Guards) | Actor (Ai được phép) | File Reference |
|---|---|---|---|---|---|---|
| T-01 | `{STATE_1}` | {event từ code} | `{STATE_2}` | {điều kiện từ code} | {actor} | `{file_thực}:{line}` |

**Transitions KHÔNG hợp lệ (code sẽ throw error):**
- {Liệt kê transitions bị cấm từ code thực tế}

---

## 4. Side-Effects (Hệ quả khi chuyển state)

> ⚠️ Ghi rõ side-effects từ code: notification, email, sync, audit log...

| Transition | Side-Effect | Cơ chế | File Reference | Ghi chú |
|---|---|---|---|---|
| → `{STATE}` | {side-effect từ code} | {cơ chế} | `{file_thực}:{line}` | |
