# Constitution — autonomous-agent-vflow (v2, AI-drafted từ code)

> Draft bởi Constitute Agent: chỉ ghi điều **quan sát được** trong code. Mục chưa rõ để `(chưa xác định)`. Tech Lead cần duyệt.

| Mục | Giá trị |
|-----|---------|
| Tên dự án | autonomous-agent-vflow |
| Phiên bản | 2.0-draft |
| Cập nhật | 2026-11-03 |

## 1. Kiến trúc
1.1 Mỗi account = một tiến trình agent; supervisor (`dashboard_api`) là nơi duy nhất thấy mọi account. Agent không biết về run plan/đa account.
1.2 Postgres là nguồn sự thật; mọi bảng nghiệp vụ cô lập theo `account_id`.
1.3 Truy cập nền tảng chỉ qua `platforms/base.py` adapter; logic nghiệp vụ không gọi trực tiếp DOM/Playwright.
1.4 LLM chỉ truy cập qua `ReplyProvider`/`llm/base.py` để test chạy được không cần credential.
1.5 Control server của agent bind loopback, không xác thực — KHÔNG mở ra interface ngoài.

## 2. Quy chuẩn code
2.1 Python: snake_case, type hints, dataclass/pydantic cho model; comment giải thích *vì sao*.
2.2 Testing: mọi thay đổi hành vi phải có test (`pytest`); test không được cần mạng/LLM trừ `tests/gemini_*_evaluation.py`.
2.3 Frontend: TypeScript strict, `vitest`; `npm run typecheck` phải sạch.
2.4 Migration: chỉ **thêm** file `storage/migrations/YYYYMMDD_*.sql`; không sửa file đã có.

## 3. An toàn nghiệp vụ (bất di bất dịch)
3.1 Agent không tự bịa giá, tồn kho, trạng thái đơn, hoàn tiền, thanh toán — chỉ lấy từ dữ liệu sản phẩm/đơn; few-shot kịch bản chỉ định hướng giọng văn.
3.2 Khi không chắc / tin nhắn không hỗ trợ / bị yêu cầu người thật → chuyển giao (`HumanHandoff`) và dừng trả lời tự động.
3.3 Không nhắn cho người lạ: follow-up chỉ cho hội thoại đã có tin thật của khách, mỗi rule tối đa một lần cho mỗi tin cuối của khách.
3.4 Mọi gửi tin phải idempotent (ledger/lease) — không gửi trùng khi restart.
3.5 Không log secret/token/PII thô (`core/logging_safety.py`).

## 4. Bảo mật
4.1 Phiên dashboard HS256 cookie; Cloudflare Access RS256 qua `cf_access.py`; mật khẩu bcrypt.
4.2 Không commit `.env`, auth state TikTok, dữ liệu khách.

## 5. Quy trình V Flow
5.1 `spec.md` là Single Source of Truth; không implement khi chưa có Master Check ≥ PASS WITH CONCERNS.
5.2 TDD; task/test/code truy vết về REQ-xxx; task map tới mức luồng `UC-xx.main`.

## 6. Chưa xác định
- Ngưỡng coverage tối thiểu · công cụ lint/format Python · chính sách retention dữ liệu khách.
