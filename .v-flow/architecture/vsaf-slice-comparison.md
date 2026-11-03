# Đối chiếu slice: V-Flow (hybrid VSAF) ↔ VSAF gốc

> Nghiệm thu Phase 3 §5 của `docs/dac_ta_tich_hop_vflow_vsaf_slicing.md`:
> *"So sánh độ khớp với 23 slices của VSAF"*.
>
> - **Bên V-Flow**: `.v-flow/slices/SLICE-*.md` (24 slice, 78 WBS unit) — sinh từ
>   `.v-flow/architecture/project_wbs.md` qua động cơ seam test + G1–G8.
> - **Bên VSAF**: `../vsaf-ws/autonomous-agent-spec/NTAPP-output/Stage_2_Architecture/slices/`
>   (23 slice, 63 WBS unit) — cùng codebase, chạy qua pipeline Dual-Repo của NTAPP.

---

## 1. Kết quả tổng hợp

| Chỉ số | VSAF gốc | V-Flow hybrid | Nhận xét |
|:--|--:|--:|:--|
| Số slice | 23 | 24 | +1 do tách seam Ownership ở Home/EGW (xem §3) |
| WBS unit được phủ | 63 | 78 | +15 unit: WBS V-Flow phủ thêm UI primitives, app shell, API client, domain model, global search, packaging, entrypoint, 7 hợp đồng external |
| Slice AFK | 17 | 17 | khớp |
| Slice HITL | 6 | 7 | +1 (`SLICE-24 egw-egress-gateway`) |
| SLICE-1 là tracer bullet xuyên tầng | có | có | cùng kết luận: compose+nginx → schema/RLS → BE auth → contract → FE |
| Trùng khớp `slice_id` ↔ phạm vi | — | **23/23** | mọi slice VSAF có đúng một slice V-Flow cùng số, cùng phạm vi |

**Độ khớp: 23/23 slice đầu trùng cả số hiệu, tên và tập unit lõi.** Hai engine chạy độc lập trên
cùng codebase cho ra cùng một cách phân rã — đây là tín hiệu chính cho AC-3.

---

## 2. Bảng đối chiếu từng slice

| # | VSAF gốc | V-Flow hybrid | Khác biệt về unit |
|--:|:--|:--|:--|
| 1 | operator login tracer | operator login tracer | V-Flow thêm `BE-DAT-04` (domain model), `WGT-APP-SHELL`, `WGT-API-CLIENT`, `WGT-UI-KIT` |
| 2 | password reset | password reset | khớp |
| 3 | users admin | users admin | khớp |
| 4 | workspace lifecycle api | workspace lifecycle api | V-Flow thêm `OPS-09` (entrypoint + config loader) |
| 5 | home shell egw | **home shell** | V-Flow **cắt `BE-SUP-10` ra** → SLICE-24 (xem §3) |
| 6 | agent control plane | agent control plane | khớp |
| 7 | realtime activity | realtime activity | khớp |
| 8 | dashboard runs | dashboard runs | V-Flow thêm `BE-SUP-15` (global search — provider của command palette, G8) |
| 9 | tiktok browser actions | tiktok browser actions | khớp (`BE-AGT-05/07/12`) |
| 10 | chrome extension bridge | chrome extension bridge | V-Flow thêm `INT-EXT-01` (hợp đồng bridge), `OPS-08` (packaging + policy) |
| 11 | gemini llm client | gemini llm client | V-Flow thêm `INT-LLM-01` |
| 12 | inbox ingestion | inbox ingestion | khớp |
| 13 | auto reply | auto reply | khớp |
| 14 | takeover conversations | takeover conversations | khớp |
| 15 | logs health | logs health | khớp |
| 16 | notifications alerts | notifications alerts | V-Flow thêm `INT-PUSH-01`, `INT-MAIL-01` |
| 17 | products | products | V-Flow thêm `WGT-PRODUCT-PICKER` |
| 18 | orders shipping | orders shipping | khớp |
| 19 | sheet export | sheet export | V-Flow thêm `INT-SHEET-01` |
| 20 | behavior config | behavior config | khớp |
| 21 | followup | followup | khớp |
| 22 | ops ci backup maintenance | ops ci backup maintenance | khớp |
| 23 | cloudflare tunnel access | cloudflare tunnel access | V-Flow thêm `INT-CFA-01` |
| 24 | — | **egw egress gateway** | slice mới (xem §3) |

---

