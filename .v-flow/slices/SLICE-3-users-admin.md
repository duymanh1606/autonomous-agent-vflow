---
slice_id: SLICE-3
feature: 001-autonomous-agent-vflow
title: "users admin"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-1]
enhanced_by: []
hub_extends: []
demoable: "Admin tạo / khoá / xoá user và cấp quyền workspace, user mới đăng nhập được"
seam_rationale: "Seam Trust/auth: phân quyền (AuthZ) là tầng trên xác thực (AuthN) đã chốt ở SLICE-1, demo được độc lập và không chạm agent. In-house toàn bộ -> AFK."
demo_status: pending
units:
  - { id: BE-SUP-02, type: backend, story: S-BE-SUP-02 }
  - { id: SCR-USERS-ADMIN, type: frontend, story: S-SCR-USERS-ADMIN }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Quản trị người dùng: CRUD user, khoá/mở, cấp quyền theo workspace, giới hạn số workspace; màn Users Admin.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
