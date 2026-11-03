# Template: Agent Configuration — Cấu hình Agent Pipeline

> Tài liệu cấu hình cho AI Agent trong dự án.
> Tạo 1 lần trong **S.0b**, cập nhật khi cần dựa trên metrics.

## Thông tin dự án

| Mục | Giá trị |
|-----|--------|
| **Tên dự án** | [TÊN DỰ ÁN] |
| **Ngày cấu hình** | [YYYY-MM-DD] |
| **Phiên bản** | 1.0 |
| **Người cấu hình** | [Tên] |

---

## 1. Model Assignment

| Agent | Model | Temperature | Max Tokens | Ghi chú |
|-------|-------|-------------|------------|---------|
| BA Agent | [model-name] | 0.3 | 8192 | Advanced Elicitation |
| BA Critic Agent | [model-name] | 0.3 | 8192 | Adversarial, fresh context |
| Plan Agent | [model-name] | 0.2 | 16384 | |
| Test Agent | [model-name] | 0.2 | 8192 | |
| Master Check Agent | [model-name] | 0.1 | 16384 | Cần reasoning mạnh nhất |
| Implement Agent | [model-name] | 0.1 | 32768 | Cần code generation mạnh |
| **Review Agent** | [model-name] | 0.2 | 16384 | Adversarial, tìm ≥3 issues |
| Understand Agent | [model-name] | 0.2 | 16384 | Codebase scan |
| Constitute Agent | [model-name] | 0.3 | 8192 | Infer from code |
| Sync Agent | [model-name] | 0.1 | 8192 | Diff analysis |
| Metrics Agent | [model-name] | 0.2 | 8192 | Data collection |
| Sprint Agent | [model-name] | 0.2 | 8192 | Planning |
| Retrospective Agent | [model-name] | 0.3 | 8192 | Analysis |
| Help/Status Agent | [model-name] | 0.2 | 4096 | Quick response |

---

## 2. Tool Access Matrix

| Tool / Quyền | BA | Plan | Test | Master Check | Implement | Review |
|---------------|:--:|:----:|:----:|:------------:|:---------:|:------:|
| File Read (docs) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| File Read (src) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| File Write (src) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Terminal | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Browser/Internet | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Codebase Search | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Image Viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

> Điều chỉnh theo nhu cầu dự án. Nguyên tắc: **least privilege** — chỉ cấp quyền cần thiết.

---

## 3. Context & Knowledge Sources

### 3.1 Input bắt buộc cho mỗi Agent

| Agent | Input bắt buộc | Input tùy chọn |
|-------|----------------|----------------|
| BA Agent | constitution.md, yêu cầu thô | wireframe, spec cũ, domain glossary |
| BA Critic Agent | spec.md, constitution.md | spec-review-log.md (header only) |
| Plan Agent | constitution.md, spec.md | existing codebase, ADRs, context.md |
| Test Agent | constitution.md, spec.md | existing test patterns |
| Master Check | constitution.md, spec.md, plan.md, test-cases.md | context.md (No-Go Zones) |
| Implement Agent | constitution.md, plan.md, tasks.md, test-cases.md | existing code context, concerns list |
| Review Agent | spec.md, plan.md, tasks.md, validation-report.md | constitution.md |
| Understand Agent | codebase files | context.md (existing) |
| Sync Agent | spec.md (new version), plan.md, tasks.md, test-cases.md | — |

### 3.2 Knowledge Base Setup

| Loại | Đường dẫn | Trạng thái |
|------|-----------|------------|
| Domain Glossary | `.v-flow/knowledge/domain-glossary.md` | [ ] Đã tạo |
| Architecture Decisions | `.v-flow/knowledge/architecture-decisions/` | [ ] Đã tạo |
| Code Patterns | `.v-flow/knowledge/patterns/` | [ ] Đã tạo |
| Lessons Learned | `.v-flow/knowledge/lessons-learned/` | [ ] Đã tạo |

---

## 4. Non-determinism Strategy

| Chiến lược | Áp dụng cho | Mô tả |
|------------|-------------|--------|
| **Retry with review** | Tất cả agents | Nếu output bị reject, chạy lại với feedback |
| **Temperature tuning** | Implement Agent | Giảm temperature cho code generation |
| **Seed fixing** | [Agent cụ thể] | Sử dụng seed cố định khi cần reproducibility |
| **Ensemble voting** | [ ] Áp dụng / [ ] Không áp dụng | 2-3 runs, chọn output tốt nhất |

