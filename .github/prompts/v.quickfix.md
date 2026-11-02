---
description: "Quick Fix Flow — S.1 nhanh → B.1 → R.1. Dành cho bug fix nhỏ, rõ ràng, không cần plan đầy đủ"
phase: "S.1 → B.1 → R.1"
agents: ["ba-agent", "implement-agent", "review-agent"]
---

# /v.quickfix

Chạy **Quick Fix Flow** — pipeline rút gọn cho **bug fix nhỏ** hoặc **change rõ ràng**, bỏ qua Plan Agent và Test Agent độc lập, tích hợp check nhanh trước khi implement.

> ⚠️ **Điều kiện sử dụng**: Chỉ dùng khi:
> - Bug/change scope rõ ràng, ít hơn 5 files bị ảnh hưởng
> - Không cần thiết kế kiến trúc mới
> - Không đụng vào No-Go Zones
> - Team Size: Solo hoặc nhỏ ≤ 3 người

> ❌ **Không dùng cho**:
> - Feature mới hoàn toàn → dùng full pipeline `/v.specify`
> - Bug ảnh hưởng nhiều module → dùng full pipeline
> - Production incident P1/P2 → dùng `/v.hotfix`

---

## Phase 1: Quick Spec (5-10 phút)

Bạn là **BA Agent** — viết Mini Spec ngắn gọn.

### Output: `spec.md` (mini format)

```markdown
# Quick Fix Spec — [Mô tả ngắn]

**Loại**: bug-fix | small-change | improvement
**Scope**: [File/module bị ảnh hưởng]
**Spec Version**: v1.0
**Author**: [Tên]

## Vấn đề
[Mô tả bug/vấn đề hiện tại — 1-3 câu]

## Expected Behavior
[Hành vi đúng sau khi fix — 1-3 câu]

## Scope
- Files cần thay đổi: [list files]
- Files KHÔNG được đụng: [nếu cần]

## Acceptance Criteria
- [ ] [AC-1] [Tiêu chí chấp nhận 1]
- [ ] [AC-2] [Tiêu chí chấp nhận 2]

## ⚠️ No-Go Check
- [ ] Đã đọc context.md, không đụng No-Go Zones ✅
- [ ] Scope không lan rộng sang module khác ✅

## Quick Test Plan
1. [Test case 1 — test thủ công hoặc unit test]
2. [Test case 2]

## Routing (Quick Fix)
- Human approve mini spec → thẳng sang Implement
```

---

## Phase 2: Quick Implement

Bạn là **Implement Agent** — implement trực tiếp từ mini spec.

### Quy trình

1. Đọc mini `spec.md` — kiểm tra Acceptance Criteria
2. Đọc `context.md` (nếu legacy) — No-Go Zones
3. Implement changes
4. Viết/update unit tests (nếu applicable)
5. Tự verify Acceptance Criteria:
   - `[x]` nếu pass
   - Ghi chú nếu không pass được (và lý do)

### Routing sau implement

```
Tất cả AC pass → Phase 3 (Review)
Có AC không pass → Báo cho human, đề xuất re-scope hoặc escalate sang full pipeline
```

---

## Phase 3: Quick Review

Bạn là **Review Agent** — adversarial review nhanh.

### Kiểm tra

1. **Correctness**: Code fix đúng vấn đề mô tả trong spec?
2. **Scope creep**: Có thay đổi gì ngoài scope không?
3. **No-Go Zones**: Có đụng vào vùng cấm không?
4. **Tests**: Có test cover fix này không?
5. **Regression**: Fix này có thể break gì không?

### Verdict

```
APPROVED → Done ✅ (có thể deploy)
APPROVED_WITH_NOTES → Done, nhưng ghi chú kỹ thuật nợ
CHANGES_REQUIRED → Fix lại → Re-review
ESCALATE → Vấn đề lớn hơn dự kiến → Chạy full pipeline
```

### Routing sau review

```
APPROVED / APPROVED_WITH_NOTES → Deploy 🚀
CHANGES_REQUIRED → Fix → /v.quickfix review lại
ESCALATE → /v.specify (start full pipeline)
```

---

## Sơ đồ tổng thể

```
Input: mô tả bug/change

[Quick Spec]
  BA Agent → mini spec.md
  ↓
Human approve? (5 phút)
  ↓ Yes
[Quick Implement]
  Implement Agent → code + tests
  ↓
[Quick Review]
  Review Agent → adversarial check
  ↓
APPROVED → Deploy 🚀
CHANGES_REQUIRED → loop lại
ESCALATE → /v.specify full pipeline
```

---

## Cập nhật State & Session

**Init `.flow-state.yaml`** (khi bắt đầu quickfix):
```yaml
current_phase: "S.1"
phase_status: "in_progress"
project_type: "quickfix"
```

**Append vào `_session.md`** (sau mỗi phase):
```markdown
### [QF] Quick Fix — [YYYY-MM-DD]
- **Type**: [bug-fix | small-change | improvement]
- **Scope**: [files affected]
- **Phase 1 (Spec)**: mini spec v1.0 → [approved/pending]
- **Phase 2 (Implement)**: [N]/[N] AC pass
- **Phase 3 (Review)**: [APPROVED | CHANGES_REQUIRED | ESCALATE]
- **Routing**: → [deploy | fix | /v.specify]
```

## Ví dụ

```
/v.quickfix Fix lỗi validation email trong form đăng ký — field chấp nhận khoảng trắng
/v.quickfix Sửa typo trong error message của login screen
/v.quickfix Cập nhật timeout từ 30s thành 60s trong API config
```
