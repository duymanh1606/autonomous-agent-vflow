# So sánh variant

> Profile luật: `strict` · graph hash: `e7dc5f25`. **In đậm** = tốt nhất của dòng. Hệ thống không tự chọn variant.

| Metric | main-first | per-flow | seam | vsaf |
|---|---:|---:|---:|---:|
| strategy | main-first | per-flow | seam | manual |
| slice_count | 12 | 18 | 18 | 24 |
| points_per_slice (↓) | 2.9 / 7 | **1.9 / 6** | **1.9 / 6** | 1.5 / 11 |
| size_cv (↓) | **0.6** | 0.79 | 0.79 | 1.88 |
| first_demo_points (↓) | 9 | 9 | 9 | **7** |
| foundation_ratio (↓) | 0.09 | 0.09 | 0.09 | **0** |
| critical_path (↓) | **4** | 5 | 5 | 8 |
| parallel_width (↑) | 6 | **9** | **9** | 8 |
| cross_slice_ratio (↓) | 0.87 | 0.87 | 0.87 | **0.53** |
| uc_spread | 2.2 | 3.4 | 3.4 | 1.8 |
| rework_exposure (↓) | **4.67** | 7.07 | 7.07 | 12.07 |
| vi phạm error | 0 | 0 | 0 | 0 |
| vi phạm warn | 1 | 28 | 28 | 50 |

## Diff vị trí (luồng / task nằm ở slice khác nhau)

| Loại | ID | main-first | per-flow | seam | vsaf |
|---|---|---|---|---|---|
| flow | UC-01.main | SLICE-1 | SLICE-1 | SLICE-1 | SLICE-12 |
| flow | UC-01-E1 | SLICE-6 | SLICE-2 | SLICE-6 | SLICE-13 |
| flow | UC-01-E2 | SLICE-6 | SLICE-3 | SLICE-7 | SLICE-14 |
| flow | UC-01-E3 | SLICE-6 | SLICE-4 | SLICE-8 | SLICE-13 |
| flow | UC-01-A1 | SLICE-7 | SLICE-5 | SLICE-9 | SLICE-13 |
| flow | UC-02.main | SLICE-2 | SLICE-6 | SLICE-2 | SLICE-14 |
| flow | UC-02-E1 | SLICE-8 | SLICE-7 | SLICE-10 | SLICE-14 |
| flow | UC-02-E2 | SLICE-8 | SLICE-8 | SLICE-11 | SLICE-14 |
| flow | UC-03.main | SLICE-3 | SLICE-9 | SLICE-3 | SLICE-21 |
| flow | UC-03-E1 | SLICE-9 | SLICE-10 | SLICE-12 | SLICE-21 |
| flow | UC-03-E2 | SLICE-9 | SLICE-11 | SLICE-13 | SLICE-21 |
| flow | UC-04.main | SLICE-4 | SLICE-12 | SLICE-4 | SLICE-1 |
| flow | UC-04-E1 | SLICE-10 | SLICE-13 | SLICE-14 | SLICE-23 |
| flow | UC-04-E2 | SLICE-10 | SLICE-14 | SLICE-15 | SLICE-23 |
| flow | UC-04-A1 | SLICE-10 | SLICE-15 | SLICE-16 | SLICE-1 |
| flow | UC-05.main | SLICE-5 | SLICE-16 | SLICE-5 | SLICE-18 |
| flow | UC-05-E1 | SLICE-11 | SLICE-17 | SLICE-17 | SLICE-19 |
| task | T-001 | SLICE-0 | SLICE-0 | SLICE-0 | SLICE-1 |
| task | T-002 | SLICE-0 | SLICE-0 | SLICE-0 | SLICE-1 |
| task | T-003 | SLICE-1 | SLICE-1 | SLICE-1 | SLICE-12 |
| task | T-004 | SLICE-1 | SLICE-1 | SLICE-1 | SLICE-13 |
| task | T-005 | SLICE-6 | SLICE-2 | SLICE-6 | SLICE-13 |
| task | T-006 | SLICE-6 | SLICE-3 | SLICE-7 | SLICE-14 |
| task | T-007 | SLICE-6 | SLICE-4 | SLICE-8 | SLICE-13 |
| task | T-008 | SLICE-7 | SLICE-5 | SLICE-9 | SLICE-13 |
| task | T-009 | SLICE-2 | SLICE-6 | SLICE-2 | SLICE-14 |
| task | T-010 | SLICE-8 | SLICE-7 | SLICE-10 | SLICE-14 |
| task | T-011 | SLICE-3 | SLICE-9 | SLICE-3 | SLICE-21 |
| task | T-012 | SLICE-9 | SLICE-10 | SLICE-12 | SLICE-21 |
| task | T-013 | SLICE-4 | SLICE-12 | SLICE-4 | SLICE-1 |
| task | T-014 | SLICE-10 | SLICE-13 | SLICE-14 | SLICE-23 |
| task | T-015 | SLICE-5 | SLICE-16 | SLICE-5 | SLICE-18 |
| task | T-016 | SLICE-11 | SLICE-17 | SLICE-17 | SLICE-19 |
