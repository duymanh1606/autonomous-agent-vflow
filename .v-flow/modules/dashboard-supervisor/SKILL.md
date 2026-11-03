---
name: domain-dashboard-supervisor
version: "1.0"
last_updated: "2026-11-03"
last_updated_by: "v.code-to-slice"
description: "Supervisor đa account + dashboard React: auth, vòng đời agent, hub SSE→WebSocket, đơn hàng, sản phẩm, orchestrator"
user-invocable: false
when_to_use: "dashboard, supervisor, accounts, orders, products, auth, run plan"
---

# Domain: Dashboard & Supervisor

**Complexity**: ⭐⭐⭐⭐
**Last verified**: 2026-11-03 · [⚠️ AI-inferred] — cần Tech Lead xác nhận

## Quick Summary

`dashboard_api/main.py` (FastAPI, ≈96 route) quản lý user/phân quyền workspace, start/stop/pause/resume agent, settings (scenario, reply-style, shipping, language, followups), hội thoại, orders, products, push. `hub.py` gom SSE của từng agent ra WebSocket trình duyệt; `orchestrator.py` chạy một capability trên nhiều account song song/tuần tự. UI ở `dashboard/src` (React + TanStack Query).

## Key Business Rules

- Đăng nhập: cookie HS256, bcrypt; Cloudflare Access RS256 tùy chọn (`cf_access.py`).
- Giới hạn `max-workspaces` theo user; quyền truy cập theo account.
- Run plan tuần tự chờ task hoàn tất theo DB của từng account, không theo delay cố định.
- Mất kết nối SSE được coi là thông tin → notification 'agent disconnected'.

## Key Entities

`users`, `accounts`, `orders`, `products`, `RunPlan`.

## ⚠️ No-Go Zones (trong module này)

- `dashboard_api/auth.py`, `cf_access.py` — bảo mật.

## 📂 Supporting Files

*(chưa có — chạy `/v.understand --module dashboard-supervisor` để sinh use-cases.md, api-specs.md, db.md)*
