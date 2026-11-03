# Task Breakdown — autonomous-agent-vflow (baseline)

> Tạo bởi Plan Agent. Spec v1.0. Đây là baseline legacy: mỗi task **đặc tả hóa hành vi hiện có bằng test** (characterization) và sửa lỗ hổng nếu test đỏ — không viết lại chức năng.

## Quy ước
- Status: `[ ]` chưa · `[/]` đang · `[x]` xong. Task ID `T-NNN`.

## Task Overview

| Tổng tasks | `[PARALLEL]` | `[CRITICAL]` | `[RISKY]` | `[GATE]` | Critical path | Phân bố Complexity | Sizing |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 16 | 5 | 2 | 1 | 0 | T-001→T-002→T-003→T-004→T-009 | S:3 · M:10 · L:3 | 35 |

## Tasks

#### T-001: Xác minh schema + migrations áp dụng sạch `[DB]` `[FOUNDATION]` `[ENTRYPOINT]`
- **Mô tả**: Test khởi tạo DB trống áp dụng schema + toàn bộ migration theo thứ tự
- **Files**: `storage/schema.sql, storage/migrations/`
- **Vị trí (symbol)**: `storage.database (init/migrate)`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: Không
- **REQ / UC mapping**: REQ-U01 ((foundation))
- **Done khi**: đáp ứng AC-01
- **Test liên quan**: TC-01
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của (foundation) chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: S
- **Trạng thái**: [ ]

#### T-002: Khóa test cô lập dữ liệu theo account `[LOGIC]` `[FOUNDATION]`
- **Mô tả**: Test đặc tả: truy vấn account A không thấy dữ liệu account B
- **Files**: `storage/tenancy.py, storage/scope.py`
- **Vị trí (symbol)**: `tenancy/scope`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-001
- **REQ / UC mapping**: REQ-U01 ((foundation))
- **Done khi**: đáp ứng AC-01
- **Test liên quan**: TC-02
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của (foundation) chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-003: Đặc tả quét inbox → MessageEvent `[LOGIC]` `[READ: Message]`
- **Mô tả**: Characterization test: hội thoại chưa đọc → MessageEvent đúng
- **Files**: `platforms/tiktok/inbox_watcher.py, messaging/scan_scheduler.py`
- **Vị trí (symbol)**: `InboxScanSkill / ScanScheduler`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-002
- **REQ / UC mapping**: REQ-E01 (UC-01.main)
- **Done khi**: đáp ứng AC-03
- **Test liên quan**: TC-03
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-01.main chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-004: Đặc tả sinh trả lời + validator + gửi idempotent `[LOGIC]` `[CRITICAL]` `[WRITE: OutboundMessage]` `[DEPENDS: T-003]`
- **Mô tả**: Test end-to-end với fake adapter + fake LLM; restart không gửi trùng
- **Files**: `agent/reply_service.py, agent/reply_validator.py, storage/inbox_ledger.py`
- **Vị trí (symbol)**: `ReplyService / ReplyValidator`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-003
- **REQ / UC mapping**: REQ-E01, REQ-U03 (UC-01.main)
- **Done khi**: đáp ứng AC-02, AC-03
- **Test liên quan**: TC-04, TC-05
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-01.main chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: L
- **Trạng thái**: [ ]

#### T-005: Đặc tả tin nhắn không hỗ trợ `[LOGIC]` `[PARALLEL]`
- **Mô tả**: Placeholder → câu xác nhận đúng ngôn ngữ, không gọi LLM
- **Files**: `agent/unsupported_message.py, agent/reply_language.py`
- **Vị trí (symbol)**: `is_unsupported_placeholder / unsupported_message_ack`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-E02 (UC-01-E1)
- **Done khi**: đáp ứng AC-04
- **Test liên quan**: TC-06
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-01-E1 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: S
- **Trạng thái**: [ ]

#### T-006: Đặc tả handoff khi cần người `[LOGIC]` `[WRITE: Escalation]` `[DEPENDS: T-004]`
- **Mô tả**: Ghi message_escalations + phát escalation.opened + dừng auto-reply
- **Files**: `services/handoff.py, services/escalation.py`
- **Vị trí (symbol)**: `HumanHandoff`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-E03 (UC-01-E2)
- **Done khi**: đáp ứng AC-05
- **Test liên quan**: TC-07
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-01-E2 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-007: Đặc tả đường dự phòng khi LLM lỗi/validator từ chối `[LOGIC]` `[RESILIENCE]` `[RISKY]` `[DEPENDS: T-004]`
- **Mô tả**: LLM giả lỗi/timeout → không gửi nội dung chưa kiểm
- **Files**: `agent/reply_service.py, llm/gemini_flash_lite.py`
- **Vị trí (symbol)**: `ReplyService fallback`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-E04, REQ-U02 (UC-01-E3)
- **Done khi**: đáp ứng AC-06, AC-07
- **Test liên quan**: TC-08, TC-09
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-01-E3 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: L
- **Trạng thái**: [ ]

