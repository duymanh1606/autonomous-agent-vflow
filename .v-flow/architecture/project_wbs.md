approved_by: AutoSystem (V-Flow WBS Synthesizer)
approved_at: 2026-11-03

# PROJECT WBS — Autonomous TikTok UI Agent (autonomous-agent-vflow)

Baseline **as-built** tái dựng từ mã nguồn dự án qua V-Flow WBS Synthesizer (`/v.wbs`).
Nguồn: cây thư mục mã nguồn + `compose.yaml` + `pyproject.toml` + `dashboard/package.json`
+ `storage/migrations/` + Module Cards `.v-flow/modules/` + `.v-flow/context.md`.

- Quy tắc đặt mã: `OPS-NN` (hạ tầng) · `BE-DAT-NN` (dữ liệu) · `BE-<MOD>-NN` (nghiệp vụ BE)
  · `INT-<MOD>-NN` (hợp đồng tích hợp) · `SCR-<NAME>` (màn hình) · `WGT-<NAME>` (component).
- Mỗi unit là **một** Work Unit duy nhất; `evidence_path` trỏ tới mã nguồn thật trong repo.
- Unit chưa có task V-Flow tương ứng được ghi `tasks: —` trong Catalog; ánh xạ unit ↔ task
  sống ở `.v-flow/architecture/wbs-task-map.yaml` (nguồn cho Slice-to-VFlow Adapter).

---

## Function Decomposition Tree

