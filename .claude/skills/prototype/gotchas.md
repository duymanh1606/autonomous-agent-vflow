# Prototype Skill — Gotchas

> Cập nhật liên tục khi Agent mắc lỗi mới. Mỗi gotcha = 1 lesson learned từ thực tế.

---

## G-001: Prototype trước khi có câu hỏi rõ ràng

**Lỗi**: Agent bắt đầu build prototype ngay mà chưa viết rõ câu hỏi cần trả lời.

**Hậu quả**: Prototype scope creep — người dùng không biết prototype này đang kiểm tra gì, không thể ra verdict.

**Fix**: Bắt buộc ghi `# Question: ...` ở đầu README prototype TRƯỚC khi viết 1 dòng code. Nếu câu hỏi chưa rõ → hỏi user hoặc detect từ spec trước.

---

## G-002: Chọn sai branch

**Lỗi**: Câu hỏi về state machine nhưng tạo UI prototype. Hoặc câu hỏi về layout nhưng tạo LOGIC TUI.

**Hậu quả**: Prototype trả lời sai câu hỏi, waste toàn bộ thời gian.

**Fix**: Đọc lại SKILL.md branch selection guide. Rule of thumb: nếu câu hỏi kết thúc bằng "có đúng không?" → LOGIC; "nên trông như thế nào?" → UI.

---

## G-003: LOGIC branch — Trộn TUI code vào logic module

**Lỗi**: `logic.ts` có `console.log`, readline, hoặc escape codes (`\x1b[1m`).

**Hậu quả**: Logic module không portable — không thể lift vào real code sau khi prototype done.

**Fix**: Logic module phải 100% pure. TUI là thin shell bọc ngoài. `console.log` chỉ được xuất hiện trong `tui.ts`, không bao giờ trong `logic.ts`.

---

## G-004: UI branch — Variants chỉ khác màu

**Lỗi**: Tạo 3 variants nhưng chúng chỉ khác color scheme hoặc spacing nhỏ.

**Hậu quả**: Không phải UI prototype thật — chỉ là tweak. Không giúp user ra quyết định về structure.

**Fix**: Mỗi variant phải có **khác biệt về structure**: layout khác (sidebar vs top nav vs cards), information hierarchy khác, primary affordance khác. Nếu 2 variants quá giống → redo 1 cái với explicit constraint "no card grid" hoặc "no sidebar".

---

## G-005: UI branch — Bỏ qua Sub-shape A

**Lỗi**: Luôn tạo new throwaway route (Sub-shape B) mà không xét Sub-shape A (embed trong existing page).

**Hậu quả**: Prototype chạy trong vacuum — mọi variant đều trông ổn vì không có real data, real header, real sidebar. Design issues chỉ lộ ra khi đặt trong context thật.

**Fix**: Luôn hỏi "có existing page nào có thể host variants này không?" trước khi chọn Sub-shape B. Nếu có → Sub-shape A là default.

---

## G-006: Scope creep — Prototype trở thành MVP

**Lỗi**: Prototype được thêm error handling, tests, abstractions, auth integration.

**Hậu quả**: Tốn thời gian gấp 10x; khó xóa khi done; đôi khi bị promote lên production dưới prototype constraints.

**Fix**: Mỗi khi muốn thêm gì → hỏi "Cái này có giúp trả lời câu hỏi không?" Nếu không → đừng thêm. Prototype là throwaway, không phải MVP.

---

## G-007: Không update `.flow-state.yaml` sau verdict

**Lỗi**: Có verdict rồi nhưng quên update `artifacts.prototype.*` trong `.flow-state.yaml`.

**Hậu quả**: `/v.status` dashboard hiển thị sai pipeline state. Plan Agent không biết prototype đã done.

**Fix**: Sau khi ghi `prototype-notes.md` → ngay lập tức update `.flow-state.yaml`. Thứ tự bắt buộc: notes → session → flow-state → cleanup code.

**Validate**: Chạy `.v-flow/skills/prototype/scripts/check-flow-state.sh <feature-number>` để verify.

---

## G-008: `--req` flag nhưng REQ không có ambiguity

**Lỗi**: User dùng `--req REQ-E01` nhưng REQ-E01 rõ ràng, không ambiguous.

**Hậu quả**: Prototype giải quyết thứ không cần giải quyết — waste effort.

**Fix**: Dù user chỉ định `--req`, vẫn phải đọc REQ đó và confirm với user "REQ này cụ thể rồi, bạn có chắc muốn prototype không?" Nếu user confirm → tiến hành, ghi rõ lý do trong prototype-notes.md.

---

## G-009: Prototype không chạy được ngay (one-command requirement)

**Lỗi**: User cần thực hiện 4-5 bước setup trước khi chạy prototype.

**Hậu quả**: Friction ngăn user interact sớm với prototype. Prototype mất đi giá trị "fast feedback".

**Fix**: Test run command trước khi hand over. Với HTML mode: mở file trong browser phải work ngay (inline JS, không external deps). Với LOGIC: `pnpm prototype:NNN` phải chạy được ngay từ project root.

---

## G-010: Không cleanup sau verdict

**Lỗi**: `prototype/` folder vẫn còn trong `.v-flow/features/NNN/` sau khi có verdict.

**Hậu quả**: Code prototype (không có tests, không production-quality) bị confuse với real code. Repo bloat.

**Fix**: Luôn nhắc user xóa `prototype/` sau khi verdict đã được ghi vào `prototype-notes.md`. Chỉ giữ `prototype-notes.md`.

**Validate**: Chạy `.v-flow/skills/prototype/scripts/check-prototype-cleanup.sh` (không cần args) để scan tất cả features.

---

## G-011: Xung đột phím nhập liệu trong TUI (Raw Mode Input Crash)

**Lỗi**: Agent viết code TUI để hỏi người dùng nhập liệu (nhập số tiền, tên, câu trả lời) nhưng vẫn giữ nguyên chế độ lắng nghe phím Raw Mode (`setRawMode(true)`).

**Hậu quả**: Khi người dùng nhấn phím đầu tiên để nhập liệu, TUI hiểu nhầm đó là một phím tắt menu, gây ra lỗi crash chương trình ngay lập tức hoặc nhảy menu sai lệch.

**Fix**: Bắt buộc phải tắt Raw Mode (`process.stdin.setRawMode(false)`) và pause stdin trước khi tạo giao diện `readline`/`prompt`. Sau khi nhận được dữ liệu (User nhấn Enter), mới bật lại Raw Mode (`setRawMode(true)`) và resume stdin để nhận phím tắt. Xem blueprint mẫu trong `LOGIC.md` phần `4.5. Handling Text & Number Inputs`.

---

## G-012: Bàn giao "mù" (Blind Handover)

**Lỗi**: Agent tạo xong mã nguồn prototype và đưa ngay lệnh chạy cho người dùng mà không tự chạy thử trước.

**Hậu quả**: Người dùng nhận được lệnh nhưng không chạy được do lỗi cú pháp TypeScript, lỗi đường dẫn import path (`@/` resolving), hoặc thiếu thư viện phụ thuộc chưa cài đặt.

**Fix**: Agent bắt buộc phải chạy thử lệnh (sử dụng `run_command` trên terminal của workspace) và đảm bảo chương trình biên dịch/khởi động thành công không bị crash trong ít nhất 500ms - 1s trước khi bàn giao lệnh chạy cho người dùng.

