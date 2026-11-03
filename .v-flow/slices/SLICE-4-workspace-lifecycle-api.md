---
slice_id: SLICE-4
feature: 001-autonomous-agent-vflow
title: "workspace lifecycle api"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-1]
enhanced_by: []
hub_extends: []
demoable: "Operator gọi API tạo workspace rồi start/stop, Supervisor spawn được tiến trình agent + Chrome + Xvfb/noVNC"
seam_rationale: "Seam Read/Write + Ownership: đây là đường ghi vòng đời tiến trình, phụ thuộc host (systemd, virtual display) nhưng vẫn in-house nên AFK. Cắt trước phần UI (SLICE-5) để chứng minh lifecycle qua API trước khi dán màn hình lên."
demo_status: pending
units:
  - { id: BE-SUP-03, type: backend, story: S-BE-SUP-03 }
  - { id: OPS-03, type: infrastructure, story: S-OPS-03 }
  - { id: OPS-09, type: infrastructure, story: S-OPS-09 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Vòng đời workspace: CRUD account, start/stop/pause/resume/wake/focus, spawn agent per-account kèm Chrome + Xvfb + x11vnc/noVNC; systemd service + virtual display; entrypoint `main.py` và bộ nạp cấu hình per-account.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
