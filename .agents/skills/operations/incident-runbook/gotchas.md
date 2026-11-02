# Incident Runbook — Gotchas & Common Mistakes

## ⚠️ Gotcha 1: Jumping to Fix Without Understanding

**Sai**: Thấy error → sửa ngay dòng code gây lỗi.  
**Đúng**: Triage → Investigate → Understand root cause → THEN fix. Quick patch che giấu vấn đề sâu hơn.

## ⚠️ Gotcha 2: Incorrect Severity

**Sai**: Mọi incident đều P1 vì "user is complaining".  
**Đúng**: P1 = service down / data loss. P2 = major feature broken. Sai severity → sai response → resource waste.

## ⚠️ Gotcha 3: Skipping Post-Mortem

**Sai**: Fix xong → close ticket → move on.  
**Đúng**: Post-mortem bắt buộc cho P1/P2. Ghi lessons learned vào `.v-flow/knowledge/lessons-learned/`.

## ⚠️ Gotcha 4: Modifying No-Go Zones

**Sai**: Emergency = được phép sửa mọi thứ.  
**Đúng**: No-Go Zones vẫn cần Tech Lead approval, kể cả P1. Document lý do nếu phải vi phạm.

## ⚠️ Gotcha 5: No Rollback Plan

**Sai**: Deploy hotfix mà không có rollback strategy.  
**Đúng**: Mỗi hotfix PHẢI có rollback plan. Feature flags preferred over code changes khi possible.
