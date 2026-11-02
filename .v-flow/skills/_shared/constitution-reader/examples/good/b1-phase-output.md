# Good Example — Constitution Reader Output cho Phase B.1

> Mẫu output khi constitution-reader extract rules cho Implement Agent.

## Input
- Phase: B.1 (Implementation)
- Agent: Implement Agent
- Constitution: v2.1

## Output

```markdown
## Active Constitution Rules (Phase: B.1 Implementation)

### §1 Architecture (ACTIVE)
- ✅ Clean Architecture: Presentation → Domain → Data
- ✅ Dependency Rule: inner layers không depend outer layers
- ✅ Domain layer: pure Dart, no framework imports

### §2 Code Standards (ACTIVE)
- ✅ camelCase for variables/functions
- ✅ PascalCase for classes
- ✅ Max function length: 50 LOC
- ✅ Max file length: 300 LOC

### §3 Testing (ACTIVE)
- ✅ Coverage target: ≥ 80%
- ✅ TDD mandatory: test before code
- ✅ Naming: should_X_when_Y

### §5 Security (ALWAYS ACTIVE)
- ✅ No hardcoded secrets
- ✅ Validate all external input

### §7 No-Go Zones (ACTIVE)
- 🔴 lib/core/engine/ — FFI bridge, native code
- 🟡 lib/core/auth/ — shared by 5 modules

### Not applicable for B.1
- §4 API Conventions → Plan phase only
- §9 Spec Change Policy → Spec phase only
```

## Điểm đáng chú ý

✅ **Chỉ sections liên quan** — skip §4, §9 (không dùng ở B.1)
✅ **No-Go Zones LUÔN included** — dù phase nào
✅ **Actionable** — rules cụ thể, không generic
