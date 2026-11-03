---
slice_id: SLICE-17
feature: 001-autonomous-agent-vflow
title: "products"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5]
enhanced_by: []
hub_extends: []
demoable: "Operator tạo/sửa sản phẩm, upload media và chọn được sản phẩm từ picker"
seam_rationale: "Nhánh catalog độc lập, chỉ cần vỏ UI. WGT-PRODUCT-PICKER đi cùng provider của nó để thoả G8 trước khi SCR-CUSTOMERS/SCR-ORDERS dùng."
demo_status: pending
units:
  - { id: BE-SUP-05, type: backend, story: S-BE-SUP-05 }
  - { id: SCR-PRODUCTS, type: frontend, story: S-SCR-PRODUCTS }
  - { id: WGT-PRODUCT-PICKER, type: frontend, story: S-WGT-PRODUCT-PICKER }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
CRUD sản phẩm, sản phẩm mặc định, upload media; màn Products và widget chọn sản phẩm.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