```text
AUTONOMOUS TIKTOK UI AGENT (ATA)
├── [OPS] Infrastructure & Runtime
│   ├── OPS-01  Container Runtime & Compose
│   ├── OPS-02  Dashboard nginx Reverse Proxy & VNC auth_request
│   ├── OPS-03  Systemd Supervisor Service & Virtual Display
│   ├── OPS-04  Cloudflare Tunnel & Access
│   ├── OPS-05  Backup & Restore Check
│   ├── OPS-06  Maintenance Timer
│   ├── OPS-07  CI Pipeline, Test Suite & Env Check
│   ├── OPS-08  Extension Packaging & Enterprise Policy
│   └── OPS-09  Agent Runtime Entrypoint & Config Loader
│
├── [DAT] Data Persistence
│   ├── BE-DAT-01  Database Schema & SQL Migrations
│   ├── BE-DAT-02  Tenant Isolation (RLS by account_id)
│   ├── BE-DAT-03  Repositories & Conversation Store
│   └── BE-DAT-04  Domain Models & DTO
│
├── [AGT] Agent Runtime (per-account)
│   ├── BE-AGT-01  Inbox Watcher & Scan Scheduler
│   ├── BE-AGT-02  Inbox Ledger, Dedupe & Lease
│   ├── BE-AGT-03  Message Analyzer & Scenario Router
│   ├── BE-AGT-04  Reply Generator, Validator, Language & Timing
│   ├── BE-AGT-05  TikTok Web Adapter & UI Action Executor
│   ├── BE-AGT-06  LangGraph Workflow & Checkpoint
│   ├── BE-AGT-07  Recovery & State Verifier
│   ├── BE-AGT-08  Follow-up Scheduler & Policy
│   ├── BE-AGT-09  Escalation & Human-Takeover Gate
│   ├── BE-AGT-10  Agent Control Server & Event Bus
│   ├── BE-AGT-11  Gemini LLM Client & Vision Fallback
│   ├── BE-AGT-12  Policy-gated Actions & Tool Registry
│   └── BE-AGT-13  Product Lookup & Customer Memory
│
├── [SUP] Supervisor API (dashboard_api)
│   ├── BE-SUP-01  Operator Auth & Session
│   ├── BE-SUP-02  User & Workspace Access Admin
│   ├── BE-SUP-03  Workspace Lifecycle & Process Manager
│   ├── BE-SUP-04  Conversations, Takeover & Manual Send
│   ├── BE-SUP-05  Product Management & Media
│   ├── BE-SUP-06  Order & Shipping Management
│   ├── BE-SUP-07  Account Behavior Config
│   ├── BE-SUP-08  Translation & Chat Attachments
│   ├── BE-SUP-09  Notifications, Web Push, Email & Alerts
│   ├── BE-SUP-10  EGW Egress Gateway Integration
│   ├── BE-SUP-11  Orchestrated Runs
│   ├── BE-SUP-12  Realtime Event Hub
│   ├── BE-SUP-13  Logs, Health Monitor & Healthz
│   ├── BE-SUP-14  Google Sheet Export
│   └── BE-SUP-15  Global Search
│
├── [EXT] Chrome Extension Bridge
│   ├── BE-EXT-01  DOM Observer & Extractor
│   ├── BE-EXT-02  Action Executor
│   └── BE-EXT-03  Background Bridge to Local Agent
│
├── [INT] Integration Contracts
│   ├── Nội bộ:
│   │   ├── INT-SUP-01  Supervisor Public API /api/*
│   │   ├── INT-SUP-02  Realtime Events /api/events (WebSocket)
│   │   ├── INT-AGT-01  Agent Control API /control/*
│   │   ├── INT-AGT-02  Agent Event Stream /control/events (SSE)
│   │   └── INT-EXT-01  Extension ↔ Local Agent Bridge (127.0.0.1:8765)
│   └── Bên thứ ba:
│       ├── INT-LLM-01    Google Gemini generateContent
│       ├── INT-SHEET-01  Google Apps Script Sheet Webhook
│       ├── INT-EGW-01    EGW Egress Gateway Admin API
│       ├── INT-CFA-01    Cloudflare Tunnel & Access
│       ├── INT-PUSH-01   Web Push (VAPID)
│       └── INT-MAIL-01   SMTP Email
│
└── [UI] Operator Dashboard SPA
    ├── Screens:
    │   ├── SCR-AUTH            Đăng nhập / Đăng ký / Quên mật khẩu
    │   ├── SCR-RESET-PASSWORD  Đặt lại mật khẩu
    │   ├── SCR-HOME            Danh sách Workspace
    │   ├── SCR-DASHBOARD       Dashboard & Runs
    │   ├── SCR-ACTIVITY        Dòng sự kiện realtime
    │   ├── SCR-ALERTS          Cảnh báo & Thông báo
    │   ├── SCR-LOGS            Log & Health
    │   ├── SCR-CUSTOMERS       Khách hàng & Hội thoại
    │   ├── SCR-ORDERS          Đơn hàng
    │   ├── SCR-PRODUCTS        Sản phẩm
    │   ├── SCR-SCENARIO        Kịch bản trả lời
    │   ├── SCR-SETTINGS        Cấu hình account
    │   ├── SCR-SHIPPING        Cấu hình vận chuyển
    │   └── SCR-USERS-ADMIN     Quản trị người dùng
    └── Widgets:
        ├── WGT-APP-SHELL       App Shell, Router & Auth Gate
        ├── WGT-API-CLIENT      API Client & Realtime Hook
        ├── WGT-UI-KIT          UI Primitives (Modal/Toast/NumberInput/ErrorBoundary/Icons)
        ├── WGT-SIDEBAR         Sidebar điều hướng
        ├── WGT-TOPBAR          Topbar
        ├── WGT-COMMAND-PALETTE Command Palette
        ├── WGT-ACCOUNT-DIALOG  Dialog tạo/sửa Workspace
        ├── WGT-FORCE-CHANGE-PASSWORD  Buộc đổi mật khẩu
        └── WGT-PRODUCT-PICKER  Chọn sản phẩm trong hội thoại/đơn
```

---

## Work Unit Catalog

> `consumes` = unit mà unit này gọi/phụ thuộc · `used_by` = unit tiêu thụ nó ·
> `evidence_path` = bằng chứng mã nguồn · `tasks` = task V-Flow trong `tasks.md` (— nếu chưa có).

