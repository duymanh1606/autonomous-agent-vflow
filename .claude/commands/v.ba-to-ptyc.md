---
description: "BA to PTYC Agent — Sinh tài liệu Phân tích Yêu cầu (PTYC.docx) chuẩn ISO từ spec.md (Doc Export — S.1.6, optional)"
phase: "S.1.6"
agent: "ba-to-ptyc-agent"
optional: true
dependency: "Python docxtpl (pip install docxtpl); mermaid-cli optional cho sơ đồ"
---

# /v.ba-to-ptyc

> Orchestration wrapper cho **BA to PTYC Agent**. Đọc `agents/ba-to-ptyc-agent.md` để thực hiện core logic.
> Tương ứng **bước 7a** trong BA Skill Pipeline: `spec.md` → `PTYC.docx`.

> ⚠️ **OPTIONAL — Doc Export**. Chỉ sinh tài liệu bàn giao, không thay đổi spec/plan/code.
> Cơ chế **Route B**: đổ dữ liệu vào template `.docx` có sẵn → **giữ nguyên 100% format ISO Viettel**.

---

## Prerequisites

> ⚠️ Tooling nằm **trong `.v-flow/` của project** (do `v-flow init/sync` copy vào): `.v-flow/scripts/ptyc/` + `.v-flow/templates/ptyc/`. Chạy mọi lệnh từ **gốc project** (nơi có thư mục `.v-flow/`) — **KHÔNG** dùng đường dẫn kiểu `<project>/scripts/...` ở thư mục gốc (không tồn tại), cũng không cần repo framework ngoài.
> Nếu `.v-flow/scripts/ptyc/` chưa có → chạy `v-flow sync --apply` (hoặc `v-flow init`) để copy vào. `<F>` = `.v-flow/features/{NNN}`.

```
1. <F>/spec.md                              ← nên đã Approved
2. <F>/ptyc.meta.yaml                       ← nếu chưa có: copy .v-flow/templates/ptyc/ptyc.meta.example.yaml và điền
3. venv trong .v-flow (1 lần) — macOS python externally-managed:
     python3 -m venv .v-flow/.venv && .v-flow/.venv/bin/pip install docxtpl
```

> Thiếu `docxtpl` → `render_ptyc.py` in hướng dẫn cài venv và **dừng (không ra file)**.
> Thiếu `mermaid-cli` → sơ đồ dùng placeholder (không fail).
> Template tự resolve `.v-flow/templates/ptyc/PTYC.template.docx` — không cần `--template`.

---

## Execution

1. Đọc agent definition: `agents/ba-to-ptyc-agent.md`
2. Chạy từ **gốc project** (nơi có `.v-flow/`). `<F>` = `.v-flow/features/{NNN}`.
3. Đọc `<F>/spec.md` + `<F>/ptyc.meta.yaml` (+ `<F>/plan.md` nếu có)
4. Map → `<F>/ptyc/ptyc-data.json` (đúng `.v-flow/scripts/ptyc/ptyc-data.schema.json`)
5. (Tùy chọn) `node .v-flow/scripts/ptyc/render_mermaid.mjs <F>/ptyc/img`
6. Render — **`--out` là thư mục** → file tự đặt tên `{doc_code}.docx` (doc_code tự sinh từ `pyc_ref.no`, KHÔNG hardcode):
   `.v-flow/.venv/bin/python .v-flow/scripts/ptyc/render_ptyc.py --data <F>/ptyc/ptyc-data.json --out <F>/ptyc/ --img-dir <F>/ptyc/img`
7. **Xác nhận file `.docx` tồn tại** + đúng số PYC → báo đường dẫn + danh sách `[TBD]`

## Options

### `--feature <NNN>`
Chỉ định feature. Mặc định: feature đang active trong `.flow-state.yaml`.

### `--meta <path>`
Đường dẫn `ptyc.meta.yaml` khác (mặc định: trong thư mục feature).

### `--no-images`
Bỏ qua bước mermaid → tất cả sơ đồ dùng placeholder (nhanh, không cần mmdc).

---

## Output

```
.v-flow/features/{NNN}/ptyc/
├── ptyc.meta.yaml          ← metadata (BA điền)
├── ptyc-data.json          ← dữ liệu AI map từ spec (trung gian, review được)
├── img/                    ← *.mmd + *.png (nếu render được)
└── PTYC_{doc_code}.docx    ← ✅ tài liệu bàn giao
```

> 📎 Sinh lại template (khi file mẫu đổi): `.v-flow/.venv/bin/python .v-flow/scripts/ptyc/build_template.py <file-mẫu.docx> .v-flow/templates/ptyc/PTYC.template.docx`
