# Template: Code Review Report — Báo cáo Adversarial Review

> Được tạo bởi **Review Agent** — Phase R.1
> Feature: [TÊN FEATURE]
> Spec Version: [vX.Y]
> Ngày review: [YYYY-MM-DD]

---

## Kết quả tổng hợp

| | Kết quả |
|---|---|
| **PHÁN QUYẾT** | ✅ **APPROVED** / ⚠️ **APPROVED WITH NOTES** / ❌ **CHANGES REQUIRED** |
| **Spec Version** | vX.Y |
| **Issues tìm được** | [N] (bắt buộc ≥ 3) |
| **Concerns từ R.0 verified** | [N]/[N] |

---

## 1. Spec Compliance — Code có đúng spec không?

| Requirement | Implemented? | Test? | Ghi chú |
|------------|:-----------:|:-----:|---------|
| REQ-U01 | ✅ / ❌ | ✅ / ❌ | |
| REQ-E01 | ✅ / ❌ | ✅ / ❌ | |

**Coverage**: [X/Y] requirements implemented → [XX]%

---

## 2. Architecture Compliance — Đúng plan không?

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| Code theo architecture trong plan.md | ✅ / ❌ | |
| File paths khớp với plan.md | ✅ / ❌ | |
| Dependencies đúng plan | ✅ / ❌ | |
| Không có code ngoài scope | ✅ / ❌ | |

---

## 3. Constitution Compliance

| Nguyên tắc | Tuân thủ? | Ghi chú |
|-----------|:--------:|---------| 
| Naming convention | ✅ / ❌ | |
| Error handling pattern | ✅ / ❌ | |
| Testing standards | ✅ / ❌ | |
| Code documentation | ✅ / ❌ | |

---

## 4. Code Quality

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| No hardcoded values | ✅ / ❌ | |
| Proper error handling | ✅ / ❌ | |
| No code duplication | ✅ / ❌ | |
| Edge cases handled | ✅ / ❌ | |
| Performance acceptable | ✅ / ❌ | |
| Security concerns | ✅ / ❌ | |

---

## 5. Concerns Verification (từ R.0)

> Kiểm tra tất cả concerns từ `validation-report.md`

| Concern ID | Mô tả | Resolved? | Cách resolve |
|-----------|-------|:---------:|-------------|
| W-001 | [mô tả] | ✅ / ❌ | [cách giải quyết] |
| W-002 | [mô tả] | ✅ / ❌ | [cách giải quyết] |

---

## 6. Issues Found (≥ 3 bắt buộc)

### 🔴 Critical — Block merge
*(Không có)* / Liệt kê nếu có:
- **[CR-001]** `file:line` — [Mô tả] → Fix: [Đề xuất]

### 🟠 Major — Block merge
*(Không có)* / Liệt kê nếu có:
- **[MJ-001]** `file:line` — [Mô tả] → Fix: [Đề xuất]

### 🟡 Minor — Nên fix
- **[MN-001]** `file:line` — [Mô tả] → Suggestion: [Đề xuất]

### 🔵 Suggestions — Nice to have
- **[SG-001]** [Gợi ý cải thiện]

---

## 7. Routing Decision

**PHÁN QUYẾT**: ✅ APPROVED / ⚠️ APPROVED WITH NOTES / ❌ CHANGES REQUIRED

```yaml
# Dùng để cập nhật .flow-state.yaml
verdict: "APPROVED"
route_decision: "deploy"                # deploy | fix_and_re_review | escalate
concerns_all_resolved: true
```

**Route cụ thể**:

| Verdict | → Làm gì tiếp |
|---------|---------------|
| APPROVED | 🚀 Deploy → `/v.retrospective` → `/v.metrics` |
| APPROVED_WITH_NOTES | 🚀 Deploy + track notes → `/v.retrospective` |
| CHANGES_REQUIRED | Fix issues → `/v.review` lại |
| CHANGES_REQUIRED (lần 3+) | Escalate → human review toàn bộ |

---

> **Reviewer**: Review Agent
> **Principle**: ≥ 3 issues bắt buộc — không bao giờ "LGTM"
