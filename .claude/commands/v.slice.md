---
description: "Slice Planning — Cắt feature thành các lát dọc demo được, so sánh variant, người chọn và khóa"
phase: "B.0c"
agent: "plan-agent"
---

# /v.slice

> Bước **B.0c** — chạy sau B.0a Plan ∥ B.0b Test, **trước** R.0 Master Check.
> Luật cắt (seam test) và bộ kiểm tra G1–G8 lấy từ VSAF `NTAPP-slice-planning`; đầu vào là **luồng UC + task** của V-Flow.
> Mọi phép tính (graph, luật R1–R11, metrics) do CLI `v-flow slice …` làm — agent không tự tính, chỉ đề xuất và giải thích.

## Điều kiện tiên quyết
- `spec.md` đã approved, `tasks.md` và `test-cases.md` đã có
- Mapping của task ghi tới **mức luồng** (`UC-01.main`, `UC-01-E1`) — task chỉ ghi `UC-01` bị hiểu là phục vụ mọi luồng của UC (kèm cảnh báo)
- `slicing.enabled` không phải `false` trong `.v-flow/slicing.config.yaml`

## Execution

1. **Kiểm tra đầu vào**: `v-flow slice graph <feature>`
   - Có tham chiếu hỏng → **DỪNG**, báo về `/v.plan` hoặc `/v.test` để sửa
   - Có cảnh báo `uc_level_mapping` / `unmapped_unit` → đề nghị Plan Agent ghi mapping tới mức luồng hoặc gắn `[FOUNDATION]`
2. **Sinh 2–3 variant** (mặc định, hoặc theo `--strategy`):
   - `v-flow slice plan <feature> --strategy per-flow`
   - `v-flow slice plan <feature> --strategy main-first`
   - **Variant `agent`**: agent tự đề xuất một cách cắt, ghi ra `slicing/agent.yaml` theo schema variant (mỗi slice có `id`, `name`, `flows`, `units`, `depends_on`, `demo`, `type`; kèm `provenance: {model, prompt_hash}`), rồi
     `v-flow slice plan <feature> --strategy manual --from slicing/agent.yaml --as agent --created-by agent`
3. **So sánh**: `v-flow slice compare <feature>` → đọc `slicing/compare.md`
4. **Trình bày cho người duyệt**: bảng compare + nhận xét ngắn cho từng variant, luôn nêu metric đối trọng cạnh nhau
   (vd `first_demo_points` thấp nhưng `rework_exposure` cao). **Không tự chọn thay người.**
5. **Viết câu demo**: slice nào còn `demo: "TODO: …"` thì cùng người duyệt viết câu demo thật (R4 chặn ở profile `strict`).
   Sửa trực tiếp trong `slicing/variants/<tên>.yaml` rồi `v-flow slice check <feature> --variant <tên>`
6. **Người chọn** → `v-flow slice use <feature> <variant>` (chạy profile `strict`; có lỗi thì từ chối)
7. **Người duyệt khóa** → `v-flow slice use <feature> <variant> --lock --by "<tên>"`. Từ đây ID slice không được đổi.

> Đây là **cổng duyệt của người** (giống Bước 4 VSAF). Agent không chạy `--lock` khi chưa có người xác nhận rõ ràng.

## Options

### --strategy <s>
Chỉ sinh variant bằng strategy này (xem `v-flow slice strategies`), bỏ qua bộ mặc định.

### --experiment
Dùng `--profile experiment` khi plan/compare để thấy hết vi phạm mà không bị chặn. Bước `use` luôn chạy `strict`.

## Thử nghiệm (không đụng spec, plan hay code)

| Muốn thử | Lệnh |
|---|---|
| Cách gom khác | `--strategy <s>` hoặc thêm `.v-flow/slicing/strategies/<tên>.js` |
| Độ dày, thứ tự | `--param max_points=6`, hoặc `v-flow slice sweep <feature> --strategy size-capped --param max_points=4,6,8,10` |
| Độ chặt của luật | `--profile experiment`, hoặc sửa `profiles:` trong `.v-flow/slicing.config.yaml` |
| Seam nào được tính | `seams:` trong config (`foundation`, `ownership`, `resilience`, `read-write`) |
| Tiêu chí đánh giá mới | thêm `.v-flow/slicing/metrics/<id>.js` export `{ id, better, compute(graph, variant) }` |
| Ổn định trên nhiều feature | `v-flow slice bench --strategies a,b [--fixtures <dir>]` |
| Nhìn tận mắt | `v-flow slice show <feature> --variant <v> [--format mermaid]` |

## 🔀 Routing Rules — Sau Slice Planning

```
Variant đã use --lock
  → Route: /v.check (R.0 kiểm cả cách cắt: validate --strict chạy luật slice + câu demo khớp AC)

Graph có tham chiếu hỏng / task không map luồng
  → Route: /v.plan hoặc /v.test để sửa mapping, rồi /v.slice lại

Người duyệt muốn đổi variant đã khóa / đã có slice chạy
  → v-flow slice use <feature> <v> --unlock --reason "…" (lý do ghi vào _session.md)
  → Slice đã chạy phải giữ ID: sinh variant mới bằng v-flow slice plan <feature> --keep-done
```

## Cập nhật State & Session

`v-flow slice use` tự ghi `.flow-state.yaml` (khối `slicing:` và `slices:`) và render `slices.md`. Agent cập nhật thêm:

```yaml
current_phase: "B.0c"
phase_status: "done"
```

**Append vào `_session.md`**:
```markdown
### [B.0c] Slice Planning — [YYYY-MM-DD]
- **Variant đã so**: [per-flow, main-first, agent]
- **Chọn**: [tên] — lý do: [ngắn]
- **Khóa bởi**: [người duyệt]
- **Slice đầu tiên (tracer bullet)**: SLICE-1 — [câu demo]
- **Routing**: → /v.check
```

---

## Ví dụ

```
/v.slice                                 ← feature hiện tại, 3 variant mặc định
/v.slice 001-user-login --strategy seam
/v.slice --experiment
```