## 3. Một khác biệt có chủ ý: tách EGW khỏi Home shell

VSAF đặt `BE-SUP-10` (EGW Egress Gateway) chung với `SCR-HOME` ở SLICE-5 và đánh **cả slice là
HITL**. Theo đúng luật của chính VSAF, đó là dấu hiệu thiếu một lần cắt:

- **Seam Ownership** nói: unit in-house và unit do hệ bên ngoài sở hữu phải nằm hai slice.
- **G6 (AFK/HITL purity)** nói: không bó unit external với unit in-house vốn demo được mà không cần nó.
  `SCR-HOME` + sidebar/topbar + dialog tạo workspace demo được hoàn toàn mà **không** cần EGW.
- **AFK-first staging** nói: một unit external đơn lẻ không được kéo cả slice AFK thành HITL.

Nên bản V-Flow cắt thành:

| | unit | type |
|:--|:--|:--|
| SLICE-5 `home shell` | `SCR-HOME` (growable), `WGT-SIDEBAR`, `WGT-TOPBAR`, `WGT-ACCOUNT-DIALOG` | **AFK** |
| SLICE-24 `egw egress gateway` | `BE-SUP-10`, `INT-EGW-01` | HITL |

`SCR-HOME` được đánh `growable: true` và SLICE-24 khai `hub_extends: [SLICE-5]` (SLICE-5 đối ứng
`enhanced_by: [SLICE-24]`) — hành động "gán proxy" vào Home đi qua **extension story**, nên
`SCR-HOME` vẫn thuộc đúng một slice và G1 giữ nguyên.

**Hệ quả đo được**: 17 slice AFK/24 thay vì 17/23, và lát vỏ điều hướng (SLICE-5) không còn phải
chờ cấu hình EGW mới demo được.

---

## 4. Vì sao WBS V-Flow nhiều hơn 15 unit

Không phải cắt khác — là **coverage khác**. AC-1 của đặc tả tích hợp đòi 100% thành phần mã nguồn
có unit nhận trách nhiệm, nên bản V-Flow bổ sung:

| Nhóm bổ sung | Unit |
|:--|:--|
| Hợp đồng bên thứ ba tách riêng (nguồn của seam Ownership) | `INT-LLM-01`, `INT-SHEET-01`, `INT-EGW-01`, `INT-CFA-01`, `INT-PUSH-01`, `INT-MAIL-01` |
| Hợp đồng nội bộ còn thiếu | `INT-EXT-01` (extension ↔ agent, `127.0.0.1:8765`) |
| Tầng dữ liệu | `BE-DAT-04` (domain model `models/`) |
| Backend còn thiếu | `BE-SUP-15` (global search `dashboard_api/search.py`) |
| Hạ tầng còn thiếu | `OPS-08` (đóng gói extension + policy), `OPS-09` (entrypoint + config loader) |
| Frontend còn thiếu | `WGT-APP-SHELL`, `WGT-API-CLIENT`, `WGT-UI-KIT`, `WGT-PRODUCT-PICKER` |

Trong đó 7 unit `INT-*` external là phần **ảnh hưởng trực tiếp tới chất lượng cắt lát**: chúng là
dữ liệu đầu vào của seam Ownership, và chính chúng làm lộ ra lần cắt thiếu ở §3.

---

## 5. Hai bất biến không tương thích (và cách xử lý)

| | VSAF | V-Flow | Xử lý |
|:--|:--|:--|:--|
| Đơn vị phủ | WBS unit — một luồng UC được phép trải nhiều slice (cắt theo tầng) | luồng UC — R2 đòi luồng thuộc **đúng một** slice | Adapter gán luồng cho **slice sớm nhất** chạm tới nó (thứ tự topo của `blocked_by`) |
| Phạm vi | WBS phủ **toàn hệ thống as-built** | `tasks.md`/`test-cases.md` phủ **một feature** | 16/24 slice as-built không có task/TC → `R4-demoable` và `R9-has-tests` hạ xuống `warn` trong profile `strict` (`.v-flow/slicing.config.yaml`, lý do ghi tại chỗ). Phần "thiếu câu demo" của G2 vẫn bị adapter chặn cứng |

Đây là khác biệt **thiết kế**, không phải lỗi dữ liệu: cùng một hệ thống, VSAF cắt theo tầng kiến
trúc còn V-Flow cắt theo luồng nghiệp vụ. Hybrid giữ cả hai tầng kiểm thay vì ép một bên theo bên kia.
