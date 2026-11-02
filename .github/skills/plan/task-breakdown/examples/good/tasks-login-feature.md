# Ví dụ — Tasks.md (User Login Feature)

> Đây là mẫu output chuẩn cho Plan Agent khi chia tasks (schema khớp `.v-flow/templates/tasks-template.md`).

---

## Tasks — Feature 001: User Login

#### T-001: Data Models & Entities `[LOGIC]` `[ENTRYPOINT]` `[CRITICAL]`
- **Mô tả**: Tạo data models cho authentication flow — user entity, request/response DTOs.
- **Files**: `lib/features/auth/domain/auth_models.dart`
- **Thay đổi cụ thể**:
  - Mong muốn: AuthUser, LoginRequest, LoginResponse với serialization.
  - Các bước: 1) Định nghĩa entity 2) DTO + fromJson/toJson 3) Unit test serialization.
- **Dependency**: Không
- **REQ / UC mapping**: REQ-E01, REQ-U01 (UC-01)
- **Done khi**: serialize/deserialize round-trip đúng cho AuthUser + DTOs (AC-01, spec §4)
- **Test liên quan**: TC-01
- **TDD** (Red→Green):
  - [ ] Test: `LoginResponse.fromJson` parse đúng `token` + `refreshToken`
  - [ ] Test: `LoginRequest.toJson` ra đúng `{email, password}`
  - [ ] Impl: entity + DTO + fromJson/toJson
- **Complexity**: S
- **Trạng thái**: [ ]

#### T-002: Auth Repository Interface & Implementation `[LOGIC]` `[DEPENDS: T-001]`
- **Mô tả**: Repository interface tại domain layer, implementation tại data layer.
- **Files**: `lib/features/auth/domain/auth_repository.dart`, `lib/features/auth/data/auth_repository_impl.dart`
- **Thay đổi cụ thể**:
  - Mong muốn: Interface defined trước implementation; map error types (InvalidCredentials, AccountLocked, NetworkError).
  - Các bước: 1) Interface 2) Impl gọi API service (mock) 3) Unit test với mock.
- **Dependency**: T-001
- **REQ / UC mapping**: REQ-E01, REQ-E02 (UC-01)
- **Done khi**: repository map đúng error types (InvalidCredentials/AccountLocked/NetworkError) (AC-02, spec §4)
- **Test liên quan**: TC-02, TC-03
- **TDD** (Red→Green):
  - [ ] Test: API trả 401 → throw `InvalidCredentials`
  - [ ] Test: API trả 423 → throw `AccountLocked`
  - [ ] Impl: interface + impl gọi api service (mock) + map error
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-003: API Service `[API]` `[DEPENDS: T-001]` `[PARALLEL]`
- **Mô tả**: HTTP client cho auth endpoints. Song song với T-002 (không share code).
- **Files**: `lib/features/auth/data/auth_api_service.dart`
- **Thay đổi cụ thể**:
  - Mong muốn: gọi `POST /api/auth/login`, parse response + error.
  - Các bước: 1) Base URL từ config (không hardcode) 2) Timeout 10s (constitution §5.2) 3) Error parsing.
- **[API]**: `POST /api/auth/login` · request `{email, password}` · response `{token, refreshToken}`
- **Dependency**: T-001
- **REQ / UC mapping**: REQ-E01 (UC-01)
- **Done khi**: gọi đúng `POST /api/auth/login` + parse response/error (AC-03, spec §4)
- **Test liên quan**: TC-04
- **TDD** (Red→Green):
  - [ ] Test: request hợp lệ → parse `{token, refreshToken}`
  - [ ] Test: quá 10s → throw `NetworkError`
  - [ ] Impl: http client + base URL từ config + timeout + parse
- **Complexity**: S
- **Trạng thái**: [ ]

#### T-004: Login Use Case `[LOGIC]` `[CRITICAL]` `[DEPENDS: T-002, T-003]`
- **Mô tả**: Core business logic — validate → authenticate → handle result + rate limiting.
- **Files**: `lib/features/auth/domain/login_usecase.dart`
- **Thay đổi cụ thể**:
  - Mong muốn: rate limiting block sau 5 attempts; mọi error type được handle.
  - Các bước: 1) Validate input 2) Call repository 3) Đếm attempts + lockout.
- **Dependency**: T-002, T-003
- **REQ / UC mapping**: REQ-E01, REQ-E02, REQ-U01, REQ-O01 (UC-01)
- **Done khi**: rate limiting chặn sau 5 lần sai + mọi error type được handle (AC-04, AC-05, spec §4)
- **Test liên quan**: TC-01 → TC-05
- **TDD** (Red→Green):
  - [ ] Test: credential đúng → trả `AuthUser`
  - [ ] Test: sai 5 lần → lockout; lần 6 bị chặn, KHÔNG gọi repository
  - [ ] Impl: validate → call repo → đếm attempts + lockout
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-005: Login UI `[UI]` `[DEPENDS: T-004]`
- **Mô tả**: Presentation layer — form UI, state management, error display.
- **Files**: `lib/features/auth/presentation/login_screen.dart`, `login_bloc.dart`
- **Thay đổi cụ thể**:
  - Mong muốn: loading/success/error state; validate email; thông báo lỗi không lộ credential.
  - Các bước: 1) Form widget 2) Bloc states 3) Error mapping.
- **[UI]**: Màn hình `LoginScreen` (UC-01) · component email/password field, submit button · trạng thái `loading/error-401` · token `input-default`, `button-primary`
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-E01, REQ-E02, REQ-O01 (UC-01)
- **Done khi**: hiển thị loading/success/error; thông báo lỗi KHÔNG lộ credential (AC-06, spec §4)
- **Test liên quan**: TC-06, TC-07
- **TDD** (Red→Green):
  - [ ] Test: submit → state `loading` → success chuyển màn
  - [ ] Test: 401 → hiển thị lỗi chung, không tiết lộ field nào sai
  - [ ] Impl: form widget + bloc states + error mapping
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-006: Integration Test & Cleanup `[TEST]` `[GATE]` `[DEPENDS: T-005]`
- **Mô tả**: End-to-end test flow. DỪNG chờ human review trước khi merge.
- **Files**: `test/features/auth/login_integration_test.dart`
- **Thay đổi cụ thể**:
  - Mong muốn: E2E pass cho login success + failure flow.
  - Các bước: 1) Test success 2) Test failure 3) Human review.
- **Dependency**: T-005
- **REQ / UC mapping**: All REQs (UC-01)
- **Done khi**: E2E login success + failure pass; human review approved (AC-07, spec §4)
- **Test liên quan**: TC-08
- **TDD** (Red→Green):
  - [ ] Test: happy path login → vào home
  - [ ] Test: sai mật khẩu → ở lại màn + thông báo lỗi
- **Gate condition**: Human review approved trước khi merge.
- **Complexity**: S
- **Trạng thái**: [ ]
