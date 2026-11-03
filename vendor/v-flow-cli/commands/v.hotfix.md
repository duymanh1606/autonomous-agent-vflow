---
description: "Hotfix Flow — O.0 → B.1 → R.1. Dành cho Production Incident P1/P2, skip spec hoàn toàn"
phase: "O.0 → B.1 → R.1"
agents: ["operations-agent", "implement-agent", "review-agent"]
---

# /v.hotfix

Chạy **Hotfix Flow** — pipeline khẩn cấp cho **Production Incident P1/P2**, ưu tiên tốc độ khôi phục, thực hiện phân tích spec sau.

> 🔴 **Chỉ dùng khi**:
> - Production đang down hoặc có vấn đề nghiêm trọng đang xảy ra
> - Incident severity = P1 (Critical, immediate) hoặc P2 (High)
> - Cần deploy fix trong vòng 1-2 giờ

> ❌ **Không dùng cho**:
> - Bug không ảnh hưởng production → `/v.quickfix`
> - Feature mới hoặc improvement → full pipeline
> - P3/P4 incidents → `/v.quickfix`

---

## Phase 0: Incident Assessment (< 5 phút)

Bạn là **Operations Agent** (xem `agents/operations-agent.md`) — xác định nhanh root cause và scope.

### Output: Incident Summary

```markdown
## Incident — [INC-ID]

**Severity**: P1 | P2
**Phát hiện**: [YYYY-MM-DD HH:MM]
**Symptom**: [Mô tả biểu hiện — logs, errors, user reports]
**Bị ảnh hưởng**: [Service/feature nào bị ảnh hưởng]
**Root Cause (hypothesis)**: [Nguyên nhân sơ bộ]

## Fix Plan (sơ bộ)
- Files cần thay đổi: [list]
- Expected fix: [mô tả]
- Rollback plan: [nếu fix không work]

## No-Go Check
- [ ] Fix không đụng vào No-Go Zones ✅

## Routing
→ Proceed to Hotfix Implement
```

---

## Phase 1: Hotfix Implement

Bạn là **Implement Agent** — implement nhanh, focused, có safety net.

### Quy trình (ưu tiên speed + safety)

1. **Đọc Incident Summary** — hiểu root cause
2. **Kiểm tra context.md** — No-Go Zones (bắt buộc, dù khẩn)
3. **Implement minimal fix** — chỉ fix đúng vấn đề, không refactor
4. **Viết smoke test** — test nhanh verify fix hoạt động
5. **Chuẩn bị rollback** — ghi rõ cách rollback nếu cần

### Nguyên tắc Hotfix

```
✅ Minimal change — nhỏ nhất có thể để fix vấn đề
✅ Có rollback plan — phải biết cách undo nếu fail
✅ Smoke test — ít nhất 1 test verify fix
❌ Không refactor — không "tranh thủ" clean code
❌ Không thêm feature — chỉ fix
❌ Không đụng No-Go Zones — dù khẩn cũng không
```

### Routing sau implement

```
Fix sẵn sàng → Phase 2 (Emergency Review)
Fix không đủ → Escalate, cần thêm người hỗ trợ
```

---

## Phase 2: Emergency Review (< 15 phút)

Bạn là **Review Agent** — review nhanh nhưng đảm bảo safety.

### Checklist (phải check đủ, dù nhanh)

```
[ ] Fix address đúng root cause (theo incident summary)?
[ ] Change scope minimal — không có thay đổi "bonus"?
[ ] No-Go Zones không bị đụng vào?
[ ] Có smoke test?
[ ] Rollback plan rõ ràng?
[ ] Không introduce regression rõ ràng?
```

### Verdict

```
APPROVED → Deploy ngay 🚀
APPROVED_WITH_MONITORING → Deploy + monitor chặt 30 phút
HOLD → Vấn đề với fix, cần thêm review
```

---

## Phase 3: Deploy & Verify

```
1. Deploy fix
2. Monitor 15-30 phút — xác nhận incident resolved
3. Thông báo stakeholders: incident resolved
4. Tạo Incident Report: .v-flow/incidents/INC-XXX.md
5. Schedule Post-mortem: /v.retrospective (trong 24-48h)
```

---

## Phase 4: Post-Hotfix (sau khi ổn định)

Sau khi incident under control:

```
[ ] Tạo proper spec cho fix (nếu cần)
[ ] Chạy /v.retrospective — lessons learned
[ ] Cập nhật knowledge/lessons-learned/ nếu có pattern mới
[ ] Xem xét thêm test case vào regression suite
[ ] Update context.md nếu phát hiện No-Go Zone mới
```

---

## Sơ đồ tổng thể

```
Production Incident P1/P2
         ↓
[O.0 Assessment] < 5 min
  → Incident Summary + Root Cause
         ↓
[B.1 Hotfix Implement]
  → Minimal fix + rollback plan + smoke test
         ↓
[R.1 Emergency Review] < 15 min
  → APPROVED / HOLD
         ↓
Deploy 🚀 → Monitor
         ↓
[Post-mortem] trong 24-48h
  → Retrospective + Lessons Learned
```

---

## Incident Severity Guide

| Priority | Mô tả | SLA Fix | Flow |
|----------|-------|---------|------|
| **P1** Critical | Production down, toàn bộ user bị ảnh hưởng | < 1h | Hotfix |
| **P2** High | Feature quan trọng broken, nhiều user bị ảnh hưởng | < 4h | Hotfix |
| **P3** Medium | Bug ảnh hưởng một số user, có workaround | < 24h | Quickfix |
| **P4** Low | Cosmetic, minor issue | Next sprint | Full pipeline |

---

## Cập nhật State & Session

**Tạo `incidents/INC-XXX.md`** (sau khi deploy):
```markdown
# Incident INC-XXX — [Mô tả ngắn]

**Severity**: P[N]
**Detected**: [YYYY-MM-DD HH:MM]
**Resolved**: [YYYY-MM-DD HH:MM]
**Root Cause**: [mô tả]
**Fix**: [mô tả fix]
**Post-mortem**: [pending | done]
```

**Append vào `_session.md`**:
```markdown
### [O.0] Hotfix — [YYYY-MM-DD]
- **Incident**: INC-XXX (P[N])
- **Root Cause**: [mô tả]
- **Fix**: [mô tả]
- **Review**: [APPROVED | HOLD]
- **Post-mortem**: scheduled [date]
- **Routing**: → Deploy → Monitor → /v.retrospective
```

---

## Ví dụ

```
/v.hotfix INC-042 Login API trả về 500 sau deploy lúc 14:30
/v.hotfix INC-043 Payment service không xử lý được transaction mới
```
