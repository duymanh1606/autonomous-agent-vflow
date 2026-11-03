# Template: Bugfix Spec — Phân tích Bug có cấu trúc

> 📌 **Lấy cảm hứng từ Kiro Bugfix Specs** — 3-behavior model + root cause analysis
> Được tạo bởi **Bugfix Analyst Agent** — Phase S.1
> Bug ID: [BUG-ID]

---

## 1. Bug Report

### 1.1 Mô tả ngắn
<!-- 1-2 câu mô tả bug -->

### 1.2 Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### 1.3 Environment
- **OS/Browser/Device**: [...]
- **App version/commit**: [...]
- **Reproduced?**: ✅ Có / ❌ Chưa reproduce được

### 1.4 Evidence
<!-- Screenshots, logs, error messages -->

---

## 2. Bugfix Analysis (3-Behavior Model)

### 2.1 Current Behavior (Defect) 🔴
<!-- EARS notation: Khi [điều kiện], hệ thống [hành vi sai hiện tại] -->

- **BUG-B01**: Khi [điều kiện cụ thể], hệ thống [hành vi sai]
- **BUG-B02**: [nếu có thêm defect — optional]

### 2.2 Expected Behavior (Correct) 🟢
<!-- EARS notation: Khi [điều kiện], hệ thống phải [hành vi đúng] -->
<!-- BUG-E phải mapping 1:1 với BUG-B -->

- **BUG-E01**: Khi [điều kiện cụ thể], hệ thống phải [hành vi đúng]
- **BUG-E02**: [mapping với BUG-B02 — nếu có]

### 2.3 Unchanged Behavior (Regression Prevention) 🛡️
<!-- EARS notation: Khi [điều kiện], hệ thống phải TIẾP TỤC [hành vi giữ nguyên] -->
<!-- Tối thiểu 2 BUG-U -->

- **BUG-U01**: Khi [điều kiện liên quan], hệ thống phải TIẾP TỤC [behavior phải giữ nguyên]
- **BUG-U02**: Khi [điều kiện khác], hệ thống phải TIẾP TỤC [behavior phải giữ nguyên]

---

## 3. Root Cause Analysis

### 3.1 Root Cause Hypothesis
- **Nguyên nhân gốc**: [Mô tả tại sao bug xảy ra — KHÔNG phải symptom]
- **Confidence**: high | medium | low
- **Evidence**: [Dẫn chứng cụ thể — log, code trace, test result]

### 3.2 Affected Code
| File | Line(s) | Mô tả vấn đề |
|------|---------|---------------|
| [path/to/file] | [L-xx] | [vấn đề cụ thể trong code] |

### 3.3 Why It Happened
<!-- Giải thích nguyên nhân sâu: thiếu validation, logic sai, race condition, v.v. -->

---

## 4. Scope

### 4.1 Files cần thay đổi
- [ ] [file 1] — [mô tả change]
- [ ] [file 2] — [mô tả change]

### 4.2 Files KHÔNG được đụng (Constraints)
- [file/module] — [lý do không đụng]

### 4.3 No-Go Check
- [ ] Đã đọc `context.md`, không đụng No-Go Zones ✅
- [ ] Scope không lan rộng sang module không liên quan ✅

---

## 5. Test Plan (3-Tier)

### T1: Bug Reproducible (Red 🔴)
<!-- Test phải FAIL trước fix, PASS sau fix -->
- [ ] **TC-R01**: [Test reproduce BUG-B01]
- [ ] **TC-R02**: [Test reproduce BUG-B02 — nếu có]

### T2: Bug Fixed (Green 🟢)
<!-- Test phải PASS sau fix -->
- [ ] **TC-G01**: [Test verify BUG-E01]
- [ ] **TC-G02**: [Test verify BUG-E02 — nếu có]

### T3: No Regression (Protect 🛡️)
<!-- Test phải PASS cả trước VÀ sau fix -->
- [ ] **TC-P01**: [Test verify BUG-U01 vẫn đúng]
- [ ] **TC-P02**: [Test verify BUG-U02 vẫn đúng]

### Mapping Matrix

| Behavior | Test Tier | Test ID | Trước fix | Sau fix |
|----------|-----------|---------|-----------|---------|
| BUG-B01 | T1 (Red) | TC-R01 | ❌ FAIL | ✅ PASS |
| BUG-E01 | T2 (Green) | TC-G01 | ❌ FAIL | ✅ PASS |
| BUG-U01 | T3 (Protect) | TC-P01 | ✅ PASS | ✅ PASS |
| BUG-U02 | T3 (Protect) | TC-P02 | ✅ PASS | ✅ PASS |

---

## 6. Acceptance Criteria

- [ ] **AC-1**: Current behavior (BUG-B*) không còn xảy ra
- [ ] **AC-2**: Expected behavior (BUG-E*) hoạt động đúng
- [ ] **AC-3**: Unchanged behaviors (BUG-U*) vẫn hoạt động
- [ ] **AC-4**: Tất cả tests 3-tier pass (T1 + T2 + T3)
- [ ] **AC-5**: Full test suite pass (no regression bên ngoài)

---

## 7. Status

| Thông tin | Giá trị |
|-----------|--------|
| **Severity** | P1 / P2 / P3 / P4 |
| **Spec Version** | v1.0 |
| **Trạng thái** | `Draft` / `Approved` |
| **Người approve** | [Tên] |
| **Ngày approve** | [YYYY-MM-DD] |

### Routing
- Human approve → Phase tiếp theo (Design hoặc Implement)
