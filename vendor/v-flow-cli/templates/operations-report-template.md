# Template: Operations Report — Báo cáo Vận hành

> Tạo bởi Operations Agent (**O.0**) hoặc thủ công khi có incident.
> Lưu tại: `.v-flow/features/NNN-ten-feature/operations-report.md` hoặc `.v-flow/incidents/INC-NNN.md`

## Thông tin Incident

| Mục | Giá trị |
|-----|--------|
| **Incident ID** | INC-[NNN] |
| **Severity** | 🔴 P1 / 🟡 P2 / 🔵 P3 / ⚪ P4 |
| **Phát hiện lúc** | [YYYY-MM-DD HH:MM UTC] |
| **Phát hiện bởi** | Operations Agent / Manual / Monitoring alert |
| **Resolved lúc** | [YYYY-MM-DD HH:MM UTC] |
| **Duration** | [X phút / giờ] |

---

## 1. Mô tả sự cố

### Triệu chứng
<!-- Mô tả ngắn gọn: cái gì bị lỗi, users thấy gì -->

### Timeline
| Thời gian | Sự kiện |
|-----------|---------|
| [HH:MM] | [Anomaly đầu tiên được phát hiện] |
| [HH:MM] | [Hành động đầu tiên] |
| [HH:MM] | [Fix được deploy] |
| [HH:MM] | [Confirmed resolved] |

---

## 2. Impact — Ảnh hưởng

| Metric | Giá trị |
|--------|--------|
| Users bị ảnh hưởng | |
| Error rate (peak) | |
| Services bị ảnh hưởng | |
| Revenue impact (nếu có) | |

---

## 3. Root Cause Analysis

### Nguyên nhân gốc
<!-- Mô tả chi tiết nguyên nhân -->

### Feature / Component liên quan
| Mục | Giá trị |
|-----|--------|
| Feature | #[NNN] — [Tên feature] |
| Spec | `.v-flow/features/NNN/spec.md` |
| Commit gây lỗi | [commit hash] — [message] |
| File | [path:line] |

### Phân loại nguyên nhân
- [ ] Code bug (logic error, unhandled exception)
- [ ] Data issue (schema mismatch, bad data)
- [ ] Infrastructure (resource exhaustion, config error)
- [ ] External dependency (3rd party API down)
- [ ] Deployment issue (failed migration, config)
- [ ] Khác: ___

---

## 4. Resolution — Giải pháp

### Hành động đã thực hiện
1. [Mô tả fix]

### Fix verification
- [ ] Fix đã deploy
- [ ] Error rate trở về baseline
- [ ] Không có side effects

---

## 5. Lessons Learned & Prevention

### Test gaps phát hiện
<!-- Test cases nào bị thiếu mà nên có? -->
- [ ] [Test case cần thêm]

### Process gaps
<!-- Quy trình nào cần cải thiện? -->
- [ ] [Process improvement]

### Follow-up actions
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| [Thêm test case] | [Tên] | [Date] | [ ] |
| [Cập nhật spec/plan] | [Tên] | [Date] | [ ] |
| [Cập nhật monitoring] | [Tên] | [Date] | [ ] |

---

## 6. Traceability

| Artifact | Link |
|----------|------|
| Spec gốc | `.v-flow/features/NNN/spec.md` |
| Plan gốc | `.v-flow/features/NNN/plan.md` |
| Test cases | `.v-flow/features/NNN/test-cases.md` |
| Metrics report | `.v-flow/features/NNN/metrics-report.md` |
| Fix PR/MR | [link to merge request] |
| Monitoring dashboard | [link to dashboard] |
