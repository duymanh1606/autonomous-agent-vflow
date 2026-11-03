# API Contract: [Service/Module Name]

> **Version**: 1.0.0
> **Last Updated**: YYYY-MM-DD
> **Owner**: [Tên người/team chịu trách nhiệm]
> **REQ Reference**: REQ-xxx

---

## Overview

*(Mô tả ngắn gọn API này phục vụ nghiệp vụ gì)*

---

## Base URL

```
Production: https://api.example.com/v1
Staging:    https://api-staging.example.com/v1
```

---

## Authentication

| Method | Header | Notes |
|--------|--------|-------|
| Bearer Token | `Authorization: Bearer <token>` | JWT, TTL = 1h |

---

## Endpoints

### POST /resource

> **Mô tả**: Tạo mới resource
> **Auth**: Required
> **Rate Limit**: 100 req/min

#### Request

```json
{
  "name": "string (required, max 255)",
  "description": "string (optional, max 1000)",
  "category_id": "integer (required)"
}
```

#### Response — 201 Created

```json
{
  "id": 1,
  "name": "Example",
  "description": "...",
  "category_id": 1,
  "created_at": "2026-04-27T00:00:00Z",
  "updated_at": null
}
```

#### Error Responses

| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | `VALIDATION_ERROR` | Field-level error details | Invalid input |
| 401 | `UNAUTHORIZED` | "Authentication required" | Missing/invalid token |
| 409 | `CONFLICT` | "Resource already exists" | Duplicate name |
| 422 | `UNPROCESSABLE` | "Category not found" | Invalid category_id |
| 500 | `INTERNAL_ERROR` | "Internal server error" | Unexpected failure |

---

### GET /resource/:id

> **Mô tả**: Lấy thông tin resource theo ID
> **Auth**: Required

#### Response — 200 OK

```json
{
  "id": 1,
  "name": "Example",
  "description": "...",
  "category_id": 1,
  "created_at": "2026-04-27T00:00:00Z",
  "updated_at": null
}
```

#### Error Responses

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | Resource does not exist |

---

## Data Models

### Resource

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | integer | PK, auto-increment | |
| `name` | string | max 255, unique | |
| `description` | string | max 1000, nullable | |
| `category_id` | integer | FK → categories.id | |
| `created_at` | datetime | auto-set | ISO 8601 |
| `updated_at` | datetime | nullable | ISO 8601 |

---

## SLA & Performance

| Metric | Target |
|--------|--------|
| P95 Latency | < 200ms |
| Availability | 99.9% |
| Rate Limit | 100 req/min per user |
| Max Payload | 1MB |

---

## Versioning Policy

- **Breaking changes** → Increment major version (v1 → v2)
- **Additive changes** → No version bump (new optional fields OK)
- **Deprecation** → 6-month sunset notice in `Sunset` header

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| YYYY-MM-DD | 1.0.0 | Initial contract |
