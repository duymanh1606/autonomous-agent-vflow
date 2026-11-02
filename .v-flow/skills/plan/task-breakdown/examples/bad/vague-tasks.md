# Ví dụ XẤU — Tasks mơ hồ (KHÔNG làm theo)

> ⚠️ Đây là **anti-pattern**. Đối chiếu với `examples/good/tasks-login-feature.md`.
> Mỗi khối minh họa một lỗi trong `gotchas.md` hoặc thiếu trường bắt buộc trong schema.

---

## ❌ 1. Task quá lớn + thiếu ENTRYPOINT

```markdown
#### T-001: Implement toàn bộ feature login `[LOGIC]`
- **Mô tả**: làm hết login.
```

**Sai vì**: 1 task ôm cả feature → không biết khi nào xong, test khó viết; cả list không có `[ENTRYPOINT]`.
**Sửa**: tách theo component (model → repo → usecase → UI), đúng 1 task `[ENTRYPOINT]`. Rule: 1 task ≈ 1 component ≈ 1–3 REQ ≈ 1 TDD cycle.

---

## ❌ 2. Thiếu trường bắt buộc (Done khi / Complexity / Type / TDD)

```markdown
#### T-002: Sửa màn product
- **Files**: lib/ui/product_page.dart
```

**Sai vì**: không có Task Type, không Complexity, không `Done khi` (bám AC), không block TDD → validator cảnh báo, dev phải hỏi lại "xong là sao?".
**Sửa**: gắn `[UI]` · `Complexity: M` · `Done khi: AC REQ-xxx spec §4` · block `TDD` (Red→Green).

---

## ❌ 3. Sửa code chung chung (thiếu Vị trí + Hiện trạng→Mong muốn)

```markdown
#### T-003: Update ProductScreen `[UI]`
- **Mô tả**: cải thiện màn product.
```

**Sai vì**: "cải thiện" → không rõ sửa symbol nào, từ gì sang gì.
**Sửa**: Vị trí `ProductScreen.build()` · Hiện trạng: render list phẳng → Mong muốn: thêm `FilterBar` + cột `Trạng thái` (badge), filter theo status.

---

## ❌ 4. Fake `[PARALLEL]` (2 task cùng sửa 1 file)

```markdown
#### T-004: Thêm filter `[UI]` `[PARALLEL]`
- **Files**: lib/ui/product_page.dart
#### T-005: Thêm cột trạng thái `[UI]` `[PARALLEL]`
- **Files**: lib/ui/product_page.dart
```

**Sai vì**: hai task song song nhưng sửa **cùng** `product_page.dart` → xung đột.
**Sửa**: gộp thành 1 task, hoặc cho 1 task `[DEPENDS]` task kia (tuần tự). Validator sẽ cảnh báo "Fake [PARALLEL]".

---

## ❌ 5. Circular dependency / thiếu REQ

```markdown
#### T-006: A `[DEPENDS: T-007]`   (không REQ)
#### T-007: B `[DEPENDS: T-006]`   (không REQ)
```

**Sai vì**: T-006↔T-007 vòng lặp → không bao giờ chạy được; cả hai không trace REQ → task thừa.
**Sửa**: tách logic chung sang T-000, cả hai `[DEPENDS: T-000]`; mỗi task gắn REQ-xxx.

---

## ❌ 6. "Done" = chỉ test pass

```markdown
- **Done khi**: tất cả test pass.
```

**Sai vì**: test pass ≠ đáp ứng nghiệp vụ; có thể test sai/thiếu.
**Sửa**: `Done khi` bám **Acceptance Criteria** cụ thể trong spec §4 (vd: "nút submit disable khi form invalid + snackbar khi 401"). TDD là *cách* làm, AC là *đích*.
