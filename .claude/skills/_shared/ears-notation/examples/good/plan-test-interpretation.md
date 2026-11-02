# Good Example — EARS Interpretation cho Plan Agent

> Mẫu cách Plan Agent đọc spec và design architecture dựa trên REQ types.

## Input: spec.md excerpt
```
REQ-U01: Hệ thống phải hash password trước khi lưu DB
REQ-E01: Khi user nhấn Login, hệ thống phải validate credentials
REQ-S01: Trong khi loading, hệ thống phải hiển thị spinner
REQ-O01: Nếu user có valid token, hệ thống phải skip login
```

## Plan Agent Interpretation

| REQ | Type | → Architecture Decision |
|-----|------|------------------------|
| REQ-U01 | Ubiquitous | `AuthService` middleware — always hash, mọi endpoint dùng password |
| REQ-E01 | Event-driven | `LoginController.post()` → `AuthService.validate()` — handler pattern |
| REQ-S01 | State-driven | `LoginBloc` — state management: `LoginLoading` / `LoginSuccess` / `LoginError` |
| REQ-O01 | Optional | `AuthGuard` — check token at app startup, conditional redirect |

## Test Agent Interpretation

| REQ | Type | → Test Strategy |
|-----|------|----------------|
| REQ-U01 | Ubiquitous | Invariant test — verify hash ở MỌI endpoint lưu password (≥2 TCs) |
| REQ-E01 | Event-driven | Trigger test — POST /login valid → 200, invalid → 401 (≥3 TCs) |
| REQ-S01 | State-driven | State test — emit Loading → verify spinner, emit Success → verify redirect (≥3 TCs) |
| REQ-O01 | Optional | Branch test — có token → skip, không token → show login (≥2 TCs) |
