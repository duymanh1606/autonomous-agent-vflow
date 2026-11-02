---
description: "Bugfix Flow — S.1(3-behavior) → B.0(opt) → B.1(3-tier TDD) → R.1. Dành cho bug cần investigate."
phase: "S.1 → B.0 → B.1 → R.1"
agents: ["bugfix-analyst-agent", "plan-agent", "implement-agent", "review-agent"]
---

# /v.bugfix

Chạy **Bugfix Flow** — pipeline chuẩn hóa để chẩn đoán và sửa lỗi (Surgical Bugfix), áp dụng 3-behavior model và 3-tier TDD.

> ⚠️ **Điều kiện sử dụng**: Chỉ dùng khi:
> - Bug cần investigate, ảnh hưởng nhiều file (≥ 5 files), hoặc cần regression testing
> - Có risk regression nếu sửa sai
> - Bug đã reproduced hoặc có log/evidence rõ ràng

> ❌ **Không dùng cho**:
> - Bug trivial < 5 files, nguyên nhân rõ ràng → dùng `/v.quickfix`
> - Production incident P1/P2 → dùng `/v.hotfix`
> - Mở rộng feature mới → dùng full pipeline `/v.specify`

---

## Phase 1: Bugfix Analysis [S.1]

Bạn là **Bugfix Analyst Agent** — chuyên gia chẩn đoán bug.

### Quy trình:
1. Đọc và tuân thủ tuyệt đối kỹ năng tại `skills/specify/bugfix-analyst/SKILL.md`
2. Phân tích root cause từ input
3. Khởi tạo `.flow-state.yaml` nếu chưa có (Phase S.1, type bugfix)
4. Xây dựng 3-Behavior Model:
   - BUG-B (Defect): Cái gì ĐANG SAI
   - BUG-E (Expected): Cái gì PHẢI ĐÚNG
   - BUG-U (Unchanged): Cái gì KHÔNG ĐƯỢC ĐỔI (≥ 2 items)
5. Thiết kế 3-Tier Test Plan (T1: Red, T2: Green, T3: Protect)
6. Output ra `bugfix.md` dựa theo `.v-flow/templates/bugfix-spec-template.md`
7. Cập nhật vào `_session.md`

### Routing sau Phase 1
- Human approve `bugfix.md` → /v.plan (nếu cần design) hoặc /v.implement (nếu fix đơn giản)
- Root cause confidence = low → DỪNG, yêu cầu user thêm log/debug session

---

## Phase 2: Fix Design [B.0a] (Optional)

Bạn là **Plan Agent** — thiết kế fix an toàn.

### Quy trình:
1. Đọc `bugfix.md`
2. Lên plan sửa đổi chi tiết, đảm bảo cover hết BUG-E và không break BUG-U.
3. Không đụng No-Go Zones trong `context.md`
4. Lên rollback plan
5. Output ra `plan.md`

---

## Phase 3: Implement Fix [B.1]

Bạn là **Implement Agent** — code theo TDD 3-Tier.

### Quy trình:
1. Thực hiện TDD theo 3 Tier:
   - 🔴 **RED**: Viết T1 tests (reproduce bug) → Run → confirm FAIL
   - 🟢 **GREEN**: Implement fix → Run T1 PASS → Run T2 PASS
   - 🛡️ **PROTECT**: Run T3 PASS (regression check) → Full suite PASS
2. Fix không được đụng tới files nằm ngoài scope trừ khi cần thiết (và update report)
3. Cập nhật kết quả vào `_session.md`

---

## Phase 4: Review + Bugfix Report [R.1]

Bạn là **Review Agent** — adversarial review và tạo báo cáo.

### Quy trình:
1. Đọc kỹ `bugfix.md` và changes
2. Xác nhận 3-Tier Test Plan đã được implement đầy đủ (T1, T2, T3 pass)
3. Xác nhận root cause thực sự đã được giải quyết
4. Tạo `bugfix-report.md` theo `.v-flow/templates/bugfix-report-template.md` (Trả lời 6 câu hỏi: Bug là gì? Root cause? Giải pháp? Sửa ntn? File nào sửa? File nào ảnh hưởng?)
5. Đưa ra Verdict.

### Verdict:
- APPROVED → Có bugfix-report.md → Deploy
- CHANGES_REQUIRED → Bắt buộc sửa lại
- ESCALATE → Chuyển sang full pipeline
