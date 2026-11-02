---
name: bugfix-analyst
description: "Hướng dẫn Bugfix Analyst Agent phân tích bug theo 3-behavior model (Current/Expected/Unchanged), tìm root cause, và thiết kế 3-tier test plan. Agent PHẢI đọc skill này khi /v.bugfix được gọi."
trigger: "Khi /v.bugfix được gọi"
phase: "S.1"
used_by:
  - /v.bugfix
hooks:
  pre_analysis: "Scan codebase → trace execution path → xác định root cause hypothesis"
  post_analysis: "Verify 3-behavior model đầy đủ, 3-tier test plan có mapping matrix"
---

# Bugfix Analyst — Phân Tích Bug Có Cấu Trúc

> ⚠️ Đây là **Skill bắt buộc** cho Bugfix Analyst Agent.
> QUAN TRỌNG: Phải document đủ **3 loại behavior**. Thiếu "Unchanged Behavior" → regression risk cao.
>
> → Xem `gotchas.md` cho lỗi phổ biến khi phân tích bug.
> → Xem `examples/good/` cho mẫu bugfix.md chuẩn.
> → Xem `examples/bad/` cho anti-patterns cần tránh.
> → Xem `config.json` để customize (min_unchanged, confidence_threshold).

---

## Khi nào KHÔNG cần skill này

- Bug đơn giản, rõ ràng, ≤ 5 files → dùng `/v.quickfix` (không cần formal analysis)
- Production incident P1/P2 → dùng `/v.hotfix` (speed > structure)
- Feature mới → dùng `/v.specify` (không phải bugfix)

---

## 3-Behavior Model — Core Concept

> 💡 Đây là concept QUAN TRỌNG NHẤT. Mọi bugfix analysis đều xoay quanh 3 loại behavior.
> Agent tự quyết depth dựa trên severity và complexity của bug.

### Tại sao cần 3 behaviors?

Hầu hết regression khi fix bug xảy ra vì developer:
1. ❌ Chỉ focus vào "cái gì sai" → fix xong break cái khác
2. ❌ Không document "cái gì ĐÚNG phải giữ nguyên" → không ai biết regression xảy ra

3-Behavior Model buộc agent phải suy nghĩ **cả 3 chiều**:

```
🔴 Current Behavior (BUG-B)    — Cái gì ĐANG SAI?
🟢 Expected Behavior (BUG-E)   — Cái gì PHẢI ĐÚNG sau fix?
🛡️ Unchanged Behavior (BUG-U)  — Cái gì KHÔNG ĐƯỢC THAY ĐỔI?
```

### EARS Notation cho Bugfix

Áp dụng EARS notation (cross-ref `ears-writer` skill) với từ khóa bugfix-specific:

| Behavior Type | EARS Template | Prefix |
|---------------|---------------|--------|
| **Current (Defect)** | `Khi [điều kiện], hệ thống [hành vi sai hiện tại]` | BUG-B |
| **Expected (Correct)** | `Khi [điều kiện], hệ thống phải [hành vi đúng]` | BUG-E |
| **Unchanged (Protect)** | `Khi [điều kiện], hệ thống phải TIẾP TỤC [hành vi giữ nguyên]` | BUG-U |

---

## Đặc Thù Và Quy Ước

> 💡 Phần này chứa thông tin Agent thường bỏ sót hoặc làm sai.

### 1. BUG-B và BUG-E phải là cặp đối xứng

- Mỗi BUG-B (defect) PHẢI có đúng 1 BUG-E (expected) tương ứng
- ❌ 3 BUG-B + 1 BUG-E → không rõ E nào fix B nào
- ✅ BUG-B01 ↔ BUG-E01, BUG-B02 ↔ BUG-E02

### 2. BUG-U ít nhất 2 items

- Nghĩ về behaviors **liên quan** nhưng **không bị ảnh hưởng** bởi fix
- Hỏi: "Nếu tôi fix X, behavior nào ở gần X có thể bị ảnh hưởng?"
- Đọc code callers/dependents → infer unchanged behaviors

