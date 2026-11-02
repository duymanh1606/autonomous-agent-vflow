# Gotchas — Constitution Reader

> Cập nhật liên tục khi Agent gặp edge case mới.
> Đây là "institutional memory" cho constitutional compliance.

---

## Gotchas Phổ Biến

1. ❌ **Đọc toàn bộ constitution mỗi lần** — Waste context window (500+ LOC).
   - **Fix**: Chỉ đọc sections liên quan (xem Per-Agent Extraction Depth table).
   - **Hậu quả**: Agent chậm, context window bị chiếm bởi rules không dùng.

2. ❌ **Constitution nói A, context.md nói B** — Conflict không phát hiện.
   - **VD**: Constitution: "No ORM, use raw SQL". Context.md: "Sequelize ORM đang dùng".
   - **Fix**: context.md reflect THỰC TẾ → ưu tiên context.md cho legacy. Ghi conflict.
   - **Hậu quả**: Agent dùng sai pattern → code inconsistent.

3. ❌ **Bỏ qua `[Cần quyết định]`** — Agent tự fill placeholder.
   - **VD**: §3 Testing: "[Cần quyết định]". Agent pick "80%" tự ý.
   - **Rule**: KHÔNG tự quyết. Ghi vào _session.md, chờ Tech Lead.
   - **Hậu quả**: Tech Lead không biết Agent đã quyết thay.

4. ❌ **Quên No-Go Zones** — Constitution §7 liệt kê nhưng Agent quên extract.
   - **Fix**: Output ALWAYS include No-Go list ở cuối, DÙ phase nào.
   - **Hậu quả**: Implement Agent đụng No-Go → bị block muộn.

5. ❌ **Version mismatch** — Constitution updated nhưng pipeline chạy từ version cũ.
   - **Fix**: Compare header version vs .flow-state.yaml. Flag nếu khác.
   - **Hậu quả**: Agent follow rules cũ → drift.

6. ❌ **Skip constitution cho greenfield** — "Dự án mới, chưa cần rules".
   - **Rule**: Greenfield CŨNG cần. Nếu chưa có → suggest `/v.constitute`.
   - **Hậu quả**: Code không consistent từ đầu.

7. ❌ **§5 Security bị skip** — Agent chỉ đọc §1, §2, quên §5.
   - **Rule**: §5 Security = ALWAYS ACTIVE cho MỌI phase.
   - **Hậu quả**: Security holes không được catch sớm.

---

## Edge Cases

- **Monorepo**: Nhiều constitution files → đọc gần nhất theo directory
- **Empty sections**: Constitution có heading nhưng nội dung trống → treat như [Cần quyết định]
- **Spec change mid-pipeline**: constitution.md §9 quy định enqueue/interrupt → đọc kỹ