### [OPS] Infrastructure & Runtime — `type: infrastructure`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| OPS-01 | Container Runtime & Compose | — | OPS-02, BE-DAT-01 | `compose.yaml`, `dashboard/Dockerfile`, `.env.example` | — |
| OPS-02 | Dashboard nginx Reverse Proxy & VNC auth_request | OPS-01, INT-SUP-01 | WGT-API-CLIENT, INT-CFA-01 | `dashboard/nginx.conf.template`, `deploy/nginx-reverse-proxy.conf` | — |
| OPS-03 | Systemd Supervisor Service & Virtual Display | OPS-09 | BE-SUP-03 | `deploy/install_systemd_service.sh`, `deploy/setup_virtual_display.sh`, `deploy/update.sh` | — |
| OPS-04 | Cloudflare Tunnel & Access | OPS-02, INT-CFA-01 | BE-SUP-01 | `deploy/install_cloudflared.sh`, `dashboard_api/cf_access.py` | T-014 |
| OPS-05 | Backup & Restore Check | OPS-01, BE-DAT-01 | — | `deploy/backup.sh`, `deploy/install_backup_timer.sh`, `deploy/restore_check.sh` | — |
| OPS-06 | Maintenance Timer | BE-DAT-03 | — | `scripts/run_maintenance.py`, `deploy/install_maintenance_timer.sh`, `storage/maintenance.py` | — |
| OPS-07 | CI Pipeline, Test Suite & Env Check | — | — | `.github/workflows/ci.yml`, `.github/workflows/v-flow-validate.yml`, `deploy/check_env.sh`, `tests/`, `pyproject.toml`, `dashboard/package.json`, `dev.sh`, `deploy.sh`, `check_auth.py` | — |
| OPS-08 | Extension Packaging & Enterprise Policy | BE-EXT-03 | BE-EXT-01, BE-EXT-02 | `scripts/pack_extension.sh`, `scripts/install_extension_policy.sh`, `extension/manifest.json` | — |
| OPS-09 | Agent Runtime Entrypoint & Config Loader | BE-AGT-06 | OPS-03, BE-SUP-03 | `main.py`, `load_config.py`, `configs/config.yaml`, `configs/accounts/`, `configs/ui_coordinates.yaml`, `submit_task.py`, `scripts/migrate_account_configs.py`, `scripts/gen_code_map.py`, `data/` | — |

### [DAT] Data Persistence — `type: backend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| BE-DAT-01 | Database Schema & SQL Migrations | OPS-01 | BE-DAT-02, BE-DAT-03, OPS-05 | `storage/schema.sql`, `storage/migrations/*.sql`, `storage/database.py` | T-001 |
| BE-DAT-02 | Tenant Isolation (RLS by account_id) | BE-DAT-01 | BE-DAT-03 | `storage/tenancy.py`, `storage/scope.py` | T-002 |
| BE-DAT-03 | Repositories & Conversation Store | BE-DAT-01, BE-DAT-02, BE-DAT-04 | mọi `BE-AGT-*`, `BE-SUP-*` | `storage/repositories.py`, `storage/conversation_context.py`, `storage/conversation_control.py`, `storage/reply_timings.py`, `storage/llm_usage.py`, `storage/product_repository.py`, `storage/audit.py`, `storage/paths.py`, `memory/conversation_store.py`, `memory/processed_messages.py` | — |
| BE-DAT-04 | Domain Models & DTO | — | BE-DAT-03, BE-AGT-*, BE-SUP-* | `models/*.py` | — |

