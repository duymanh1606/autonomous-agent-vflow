# Template: Retrospective Report — Báo cáo Tổng kết

> Được tạo bởi **Retrospective Agent**
> Feature/Sprint: [TÊN]
> Ngày: [YYYY-MM-DD]

---

## 1. Tổng quan Feature/Sprint

| Mục | Giá trị |
|-----|--------|
| **Feature** | [#NNN — Tên feature] |
| **Ngày bắt đầu** | [YYYY-MM-DD] |
| **Ngày hoàn thành** | [YYYY-MM-DD] |
| **Tổng thời gian** | [X ngày] |
| **Spec versions** | v1.0 → v[X.Y] ([N] revisions) |
| **Rework cycles** | [N] (quay lại phase nào) |

---

## 2. Phân tích 5 chiều

### 2.1 🎯 Spec Quality — Chất lượng đặc tả

| Metric | Giá trị | Đánh giá |
|--------|--------|:--------:|
| Requirements rõ ràng ngay từ v1? | [%] | ✅ / ⚠️ / ❌ |
| Số lần phải sửa spec | [N] | ✅ / ⚠️ / ❌ |
| BA Critic rounds | [N] | ✅ / ⚠️ / ❌ |
| Requirements bị miss (phát hiện muộn) | [N] | ✅ / ⚠️ / ❌ |

**Nhận xét**: [phân tích]

### 2.2 📐 Planning Quality — Chất lượng kế hoạch

| Metric | Giá trị | Đánh giá |
|--------|--------|:--------:|
| Plan đúng ngay từ đầu? | Yes/No | ✅ / ⚠️ / ❌ |
| Cần re-plan? | [N] lần | ✅ / ⚠️ / ❌ |
| Task estimation accuracy | [XX]% | ✅ / ⚠️ / ❌ |
| Dependency issues gặp? | [N] | ✅ / ⚠️ / ❌ |

**Nhận xét**: [phân tích]

### 2.3 🛡️ Quality Gates — Hiệu quả cổng chất lượng

| Metric | Giá trị | Đánh giá |
|--------|--------|:--------:|
| Master Check pass lần 1? | Yes/No | ✅ / ⚠️ / ❌ |
| Code Review pass lần 1? | Yes/No | ✅ / ⚠️ / ❌ |
| Issues caught by Master Check | [N] | ✅ / ⚠️ / ❌ |
| Issues leaked to Review | [N] | ✅ / ⚠️ / ❌ |
| Bugs found after deploy | [N] | ✅ / ⚠️ / ❌ |

**Nhận xét**: [phân tích]

### 2.4 ⚙️ Execution Quality — Chất lượng thực hiện

| Metric | Giá trị | Đánh giá |
|--------|--------|:--------:|
| TDD followed? | Yes/No | ✅ / ⚠️ / ❌ |
| Test coverage | [XX]% | ✅ / ⚠️ / ❌ |
| Concerns resolved | [N]/[N] | ✅ / ⚠️ / ❌ |
| Deviations from plan | [N] | ✅ / ⚠️ / ❌ |
| Constitution violations | [N] | ✅ / ⚠️ / ❌ |

**Nhận xét**: [phân tích]

### 2.5 👥 Team & Process

| Metric | Giá trị | Đánh giá |
|--------|--------|:--------:|
| Human response time (avg) | [N] giờ | ✅ / ⚠️ / ❌ |
| Blocked time total | [N] giờ | ✅ / ⚠️ / ❌ |
| Communication issues | [N] | ✅ / ⚠️ / ❌ |

**Nhận xét**: [phân tích]

---

## 3. What Went Well ✅

1. [Điều tốt 1]
2. [Điều tốt 2]
3. [Điều tốt 3]

## 4. What Could Be Improved ⚠️

1. [Cải thiện 1] → **Action**: [hành động cụ thể]
2. [Cải thiện 2] → **Action**: [hành động cụ thể]
3. [Cải thiện 3] → **Action**: [hành động cụ thể]

## 5. What Went Wrong ❌

1. [Vấn đề 1] → **Root cause**: [nguyên nhân] → **Prevention**: [cách phòng tránh]

---

## 6. Action Items

| # | Action | Owner | Deadline | Target |
|---|--------|-------|----------|--------|
| 1 | [hành động] | [ai] | [khi nào] | [agent-config / constitution / knowledge-base] |
| 2 | [hành động] | [ai] | [khi nào] | [mục tiêu] |

---

## 7. Knowledge Base Updates

> Đề xuất cập nhật vào `.v-flow/knowledge/`

| File | Loại update | Nội dung |
|------|:----------:|---------|
| `lessons-learned/[topic].md` | Tạo mới / Cập nhật | [tóm tắt bài học] |
| `patterns/[pattern].md` | Tạo mới / Cập nhật | [pattern mới phát hiện] |
| `domain-glossary.md` | Cập nhật | [thuật ngữ mới] |

---

## 8. Đánh giá tổng thể

| Tiêu chí | Điểm (1-5) |
|----------|:-----------:|
| Spec Quality | /5 |
| Planning Quality | /5 |
| Quality Gates | /5 |
| Execution Quality | /5 |
| Team & Process | /5 |
| **Trung bình** | **/5** |

> **So sánh với feature/sprint trước**: Tốt hơn / Tương đương / Kém hơn — [giải thích]

---

> **Bước tiếp theo**: `/v.metrics` (nếu chưa chạy) → Feature complete
