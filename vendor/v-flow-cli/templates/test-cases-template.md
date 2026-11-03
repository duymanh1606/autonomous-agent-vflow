# Template: Test Cases

> Được tạo bởi **Test Agent** từ Specification
> Feature: [TÊN FEATURE]
> Spec Version: [vX.Y]

## 1. Test Matrix (Ma trận truy vết)

| Requirement | AC | Test Case(s) | Loại | Priority | Trạng thái |
|------------|----|-------------|------|:--------:|:---------:|
| REQ-U01 | AC-01 | TC-01, TC-02 | Unit | P1 | ⬜ Chưa chạy |
| REQ-E01 | AC-02 | TC-03, EC-01 | Integration | P2 | ⬜ Chưa chạy |
| REQ-S01 | AC-03 | TC-04, TC-05 | E2E | P2 | ⬜ Chưa chạy |
| REQ-O01 | AC-04 | TC-06 | Unit | P3 | ⬜ Chưa chạy |

> Cột **AC** = mã `AC-NN` tại spec §4 mà (các) test case verify. Mọi `AC-NN` phải có ≥1 TC (Master Check cross-check).

**Coverage**: [X/Y] REQ + [A/B] AC-NN có test → [XX]%

---

## 2. Test Cases

### TC-01: [Tên test case]

| Mục | Chi tiết |
|-----|---------|
| **Requirement** | REQ-xxx |
| **AC** | AC-NN (tiêu chí spec §4 mà TC này verify) |
| **Loại** | Unit / Integration / E2E |
| **Priority** | P1 / P2 / P3 |
| **Tiền điều kiện** | [Setup cần thiết] |
| **Bước thực hiện** | 1. [Bước 1] → 2. [Bước 2] → ... |
| **Input** | [Dữ liệu đầu vào cụ thể] |
| **Expected Output** | [Kết quả mong đợi cụ thể] |
| **Actual Output** | [Điền sau khi chạy] |
| **Kết quả** | ⬜ Pass / ⬜ Fail / ⬜ Chưa chạy |

---

### TC-02: [Tên test case]

| Mục | Chi tiết |
|-----|---------|
| **Requirement** | REQ-xxx |
| **AC** | AC-NN (tiêu chí spec §4 mà TC này verify) |
| **Loại** | Unit / Integration / E2E |
| **Priority** | P1 / P2 / P3 |
| **Tiền điều kiện** | |
| **Bước thực hiện** | |
| **Input** | |
| **Expected Output** | |
| **Actual Output** | |
| **Kết quả** | ⬜ Pass / ⬜ Fail / ⬜ Chưa chạy |

---

## 3. Edge Cases & Error Cases

### EC-01: [Mô tả edge case]
| Mục | Chi tiết |
|-----|---------|
| **Requirement** | REQ-xxx |
| **Điều kiện** | [Khi nào xảy ra — boundary value / null / overflow] |
| **Input** | [Dữ liệu edge case cụ thể] |
| **Expected behavior** | [Hệ thống phải xử lý thế nào] |
| **Priority** | P1 / P2 / P3 |

### EC-02: [Mô tả error case]
| Mục | Chi tiết |
|-----|---------|
| **Requirement** | REQ-xxx |
| **Điều kiện** | [Network error / invalid input / timeout] |
| **Input** | [Dữ liệu gây lỗi] |
| **Expected behavior** | [Error message / fallback / retry] |
| **Priority** | P1 / P2 / P3 |

---

## 4. Negative Tests

> Kiểm tra hệ thống KHÔNG làm những gì không nên làm

| ID | Mô tả | Input | Expected: Hệ thống KHÔNG | REQ |
|----|-------|-------|--------------------------|-----|
| NT-01 | [truy cập trái phép] | [input] | [cho phép truy cập] | REQ-xxx |
| NT-02 | [SQL injection] | `'; DROP TABLE--` | [thực thi query] | REQ-xxx |

---

## 5. Test Data

### 5.1 Dữ liệu mẫu cần chuẩn bị

| Loại | Mô tả | Giá trị mẫu | Dùng cho TC |
|------|-------|-------------|:-----------:|
| | | | TC-xx |

### 5.2 Mock/Stub cần thiết

| Service/API | Mock method | Response mẫu | Dùng cho TC |
|------------|------------|--------------|:-----------:|
| | | | TC-xx |

---

## 6. Tổng kết

| Metric | Giá trị |
|--------|--------|
| Tổng test cases | [Số] |
| Edge/Error cases | [Số] |
| Negative tests | [Số] |
| P1 (Critical) | [Số] |
| P2 (Important) | [Số] |
| P3 (Nice-to-have) | [Số] |
| Coverage Requirements | [X/Y] requirements có test |
| Estimated run time | [X phút] |

---

> **Trạng thái**: Draft / Reviewed / Approved
> **Người review**: [QA Lead]
> **Ngày review**: [YYYY-MM-DD]
