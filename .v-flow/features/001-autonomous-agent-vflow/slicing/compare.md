# So sánh variant

> Profile luật: `strict` · graph hash: `e7dc5f25`. **In đậm** = tốt nhất của dòng. Hệ thống không tự chọn variant.

| Metric | main-first | per-flow |
|---|---:|---:|
| strategy | main-first | per-flow |
| slice_count | 12 | 18 |
| points_per_slice (↓) | 2.9 / 7 | **1.9 / 6** |
| size_cv (↓) | **0.6** | 0.79 |
| first_demo_points (↓) | 9 | 9 |
| foundation_ratio (↓) | 0.09 | 0.09 |
| critical_path (↓) | **4** | 5 |
| parallel_width (↑) | 6 | **9** |
| cross_slice_ratio (↓) | 0.87 | 0.87 |
| uc_spread | 2.2 | 3.4 |
| rework_exposure (↓) | **4.67** | 7.07 |
| vi phạm error | 12 | 22 |
| vi phạm warn | 1 | 6 |

## Diff vị trí (luồng / task nằm ở slice khác nhau)

| Loại | ID | main-first | per-flow |
|---|---|---|---|
| flow | UC-01-E1 | SLICE-6 | SLICE-2 |
| flow | UC-01-E2 | SLICE-6 | SLICE-3 |
| flow | UC-01-E3 | SLICE-6 | SLICE-4 |
| flow | UC-01-A1 | SLICE-7 | SLICE-5 |
| flow | UC-02.main | SLICE-2 | SLICE-6 |
| flow | UC-02-E1 | SLICE-8 | SLICE-7 |
| flow | UC-03.main | SLICE-3 | SLICE-9 |
| flow | UC-03-E1 | SLICE-9 | SLICE-10 |
| flow | UC-03-E2 | SLICE-9 | SLICE-11 |
| flow | UC-04.main | SLICE-4 | SLICE-12 |
| flow | UC-04-E1 | SLICE-10 | SLICE-13 |
| flow | UC-04-E2 | SLICE-10 | SLICE-14 |
| flow | UC-04-A1 | SLICE-10 | SLICE-15 |
| flow | UC-05.main | SLICE-5 | SLICE-16 |
| flow | UC-05-E1 | SLICE-11 | SLICE-17 |
| task | T-005 | SLICE-6 | SLICE-2 |
| task | T-006 | SLICE-6 | SLICE-3 |
| task | T-007 | SLICE-6 | SLICE-4 |
| task | T-008 | SLICE-7 | SLICE-5 |
| task | T-009 | SLICE-2 | SLICE-6 |
| task | T-010 | SLICE-8 | SLICE-7 |
| task | T-011 | SLICE-3 | SLICE-9 |
| task | T-012 | SLICE-9 | SLICE-10 |
| task | T-013 | SLICE-4 | SLICE-12 |
| task | T-014 | SLICE-10 | SLICE-13 |
| task | T-015 | SLICE-5 | SLICE-16 |
| task | T-016 | SLICE-11 | SLICE-17 |
