---
name: constitution-enforcer
version: "1.0"
agent: implement
phase: B.1
triggers:
  - implement_agent_pre_commit
  - review_agent_check
dependencies:
  - _shared/constitution-reader
  - _shared/context-reader
input:
  - constitution.md
  - source code files
  - context.md (for no-go zones)
output:
  - compliance_report (pass/fail with violations list)
complexity: medium
---

# Constitution Enforcer Skill

> **Purpose**: Tự động kiểm tra code đang implement có tuân thủ các quy tắc trong `constitution.md` không.
> **Khi nào dùng**: Trước mỗi commit trong B.1 (Implement) và tại R.1 (Review).

## Quick Reference

```
Input:  constitution.md + source code files + context.md
Output: Compliance report (PASS / FAIL with violations)
Agent:  Implement Agent, Review Agent
Phase:  B.1 → R.1
```

## Enforcement: tool-enforced vs LLM-judged

> ⚠️ Đừng tự lừa bằng "đọc bằng mắt". Tách rõ phần **chạy được bằng lệnh** và phần **cần LLM/human suy xét**.

| Tầng | Cách enforce | Gồm |
|------|-------------|-----|
| **Cơ học (deterministic)** | `bash .v-flow/skills/implement/constitution-enforcer/scripts/check-constitution.sh` + linter dự án | hardcoded secret, lint/format, (mở rộng được: forbidden import) |
| **Semantic (LLM/human)** | đọc `constitution.md` + đối chiếu code | architecture/layer separation, naming convention nghiệp vụ, API/UI convention |

- Implement Agent ở **B.1** chạy script ở Bước 4 (pre-commit). Lint command lấy từ `.v-flow/config.yaml → lint_command` hoặc autodetect.
- Phần semantic vẫn phải review — script **không** thay thế.
- Muốn enforce cứng → wire script vào git pre-commit / CI (xem `## Wiring enforcement thật` cuối file).

## What This Skill Does

1. **Parse Constitution Rules** — Đọc `constitution.md`, trích xuất các quy tắc enforceable
2. **Classify Rules** — Phân loại thành: Naming, Architecture, Testing, Security, API, UI/UX
3. **Scan Code** — Phần cơ học chạy `.v-flow/skills/implement/constitution-enforcer/scripts/check-constitution.sh`; phần semantic LLM đối chiếu
4. **Report** — Tạo compliance report với violations và suggestions

## Rule Categories

| Category | Examples | Auto-checkable |
|----------|---------|----------------|
| **Naming** | Variable naming, file naming conventions | ✅ Yes |
| **Architecture** | Layer separation, forbidden imports | ✅ Yes |
| **Testing** | Min coverage, test file naming | ✅ Yes |
| **Security** | No hardcoded secrets, input validation | ⚠️ Partial |
| **API** | Response format, error handling | ⚠️ Partial |
| **UI/UX** | Design system usage | ❌ Manual |

## How to Use

### Step 1: Extract Rules from Constitution

```markdown
Đọc constitution.md, trích xuất các quy tắc có thể enforce tự động.
Mỗi rule cần có:
- Rule ID (ví dụ: CONST-ARCH-001)
- Category (Naming/Architecture/Testing/Security/API)
- Description
- Check method (regex pattern, import check, file structure check)
- Severity (error/warning)
```

### Step 2: Check Code Against Rules

```markdown
Cho mỗi file trong changeset:
1. Check naming conventions (file names, function names, variable names)
2. Check import patterns (forbidden dependencies, layer violations)
3. Check test existence (nếu constitution yêu cầu)
4. Check security patterns (hardcoded values, unsafe operations)
5. Check API conventions (response format, error handling)
```

### Step 3: Generate Report

```markdown
## Constitution Compliance Report

### Summary
- Rules checked: X
- Violations: Y (Z errors, W warnings)
- Compliance score: XX%

### Violations
| # | Rule | File | Line | Description | Severity |
|---|------|------|------|-------------|----------|
| 1 | CONST-ARCH-001 | src/api/handler.js | 15 | Direct DB access from handler (should use repository) | Error |

### Passed Rules
| Rule | Description |
|------|-------------|
| CONST-NAME-001 | File naming follows kebab-case |
```

## Integration Points

- **Pre-commit**: Implement Agent chạy trước khi commit
- **Review**: Review Agent include trong adversarial review
- **CI**: Có thể tích hợp vào CI pipeline

## Gotchas

1. **Không phải mọi rule đều auto-checkable** — UI/UX rules cần manual review
2. **False positives** — Regex-based checks có thể bắt nhầm. Agent nên verify context
3. **Performance** — Với codebase lớn, chỉ check changed files, không scan toàn bộ
4. **Constitution evolves** — Khi constitution update, cần re-run check trên existing code

## Wiring enforcement thật (tùy chọn — khuyến nghị cho production)

> Frontmatter `triggers: [pre_commit, review_check]` chỉ là **ý định** — harness/Claude Code KHÔNG tự fire. Có 2 cách để enforce thật (chọn 1):

1. **Agent-invoked (mặc định, không cần setup)**: Implement Agent chạy script trong quy trình B.1 (Bước 4). Deterministic trong 1 lần chạy V-Flow, nhưng phụ thuộc agent thực hiện đúng quy trình.
2. **Hard gate (CI / git hook)** — chống bỏ sót triệt để:
   - **git pre-commit**: tạo `.husky/pre-commit` (hoặc `.git/hooks/pre-commit`) gọi `bash .v-flow/skills/implement/constitution-enforcer/scripts/check-constitution.sh` và `.v-flow/skills/implement/no-go-zone-guard/scripts/check-nogo-zones.sh` cho mỗi staged file.
   - **CI**: thêm step chạy 2 script trên PR; fail build nếu exit ≠ 0.

> ⚠️ Việc tạo git hook làm thay đổi môi trường dev của cả team — chỉ thêm khi đã thống nhất.
