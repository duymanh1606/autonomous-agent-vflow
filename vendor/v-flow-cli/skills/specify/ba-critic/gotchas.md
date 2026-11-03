# Gotchas — BA Critic

> Cập nhật liên tục khi Agent gặp bias hoặc edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **"Specs tốt rồi" / LGTM** — KHÔNG được chấp nhận. Luôn có ≥3 issues.
   - **Hậu quả**: Spec mơ hồ leak ra implement → costly rework.

2. ❌ **Bias từ round trước** — Đọc spec mới như chưa từng đọc.
   - **Hậu quả**: Miss issues mới do BA Agent vô tình giới thiệu khi fix issues cũ.

3. ❌ **Focus nên fixing thay vì finding** — Critic Agent TÌM issues, không FIX.
   - **Fix**: Mô tả issue + suggest hướng fix. BA Agent quyết cách fix.

4. ❌ **Nitpicking wording, bỏ qua logic** — Sửa dấu chấm câu nhưng miss missing REQ.
   - **Fix**: Sort by severity — Critical/Major trước, Minor sau.

5. ❌ **Confirm bias** — "Round trước nói 3 issues, round này cũng 3 vì spec tốt hơn rồi."
   - **Fix**: Fresh context. Đọc spec fresh, tìm issues hoàn toàn MỚI.

6. ❌ **Copy issues từ blueprint** — Tìm issues generic ("cần thêm error handling") thay vì specific.
   - **Fix**: Mỗi issue phải reference REQ-xxx + giải thích cụ thể VÌ SAO sai.

7. ❌ **Quên context.md** — Review spec mà không kiểm tra No-Go Zones.
   - **Check**: REQ-xxx có yêu cầu modify code trong No-Go Zone? → CRITICAL issue.

8. ❌ **Quên constitution.md** — Spec suggest pattern khác constitution.
   - **Check**: Architecture pattern trong spec align với constitution? Naming conventions?

---

## Edge Cases

- ✅ Spec rất ngắn (< 5 REQs) → Vẫn phải tìm ≥3 issues. Check completeness kỹ hơn.
- ✅ First round trên fresh spec → Focus ambiguity + completeness (thường nhiều issues nhất).
- ✅ Round 3+ vẫn REVISE NEEDED → Escalate cho human. Ghi vào `_session.md`.