---

## 5. Prompt Versions

| Agent | Prompt File | Version | Lần cập nhật cuối |
|-------|-------------|---------|-------------------|
| BA Agent | `agents/ba-agent.md` | v2.0 | [YYYY-MM-DD] |
| BA Critic Agent | `agents/ba-critic-agent.md` | v2.0 | [YYYY-MM-DD] |
| Plan Agent | `agents/plan-agent.md` | v2.0 | [YYYY-MM-DD] |
| Test Agent | `agents/test-agent.md` | v2.0 | [YYYY-MM-DD] |
| Master Check | `agents/master-check-agent.md` | v2.0 | [YYYY-MM-DD] |
| Implement Agent | `agents/implement-agent.md` | v2.0 | [YYYY-MM-DD] |
| Review Agent | `agents/review-agent.md` | v2.0 | [YYYY-MM-DD] |
| Understand Agent | `agents/understand-agent.md` | v2.0 | [YYYY-MM-DD] |
| Constitute Agent | `agents/constitute-agent.md` | v2.0 | [YYYY-MM-DD] |
| Sync Agent | `agents/sync-agent.md` | v2.0 | [YYYY-MM-DD] |
| Metrics Agent | `agents/metrics-agent.md` | v2.0 | [YYYY-MM-DD] |
| Sprint Agent | `agents/sprint-agent.md` | v2.0 | [YYYY-MM-DD] |
| Retrospective Agent | `agents/retrospective-agent.md` | v2.0 | [YYYY-MM-DD] |
| Help Agent | `agents/help-agent.md` | v2.0 | [YYYY-MM-DD] |
| Status Agent | `agents/status-agent.md` | v2.0 | [YYYY-MM-DD] |
| Import BA Docs Agent | `agents/import-ba-docs-agent.md` | v2.0 | [YYYY-MM-DD] |

---

## 6. Guardrails — Input/Output Validation

### 6.1 Input Guardrails

| Agent | Guardrail | Mô tả |
|-------|-----------|-------|
| Tất cả | **Constitution check** | Reject input thiếu constitution.md |
| BA Agent | **Format validation** | Yêu cầu có ≥ 1 requirement rõ ràng |
| Implement Agent | **Scope check** | Chỉ modify files trong `tasks.md` |
| Tất cả | **PII filter** | [ ] Bật / [ ] Tắt — lọc thông tin cá nhân |

### 6.2 Output Guardrails

| Agent | Guardrail | Action khi vi phạm |
|-------|-----------|-------------------|
| Tất cả | **Template compliance** | Output phải đúng template → reject nếu sai format |
| Implement Agent | **File write scope** | Chỉ ghi vào files được chỉ định → block nếu ngoài scope |
| Implement Agent | **No secrets in code** | Scan output cho API keys, passwords → block |
| BA Agent | **Language consistency** | Output cùng ngôn ngữ với constitution |

### 6.3 Safety & Content

- [ ] **Harmful content filter**: Bật lọc nội dung không phù hợp
- [ ] **Hallucination check**: Yêu cầu agent cite sources trong output
- [ ] **Confidence threshold**: Reject output có confidence < [X]/5

---

## 7. Safe Iteration — Test trước Production

### 7.1 Staging Strategy

| Giai đoạn | Môi trường | Mục đích |
|-----------|-----------|---------|
| Dev | Local / sandbox | Test prompt changes nhanh |
| Staging | Staging environment | Test với data representative |
| Prod | Production | Sau khi staging OK |

### 7.2 Khi thay đổi Agent Config

```
1. Thay đổi trên branch riêng
2. Test với 1-2 features trên staging
3. So sánh metrics staging vs production
4. Nếu tốt hơn → merge vào main
5. Ghi lại lý do thay đổi trong decision log
```

### 7.3 Rollback Plan

- [ ] Giữ version cũ của agent-config.md (git history)
- [ ] Nếu metrics xấu hơn sau thay đổi → revert ngay

---

> **Lưu ý**: Agent config được tạo 1 lần và cập nhật dựa trên [Agent Metrics](../docs/agent-metrics-guide.md). Review lại config sau mỗi 5-10 features.
