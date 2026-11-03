# Constitution Enforcer — Bad Example

> Ví dụ output THIẾU SÓT — không nên làm theo.

## ❌ Bad Output

```markdown
## Constitution Check

Everything looks fine. No major issues found.

Compliance: OK
```

## Vấn đề

| # | Lỗi | Giải thích |
|---|------|-----------|
| 1 | Không cụ thể | "Everything looks fine" không list rules đã check |
| 2 | Không có evidence | Không chỉ rõ files đã scan |
| 3 | False negative | Có thể bỏ sót violations vì không check systematic |
| 4 | Không có score | Không có metric để track trends |
| 5 | Không liệt kê passed rules | Không chứng minh thực sự đã check |

## ❌ Bad Output — Quá vague

```markdown
## Compliance Report

- Checked 3 files
- Found some naming issues
- Architecture seems OK
```

## Vấn đề

| # | Lỗi | Giải thích |
|---|------|-----------|
| 1 | "Some naming issues" — mấy? ở đâu? | Phải chỉ file + line + rule |
| 2 | "Seems OK" — không xác định | Phải PASS hoặc FAIL rõ ràng |
| 3 | Không có Rule ID | Không thể trace back constitution section |
| 4 | Không có severity | Không biết Error hay Warning |
