# Template: UX Checklist

> Được tạo bởi **UX Agent** — Phase B.0 (optional, `--with-ux`)
> Feature: [TÊN FEATURE]
> Spec Version: [vX.Y]
> Ngày review: [YYYY-MM-DD]

> 📌 Tham chiếu màn hình từ plan §5 (UI/Screen Changes) và token từ `DESIGN.md`.

---

## 1. Usability (Khả dụng)

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| Luồng chính ≤ 3 bước tới mục tiêu? | ✅ / ❌ / N/A | |
| Nhãn nút/label rõ nghĩa (không mơ hồ)? | ✅ / ❌ / N/A | |
| Hành động phá huỷ có xác nhận? | ✅ / ❌ / N/A | |
| Có lối thoát/back/cancel ở mọi bước? | ✅ / ❌ / N/A | |

---

## 2. Accessibility (A11y)

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| Điều hướng bàn phím đầy đủ (focus order)? | ✅ / ❌ / N/A | |
| Label/semantics cho screen reader? | ✅ / ❌ / N/A | |
| Tương phản màu đạt WCAG AA? | ✅ / ❌ / N/A | dùng token `DESIGN.md` |
| Target chạm ≥ 44px? | ✅ / ❌ / N/A | |

---

## 3. States & Feedback

| Màn hình (UC) | empty | loading | error | success | Token DESIGN.md |
|---------------|:-----:|:-------:|:-----:|:-------:|-----------------|
| [Màn hình] (UC-xx) | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | `button-primary`, `input-error`… |

> Mọi trạng thái trong plan §5 phải có thiết kế tương ứng — không bỏ trống loading/error.

---

## 4. Visual Consistency

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| Dùng token `DESIGN.md`, KHÔNG hardcode hex/size? | ✅ / ❌ / N/A | |
| Spacing/typography theo scale design? | ✅ / ❌ / N/A | |
| Component tái sử dụng (không tạo trùng)? | ✅ / ❌ / N/A | |
| Responsive (mobile/tablet/desktop)? | ✅ / ❌ / N/A | |

---

## 5. Phân loại Issues

### 🟠 Major UX Issues
*(Không có)* / Liệt kê nếu có:
- **[UX-M001]** [Mô tả] → Fix: [Đề xuất]

### 🟡 UX Concerns
*(Không có)* / Liệt kê nếu có:
- **[UX-W001]** [Mô tả] → Implement Agent cần chú ý

### 🔵 Recommendations
- **[UX-R001]** [Gợi ý cải thiện]

---

## 6. Verdict

**UX Review**: ✅ PASS / ⚠️ PASS WITH CONCERNS / ❌ FAIL

> **FAIL** nếu thiếu trạng thái thiết yếu (error/loading) hoặc vi phạm a11y nghiêm trọng.

---

> **Reviewer**: UX Agent
> **Mandatory khi**: Feature có UI/UX components (form, danh sách, luồng nhiều bước)
