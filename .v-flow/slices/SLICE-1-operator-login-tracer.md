---
slice_id: SLICE-1
feature: 001-autonomous-agent-vflow
title: "operator login tracer"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: []
enhanced_by: [SLICE-24]
hub_extends: []
demoable: "Operator mở dashboard qua nginx, đăng nhập và thấy phiên của mình; dữ liệu account A không đọc được từ account B"
seam_rationale: "Tracer bullet: đi hết mọi tầng (compose+nginx -> schema/RLS/repo/model -> BE auth -> hợp đồng REST -> app shell + màn Auth). Seam Trust/auth: toàn bộ quyết định nền (JWT, RLS, schema gốc) gom vào đúng slice này để các slice sau chỉ tiêu thụ. Toàn in-house nên AFK; Cloudflare Access (external) bị cắt sang SLICE-23. SCR-HOME chưa có nên app shell ở đây chỉ phục vụ màn Auth."
demo_status: pending
units:
  - { id: OPS-01, type: infrastructure, story: S-OPS-01 }
  - { id: OPS-02, type: infrastructure, story: S-OPS-02 }
  - { id: BE-DAT-01, type: backend, story: S-BE-DAT-01 }
  - { id: BE-DAT-02, type: backend, story: S-BE-DAT-02 }
  - { id: BE-DAT-03, type: backend, story: S-BE-DAT-03 }
  - { id: BE-DAT-04, type: backend, story: S-BE-DAT-04 }
  - { id: BE-SUP-01, type: backend, story: S-BE-SUP-01 }
  - { id: INT-SUP-01, type: integration }
  - { id: WGT-APP-SHELL, type: frontend, story: S-WGT-APP-SHELL }
  - { id: WGT-API-CLIENT, type: frontend, story: S-WGT-API-CLIENT }
  - { id: WGT-UI-KIT, type: frontend, story: S-WGT-UI-KIT }
  - { id: SCR-AUTH, type: frontend, story: S-SCR-AUTH }
  - { id: WGT-FORCE-CHANGE-PASSWORD, type: frontend, story: S-WGT-FORCE-CHANGE-PASSWORD }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Dựng nền chạy được đầu tiên: container Postgres + nginx, schema và migration, RLS theo `account_id`, repository, model miền, xác thực operator (JWT HS256 + cookie), hợp đồng `/api/*`, vỏ ứng dụng SPA và màn đăng nhập (kèm luồng buộc đổi mật khẩu).

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
