---
slice_id: SLICE-<n>
feature: <feature-slug>             # slice này ra đời từ feature nào
title: "<hành vi demoable, ngắn>"
type: AFK | HITL                    # AFK: build+merge không cần người · HITL: cần quyết định/duyệt
parent_epics: [<EPIC-ID>, ...]      # list → cross-epic OK
blocked_by: [<SLICE-ID>, ...]       # [] nếu start ngay; DAG, không chu trình (G3)
enhanced_by: [<SLICE-ID>, ...]      # slice sau nối thêm hành động vào unit hub build ở đây
hub_extends: [<SLICE-ID>, ...]      # nghịch đảo của enhanced_by: slice gốc chứa hub growable
demoable: "<1 câu: hành vi end-to-end quan sát được bởi actor>"
seam_rationale: "<1-2 câu: cắt ở đâu và vì sao. Seam nào (Ownership / Trust-auth / Resilience / Read-write). Lý do AFK vs HITL.>"
demo_status: pending                # pending → passed (chỉ demo thật mới flip)
units:
  - { id: <BE-unit>,  type: backend,     story: S-<BE-unit> }
  - { id: <SCR-unit>, type: frontend,    story: S-<SCR-unit> }
  - { id: <hub-unit>, type: backend,     story: S-<hub-unit>, growable: true }   # hub cố ý lớn dần qua nhiều slice
  - { id: <INT-unit>, type: integration }                                        # hợp đồng không cần story riêng
approved_by: <tên người duyệt hoặc AutoSystem>
approved_at: YYYY-MM-DD
---

## What to build
<Mô tả lát cắt end-to-end theo **hành vi**, không mô tả từng tầng. Không file path, không code.>

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
