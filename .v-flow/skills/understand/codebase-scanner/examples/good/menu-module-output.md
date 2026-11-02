# Good Example — Module Card Output cho `menu` module

> Đây là output mẫu khi codebase-scanner scan một module UI-only (không có backend/DB).

## SKILL.md Output

```markdown
---
module: menu
complexity: Low
layer: Presentation only
---

# Module: Menu

## Description
Module quản lý màn hình chính (Home) của ứng dụng Xiangqi, đóng vai trò
navigation hub chuyển hướng user tới các tính năng: Play, Analysis, Openbook,
Replay. Sử dụng StatelessWidget pattern, không có business logic phức tạp.
[⚠️ AI-inferred: Không tìm thấy state management trong module này]

## Quick Summary
- Presentation-only module — không có domain/data layer
- Navigation qua GoRouter, 4 route targets
- 2 widgets chính: MenuScreen (grid layout), MenuCard (reusable)
- Không có API call, không có DB access
- 0 test files

## Key Business Rules
- Không có business rules — module chỉ hiển thị menu items

## Key Entities
- Không có entities — module không quản lý data

## No-Go Zones
- Không có No-Go Zones (module nhỏ, đơn giản)
```

## Điểm đáng chú ý

✅ **description** cụ thể — "navigation hub", không phải "module quản lý menu"
✅ **[⚠️ AI-inferred]** đánh dấu rõ thông tin suy luận
✅ **Quick Summary** nêu layer, patterns, test coverage
✅ **"Không có"** khi module không applicable — KHÔNG bịa data
