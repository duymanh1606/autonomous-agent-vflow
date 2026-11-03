---
name: domain-handoff-escalation
version: "1.0"
last_updated: "2026-11-03"
last_updated_by: "v.code-to-slice"
description: "Chuyển giao hội thoại cho người: escalation, takeover/release, thông báo dashboard"
user-invocable: false
when_to_use: "handoff, takeover, escalation, notification, alert"
---

# Domain: Handoff & Escalation

**Complexity**: ⭐⭐⭐
**Last verified**: 2026-11-03 · [⚠️ AI-inferred] — cần Tech Lead xác nhận

## Quick Summary

`HumanHandoff` (`services/handoff.py`) là điểm duy nhất biến 'cần người' thành hiển thị: ghi `message_escalations`, phát sự kiện `escalation.opened` (dashboard dựng notification) và log. `storage/conversation_control.py` giữ trạng thái takeover; operator gửi tin tay qua `POST .../messages`.

## Key Business Rules

- Handoff phải bền qua restart (bảng `message_escalations`).
- Hội thoại đang takeover thì agent không tự trả lời; `release` trả quyền cho agent.
- Notification resolve được qua `POST /api/notifications/{id}/resolve`.

## Key Entities

`message_escalations`, `notifications`, `conversation_control`.

## ⚠️ No-Go Zones (trong module này)

- Không bỏ ghi `message_escalations` khi mở handoff.

## 📂 Supporting Files

*(chưa có — chạy `/v.understand --module handoff-escalation` để sinh use-cases.md, api-specs.md, db.md)*
