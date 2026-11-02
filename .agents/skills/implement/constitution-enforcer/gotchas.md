# Constitution Enforcer — Gotchas & Common Mistakes

## ⚠️ Gotcha 1: Over-enforcement

**Sai**: Cứng nhắc block mọi vi phạm, kể cả những rule mơ hồ.  
**Đúng**: Chỉ block trên `error` severity. `warning` chỉ cảnh báo, để developer quyết định.

## ⚠️ Gotcha 2: Scope Creep

**Sai**: Check toàn bộ codebase mỗi lần commit.  
**Đúng**: Chỉ check **changed files** trong commit/PR hiện tại. Full scan chỉ khi `v-flow doctor`.

## ⚠️ Gotcha 3: Static Rules vs Dynamic Context

**Sai**: Áp dụng naming convention cho tất cả files, kể cả generated code.  
**Đúng**: Respect No-Go Zones từ `context.md`. Generated code, vendor code, legacy code excluded.

## ⚠️ Gotcha 4: Constitution Updates

**Sai**: Khi constitution update, yêu cầu fix ngay toàn bộ codebase.  
**Đúng**: New rules chỉ apply cho new/changed code. Tạo tech-debt ticket cho existing violations.

## ⚠️ Gotcha 5: False Positives trong Security Checks

**Sai**: Flag mọi string constant as "potential hardcoded secret".  
**Đúng**: Chỉ flag patterns match secrets (keys, tokens, passwords). Use allowlist cho known safe constants.
