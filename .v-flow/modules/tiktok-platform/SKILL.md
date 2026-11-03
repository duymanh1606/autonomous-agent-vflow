---
name: domain-tiktok-platform
version: "1.0"
last_updated: "2026-11-03"
last_updated_by: "v.code-to-slice"
description: "Điều khiển TikTok Web qua Chrome extension/CDP: quan sát DOM, grounding, thực thi hành động"
user-invocable: false
when_to_use: "selector TikTok, inbox watcher, backfill, extension, perception"
---

# Domain: TikTok Platform

**Complexity**: ⭐⭐⭐⭐⭐
**Last verified**: 2026-11-03 · [⚠️ AI-inferred] — cần Tech Lead xác nhận

## Quick Summary

Adapter `TikTokWebAdapter` (`platforms/tiktok_web/`) triển khai `platforms/base.py`; skill TikTok (`inbox_watcher`, `inbox_backfill`, `browsing`, `messaging`) chạy trên `grounding/` (DOM resolver, tọa độ cố định, Gemini grounding làm fallback) và `perception/` (DOM → state parser → vision fallback). Extension MV3 (`extension/`) chạy content script, bridge loopback. Rất phụ thuộc DOM bên thứ ba.

## Key Business Rules

- Ưu tiên DOM resolver; tọa độ cố định/vision chỉ là fallback (`grounding/target_resolver.py`).
- Phát hiện màn hình/lỗi UI qua `ui_states.py`, `models/ui_errors.py`; thất bại có phân loại (`message_errors.py`).
- Hộp "message requests" được quét riêng (`scan_outcomes.py`).

## Key Entities

`DomTarget`, `Observation`, `Action`, `ActionResult`, `MessageDelivery`.

## ⚠️ No-Go Zones (trong module này)

- `extension/manifest.json` quyền trình duyệt; `configs/ui_coordinates.yaml` (hiệu chỉnh tay).

## 📂 Supporting Files

*(chưa có — chạy `/v.understand --module tiktok-platform` để sinh use-cases.md, api-specs.md, db.md)*
