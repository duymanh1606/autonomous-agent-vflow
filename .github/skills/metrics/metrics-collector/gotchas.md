# Metrics Collector — Gotchas & Common Mistakes

## ⚠️ Gotcha 1: Vanity Metrics

**Sai**: Focus vào "total features completed" — không phản ánh quality.  
**Đúng**: Đo **first-pass approval rate** và **rework rate** — phản ánh thực sự Agent performance.

## ⚠️ Gotcha 2: Missing Baseline

**Sai**: Report metrics mà không có benchmark.  
**Đúng**: So sánh với 5 features gần nhất. Feature đầu tiên là baseline, không phải target.

## ⚠️ Gotcha 3: Ignoring Context

**Sai**: So sánh cycle time giữa simple CRUD feature và complex integration feature.  
**Đúng**: Normalize theo requirements count. Report requirements/hour thay vì absolute time.

## ⚠️ Gotcha 4: Skipping Recommendations

**Sai**: Chỉ report numbers, không đề xuất action.  
**Đúng**: Mỗi metrics report PHẢI có ≥2 actionable recommendations dựa trên bottleneck analysis.

## ⚠️ Gotcha 5: Over-optimization

**Sai**: Mỗi feature đều thay đổi agent-config.md dựa trên metrics.  
**Đúng**: Chỉ update agent config sau 5-10 features. Trends matter, not individual data points.
