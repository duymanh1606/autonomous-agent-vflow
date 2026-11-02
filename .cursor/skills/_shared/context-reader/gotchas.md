# Gotchas — Context Reader

> Cập nhật liên tục khi Agent gặp edge case mới.
> Legacy projects là "minefield" — mỗi gotcha ở đây từ lỗi thực tế.

---

## Gotchas Phổ Biến

1. ❌ **Skip context.md vì "greenfield"** — File tồn tại = legacy. Phải đọc.
   - **Check**: `ls .v-flow/context.md` — exists? → read.
   - **Hậu quả**: Agent implement pattern sai cho legacy codebase.

2. ❌ **AI-inferred → chấp nhận không verify** — AI có thể sai hoàn toàn.
   - **VD**: AI infer "sử dụng JWT auth" nhưng thực tế dùng session-based.
   - **Fix**: Cross-reference với code thực. Đánh dấu mức tin cậy.
   - **Hậu quả**: Plan Agent design JWT flow → implement fail.

3. ❌ **Outdated context → plan wrong** — context.md nói "Node 14" nhưng đã upgrade Node 18.
   - **Fix**: Check `Last updated` date. > 30 ngày → WARN + suggest refresh.
   - **Hậu quả**: Implement Agent dùng Node 14 syntax/API → warnings hoặc errors.

4. ❌ **Bỏ qua No-Go Zones trong output** — Đọc context.md nhưng không extract No-Go list.
   - **Rule**: No-Go Zones ALWAYS included in output, ALWAYS.
   - **Hậu quả**: Downstream agents đụng No-Go → bị block muộn, waste effort.

5. ❌ **Conflict context vs constitution không flag** — Reality ≠ Rules nhưng Agent chọn 1.
   - **Fix**: Flag conflict rõ ràng. Ghi _session.md. Implement code mới theo constitution.
   - **Hậu quả**: Inconsistent codebase — half old style, half new style.

6. ❌ **Quên tech debt entries** — context.md liệt kê SQL injection nhưng Agent plan không address.
   - **Fix**: Tech debt items PHẢI được xem xét trong plan.md (address hoặc explicit acknowledge).
   - **Hậu quả**: Known vulnerabilities not addressed → security risk.

7. ❌ **Module Map = boundary** — Agent chạm module ngoài scope.
   - **VD**: Task nói "fix product page" nhưng Agent sửa cả payment module.
   - **Fix**: Kiểm tra Module Map. Module không listed = out of scope.
   - **Hậu quả**: Scope creep → unplanned changes → regression.

8. ❌ **Trust level uniform** — Treat verified và AI-inferred cùng weight.
   - **Fix**: Xem Trust Levels table trong SKILL.md. 🔴 items = DON'T rely.

---

## Edge Cases

- **context.md rỗng**: File exists nhưng không có content → treat như greenfield
- **context.md quá dài (> 300 LOC)**: Đọc §4 No-Go Zones TRƯỚC, còn lại after
- **Multiple context.md** (monorepo): Đọc gần nhất theo directory hierarchy
