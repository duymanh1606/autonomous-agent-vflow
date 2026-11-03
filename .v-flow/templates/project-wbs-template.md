approved_by: <tên_kỹ_sư_hoặc_AutoSystem>
approved_at: YYYY-MM-DD

# PROJECT WBS — <Tên Dự Án>

Baseline **as-built** tái dựng từ mã nguồn dự án qua V-Flow WBS Synthesizer (`/v.wbs`).
Nguồn: <liệt kê nguồn đã dò — cây thư mục, compose, manifest package, migrations, Module Cards>.

- Quy tắc đặt mã: `OPS-NN` · `BE-DAT-NN` · `BE-<MOD>-NN` · `INT-<MOD>-NN` · `SCR-<NAME>` · `WGT-<NAME>`
- Mỗi unit là **một** Work Unit duy nhất; `evidence_path` trỏ tới mã nguồn thật.
- Ánh xạ unit ↔ task V-Flow sống ở `.v-flow/architecture/wbs-task-map.yaml`.

---

## Function Decomposition Tree

```text
<SYSTEM NAME>
├── [OPS] Infrastructure & Runtime
│   ├── OPS-01  <Container Runtime & Compose>
│   └── OPS-02  <Reverse Proxy & Routing>
├── [DAT] Data Persistence
│   ├── BE-DAT-01  <Database Schema & Migrations>
│   └── BE-DAT-02  <Tenant Isolation & Repositories>
├── [<MOD>] <Tên Phân Hệ>
│   ├── BE-<MOD>-01  <Core Processing Engine>
│   └── BE-<MOD>-02  <...>
├── [INT] Integration Contracts
│   ├── Nội bộ:
│   │   └── INT-<MOD>-01  <Public API>
│   └── Bên thứ ba:
│       └── INT-<EXT>-01  <External adapter contract>
└── [UI] <Frontend Application>
    ├── Screens:
    │   ├── SCR-LOGIN  <Màn hình Đăng nhập>
    │   └── SCR-MAIN   <Màn hình Quản trị>
    └── Widgets:
        └── WGT-NOTIFY <Hộp thông báo thời gian thực>
```

---

## Work Unit Catalog

> `consumes` = unit mà unit này gọi/phụ thuộc · `used_by` = unit tiêu thụ nó ·
> `evidence_path` = bằng chứng mã nguồn · `tasks` = task V-Flow (— nếu chưa có).
>
> Quan hệ `consumes`/`used_by` là dữ liệu mà **seam test** và **G8 Precedence** của
> `ntapp-slice-planning` dùng để tính. Sai một chiều là cách cắt sai.

### [OPS] <Nhóm> — `type: infrastructure`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| OPS-01 | <tên> | — | <...> | `<path>` | — |

### [DAT] <Nhóm> — `type: backend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| BE-DAT-01 | <tên> | <...> | <...> | `<path>` | T-xxx |

### [INT] Integration Contracts — `type: integration`

| ID | Tên | provider → consumers | giao thức | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| INT-<MOD>-01 | <tên> | <MOD> → <consumer> | REST/WS/SSE/SMTP/... | `<path>` | — |

### [UI] Screens — `type: frontend`

| ID | Tên | consumes | evidence_path | tasks |
|:---|:---|:---|:---|:---|
| SCR-<NAME> | <tên> | <BE unit> | `<path>` | — |

### [UI] Widgets — `type: frontend`

| ID | Tên | consumes | used_by | evidence_path | tasks |
|:---|:---|:---|:---|:---|:---|
| WGT-<NAME> | <tên> | <...> | <SCR-*> | `<path>` | — |

---

## Thống kê Coverage

| Nhóm | Số unit |
|:---|---:|
| OPS | n |
| ... | n |
| **Tổng** | **N** |

> **Coverage invariant**: liệt kê mọi thư mục mã nguồn cấp 1 và unit nhận trách nhiệm cho nó.
> Thư mục cố ý bỏ qua (`__pycache__`, `.venv`, `node_modules`, artifact build) ghi rõ tại đây.
