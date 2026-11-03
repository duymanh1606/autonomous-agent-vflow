# Spec Review Log — [Feature Name]

> **Mục đích**: Track lịch sử từng round của Dual BA loop  
> **Điều kiện dừng**: 0 Critical + 0 Major (CONVERGED) hoặc Round ≥ 4 (ESCALATE)

---

## Thông tin chung

| Thuộc tính | Giá trị |
|-----------|---------|
| **Feature** | [NNN-ten-feature] |
| **BA Agent** | BA Agent |
| **BA Critic** | BA Critic Agent |
| **Max Rounds** | 4 |
| **Exit Criteria** | No Critical + No Major |
| **Bắt đầu** | YYYY-MM-DD |
| **Trạng thái** | 🔄 In Progress / ✅ CONVERGED / 🛑 ESCALATED |

---

<!-- Thêm mỗi Round bên dưới theo template sau -->

## Round [N] — [YYYY-MM-DD]

**Spec Version đầu round**: v[X.Y]
**Reviewer**: BA Critic Agent *(fresh context — không đọc round trước)*

### Issues Found

| ID | Mức | Mô tả ngắn | Requirement liên quan |
|----|-----|------------|----------------------|
| R[N]-C001 | 🔴 Critical | [Mô tả vấn đề] | REQ-Exx |
| R[N]-M001 | 🟠 Major | [Mô tả vấn đề] | REQ-Uxx |
| R[N]-m001 | 🟡 Minor | [Mô tả vấn đề] | REQ-Sxx |

### Thống kê Round [N]

| Mức | Số lượng |
|-----|---------|
| 🔴 Critical | 0 |
| 🟠 Major | 0 |
| 🟡 Minor | 0 |
| **Tổng** | **0** |

### Verdict Round [N]

> ✅ **CONVERGED** — 0 Critical + 0 Major. Sẵn sàng chạy `/v.plan`  
> ⚠️ **ITERATE** — Còn [N] Critical/Major. BA Agent cần cập nhật spec  
> 🛑 **ESCALATE** — Đã đạt max_rounds = 4. Cần human review trước khi tiếp tục

### BA Agent Response *(chỉ điền nếu ITERATE)*

**Spec Version mới**: v[X.Y+1]

| Issue ID | Hành động | Ghi chú |
|----------|-----------|---------|
| R[N]-C001 | ✅ Đã sửa | [Mô tả cách sửa] |
| R[N]-M001 | ✅ Đã sửa | [Mô tả cách sửa] |
| R[N]-m001 | ⏭️ Bỏ qua | [Lý do không sửa] |

---

## Convergence Summary *(cập nhật sau mỗi round)*

| Round | Spec Version | Critical | Major | Minor | Delta | Verdict |
|-------|-------------|---------|-------|-------|-------|---------|
| 1 | v1.0 | - | - | - | - | - |
| 2 | - | - | - | - | - | - |
| 3 | - | - | - | - | - | - |
| 4 | - | - | - | - | - | - |

**Kết quả cuối**: -  
**Spec Version Final**: -  
**Bước tiếp theo**: -
