<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Tech Context: {Tên Module}
## 1. Key Files
## 2. Architecture Patterns
## 3. Dependencies
### Module này GỌI (outgoing)
### Module khác GỌI module này (incoming)
## 4. Tech Debt & Known Issues
## 5. Test Coverage
-->
# Tech Context: {Tên Module}

> **Audience chính**: Dev, Tech Lead
> **AI generate**: Có Graph → ~100% auto. Không Graph → scan imports/files → ~70% auto

---

## 1. Key Files

> ⚠️ Mỗi file phải có MÔ TẢ VAI TRÒ CỤ THỂ — không chỉ ghi "core logic" hay "xử lý API".
> Phải giải thích file này LÀM GÌ đủ rõ để dev mới đọc hiểu mà không cần mở code.

<!-- HƯỚNG DẪN: List TẤT CẢ files quan trọng trong module.
Đọc TỪNG file để viết mô tả vai trò CỤ THỂ (không phải "xử lý logic").
VD đúng: "Xử lý 5 use cases: load scenarios, open scenario, validate move, check solution, request hint"
VD sai: "Core business logic"
-->

| File | Vai trò CỤ THỂ | LOC | Có Test? | Ghi chú |
|---|---|---|---|---|
| `{file_thực_1}` | {mô tả vai trò cụ thể: file này làm gì, xử lý bao nhiêu operations, gọi dependencies nào} | ~{N} | {✅/❌} | |
| `{file_thực_2}` | {mô tả vai trò cụ thể} | ~{N} | {✅/❌} | |

---

## 2. Architecture Patterns

> ⚠️ Không chỉ liệt kê tên pattern. Mô tả CÁCH module thực sự áp dụng pattern đó — bao gồm cả chỗ vi phạm.

<!-- HƯỚNG DẪN: Phân tích patterns TỪ CODE THỰC TẾ.
Xem cấu trúc thư mục, cách import, flow data giữa các layers.
Ghi rõ cả nơi pattern bị vi phạm (bypass, coupling).
-->

- **{Pattern_thực}**: {Mô tả CÁCH module dùng — bao gồm ngoại lệ/vi phạm nếu có}
- **{Pattern_thực_2}**: {Mô tả}

---

## 3. Dependencies

### Module này GỌI (outgoing)

| Target | Cách gọi | Mục đích | File thực hiện gọi |
|---|---|---|---|
| `{target_thực}` | {DI / import / HTTP / ...} | {mục đích} | `{file_thực}:{line}` |

### Module khác GỌI module này (incoming)

| Caller | Cách gọi | Mục đích | File bị gọi |
|---|---|---|---|
| `{caller_thực}` | {cách gọi} | {mục đích} | `{file_thực}` → hàm `{function_thực}` |

---

## 4. Tech Debt & Known Issues

> ⚠️ Chỉ đích danh file, mô tả vấn đề cụ thể, đánh giá severity.

<!-- HƯỚNG DẪN: Scan code tìm TODO, FIXME, HACK, WORKAROUND, DEPRECATED.
Đếm files > 300 LOC, hàm > 50 LOC.
Đánh giá severity: 🔴 Cao, 🟠 Trung bình, 🟡 Thấp
-->

| # | Vấn đề | Severity | File reference | Ảnh hưởng | Kế hoạch fix |
|---|---|---|---|---|---|
| 1 | {vấn đề cụ thể từ code} | {🔴/🟠/🟡} | `{file_thực}` | {ảnh hưởng} | [❓ CẦN HUMAN BỔ SUNG] |

---

## 5. Test Coverage

| Loại test | Có? | Coverage ước tính | Tool | Ghi chú |
|---|---|---|---|---|
| Unit | {✅/❌} | ~{N}% | {tool} | |
| Integration | {✅/❌} | ~{N}% | {tool} | |
| E2E | {✅/❌} | ~{N}% | {tool} | |

**Files KHÔNG có test** (cần ưu tiên):
- `{file_thực}` — {mô tả}, {N} LOC
