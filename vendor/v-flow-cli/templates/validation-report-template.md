# Template: Validation Report (Báo cáo Master Check)

> Được tạo bởi **Master Check Agent** — Phase R.0
> Feature: [TÊN FEATURE]
> Spec Version: [vX.Y]
> Ngày kiểm tra: [YYYY-MM-DD]

---

## Kết quả tổng hợp

| | Kết quả |
|---|---|
| **PHÁN QUYẾT** | ✅ **PASS** / ⚠️ **PASS WITH CONCERNS** / ❌ **FAIL** |
| **Spec Version** | vX.Y |
| **Artifacts synced** | ✅ Tất cả / ❌ Có artifacts chưa sync |

---

## 1. Coverage Check (Độ bao phủ)

> Mọi requirement trong spec đều có task trong plan VÀ test case tương ứng?

| Requirement | Có trong Plan? | Có Test Case? | Kết quả |
|------------|---------------|--------------|---------|
| REQ-U01 | ✅ T-001 | ✅ TC-01 | ✅ |
| REQ-E01 | ✅ T-003 | ❌ Thiếu | ❌ |

**Coverage**: [X/Y] requirements → [XX]%

> **AC coverage** — mọi `AC-NN` (spec §4) có ≥1 task (qua `Done khi`) phủ?

| AC | Task phủ | Kết quả |
|----|----------|---------|
| AC-01 | T-003 | ✅ |
| AC-02 | ❌ Thiếu | ❌ |

**AC coverage**: [X/Y] → [XX]%

---

## 2. Consistency Check (Tính nhất quán)

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| Spec ↔ Plan nhất quán | ✅ / ❌ | [Chi tiết nếu có vấn đề] |
| Spec ↔ Test Cases nhất quán | ✅ / ❌ | |
| Plan ↔ Test Cases nhất quán | ✅ / ❌ | |

---

## 3. Completeness Check (Tính đầy đủ)

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| Edge cases đã xử lý | ✅ / ❌ | |
| Error handling đã định nghĩa | ✅ / ❌ | |
| Security concerns đã xem xét | ✅ / ❌ | |
| Performance considerations | ✅ / ❌ | |
| No-Go Zones không bị vi phạm | ✅ / ❌ / N/A | |

---

## 4. Constitution Compliance (Tuân thủ Constitution)

| Nguyên tắc | Tuân thủ? | Ghi chú |
|-----------|----------|---------|
| Architecture pattern | ✅ / ❌ | |
| Code standards | ✅ / ❌ | |
| UI/UX guidelines | ✅ / ❌ | |
| API standards | ✅ / ❌ | |

---

## 5. Phân loại Issues

### 🔴 Critical — Block implementation
*(Không có)* / Liệt kê nếu có:
- **[C-001]** [Mô tả] → Fix: [Đề xuất]

### 🟠 Major — Block implementation
*(Không có)* / Liệt kê nếu có:
- **[M-001]** [Mô tả] → Fix: [Đề xuất]

### 🟡 Concerns — Không block; Implement Agent phải đọc và chú ý
*(Không có)* / Liệt kê nếu có:
- **[W-001]** [Mô tả risk/concern] → Implement Agent lưu ý

### 🔵 Minor/Suggestions
- **[S-001]** [Gợi ý cải thiện]

---

## 6. Routing Decision

> **Bắt buộc điền** — để agent tiếp theo biết rõ bước kế tiếp.

**PHÁN QUYẾT**: ✅ PASS / ⚠️ PASS WITH CONCERNS / ❌ FAIL

```yaml
# Dùng để cập nhật .flow-state.yaml
verdict: "PASS"                   # PASS | PASS_WITH_CONCERNS | FAIL
fail_reason: null                 # null | spec_gap | plan_gap | test_gap | nogo_violation | constitution_violation
route_decision: "implement"       # implement | re_specify | re_plan | re_test | fix_artifact
```

**Route cụ thể**:

| Verdict | fail_reason | →  Làm gì tiếp |
|---------|------------|----------------|
| PASS | — | `/v.implement` |
| PASS_WITH_CONCERNS | — | `/v.implement` + đọc kỹ concerns |
| FAIL | `spec_gap` | `/v.specify` → sync → check |
| FAIL | `plan_gap` | `/v.plan` → sync → check |
| FAIL | `test_gap` | `/v.test` → check |
| FAIL | `nogo_violation` | `/v.plan` (redesign tránh No-Go) |
| FAIL | `constitution_violation` | Fix artifact vi phạm → check |

> **⚠️ Concerns carry-forward** *(chỉ khi PASS_WITH_CONCERNS)*:
> Implement Agent và Review Agent phải đối chiếu danh sách concerns [W-xxx] bên trên.

---

> **Người kiểm tra**: Master Check Agent
> **Cần approve bởi**: [PM / Tech Lead]
