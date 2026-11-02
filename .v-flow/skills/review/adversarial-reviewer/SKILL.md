---
name: adversarial-reviewer
description: "Hướng dẫn Review Agent tìm issues trong code. Agent PHẢI đọc skill này khi /v.review được gọi. Review đủ 5 chiều có bằng chứng — không ép số lượng issue, KHÔNG LGTM trống."
trigger: "Khi /v.review được gọi"
phase: "R.1"
used_by:
  - /v.review
---

# Adversarial Reviewer — Review Không Nhân Nhượng

> ⚠️ Đây là **Skill bắt buộc** cho Review Agent.
> QUAN TRỌNG: Bắt buộc **review đủ 5 chiều có bằng chứng** — KHÔNG ép số lượng issue. "LGTM"/"Looks good" trống (không bằng chứng) BỊ CẤM; "no material findings" hợp lệ nếu kèm residual risk + test gap.
>
> → Xem `gotchas.md` cho issues hay gặp nhất (historical data).
> → Xem `examples/good/` cho mẫu review report chuẩn.
> → Xem `config.json` để customize (min_issues, review_depth).
> → Chạy `.v-flow/skills/review/adversarial-reviewer/scripts/quick-security-scan.sh <dir>` để pre-scan trước review.

---

## Khi nào review KHÁC

- **Quick Fix** (`/v.quickfix`): Vẫn review đủ chiều nhưng scope nhỏ hơn.
- **Hotfix** (`/v.hotfix`): Focus correctness + security only. Có thể ≤3 nếu scope rất nhỏ.

---

## 5 Chiều Review — Pattern Detection

> 💡 Phần này cung cấp **signals để tìm issues**, không phải step-by-step.
> Agent tự quyết thứ tự và depth dựa trên feature.

### 1. 🎯 Correctness — Code vs Spec alignment

**Signals cần tìm:**
- Function behavior khớp REQ-xxx description? → So sánh spec → code
- Edge cases trong test-cases.md có test code tương ứng?  
- Return types/error codes match expected?
- Off-by-one errors (>, >=, <, <=)
- Null/undefined không được handle

### 2. 🏗️ Architecture — Constitution compliance

**Signals cần tìm:**
- Import direction vi phạm layer rules? (presentation → domain OK, domain → presentation ❌)
- Pattern mismatch? (constitution nói Repository, code dùng direct DB query)
- No-Go Zone violated?
- Naming convention bị mix? (camelCase + snake_case trong cùng module)

### 3. 🔒 Security — Attack surface check

**Grep patterns trong code review:**
```
String concatenation SQL:  `+ variable`, `${variable}` trong SQL strings
Hardcoded secrets:         `password`, `apiKey`, `secret`, `token` = literal value
Missing validation:        req.body dùng trực tiếp không qua validation
Sensitive logging:         console.log(password), console.log(token)
Missing auth check:        Route handler không có auth middleware
XSS vectors:               innerHTML =, dangerouslySetInnerHTML, v-html
```

### 4. 📊 Quality — Test & maintainability

**Signals cần tìm:**
- Test coverage gaps → file có logic nhưng không có test file tương ứng
- Error handling → try-catch thiếu hoặc swallow (`catch(e) {}`)
- Magic numbers → `if (count > 5)` thay vì `if (count > MAX_RETRIES)`
- Dead code → functions/variables defined but never used
- TODO/FIXME/HACK comments → tech debt indicators

### 5. ⚡ Performance — Resource efficiency

**Grep patterns:**
```
N+1 queries:    `for ... await db.query()`
Missing index:  WHERE clause on non-indexed column
Memory leak:    addEventListener without removeEventListener
Large payload:  SELECT * thay vì specific columns
Missing pagination: findAll() without limit
```

---

## Issue Severity Reference

| Severity | Criteria | Action Required |
|:--------:|---------|----------------|
| 🔴 **Critical** | Bug, security vuln, data loss, crash | **MUST fix** — block merge |
| 🟡 **Major** | Architecture violation, missing test, bad pattern | **SHOULD fix** — discuss if needed |
| 🟢 **Minor** | Style, naming, improvement, optimization | **CAN fix** — optional |

**Rule**: review đủ 5 chiều; mỗi finding có severity + `file:line` + bằng chứng. **Không ép số lượng** — nếu không có material finding, ghi rõ scope/assumptions/residual risk + test gap còn lại.

---

## Concern Verification

> 💡 Phần này KHÔNG ĐƯỢC BỎ QUA.

Review Agent PHẢI verify W-xxx concerns từ R.0 (validation-report.md):

```
1. Đọc validation-report.md → §4 Concerns
2. Với mỗi W-xxx:
   - Tìm code implementation giải quyết concern
   - Verify implementation đúng và đủ
   - Ghi kết quả vào review report
```

---

## Output Format

→ Xem `examples/good/review-report-template.md` cho format chuẩn.

Minimum required sections:
- **Summary**: Files reviewed, issues count, verdict
- **Issues**: Mỗi issue có CR-xxx ID, severity, file:line, description, suggestion
- **Concerns Verification**: Ma trận W-xxx → resolved?

---

## Reviewer Biases Cần Tránh

| Bias | Mô tả | Cách tránh |
|------|-------|----------|
| **Familiarity** | Ít critical với code style mình suggest | Review như người ngoài |
| **Nitpicking overload** | 20 minor issues che mất 1 critical | Sort by severity first |
| **Style wars** | Tranh cãi formatting khi không có convention | Skip nếu constitution không nói |
| **Recency** | Focus file cuối cùng, quên file đầu | Systematic — file by file |

---

## Gotchas

→ Xem `gotchas.md` cho issues historical data — cập nhật sau MỖI review cycle.
