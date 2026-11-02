# Mẫu Prototype Notes — ✅ Tốt

> Đây là mẫu `prototype-notes.md` đúng format và đủ thông tin.
> Xem `bad/prototype-notes.md` để biết mẫu thiếu thông tin.

---

```markdown
# Prototype Notes — Feature 005: Order Cancellation Flow

**Date**: 2026-05-15
**Agent**: Prototype Agent
**Branch**: LOGIC
**Phase**: S.1.5

## Câu hỏi được trả lời

> "State machine của Order cancellation xử lý case concurrent cancel (2 users cancel cùng 1 order) như thế nào? REQ-S02 không chỉ định behavior khi CANCELLING → CANCELLED bị race condition."

**REQ refs**: REQ-S02, REQ-E05

## Run command

```bash
pnpm prototype:005
# hoặc: tsx .v-flow/features/005/prototype/tui.ts
```

## Kết quả thực hiện

User đã interact với prototype ~15 phút, test các case:
- [x] Single user cancel → `PENDING → CANCELLING → CANCELLED` ✅
- [x] Cancel sau khi đã ship → correctly rejected bởi state machine ✅  
- [x] **Concurrent cancel (2 requests)**: First request wins, second nhận `AlreadyCancellingError` ⚠️
- [x] Cancel order đã CANCELLED → `AlreadyCancelledError` ✅

**Phát hiện quan trọng**: `AlreadyCancellingError` case chưa được định nghĩa trong REQ-S02. Hiện prototype trả về generic error. User confirm: "Đây là behavior đúng — cần thêm vào spec."

## Verdict

**VALIDATED** ✅

State machine logic cơ bản đúng. Phát hiện 1 gap trong spec cần bổ sung.

## Spec impact

- **REQ-S02**: Cần thêm AC: "Khi order đang ở trạng thái CANCELLING, request cancel thứ hai phải nhận `AlreadyCancellingError` (HTTP 409)"
- **Không cần REQ mới** — là AC bổ sung cho REQ-S02 hiện có

## Decisions to carry-forward → _session.md

1. State machine pattern: Pure reducer `(OrderState, CancelAction) => OrderState` — liftable vào `OrderCancellationUseCase`
2. Error types cần định nghĩa: `AlreadyCancellingError`, `AlreadyCancelledError`, `ShippedOrderError`
3. Concurrent access: First-write-wins với optimistic lock — Plan Agent cần design DB transaction cho case này

## Routing

→ Sửa REQ-S02 trong `spec.md` (thêm AC)  
→ Sau khi sửa spec → `/v.plan + /v.test` (song song)

## Cleanup

- [ ] Xóa `.v-flow/features/005/prototype/` sau khi Plan Agent đọc notes này
- [x] `prototype-notes.md` đã được ghi đầy đủ
- [x] `_session.md` đã được append
- [x] `.flow-state.yaml` đã được update: `artifacts.prototype.verdict = VALIDATED`
```
