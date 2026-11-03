---
slice_id: SLICE-23
feature: 001-autonomous-agent-vflow
title: "cloudflare tunnel access"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-1]
enhanced_by: []
hub_extends: []
demoable: "Dashboard truy cập được từ ngoài qua Cloudflare tunnel + Access; sai mật khẩu / tài khoản bị khoá / quota bị từ chối đúng"
seam_rationale: "Seam Ownership + Trust/auth: Cloudflare Access là nhà cung cấp danh tính bên ngoài -> HITL. Tách khỏi SLICE-1 để xác thực nội bộ demo được mà không chờ cấu hình tunnel."
demo_status: pending
units:
  - { id: OPS-04, type: infrastructure, story: S-OPS-04 }
  - { id: INT-CFA-01, type: integration }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Cloudflared tunnel + Cloudflare Access assertion, các nhánh từ chối đăng nhập và giới hạn quota.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
