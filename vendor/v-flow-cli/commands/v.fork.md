---
description: "Fork — Branch feature để thử hướng khác (Time Travel)"
phase: "Any"
---

# /v.fork

Tạo một **bản sao (branch)** của feature để thử hướng spec/plan/architecture khác mà không ảnh hưởng bản gốc.

> Lấy cảm hứng từ LangGraph Time Travel: **Fork** — branch từ checkpoint cũ để explore alternative paths.

## Điều kiện tiên quyết
- Feature gốc phải tồn tại với `.flow-state.yaml`
- Tối đa 2 forks per feature
- Phải có lý do rõ ràng (không "thử cho vui")

## Khi nào dùng

- Muốn so sánh 2 architecture approaches trước khi quyết định
- Spec có 2 hướng giải quyết — cần prototype cả hai để chọn
- Muốn thử risky approach mà không ảnh hưởng feature chính
- Team debate về solution → fork ra để mỗi approach có proof-of-concept

## Quy trình

### Bước 1: Tạo Fork

```
/v.fork [feature-id] --as [new-name]
/v.fork 001-login --as 001-login-graphql  ← thử GraphQL thay vì REST
```

### Bước 2: Sao chép & Diverge

```
1. Copy toàn bộ feature folder:
   .v-flow/features/001-login/
   → .v-flow/features/001-login-graphql/

2. Cập nhật .flow-state.yaml trong bản fork:
   feature_name: "001-login-graphql"
   forked_from: "001-login"
   forked_at_phase: "B.0"
   forked_at_spec: "v1.2"
   fork_reason: "Thử GraphQL thay vì REST — so với original REST approach"

3. Cập nhật _session.md trong bản fork:
   ### [FORK] — [YYYY-MM-DD]
   - **Forked from**: 001-login (phase B.0, spec v1.2)
   - **Reason**: Thử GraphQL approach
   - **Compare with**: 001-login (REST approach)

4. Cập nhật _session.md trong bản GỐC:
   ### [FORK CREATED] — [YYYY-MM-DD]
   - **Fork**: 001-login-graphql
   - **Purpose**: So sánh GraphQL vs REST
```

### Bước 3: Develop Independently

Mỗi fork được develop độc lập:
- Chạy `/v.plan` riêng
- Chạy `/v.implement` riêng
- Mỗi fork có `.flow-state.yaml` riêng

### Bước 4: Compare & Decide

```
/v.status 001-login 001-login-graphql --compare

## 📊 Fork Comparison

| Metric | 001-login (REST) | 001-login-graphql |
|--------|-----------------|-------------------|
| Phase | B.1 (70% tasks) | B.1 (40% tasks) |
| Tasks | 10 | 14 |
| Complexity | Medium | High |
| Test coverage | 85% | 60% |
| Performance | ✅ Good | ⚠️ N+1 risk |
| Spec coverage | 10/10 REQ | 10/10 REQ |

→ Recommendation: Tiếp tục với REST approach (simpler, better test coverage)
```

### Bước 5: Merge hoặc Discard

```
/v.fork --keep 001-login           ← giữ bản gốc, discard fork
/v.fork --keep 001-login-graphql    ← giữ fork, archive bản gốc
/v.fork --merge 001-login 001-login-graphql  ← merge ideas từ cả hai
```

## Quy tắc

- **Tối đa 2 forks per feature** — quá nhiều = spec chưa rõ ràng
- **Mỗi fork phải có reason rõ ràng** — không fork vì "thử cho vui"
- **Compare trước khi decide** — sử dụng metrics, không sử dụng gut feeling
- **Archive fork không dùng** — lưu vào `_archive/` thay vì xóa, để tham khảo sau

---

## State Schema mới

```yaml
# Thêm vào .flow-state.yaml
fork_info:
  is_fork: false                    # true nếu đây là bản fork
  forked_from: null                 # feature gốc (nếu is_fork = true)
  forked_at_phase: null
  forked_at_spec: null
  fork_reason: null
  active_forks:                     # danh sách forks đang active (nếu đây là bản gốc)
    # - name: "001-login-graphql"
    #   reason: "Thử GraphQL approach"
    #   current_phase: "B.1"
```

---

## Ví dụ

```
/v.fork 001-login --as 001-login-graphql --reason "So sánh GraphQL vs REST"
/v.fork 002-dashboard --as 002-dashboard-ssr --reason "Thử server-side rendering"
/v.status 001-login 001-login-graphql --compare
/v.fork --keep 001-login
```
