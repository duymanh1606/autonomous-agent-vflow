# Metrics Collector — Bad Example

> Ví dụ output THIẾU SÓT — không nên làm theo.

## ❌ Bad Output — Quá sơ sài

```markdown
## Metrics Report

Feature completed in 6 hours.
All tests passed. 
No major issues.
```

## Vấn đề

| # | Lỗi | Giải thích |
|---|------|-----------|
| 1 | Không có per-phase breakdown | Không biết phase nào bottleneck |
| 2 | Không có per-agent analysis | Không biết agent nào cần cải thiện |
| 3 | Không có benchmark comparison | "6 hours" có tốt hay không? |
| 4 | Không có trend data | Không biết đang cải thiện hay xuống |
| 5 | Không có recommendations | Metrics vô dụng nếu không actionable |
| 6 | Không track concerns | Concerns từ R.0 có resolved không? |

## ❌ Bad Output — Chỉ liệt kê không phân tích

```markdown
## Metrics

- S.1: 1.5h
- B.0a: 45m
- B.0b: 30m
- R.0: 20m
- B.1: 2.5h
- R.1: 40m

Total: 6.5h
```

## Vấn đề

| # | Lỗi | Giải thích |
|---|------|-----------|
| 1 | Raw data không insight | Liệt kê số nhưng không phân tích |
| 2 | Thiếu context | Không biết revision count, verdict |
| 3 | Không có percentage | Không thấy proportions |
| 4 | Không actionable | Không biết cần làm gì tiếp |
