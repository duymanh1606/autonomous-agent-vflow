# Template: Product Brief
> Dành cho: Product Owner / Project Manager
> Mục đích: Quản lý scope, timeline, dependency, risk

---

## Nguyên tắc viết cho PM/PO
- Cân bằng business + technical context
- Focus vào: Scope rõ ràng, dependency, risk, decision log
- Cần đủ chi tiết để PM/PO breakdown task và estimate
- Highlight assumption và open question
- Có phần thay đổi so với version trước (nếu là update)

---

## CẤU TRÚC TÀI LIỆU

```
# [Tên tính năng / Epic / Change Request]
**Ngày**: [Date] | **BA**: [Name] | **PO/PM**: [Name] | **Phiên bản**: [v0.1]
**Trạng thái**: Draft / In Review / Approved

---

## 1. Mục tiêu
- Business goal: [Tại sao làm tính năng này?]
- Success metric: [Đo thành công bằng gì?]
- Liên kết OKR/KPI: [Nếu có]

---

## 2. Scope

### Trong scope
- [Tính năng / Use case 1]
- [Tính năng / Use case 2]

### Ngoài scope
- [Điều này sẽ KHÔNG được thực hiện trong iteration này]

### Giả định (Assumptions)
- [Assumption 1 — cần confirm với ai?]
- [Assumption 2]

---

## 3. User Stories / Use Cases tổng quan
| # | User Story | Priority | Estimate |
|---|-----------|----------|----------|
| US-01 | Là [role], tôi muốn [action] để [benefit] | Must/Should/Could | [SP/ngày] |
| US-02 | ... | | |

---

## 4. Dependency & Tích hợp
| Dependency | Loại | Team/Hệ thống | Trạng thái |
|-----------|------|---------------|-----------|
| [API từ hệ thống X] | Kỹ thuật | [Team A] | Confirmed / TBD |
| [Phê duyệt từ phòng Y] | Nghiệp vụ | [Phòng Y] | Pending |

---

## 5. Rủi ro & Biện pháp
| Rủi ro | Xác suất | Impact | Biện pháp |
|--------|----------|--------|-----------|
| [Rủi ro 1] | Cao/TB/Thấp | Cao/TB/Thấp | [Mitigation] |

---

## 6. Timeline đề xuất
| Giai đoạn | Nội dung | Bắt đầu | Kết thúc | Owner |
|-----------|----------|---------|---------|-------|
| Analysis | Hoàn thiện requirement | [Date] | [Date] | BA |
| Design | UI/UX + Technical design | [Date] | [Date] | Dev/Design |
| Development | Implement | [Date] | [Date] | Dev |
| Testing | UAT + QA | [Date] | [Date] | QA/PO |
| Release | Deploy production | [Date] | [Date] | DevOps |

---

## 7. Open Questions & Decision Log
| # | Câu hỏi | Người quyết định | Hạn | Quyết định |
|---|---------|-----------------|-----|------------|
| Q1 | [Câu hỏi còn mở] | [Tên] | [Date] | [Pending/Đã quyết định] |

---

## 8. Lịch sử thay đổi
| Phiên bản | Ngày | Thay đổi | Người thực hiện |
|-----------|------|---------|----------------|
| v0.1 | [Date] | Tạo mới | [BA Name] |
```
