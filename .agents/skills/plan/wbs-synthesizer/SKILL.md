---
name: wbs-synthesizer
description: "Hướng dẫn WBS Agent phân rã codebase thành project_wbs.md chuẩn VSAF. Agent PHẢI đọc skill này trước khi ghi WBS. Đảm bảo mọi unit có evidence_path thật, quan hệ consumes/used_by nhất quán hai chiều, và 100% thư mục mã nguồn cấp 1 có unit nhận trách nhiệm."
trigger: "Khi WBS Agent sinh .v-flow/architecture/project_wbs.md"
phase: "U.1"
used_by:
  - /v.wbs
  - /v.code-to-vsaf-slice
hooks:
  pre_synthesis: "Load context.md + Module Cards → liệt kê thư mục mã nguồn cấp 1 làm checklist coverage"
  post_synthesis: "Verify: mỗi unit có evidence_path tồn tại thật; consumes/used_by khớp hai chiều; không thư mục nào mồ côi"
---

# WBS Synthesizer — Phân rã Codebase thành Work Unit

> ⚠️ Skill **bắt buộc** cho WBS Agent. Mỗi unit PHẢI có `evidence_path` trỏ tới file tồn tại.
> Unit không có bằng chứng = unit bịa.
>
> → `gotchas.md` cho các lỗi làm hỏng bước cắt lát phía sau.

---

## Vì sao WBS tồn tại

`tasks.md` của V-Flow trả lời *"feature này cần làm những việc gì"*. WBS trả lời câu khác:
*"hệ thống đang chạy gồm những bộ phận nào, bộ phận nào gọi bộ phận nào, ai sở hữu bộ phận đó"*.

Động cơ cắt lát của VSAF cần **câu thứ hai** mới cắt được lát dọc xuyên tầng: nó phải biết
hạ tầng ở đâu, data ở đâu, hợp đồng external ở đâu để áp seam test. `tasks.md` không mang thông
tin đó, nên slice theo `tasks.md` cắt theo luồng UC chứ không theo tầng kiến trúc.

---

## Bốn thứ bước cắt lát phía sau đọc từ WBS

| WBS cung cấp | Động cơ slice dùng để |
|:--|:--|
| Prefix ID (`OPS` / `BE-DAT` / `BE-*` / `INT` / `SCR` / `WGT`) | biết unit nằm ở tầng nào → tracer bullet phải chạm những tầng nào |
| `consumes` / `used_by` | kéo unit liên đới vào cùng slice; kiểm **G8 Precedence** (provider không muộn hơn consumer) |
| `INT-*` tách riêng cho bên thứ ba | áp seam **Ownership** → quyết định AFK vs HITL |
| Unit nền (schema, RLS, auth) | áp seam **Trust/auth** → cô lập quyết định kiến trúc vào slice nền đầu tiên |

Thiếu hoặc sai bất kỳ ô nào trong bảng này thì slice sinh ra *trông hợp lý mà sai* — và sai ở đây
rất đắt, vì nó quyết định thứ tự build của cả dự án.

---

## Quy trình 6 bước

### 1. Lập checklist coverage TRƯỚC khi viết
Liệt kê thư mục mã nguồn cấp 1 (`ls -d */`), bỏ `__pycache__` / `.venv` / `node_modules` / build.
Danh sách này là **tiêu chí nghiệm thu coverage**: kết thúc mà còn thư mục chưa có unit nào → chưa xong.

### 2. Phân nhóm theo phân hệ chạy được
Mỗi process / app / deployable là một nhóm (`[AGT]`, `[SUP]`, `[DSH]`, `[EXT]`…). Nhóm **không**
đặt theo thư mục: một phân hệ có thể trải nhiều thư mục (`agent/` + `core/` + `platforms/`), và một
thư mục có thể phục vụ nhiều phân hệ (`storage/` → gom về `[DAT]` dùng chung).

### 3. Đặt mã theo quy chuẩn

| Prefix | Dùng cho | Đánh số |
|:--|:--|:--|
| `OPS-<NN>` | container, reverse proxy, systemd, tunnel, backup, CI, packaging, entrypoint | 2 chữ số |
| `BE-DAT-<NN>` | schema, migration, RLS, repository, domain model | 2 chữ số |
| `BE-<MOD>-<NN>` | service, API router, LLM engine, platform adapter, worker | 2 chữ số |
| `INT-<MOD>-<NN>` | hợp đồng tích hợp nội bộ / bên thứ ba | 2 chữ số |
| `SCR-<NAME>` | màn hình SPA (1 route = 1 screen) | tên, KHÔNG số |
| `WGT-<NAME>` | component tái sử dụng / nhúng vào screen | tên, KHÔNG số |

### 4. Viết Catalog với bằng chứng
Mỗi dòng: `id` · tên · `consumes` · `used_by` · `evidence_path` · `tasks`.
`evidence_path` ghi **nhiều** path khi unit trải nhiều file — đừng chọn một file "tiêu biểu" rồi
để các file còn lại không ai nhận.

### 5. Ghi `wbs-task-map.yaml`
Chỉ map unit **thật sự** có task V-Flow. Unit as-built ngoài phạm vi feature thì bỏ khỏi map:
WBS phủ cả hệ thống, `tasks.md` chỉ phủ feature đang làm.

### 6. Tự kiểm rồi mới đóng
Trình bảng: số unit theo prefix · coverage thư mục (`n/n`) · số unit có task · danh sách
`<TODO: người xác nhận>` còn lại. Điền `approved_by` rồi route sang `/v.slice --vsaf`.

---

## Chạy lại (`--refresh`)

**ID là hợp đồng.** Slice manifest và `wbs-task-map.yaml` trỏ vào ID; ở VSAF còn có pre-commit hook
tra ID trong WBS. Vì vậy khi chạy lại:

- Giữ nguyên mọi ID đã có. Chỉ **nối thêm** số mới.
- Unit biến mất khỏi code → giữ ID, đánh `[deprecated]`, **không** xoá dòng (slice cũ còn trỏ tới).
- Unit đổi phạm vi → sửa mô tả + `evidence_path`, giữ ID.
- **Không bao giờ đánh số lại từ đầu.**