### [AGT] Agent Runtime — `type: backend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| BE-AGT-01 | Inbox Watcher & Scan Scheduler | BE-AGT-05 | BE-AGT-02 | `platforms/tiktok/inbox_watcher.py`, `platforms/tiktok/inbox_backfill.py`, `platforms/tiktok/scan_outcomes.py`, `messaging/scan_scheduler.py`, `messaging/runtime.py` | T-003 |
| BE-AGT-02 | Inbox Ledger, Dedupe & Lease | BE-AGT-01, BE-DAT-03 | BE-AGT-06 | `storage/inbox_ledger.py` | T-003 |
| BE-AGT-03 | Message Analyzer & Scenario Router | BE-AGT-02, BE-AGT-11, BE-AGT-13 | BE-AGT-04, BE-AGT-09 | `agent/message_analyzer.py`, `agent/message_router.py`, `agent/scenario_policy.py`, `agent/shop_policy.py`, `core/router.py` | T-005 |
| BE-AGT-04 | Reply Generator, Validator, Language & Timing | BE-AGT-03, BE-AGT-11, BE-SUP-07 | BE-AGT-05, BE-AGT-12 | `agent/reply_generator.py`, `agent/reply_validator.py`, `agent/reply_language.py`, `agent/reply_timing.py`, `agent/reply_service.py`, `agent/unsupported_message.py` | T-004, T-007 |
| BE-AGT-05 | TikTok Web Adapter & UI Action Executor | BE-AGT-12, BE-EXT-03 | BE-AGT-01, BE-AGT-07 | `platforms/tiktok_web/`, `platforms/tiktok/messaging.py`, `platforms/tiktok/browsing.py`, `platforms/tiktok/screens.py`, `platforms/base.py`, `grounding/`, `perception/browser_observer.py`, `perception/dom_observer.py`, `tools/browser.py`, `data_collection/` | — |
| BE-AGT-06 | LangGraph Workflow & Checkpoint | BE-AGT-02, BE-DAT-03 | OPS-09, BE-AGT-10 | `core/graph.py`, `core/agent.py`, `core/checkpoint.py`, `core/state.py`, `core/memory.py`, `core/schedule.py`, `core/scheduler.py`, `core/llm_planner.py`, `agent/state_manager.py` | — |
| BE-AGT-07 | Recovery & State Verifier | BE-AGT-05 | BE-AGT-06 | `core/recovery.py`, `core/state_verifier.py`, `perception/state_parser.py` | — |
| BE-AGT-08 | Follow-up Scheduler & Policy | BE-SUP-07, BE-DAT-03 | BE-AGT-06 | `messaging/followup_scheduler.py`, `agent/followup_policy.py` | T-011, T-012 |
| BE-AGT-09 | Escalation & Human-Takeover Gate | BE-AGT-03, INT-AGT-01 | BE-SUP-09, BE-SUP-04 | `services/escalation.py`, `services/handoff.py`, `storage/conversation_control.py` | T-006 |
| BE-AGT-10 | Agent Control Server & Event Bus | BE-AGT-06 | INT-AGT-01, INT-AGT-02 | `control/server.py`, `control/auth.py`, `control/events.py`, `control/settings.py`, `control/state.py` | — |
| BE-AGT-11 | Gemini LLM Client & Vision Fallback | INT-LLM-01 | BE-AGT-03, BE-AGT-04 | `llm/gemini_flash_lite.py`, `llm/base.py`, `ai/client.py`, `perception/vision_fallback.py`, `grounding/gemini_grounding.py` | — |
| BE-AGT-12 | Policy-gated Actions & Tool Registry | BE-AGT-04 | BE-AGT-05 | `core/policy.py`, `core/logging_safety.py`, `agent/tool_policy.py`, `tools/registry.py`, `tools/business.py`, `tools/base.py`, `skills/registry.py`, `skills/base.py` | — |
| BE-AGT-13 | Product Lookup & Customer Memory | BE-DAT-03, BE-SUP-05 | BE-AGT-03 | `agent/product_lookup.py`, `memory/summary_service.py`, `services/media_cache.py`, `services/metrics.py`, `core/memory.py` | T-008 |