#### T-008: Đặc tả tra cứu sản phẩm cho câu hỏi giá/tồn kho `[LOGIC]` `[READ: Product]` `[PARALLEL]`
- **Mô tả**: Giá/tồn kho chỉ lấy từ dữ liệu thật
- **Files**: `agent/product_lookup.py, storage/product_repository.py`
- **Vị trí (symbol)**: `ProductLookupPolicy`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-O01, REQ-U02 (UC-01-A1)
- **Done khi**: đáp ứng AC-07
- **Test liên quan**: TC-09
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-01-A1 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-009: Đặc tả takeover / gửi tin tay / release `[API]` `[WRITE: Conversation]`
- **Mô tả**: Takeover chặn auto-reply; release khôi phục
- **Files**: `dashboard_api/main.py, storage/conversation_control.py`
- **Vị trí (symbol)**: `POST .../takeover, .../messages, .../release`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-E05, REQ-E06, REQ-S01 (UC-02.main)
- **Done khi**: đáp ứng AC-08, AC-09
- **Test liên quan**: TC-10, TC-11
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-02.main chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-010: Đặc tả kiểm quyền và lỗi gửi của operator `[API]` `[PARALLEL]`
- **Mô tả**: Không quyền → 403; gửi lỗi giữ takeover
- **Files**: `dashboard_api/main.py, dashboard_api/auth.py`
- **Vị trí (symbol)**: `takeover/messages authz`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-009
- **REQ / UC mapping**: REQ-O02 (UC-02-E1, UC-02-E2)
- **Done khi**: đáp ứng AC-10
- **Test liên quan**: TC-12
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-02-E1, UC-02-E2 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-011: Đặc tả follow-up khách im lặng `[LOGIC]` `[WRITE: FollowUp]` `[DEPENDS: T-004]`
- **Mô tả**: Gửi đúng một lần cho mỗi (rule, tin cuối của khách)
- **Files**: `messaging/followup_scheduler.py, agent/followup_policy.py`
- **Vị trí (symbol)**: `FollowUpScheduler`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-004
- **REQ / UC mapping**: REQ-S02 (UC-03.main)
- **Done khi**: đáp ứng AC-11
- **Test liên quan**: TC-13
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-03.main chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-012: Đặc tả bỏ qua follow-up (đã nudge / takeover / ngoài giờ) `[LOGIC]` `[PARALLEL]`
- **Mô tả**: Các nhánh bỏ qua không gửi
- **Files**: `messaging/followup_scheduler.py, core/schedule.py`
- **Vị trí (symbol)**: `FollowUpScheduler skip rules`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-011
- **REQ / UC mapping**: REQ-S01, REQ-S02 (UC-03-E1, UC-03-E2)
- **Done khi**: đáp ứng AC-11
- **Test liên quan**: TC-14
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-03-E1, UC-03-E2 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: S
- **Trạng thái**: [ ]

#### T-013: Đặc tả đăng nhập và start/stop/pause/resume account `[API]` `[CRITICAL]`
- **Mô tả**: Vòng đời agent + hub đẩy status
- **Files**: `dashboard_api/main.py, dashboard_api/auth.py, dashboard_api/hub.py`
- **Vị trí (symbol)**: `POST /api/auth/login, /api/accounts/{id}/start`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-002
- **REQ / UC mapping**: REQ-E05 (UC-04.main, UC-04-A1)
- **Done khi**: đáp ứng AC-13
- **Test liên quan**: TC-15
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-04.main, UC-04-A1 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: L
- **Trạng thái**: [ ]

#### T-014: Đặc tả từ chối đăng nhập, quota, Cloudflare Access `[API]` `[PARALLEL]` `[DEPENDS: T-013]`
- **Mô tả**: Sai mật khẩu/quota/JWT sai bị từ chối
- **Files**: `dashboard_api/auth.py, dashboard_api/cf_access.py`
- **Vị trí (symbol)**: `login / max-workspaces / cf_access`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-013
- **REQ / UC mapping**: REQ-O02, REQ-O03 (UC-04-E1, UC-04-E2)
- **Done khi**: đáp ứng AC-12
- **Test liên quan**: TC-16
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-04-E1, UC-04-E2 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-015: Đặc tả tạo/cập nhật đơn hàng `[API]` `[WRITE: Order]`
- **Mô tả**: Đơn lưu theo account
- **Files**: `dashboard_api/routes/orders.py, dashboard_api/orders.py`
- **Vị trí (symbol)**: `GET/POST /api/accounts/{id}/orders`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-002
- **REQ / UC mapping**: REQ-E07 (UC-05.main)
- **Done khi**: đáp ứng AC-14
- **Test liên quan**: TC-17
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-05.main chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]

#### T-016: Đặc tả đồng bộ Google Sheet best-effort `[LOGIC]` `[EXTERNAL]` `[RESILIENCE]` `[DEPENDS: T-015]`
- **Mô tả**: Webhook lỗi không chặn thao tác, không rollback đơn
- **Files**: `integrations/sheet_export.py`
- **Vị trí (symbol)**: `export_order / spawn_export_customer_state`
- **Thay đổi cụ thể**:
  - Hiện trạng: chức năng đã có, chưa có test/spec truy vết
  - Mong muốn: test đặc tả xanh, bất kỳ sai lệch so với spec được ghi concern hoặc sửa tối thiểu
- **Dependency**: T-015
- **REQ / UC mapping**: REQ-E07 (UC-05-E1)
- **Done khi**: đáp ứng AC-14
- **Test liên quan**: TC-18
- **TDD** (Red→Green):
  - [ ] Test: kịch bản chính của UC-05-E1 chạy và khẳng định hành vi trong spec
  - [ ] Impl: chỉ sửa code nếu test đỏ do lệch spec
- **Complexity**: M
- **Trạng thái**: [ ]
