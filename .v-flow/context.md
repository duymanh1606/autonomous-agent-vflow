# context.md — Codebase Understanding Report

> **Phase**: U.0 (Understand) · **Dự án**: autonomous-agent-vflow (`autonomous-tiktok-ui-agent`)
> **Cập nhật lần cuối**: 2026-11-03 (AI scan qua `/v.code-to-slice`) · **Người review**: *(Tech Lead cần review)*
> Các mục `[⚠️ AI-inferred]` suy ra từ code, chưa được con người xác nhận.

## 1. Tech Stack Thực Tế

| Hạng mục | Công nghệ |
|----------|-----------|
| Ngôn ngữ | Python ≥3.10 (agent, API) · TypeScript/React 18 (dashboard) · JavaScript (Chrome extension) · Google Apps Script |
| Backend | FastAPI + uvicorn (`dashboard_api/`, `control/`), LangGraph (`core/graph.py`), Playwright, SSE + WebSocket |
| Package manager | `uv` (`pyproject.toml`, `uv.lock`); `npm` + Vite cho `dashboard/` |
| Database | PostgreSQL 16 (psycopg3), schema `storage/schema.sql` + `storage/migrations/*.sql`; checkpoint LangGraph trong Postgres |
| LLM | Gemini (`gemini-3.1-flash-lite` mặc định, `llm/`, `ai/client.py`), có strong LLM fallback |
| Testing | `pytest`/`unittest` (127 file trong `tests/`), `vitest` cho dashboard |
| CI/CD | `.github/workflows/ci.yml`, `v-flow-validate.yml` |
| Deployment | `compose.yaml` (postgres + dashboard nginx), systemd/cloudflared/backup scripts trong `deploy/` |

## 2. Kiến Trúc Thực Tế

Agent tự động chăm sóc khách trên **TikTok Web (inbox DM)** qua Chrome. Mỗi *account* có một tiến trình agent riêng; một *supervisor* (`dashboard_api`) quản lý nhiều account và phục vụ dashboard.

```
Chrome (TikTok Web) ⇄ extension/ (content/background JS, bridge loopback)
        ⇅
platforms/tiktok_web  ─ perception/ ─ grounding/       (quan sát + thao tác UI)
        ⇅
messaging/ (scan_scheduler, followup_scheduler, runtime)
        ⇅
agent/ (analyzer → router → reply_generator → validator → reply_service)  + llm/
        ⇅
memory/ + storage/ (Postgres)  ·  services/ (handoff, escalation, metrics, media_cache)
        ⇅
control/ (HTTP loopback per-agent, SSE events)  ⇄  dashboard_api/ (supervisor, auth, hub WS)  ⇄  dashboard/ (React)
                                                  integrations/ (Google Sheet webhook)
```

| Module | Vai trò | Thư mục chính |
|--------|---------|---------------|
| messaging-agent | Quét inbox, phân tích, sinh & kiểm tra trả lời, follow-up | `agent/`, `messaging/`, `llm/`, `memory/` |
| tiktok-platform | Điều khiển TikTok Web qua extension/CDP, quan sát DOM | `platforms/`, `perception/`, `grounding/`, `extension/`, `tools/`, `skills/` |
| runtime-core | Task graph, policy, scheduler, recovery, checkpoint | `core/`, `main.py`, `control/` |
| storage | Schema, migrations, repositories, ledger, tenancy | `storage/`, `models/` |
| handoff-escalation | Chuyển giao người, takeover/release, thông báo | `services/handoff.py`, `services/escalation.py`, `storage/conversation_control.py` |
| dashboard-supervisor | Auth, quản lý account, SSE→WS hub, orders, products | `dashboard_api/`, `dashboard/` |
| sheet-integration | Đồng bộ trạng thái khách/đơn sang Google Sheet | `integrations/` |

## 3. Entry Points

| Entry | Mô tả |
|-------|-------|
| `main.py` | Chạy một agent (`build_agent`, `main`), CLI argparse; nạp `configs/config.yaml` |
| `submit_task.py` | Gửi task tới control server của agent |
| `python -m dashboard_api` | Supervisor + REST/WS (≈96 route trong `dashboard_api/main.py`, `routes/`) |
| `dashboard/` (Vite) | UI vận hành |
| `deploy.sh`, `dev.sh`, `deploy/*.sh` | Triển khai / dev |

## 4. 🚫 No-Go Zones [⚠️ AI-inferred]

| Vùng | Lý do | Rủi ro |
|------|-------|--------|
| `storage/migrations/*.sql` đã có | Migration đã áp dụng — chỉ thêm file mới | Cao |
| `control/server.py` auth/bind loopback | Không xác thực, chỉ an toàn vì bind loopback | Cao |
| `dashboard_api/auth.py`, `cf_access.py` | Bảo mật phiên/JWT/Cloudflare Access | Cao |
| `agent/reply_validator.py`, `agent/shop_policy.py`, `core/policy.py` | Chốt an toàn: không bịa giá/tồn kho/đơn/hoàn tiền | Cao |
| `.env*`, `data/products/` | Bí mật / dữ liệu sản phẩm thật | Trung bình |
| `uv.lock`, `dashboard/package-lock.json` | Chỉ đổi qua công cụ package | Thấp |

## 5. Technical Debt Nổi Bật [⚠️ AI-inferred]

| Mức | Mô tả |
|-----|-------|
| 🟡 | `main.py` (1101 dòng) và `dashboard_api/main.py` (>2200 dòng) gom quá nhiều trách nhiệm |
| 🟡 | Bộ test `tests/gemini_*_evaluation.py` cần credential LLM thật, không chạy được offline |
| 🟡 | Selector TikTok (`platforms/tiktok_web/selectors.py`, `extension/platforms/tiktok.js`) phụ thuộc DOM bên thứ ba, dễ vỡ |

## 6. Test Coverage Hiện Tại

149 file test được phát hiện (127 trong `tests/`, còn lại ở `dashboard/src`, `integrations/apps_script`). Coverage % chưa đo. Vùng nguy cơ: luồng Chrome thật (`test_chrome_smoke.py` cần trình duyệt), tích hợp Gemini.

## 7. Patterns Đang Dùng

- **Naming**: snake_case Python, PascalCase class; tiếng Anh cho code, tiếng Việt cho UI/tài liệu.
- **Error handling**: exception domain trong `models/*_errors.py`; chuyển giao người (`HumanHandoff`) thay vì trả lời bừa.
- **State**: Postgres là nguồn sự thật; cache in-memory giới hạn `MEMORY_CACHE_LIMIT`; idempotency qua `inbox_ledger`, `processed_messages`, lease.
- **Tenancy**: dữ liệu cô lập theo `account_id` (`storage/tenancy.py`, `scope.py`).
- **Protocol/seam**: `ReplyProvider`, `PlatformAdapter` (`platforms/base.py`), `Skill` registry — để test không cần credential.

## 8. Lịch Sử Cập Nhật

| Ngày | Người | Lý do |
|------|-------|-------|
| 2026-11-02 | v-flow init | Auto-scan |
| 2026-11-03 | understand-agent (AI) | Điền kiến trúc, no-go zones từ code |