### 3. Mỗi behavior = 1 assertion cụ thể

- ❌ "Hệ thống phải TIẾP TỤC hoạt động bình thường"
- ✅ "Khi user nhập email hợp lệ, hệ thống phải TIẾP TỤC chấp nhận và lưu với response 200"

### 4. Measurable — có thể verify bằng test

- Mỗi behavior phải viết được test case tương ứng
- Nếu không test được → behavior quá vague

### 5. Từ cấm trong behaviors

| Từ cấm | Vấn đề | Thay bằng |
|--------|--------|-----------|
| "nên", "should" | Không bắt buộc | "phải", "must" |
| "nhanh", "fast" | Không measurable | "trong vòng 200ms" |
| "hợp lý", "reasonable" | Mơ hồ | Số cụ thể |
| "có thể", "can" | Description, không phải assertion | "phải" |
| "bình thường" | Vague | Mô tả behavior cụ thể |

---

## Root Cause Analysis — Quy Trình

> 💡 Agent PHẢI scan code trước khi viết root cause. Không đoán mò.

### Step 1: Thu thập thông tin

```
1. Đọc reproduction steps từ user
2. Tìm logs/error messages liên quan
3. Xác định input → output mong đợi vs thực tế
```

### Step 2: Scan codebase

```
1. Tìm entry point (API route, UI handler, event listener)
2. Trace execution path — follow data flow từ input → bug location
3. Đọc code xung quanh bug location — context 20-30 dòng
4. Kiểm tra related tests — đã có test cover case này chưa?
5. Kiểm tra git blame — code này thay đổi gần đây?
```

### Step 3: Xác định root cause

```
Root cause PHẢI trả lời được 2 câu hỏi:
1. "Dòng code nào / logic nào gây ra bug?"
2. "Tại sao code đó sai?" (thiếu validation, logic error, race condition, etc.)
```

### Confidence Level

| Level | Criteria | Action |
|-------|----------|--------|
| **High** | Trace exact line, reproduce 100%, evidence rõ ràng | → Proceed to implement |
| **Medium** | Hypothesis hợp lý, nhiều suspect, chưa reproduce 100% | → Proceed nhưng ghi cảnh báo |
| **Low** | Chưa rõ exact location, cần debug thêm | → DỪNG, recommend debug session |

---

## 3-Tier Test Plan — Thiết Kế

### Tier 1: Bug Reproducible (Red 🔴)

**Mục đích**: Confirm bug tồn tại — test PHẢI FAIL trước khi fix.

| Aspect | Giá trị |
|--------|---------|
| **Input** | Reproduction steps từ BUG-B* |
| **Assert** | Current (wrong) behavior KHÔNG xảy ra |
| **Trước fix** | ❌ FAIL (confirm bug exists) |
| **Sau fix** | ✅ PASS |
| **ID Convention** | TC-R01, TC-R02, ... |

### Tier 2: Bug Fixed (Green 🟢)

**Mục đích**: Confirm fix hoạt động — test PHẢI PASS sau khi fix.

| Aspect | Giá trị |
|--------|---------|
| **Input** | Same scenario từ BUG-E* |
| **Assert** | Expected (correct) behavior |
| **Trước fix** | ❌ FAIL |
| **Sau fix** | ✅ PASS |
| **ID Convention** | TC-G01, TC-G02, ... |

### Tier 3: No Regression (Protect 🛡️)

**Mục đích**: Confirm unchanged behaviors vẫn đúng — PHẢI PASS cả trước và sau fix.

| Aspect | Giá trị |
|--------|---------|
| **Input** | Scenarios từ BUG-U* |
| **Assert** | Unchanged behavior vẫn đúng |
| **Trước fix** | ✅ PASS |
| **Sau fix** | ✅ PASS |
| **ID Convention** | TC-P01, TC-P02, ... |

### Mapping Matrix (bắt buộc trong bugfix.md)

