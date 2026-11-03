# Gotchas — EARS Notation

> Cập nhật liên tục khi Agent gặp edge case mới.
> Đây là "cheat sheet sai lầm" cho mọi Agent làm việc với requirements.

---

## Interpretation Gotchas

1. ❌ **Prefix sai loại** — REQ-E nhưng nội dung Ubiquitous.
   - **VD**: "REQ-E01: Hệ thống phải hash password" → thiếu trigger → là REQ-U.
   - **Hậu quả**: Test Agent viết event test cho invariant rule → miss coverage.

2. ❌ **Interpret REQ-U như "nice-to-have"** — "Hệ thống phải validate" → Agent nghĩ "optional".
   - **Rule**: "phải" = MANDATORY. Ubiquitous = always enforced, every single request.

3. ❌ **Confuse State-driven vs Event-driven**
   - "Khi" = 1 event xảy ra, xong rồi thôi → **E**
   - "Trong khi" = suốt thời gian ở state → **S**
   - **VD**: "Khi user nhấn nút" = E. "Trong khi đang tải" = S.

4. ❌ **Quên branch test cho REQ-O** — Optional REQ chỉ test condition=true.
   - **Rule**: REQ-O PHẢI có test cho CẢ true branch VÀ false branch.
   - **Hậu quả**: Untested else branch → bug khi condition false.

5. ❌ **Count TCs sai per type**
   
   | REQ Type | Minimum TCs | Lý do |
   |:--------:|:-----------:|-------|
   | REQ-U | 1-2 | Invariant — verify ở ≥1 context |
   | REQ-E | 2-3 | Success + error + edge case |
   | REQ-S | 2-4 | Enter state + during + exit + timeout |
   | REQ-O | 2+ | condition=true + condition=false |

6. ❌ **Plan Agent bỏ qua REQ-S** — Quên design state management.
   - **Signal**: Spec có REQ-S nhưng plan không mention state. 
   - **Fix**: Mỗi REQ-S → plan.md PHẢI có state management component.

7. ❌ **REQ-U nhưng implement conditional** — "Hệ thống phải log" nhưng code có `if (env === 'prod')`.
   - **Rule**: REQ-U = unconditional. Nếu cần conditional → chuyển sang REQ-O.

8. ❌ **Mixed language IDs** — REQ-E01 viết tiếng Việt nhưng REQ-E02 viết tiếng Anh.
   - **Rule**: Đọc `config.json → language` setting. Nhất quán.
