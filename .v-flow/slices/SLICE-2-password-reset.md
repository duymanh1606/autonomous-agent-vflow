---
slice_id: SLICE-2
feature: 001-autonomous-agent-vflow
title: "password reset"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-1]
enhanced_by: []
hub_extends: []
demoable: "Operator quên mật khẩu, nhận token đặt lại và đổi được mật khẩu ở màn Reset Password"
seam_rationale: "Tách khỏi SLICE-1 theo seam Read/Write: SLICE-1 chứng minh đường đọc phiên, slice này là đường ghi lại credential. Seam Ownership: kênh gửi email (SMTP external) KHÔNG nằm ở đây — demo dùng token trả về từ API, phần gửi mail đi cùng SLICE-16 nơi hợp đồng INT-MAIL-01 được nối. Nhờ vậy slice giữ được AFK."
demo_status: pending
units:
  - { id: SCR-RESET-PASSWORD, type: frontend, story: S-SCR-RESET-PASSWORD }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Màn Reset Password nối vào endpoint quên/đặt lại mật khẩu đã có ở BE-SUP-01 (SLICE-1).

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