| Behavior | Test Tier | Test ID | Trước fix | Sau fix |
|----------|-----------|---------|-----------|---------|
| BUG-B01 | T1 (Red) | TC-R01 | ❌ FAIL | ✅ PASS |
| BUG-E01 | T2 (Green) | TC-G01 | ❌ FAIL | ✅ PASS |
| BUG-U01 | T3 (Protect) | TC-P01 | ✅ PASS | ✅ PASS |
| BUG-U02 | T3 (Protect) | TC-P02 | ✅ PASS | ✅ PASS |

---

## Scope Analysis

### Xác định files cần thay đổi

```
1. Từ root cause → file(s) chứa bug
2. Từ fix approach → file(s) cần modify
3. Từ test plan → test file(s) cần tạo/update
4. TỔNG files giới hạn (nếu > 10 → cân nhắc escalate)
```

### Xác định constraints

```
1. Đọc context.md → No-Go Zones
2. Từ BUG-U* → infer modules phải giữ nguyên
3. Liệt kê explicit: "File X KHÔNG được thay đổi vì Y"
```

---

## V-Flow Integration Points

- **context.md** → No-Go Zones, tech constraints
- **constitution.md** → Naming conventions, patterns
- **ears-writer skill** → EARS notation reference cho behaviors
- **tdd-driver skill** → Phase B.1 implement sẽ dùng 3-tier tests từ bugfix.md
- **adversarial-reviewer skill** → Phase R.1 review dùng 3-tier checklist
- **bugfix.md** → Output chính (thay vì spec.md)
- **_session.md** → Append trace entry `[BF]`
- **.flow-state.yaml** → Init `project_type: "bugfix"`

---

## Output — bugfix.md Structure

```markdown
# Bugfix — [BUG-ID] [Mô tả ngắn]

**Severity**: P1 | P2 | P3 | P4
**Reporter**: [Tên/source]
**Affected Module**: [module/domain]
**Spec Version**: v1.0
**Date**: [YYYY-MM-DD]

## 1. Bug Report
### Reproduction Steps
### Environment

## 2. Bugfix Analysis (3-Behavior Model)
### 2.1 Current Behavior (Defect) 🔴
### 2.2 Expected Behavior (Correct) 🟢
### 2.3 Unchanged Behavior (Regression Prevention) 🛡️

## 3. Root Cause Analysis
### Hypothesis
### Affected Code
### Why It Happened

## 4. Scope
### Files cần thay đổi
### Constraints
### No-Go Check

## 5. Test Plan (3-Tier)
### T1: Bug Reproducible (Red 🔴)
### T2: Bug Fixed (Green 🟢)
### T3: No Regression (Protect 🛡️)
### Mapping Matrix

## 6. Acceptance Criteria

## 7. Routing
```

---

## Checklist Trước Khi Submit bugfix.md

```
[ ] 3-Behavior Model đầy đủ:
    [ ] ≥1 BUG-B (defect) — mô tả cụ thể, measurable
    [ ] ≥1 BUG-E (expected) — đối xứng 1:1 với từng BUG-B
    [ ] ≥2 BUG-U (unchanged) — behaviors liên quan phải giữ nguyên
[ ] Root Cause Analysis:
    [ ] Có hypothesis với evidence (file + line)
    [ ] Confidence level xác định (high/medium/low)
    [ ] Nếu confidence = low → DỪNG, recommend debug
[ ] Scope:
    [ ] Files cần thay đổi listed
    [ ] Constraints listed
    [ ] No-Go check done (context.md)
[ ] Test Plan 3-Tier:
    [ ] T1 (Red): ≥1 test reproduce bug
    [ ] T2 (Green): ≥1 test verify fix
    [ ] T3 (Protect): ≥2 tests regression prevention
    [ ] Mapping matrix đầy đủ
[ ] Acceptance Criteria: ≥3 ACs cover cả 3 behavior types
[ ] Không dùng từ cấm: "nên", "nhanh", "hợp lý", "có thể", "bình thường"
```

---

## Gotchas

→ Xem `gotchas.md` cho lỗi phổ biến khi phân tích bug — cập nhật liên tục.
