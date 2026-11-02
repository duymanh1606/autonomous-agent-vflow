# Gotchas — Cross Validator

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **Rubber stamp PASS** — Tất cả trông OK → PASS mà không check kỹ.
   - **Hậu quả**: Gaps leak ra implement → costly rework.
   - **Fix**: PHẢI build traceability matrix. Không có matrix = không có verdict.

2. ❌ **FAIL vì perfectionism** — Fail mọi thứ vì "có thể tốt hơn".
   - **Fix**: FAIL chỉ khi có EVIDENCE cụ thể: missing REQ coverage, constitution violation, No-Go Zone.

3. ❌ **Quên No-Go Zone check** — Validate spec↔plan nhưng không check context.md.
   - **Hậu quả**: Plan includes No-Go Zone modification → Implement Agent blocked.
   - **Fix**: ALWAYS check plan file paths vs context.md No-Go Zones.

4. ❌ **Concerns quá vague** — "W-001: Cần cải thiện quality."
   - **Fix**: Concern PHẢI specific: "W-001: REQ-E02 chỉ có 1 TC (chỉ happy path), thiếu error TC."

5. ❌ **Quên routing decision** — Report không nói FAIL vì gì và route đi đâu.
   - **Fix**: Mỗi FAIL PHẢI có `fail_reason` + `route_decision`. Mỗi CONCERN PHẢI có `assigned_to`.

6. ❌ **Đếm TC nhưng không check content** — "REQ-E01 có 3 TC" nhưng 3 TC test cùng behavior.
   - **Fix**: Check TC CONTENT, không chỉ count. Duplicate TCs = coverage ảo.

7. ❌ **Miss plan↔constitution alignment** — Verify REQ coverage nhưng quên pattern check.
   - **Fix**: Phase 2 Consistency Check PHẢI bao gồm constitution pattern alignment.

8. ❌ **Suy đoán thay vì flag** — Spec mơ hồ → tự interpret rồi PASS.
   - **Fix**: Mơ hồ = flag. Không tự điền thông tin thiếu. Concern hoặc FAIL → BA Agent fix.

---

## Edge Cases

- ✅ Spec rất nhỏ (2-3 REQ) → Matrix vẫn bắt buộc. Đơn giản hơn nhưng phải có.
- ✅ No constitution.md → FLAG [⚠️ No constitution] → PASS WITH CONCERNS mặc định.
- ✅ No context.md (greenfield) → Skip No-Go Zone check, note trong report.
- ✅ > 5 concerns → Nâng lên FAIL, quá nhiều concerns = plan chưa ready.