### [SUP] Supervisor API — `type: backend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| BE-SUP-01 | Operator Auth & Session | BE-DAT-03, OPS-04 | mọi `BE-SUP-*`, SCR-AUTH | `dashboard_api/auth.py`, `dashboard_api/cf_access.py`, `dashboard_api/security_config.py`, `dashboard_api/create_admin.py` | T-013 |
| BE-SUP-02 | User & Workspace Access Admin | BE-SUP-01 | SCR-USERS-ADMIN | `dashboard_api/users.py`, `dashboard_api/main.py` | — |
| BE-SUP-03 | Workspace Lifecycle & Process Manager | BE-SUP-01, OPS-03, OPS-09, INT-AGT-01 | SCR-HOME, SCR-DASHBOARD | `dashboard_api/processes.py`, `dashboard_api/accounts.py`, `dashboard_api/sleep_wake.py`, `dashboard_api/control_writer.py` | T-013 |
| BE-SUP-04 | Conversations, Takeover & Manual Send | BE-DAT-03, BE-AGT-09, INT-AGT-01 | SCR-CUSTOMERS | `dashboard_api/main.py`, `dashboard_api/db_reader.py` | T-009, T-010 |
| BE-SUP-05 | Product Management & Media | BE-DAT-03 | SCR-PRODUCTS, BE-AGT-13 | `dashboard_api/routes/products.py`, `storage/product_repository.py` | — |
| BE-SUP-06 | Order & Shipping Management | BE-DAT-03 | SCR-ORDERS, SCR-SHIPPING, BE-SUP-14 | `dashboard_api/orders.py`, `dashboard_api/routes/orders.py` | T-015 |
| BE-SUP-07 | Account Behavior Config | BE-DAT-03, INT-AGT-01 | SCR-SCENARIO, SCR-SETTINGS, BE-AGT-04, BE-AGT-08 | `dashboard_api/account_config.py`, `dashboard_api/main.py` | — |
| BE-SUP-08 | Translation & Chat Attachments | BE-SUP-04, INT-LLM-01 | SCR-CUSTOMERS | `dashboard_api/translations.py`, `dashboard_api/routes/translations.py`, `dashboard_api/routes/chat_media.py` | — |
| BE-SUP-09 | Notifications, Web Push, Email & Alerts | BE-AGT-09, BE-SUP-13, INT-PUSH-01, INT-MAIL-01 | SCR-ALERTS | `dashboard_api/notifications.py`, `dashboard_api/web_push.py`, `dashboard_api/mailer.py`, `dashboard_api/alerts.py`, `dashboard_api/routes/push.py` | — |
| BE-SUP-10 | EGW Egress Gateway Integration | BE-SUP-01, INT-EGW-01 | SCR-HOME | `dashboard_api/egw.py` | — |
| BE-SUP-11 | Orchestrated Runs | BE-SUP-03 | SCR-DASHBOARD | `dashboard_api/orchestrator.py` | — |
| BE-SUP-12 | Realtime Event Hub | INT-AGT-02 | INT-SUP-02, SCR-ACTIVITY | `dashboard_api/hub.py` | — |
| BE-SUP-13 | Logs, Health Monitor & Healthz | BE-SUP-03 | SCR-LOGS, BE-SUP-09 | `dashboard_api/logs.py`, `dashboard_api/health_monitor.py`, `dashboard_api/main.py` | — |
| BE-SUP-14 | Google Sheet Export | BE-SUP-06, INT-SHEET-01 | — | `integrations/sheet_export.py`, `integrations/apps_script/`, `scripts/backfill_sheet_export.py` | T-016 |
| BE-SUP-15 | Global Search | BE-DAT-03 | WGT-COMMAND-PALETTE | `dashboard_api/search.py` | — |

### [EXT] Chrome Extension Bridge — `type: backend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| BE-EXT-01 | DOM Observer & Extractor | OPS-08 | BE-EXT-03 | `extension/dom/observer.js`, `extractor.js`, `locator.js`, `state_detector.js`, `notification_hook.js`, `extension/content.js` | — |
| BE-EXT-02 | Action Executor | OPS-08, BE-EXT-03 | — | `extension/actions/*.js`, `extension/platforms/tiktok.js`, `extension/platforms/registry.js` | — |
| BE-EXT-03 | Background Bridge to Local Agent | BE-EXT-01, INT-EXT-01 | BE-AGT-05, BE-EXT-02 | `extension/background.js`, `extension/manifest.json` | — |

