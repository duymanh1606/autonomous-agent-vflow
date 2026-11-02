---
name: no-go-zone-guard
description: "Ngăn Implement Agent đụng vào No-Go Zones trong context.md. Skill này LUÔN ACTIVE trong Phase B.1 — kiểm tra TRƯỚC MỖI file edit."
trigger: "LUÔN ACTIVE trong B.1 — trước mỗi file edit"
phase: "B.1"
used_by:
  - /v.implement
  - /v.review
hooks:
  pre_file_edit: "Kiểm tra file path against No-Go Zones"
---

# No-Go Zone Guard — Bảo Vệ Vùng Code Cấm

> ⚠️ Skill này **bắt buộc** trong B.1 — nhưng harness KHÔNG tự fire.
> Implement Agent PHẢI **tự chạy** `.v-flow/skills/implement/no-go-zone-guard/scripts/check-nogo-zones.sh <file>` TRƯỚC mỗi file edit (đã ghi trong `implement-agent.md` Bước 2). Muốn enforce cứng → wire vào git pre-commit / CI (xem `constitution-enforcer/SKILL.md → Wiring enforcement thật`).
>
> → Xem `gotchas.md` cho lỗi phổ biến khi xử lý No-Go.
> → Xem `examples/good/` cho workaround patterns.
> → Xem `config.json` để customize enforcement level.
> → `.v-flow/skills/implement/no-go-zone-guard/scripts/check-nogo-zones.sh <file>`: tự động phủ **Check 1/2** (path/dir), **Check 3** (import — advisory), **Check 5** (test→source). **Check 4** (config side-effect) vẫn cần agent rà thủ công.

---

## Khi nào KHÔNG áp dụng

- Greenfield project (không có context.md → không có No-Go Zones)
- File mới hoàn toàn (không nằm trong No-Go directory)

---

## Nguồn No-Go Zones

Đọc từ các nguồn theo thứ tự ưu tiên:

```
1. .v-flow/context.md → §4 🚫 No-Go Zones     ← PRIMARY
2. constitution.md → §7 No-Go Zones             ← SECONDARY  
3. tasks.md → "No-Go Check" per-task             ← TASK-LEVEL
```

---

## 3 Levels

| Level | Marker | Nghĩa | Action |
|-------|:------:|-------|--------|
| 🔴 **Strict** | `🔴 Cao` | Tuyệt đối cấm — production, audited, PCI | **BLOCK** — không ngoại lệ |
| 🟡 **Warning** | `🟡 Trung bình` | Nên tránh — nhiều service phụ thuộc | **WARN** — cần Tech Lead approval |
| 🟢 **Caution** | `🟢 Thấp` | Cẩn thận — legacy code, side effects unknown | **LOG** — ghi lý do vào _session.md |

---

## Kiểm Tra — Cái Gì Cần Check

> 💡 Đây là phần quan trọng nhất — **KHÔNG CHỈ KIỂM TRA FILE PATH**.

### Check 1: Direct File Match
```
File đang edit nằm trong No-Go Zone?
VD: routes/payment.js là No-Go → BLOCK
```

### Check 2: Parent Directory Match
```
File nằm trong directory là No-Go?
VD: No-Go = "routes/payment/" → routes/payment/webhook.js cũng BLOCK
```

### Check 3: New Import From No-Go
```
File mới import/require từ No-Go module?
VD: const auth = require('../middleware/auth') // auth.js là No-Go
→ Import READ-ONLY ok, nhưng MODIFY behavior → cần xem xét
```

### Check 4: Config Side-Effects
```
Sửa shared config (env, DB config) có ảnh hưởng No-Go modules?
VD: Thay đổi DB pool config → ảnh hưởng payment module
```

### Check 5: Test Files Tương Ứng
```
test/payment.test.js thuộc No-Go nếu routes/payment.js là No-Go?
→ CÓ. Test file của No-Go module = No-Go.
```

---

## Workaround Patterns

> 💡 Khi cần interact với No-Go module mà KHÔNG sửa nó.

### Pattern 1: Wrapper / Adapter
Tạo file mới wrap interface No-Go module:
```
// adapters/payment-adapter.js (NEW file — OK)
const payment = require('../no-go/payment'); // import OK
module.exports = {
  getStatus: (id) => payment.checkStatus(id), // wrap, không modify
};
```
**Rule**: Adapter KHÔNG modify behavior — chỉ wrap hoặc extend.

### Pattern 2: Event Bus
Emit event thay vì gọi trực tiếp:
```
// Không gọi payment.process() trực tiếp
eventBus.emit('payment:requested', data);
// payment module listen event này (nếu nó đã support)
```

### Pattern 3: Interface Segregation
Tạo interface, No-Go module implement nó. New code depend on interface, không direct dependency.

### Pattern 4: API Gateway
Gọi No-Go service qua HTTP API thay vì import trực tiếp (microservices pattern).

---

## Khi Phải Đụng No-Go Zone (Bất khả kháng)

```
1. DỪNG NGAY — không tự ý sửa
2. Ghi vào _session.md:
   "⚠️ TASK-{N} requires editing No-Go Zone: {file}. Reason: {why}"
3. Set .flow-state.yaml: blocked = true, blocked_reason = "No-Go Zone conflict"
4. Chờ Tech Lead quyết định:
   - Option A: Approve exception (ghi approval vào _session.md)
   - Option B: Redesign approach (update plan.md)
   - Option C: Scope out (update spec.md)
```

---

## No-Go Zone Types — Reference

| Loại | Ví dụ | Rủi ro | Workaround |
|------|-------|--------|-----------|
| Payment/Billing | `routes/payment.js`, `services/stripe.js` | PCI compliance | Adapter pattern |
| Auth/Identity | `middleware/auth.js`, `services/sso.js` | Cascading breakage | Interface segregation |
| Core Infrastructure | `db/pool.js`, `config/env.js` | System-wide impact | Environment variables |
| 3rd Party SDK | `lib/vendor-sdk.js` | Vendor-controlled | Wrapper pattern |
| Legacy Critical | `legacy/core-engine.js` | Unknown side effects | Event bus |
| Audited Code | `security/encryption.js` | Audit invalidation | Extend, don't modify |

---

## Wiring — Cưỡng chế cứng qua git (batch gate)

`check-nogo-zones.sh` kiểm **một** file (agent gọi trước mỗi edit). `nogo-precommit.sh` chạy nó trên **toàn bộ git diff** → biến No-Go thành rào chắn thật, **không phụ thuộc agent nhớ**.

**Pre-commit hook** (`.git/hooks/pre-commit`, `chmod +x`):
```bash
#!/bin/bash
exec .v-flow/skills/implement/no-go-zone-guard/scripts/nogo-precommit.sh
```
→ chặn commit nếu chạm 🔴 Strict zone. Thêm `--strict-warn` để chặn cả 🟡.

**CI (GitHub Actions)** — chặn PR:
```yaml
- name: No-Go Zone gate
  run: bash .v-flow/skills/implement/no-go-zone-guard/scripts/nogo-precommit.sh --base origin/${{ github.base_ref }} --strict-warn
```

Exit: `0` sạch (hoặc chỉ 🟢 Low) · `1` chạm 🔴 (hoặc 🟡 khi `--strict-warn`). Mặc định: staged files. `--base <ref>`: so với base ref (CI/PR).

---

## Gotchas

→ Xem `gotchas.md` cho lỗi phổ biến — cập nhật liên tục.
