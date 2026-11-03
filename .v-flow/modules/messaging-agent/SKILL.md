---
name: domain-messaging-agent
version: "1.0"
last_updated: "2026-11-03"
last_updated_by: "v.code-to-slice"
description: "Quét inbox TikTok, phân tích tin, sinh/kiểm tra trả lời bằng LLM, follow-up khách im lặng"
user-invocable: false
when_to_use: "reply tự động, router, scenario, follow-up, summary hội thoại"
---

# Domain: Messaging Agent

**Complexity**: ⭐⭐⭐⭐
**Last verified**: 2026-11-03 · [⚠️ AI-inferred] — cần Tech Lead xác nhận

## Quick Summary

Pipeline theo seam: `MessageAnalyzer` → `MessageRouter` (`MessageRoute`) → `ReplyGenerator` (weak/strong LLM) → `ReplyValidator` → `ReplyService`. LLM truy cập qua `ReplyProvider` nên chạy được không cần credential. `messaging/scan_scheduler.py` và `followup_scheduler.py` kích hoạt theo lịch; trạng thái hội thoại ở `memory/conversation_store.py` (Postgres) với cache in-memory giới hạn 200.

## Key Business Rules

- Tin placeholder không hỗ trợ → trả lời xác nhận riêng (`agent/unsupported_message.py`, `reply_language.unsupported_message_ack`).
- Few-shot kịch bản của operator chỉ định hướng giọng văn, KHÔNG là nguồn giá/tồn kho/đơn/hoàn tiền (`agent/scenario_policy.py`).
- Follow-up chỉ cho hội thoại có tin OUTBOUND cuối và ≥1 tin thật của khách; mỗi (hội thoại, rule, tin cuối của khách) tối đa 1 lần (`messaging/followup_scheduler.py`).
- Tool khả dụng bị lọc theo policy (`agent/tool_policy.py`); tra cứu sản phẩm theo `ProductLookupPolicy`.
- Có `ReplyTimer` ghi thời gian trả lời (`storage/reply_timings.py`).

## Key Entities

`ConversationMessage`, `MessageEvent`, `OutboundMessage`, `ReplyResult`, `CustomerState` (`models/`).

## ⚠️ No-Go Zones (trong module này)

- `agent/reply_validator.py`, `agent/shop_policy.py` — chốt an toàn nội dung.

## 📂 Supporting Files

*(chưa có — chạy `/v.understand --module messaging-agent` để sinh use-cases.md, api-specs.md, db.md)*