### [INT] Integration Contracts — `type: integration`

| ID | Tên | provider → consumers | giao thức | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| INT-SUP-01 | Supervisor Public API /api/* | SUP → UI | REST/JSON, cookie JWT | `dashboard_api/main.py`, `dashboard/src/lib/api.ts` | — |
| INT-SUP-02 | Realtime Events /api/events | SUP → UI | WebSocket | `dashboard_api/hub.py`, `dashboard/src/hooks/useEvents.ts` | — |
| INT-AGT-01 | Agent Control API /control/* | AGT → SUP | REST/JSON, `X-Control-Token` | `control/server.py`, `dashboard_api/control_writer.py` | — |
| INT-AGT-02 | Agent Event Stream /control/events | AGT → SUP | SSE | `control/events.py`, `dashboard_api/hub.py` | — |
| INT-EXT-01 | Extension ↔ Local Agent Bridge | EXT → AGT | HTTP `127.0.0.1:8765`, `X-Agent-Token` | `extension/background.js`, `control/server.py` | — |
| INT-LLM-01 | Google Gemini generateContent | bên thứ ba → AGT, SUP | HTTPS REST, `GEMINI_API_KEY` | `llm/gemini_flash_lite.py`, `ai/client.py` | — |
| INT-SHEET-01 | Google Apps Script Sheet Webhook | bên thứ ba → SUP | HTTPS POST, `GSHEET_WEBHOOK_URL` | `integrations/sheet_export.py`, `integrations/apps_script/` | T-016 |
| INT-EGW-01 | EGW Egress Gateway Admin API | bên thứ ba → SUP | HTTPS REST | `dashboard_api/egw.py` | — |
| INT-CFA-01 | Cloudflare Tunnel & Access | bên thứ ba → OPS, SUP | Tunnel + JWT assertion | `deploy/install_cloudflared.sh`, `dashboard_api/cf_access.py` | T-014 |
| INT-PUSH-01 | Web Push (VAPID) | bên thứ ba → SUP | Web Push protocol | `dashboard_api/web_push.py`, `dashboard/src/lib/webPush.ts` | — |
| INT-MAIL-01 | SMTP Email | bên thứ ba → SUP | SMTP | `dashboard_api/mailer.py`, `dashboard/src/lib/email.ts` | — |

### [UI] Screens — `type: frontend`

| ID | Tên | consumes | evidence_path | tasks |
|:---|:---|:---|:---|:---|
| SCR-AUTH | Đăng nhập / Đăng ký / Quên mật khẩu | BE-SUP-01, WGT-API-CLIENT | `dashboard/src/routes/Auth.tsx` | T-013 |
| SCR-RESET-PASSWORD | Đặt lại mật khẩu | BE-SUP-01 | `dashboard/src/routes/ResetPassword.tsx` | — |
| SCR-HOME | Danh sách Workspace | BE-SUP-03, BE-SUP-10 | `dashboard/src/routes/HomePage.tsx` | — |
| SCR-DASHBOARD | Dashboard & Runs | BE-SUP-03, BE-SUP-11, BE-SUP-12 | `dashboard/src/routes/Dashboard.tsx` | — |
| SCR-ACTIVITY | Dòng sự kiện realtime | BE-SUP-12, INT-SUP-02 | `dashboard/src/routes/ActivityPage.tsx` | — |
| SCR-ALERTS | Cảnh báo & Thông báo | BE-SUP-09 | `dashboard/src/routes/AlertsPage.tsx` | — |
| SCR-LOGS | Log & Health | BE-SUP-13 | `dashboard/src/routes/LogsPage.tsx` | — |
| SCR-CUSTOMERS | Khách hàng & Hội thoại | BE-SUP-04, BE-SUP-08, WGT-PRODUCT-PICKER | `dashboard/src/routes/Customers.tsx` | T-009 |
| SCR-ORDERS | Đơn hàng | BE-SUP-06 | `dashboard/src/routes/Orders.tsx`, `dashboard/src/lib/orderForm.ts` | T-015 |
| SCR-PRODUCTS | Sản phẩm | BE-SUP-05 | `dashboard/src/routes/Products.tsx`, `dashboard/src/lib/productForm.ts`, `productSearch.ts` | — |
| SCR-SCENARIO | Kịch bản trả lời | BE-SUP-07 | `dashboard/src/routes/Scenario.tsx` | — |
| SCR-SETTINGS | Cấu hình account | BE-SUP-07 | `dashboard/src/routes/Settings.tsx` | — |
| SCR-SHIPPING | Cấu hình vận chuyển | BE-SUP-06 | `dashboard/src/routes/Shipping.tsx` | — |
| SCR-USERS-ADMIN | Quản trị người dùng | BE-SUP-02 | `dashboard/src/routes/UsersAdmin.tsx` | — |

### [UI] Widgets — `type: frontend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| WGT-APP-SHELL | App Shell, Router & Auth Gate | BE-SUP-01, WGT-API-CLIENT | mọi `SCR-*` | `dashboard/src/App.tsx`, `main.tsx`, `styles.css`, `index.html` | — |
| WGT-API-CLIENT | API Client & Realtime Hook | INT-SUP-01, INT-SUP-02 | mọi `SCR-*` | `dashboard/src/lib/api.ts`, `hooks/useEvents.ts`, `lib/id.ts`, `lib/format.ts`, `lib/labels.ts` | — |
| WGT-UI-KIT | UI Primitives | — | mọi `SCR-*` | `dashboard/src/components/Modal.tsx`, `Toast.tsx`, `NumberInput.tsx`, `ErrorBoundary.tsx`, `components/ui/icons.tsx` | — |
| WGT-SIDEBAR | Sidebar điều hướng | WGT-API-CLIENT | SCR-HOME, SCR-DASHBOARD | `dashboard/src/components/Sidebar.tsx` | — |
| WGT-TOPBAR | Topbar | WGT-API-CLIENT | SCR-HOME, SCR-DASHBOARD | `dashboard/src/components/Topbar.tsx` | — |
| WGT-COMMAND-PALETTE | Command Palette | BE-SUP-15 | SCR-DASHBOARD | `dashboard/src/components/CommandPalette.tsx` | — |
| WGT-ACCOUNT-DIALOG | Dialog tạo/sửa Workspace | BE-SUP-03 | SCR-HOME | `dashboard/src/components/AccountDialog.tsx` | — |
| WGT-FORCE-CHANGE-PASSWORD | Buộc đổi mật khẩu | BE-SUP-01 | SCR-AUTH | `dashboard/src/components/ForceChangePassword.tsx` | — |
| WGT-PRODUCT-PICKER | Chọn sản phẩm | BE-SUP-05 | SCR-CUSTOMERS, SCR-ORDERS | `dashboard/src/components/ProductPicker.tsx` | — |

---

## Thống kê Coverage

| Nhóm | Số unit |
|:---|---:|
| OPS — Infrastructure & Runtime | 9 |
| BE-DAT — Data Persistence | 4 |
| BE-AGT — Agent Runtime | 13 |
| BE-SUP — Supervisor API | 15 |
| BE-EXT — Chrome Extension | 3 |
| INT — Integration Contracts | 11 |
| SCR — Screens | 14 |
| WGT — Widgets | 9 |
| **Tổng** | **78** |

> **AC-1 (WBS Invariant)**: mọi thư mục mã nguồn cấp 1 của repo (`agent/`, `ai/`, `control/`, `core/`,
> `dashboard/`, `dashboard_api/`, `data_collection/`, `deploy/`, `extension/`, `grounding/`,
> `integrations/`, `llm/`, `memory/`, `messaging/`, `models/`, `perception/`, `platforms/`,
> `scripts/`, `services/`, `skills/`, `storage/`, `tools/`, `configs/`, `data/`, `tests/`, `.github/workflows/`)
> đều có ít nhất một unit nhận trách nhiệm — xem cột `evidence_path`.
