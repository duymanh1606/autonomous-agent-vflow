# Incident Runbook — Bad Example

> Ví dụ output THIẾU SÓT — không nên làm theo.

## ❌ Bad Output — Quá sơ sài

```markdown
## Incident

Login broke after deployment. Fixed the config. Back to normal now.
```

## Vấn đề

| # | Lỗi | Giải thích |
|---|------|-----------|
| 1 | Không có severity | Không biết P1 hay P4 |
| 2 | Không có timeline | "Sau deployment" — khi nào? bao lâu? |
| 3 | Không có root cause | "Config" — config gì? |
| 4 | Không có impact assessment | "Broke" — ảnh hưởng bao nhiêu user? |
| 5 | Không có post-mortem | Không học được gì → sẽ lặp lại |
| 6 | Không có action items | Không ai chịu trách nhiệm prevent |

## ❌ Bad Output — Có structure nhưng thiếu depth

```markdown
## Incident Report INC-042

**Severity**: P1
**Issue**: Login not working  
**Fix**: Updated config
**Status**: Resolved

### Actions
- Fix the bug
- Deploy fix
```

## Vấn đề

| # | Lỗi | Giải thích |
|---|------|-----------|
| 1 | "Login not working" — mơ hồ | 500? 403? Timeout? |
| 2 | "Updated config" — cụ thể gì? | File nào? Thay đổi gì? |
| 3 | Không có timeline | Mất bao lâu detect→fix? |
| 4 | Không có verification | Sao biết fix hoạt động? |
| 5 | Actions quá generic | "Fix the bug" — already done? future prevention? |
| 6 | Không blame-free analysis | Không có systemic improvement |
