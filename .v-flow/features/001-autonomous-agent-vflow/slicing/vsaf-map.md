# Ánh xạ VSAF ↔ V-Flow — variant `vsaf`

> Sinh tự động bởi `v-flow slice import-vsaf`. Không sửa tay — sửa `SLICE-*.md` rồi import lại.

| Nguồn | Giá trị |
|---|---|
| Feature | 001-autonomous-agent-vflow |
| Slice manifest | `.v-flow/slices` |
| WBS | `.v-flow/architecture/project_wbs.md` |
| Task map | `.v-flow/architecture/wbs-task-map.yaml` |
| Sinh lúc | 2026-11-03T09:22:52.181Z |

## Slice

| Slice | Tên | Loại | WBS unit | Task V-Flow | Luồng |
|---|---|---|---|---|---|
| SLICE-1 | operator login tracer | AFK | OPS-01, OPS-02, BE-DAT-01, BE-DAT-02, BE-DAT-03, BE-DAT-04, BE-SUP-01, INT-SUP-01, WGT-APP-SHELL, WGT-API-CLIENT, WGT-UI-KIT, SCR-AUTH, WGT-FORCE-CHANGE-PASSWORD | T-001, T-002, T-013 | UC-04-A1, UC-04.main |
| SLICE-2 | password reset | AFK | SCR-RESET-PASSWORD | — | — |
| SLICE-3 | users admin | AFK | BE-SUP-02, SCR-USERS-ADMIN | — | — |
| SLICE-4 | workspace lifecycle api | AFK | BE-SUP-03, OPS-03, OPS-09 | — | — |
| SLICE-22 | ops ci backup maintenance | AFK | OPS-05, OPS-06, OPS-07 | — | — |
| SLICE-23 | cloudflare tunnel access | HITL | OPS-04, INT-CFA-01 | T-014 | UC-04-E1, UC-04-E2 |
| SLICE-5 | home shell | AFK | SCR-HOME, WGT-SIDEBAR, WGT-TOPBAR, WGT-ACCOUNT-DIALOG | — | — |
| SLICE-6 | agent control plane | AFK | BE-AGT-10, INT-AGT-01, INT-AGT-02 | — | — |
| SLICE-7 | realtime activity | AFK | BE-SUP-12, INT-SUP-02, SCR-ACTIVITY | — | — |
| SLICE-9 | tiktok browser actions | HITL | BE-AGT-05, BE-AGT-07, BE-AGT-12 | — | — |
| SLICE-11 | gemini llm client | HITL | BE-AGT-11, INT-LLM-01 | — | — |
| SLICE-15 | logs health | AFK | BE-SUP-13, SCR-LOGS | — | — |
| SLICE-17 | products | AFK | BE-SUP-05, SCR-PRODUCTS, WGT-PRODUCT-PICKER | — | — |
| SLICE-18 | orders shipping | AFK | BE-SUP-06, SCR-ORDERS, SCR-SHIPPING | T-015 | UC-05.main |
| SLICE-20 | behavior config | AFK | BE-SUP-07, SCR-SCENARIO, SCR-SETTINGS | — | — |
| SLICE-24 | egw egress gateway | HITL | BE-SUP-10, INT-EGW-01 | — | — |
| SLICE-8 | dashboard runs | AFK | BE-SUP-11, BE-SUP-15, SCR-DASHBOARD, WGT-COMMAND-PALETTE | — | — |
| SLICE-10 | chrome extension bridge | HITL | BE-EXT-01, BE-EXT-02, BE-EXT-03, INT-EXT-01, OPS-08 | — | — |
| SLICE-12 | inbox ingestion | AFK | BE-AGT-01, BE-AGT-02, BE-AGT-06 | T-003 | UC-01.main |
| SLICE-19 | sheet export | HITL | BE-SUP-14, INT-SHEET-01 | T-016 | UC-05-E1 |
| SLICE-13 | auto reply | AFK | BE-AGT-03, BE-AGT-04, BE-AGT-13 | T-005, T-004, T-007, T-008 | UC-01-E1, UC-01-E3, UC-01-A1 |
| SLICE-14 | takeover conversations | AFK | BE-AGT-09, BE-SUP-04, BE-SUP-08, SCR-CUSTOMERS | T-006, T-009, T-010 | UC-01-E2, UC-02.main, UC-02-E1, UC-02-E2 |
| SLICE-21 | followup | AFK | BE-AGT-08 | T-011, T-012 | UC-03.main, UC-03-E1, UC-03-E2 |
| SLICE-16 | notifications alerts | HITL | BE-SUP-09, INT-PUSH-01, INT-MAIL-01, SCR-ALERTS | — | — |
