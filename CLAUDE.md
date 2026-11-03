# AGENTS.md — V Flow Instructions for AI Agents

> This file provides instructions for AI coding agents (**GitHub Copilot**, **Antigravity**, Cursor, etc.)
> working within a project that uses **V Flow** — Agentic AI Software Development Process.

---

## 🧠 Tầng 1: Project Overview & Rules (Auto-injected)

<!-- AUTO-INJECT: context.md START -->
> ⚠️ **Project Context**: Nội dung `context.md` (~50-100 dòng overview bao gồm tech stack, architecture, no-go zones) sẽ được V Flow CLI tự động inject vào đây.
<!-- AUTO-INJECT: context.md END -->

<!-- AUTO-INJECT: constitution.md START -->
> ⚠️ **Project Rules**: Nội dung `constitution.md` (Development rules, formatting, policies) sẽ được V Flow CLI tự động inject vào đây.
<!-- AUTO-INJECT: constitution.md END -->

---

## 📦 Tầng 2: Module Cards (On-Demand Context)

> Khi làm việc với một feature cụ thể, Agent PHẢI chủ động đọc các file liên quan trong thư mục `.v-flow/modules/<domain>/SKILL.md` (Bao gồm các file: `use-cases.md`, `api-specs.md`, `tech-context.md`, `db.md`, `state-diagram.md`, `permissions.md`, `ui-flows.md`) để lấy context nghiệp vụ sâu hơn.

---

## Project Structure

This project follows the **V Flow** Spec-Driven Development process.
All development artifacts are stored in `.v-flow/`:

```
.v-flow/
├── context.md               ← U.0a: Project Overview (~50-100 dòng, auto-loaded)
├── constitution.md          ← Project principles & rules
├── agent-config.md          ← Agent pipeline configuration
├── modules/                 ← U.0b: Module Cards (Skills format)
│   └── domain-xxx/
│       ├── SKILL.md         ← Entry point + frontmatter
│       ├── use-cases.md     ← Business rules (BA đọc)
│       ├── api-specs.md     ← API endpoints (Dev đọc)
│       ├── ui-flows.md      ← Màn hình, UX, Field Mapping
│       ├── tech-context.md  ← Patterns, dependencies (Dev đọc)
│       ├── cross-service.md ← Tích hợp liên service
│       ├── db.md            ← Database, schema, DDL
│       ├── state-diagram.md ← State machine, transitions
│       ├── permissions.md   ← Roles, VPS, policies
│       └── raw/             ← U.0d (Optional — NotebookLM raw data)
│           ├── sources/     ← Source fulltext files
│           ├── domain-map.json ← Mind map export
│           └── overview.md  ← Briefing doc
├── knowledge/               ← Domain knowledge base
│   ├── domain-glossary.md
│   ├── architecture-decisions/
│   ├── patterns/
│   ├── golden-tests/
│   └── lessons-learned/
├── features/                ← Feature artifacts
│   └── NNN-feature-name/
│       ├── spec.md          ← S.1: Specification — SINGLE SOURCE OF TRUTH
│       ├── .flow-state.yaml ← Machine-readable pipeline state
│       ├── _session.md      ← Working memory
│       ├── plan.md          ← B.0a: Technical Plan
│       ├── tasks.md         ← B.0a: Task Breakdown
│       ├── test-cases.md    ← B.0b: Test Cases
│       ├── validation-report.md ← R.0: Master Check
│       └── metrics-report.md    ← M.0: Metrics
├── architecture/           ← U.1: WBS as-built (bridge sang động cơ cắt lát VSAF)
│   ├── project_wbs.md       ← Function Decomposition Tree + Work Unit Catalog
│   └── wbs-task-map.yaml    ← Ánh xạ WBS unit ↔ task V-Flow (nguồn cho import-vsaf)
├── slices/                  ← B.0c: SLICE-*.md chuẩn VSAF (tracer bullet, seam, AFK/HITL)
│                            ← nạp vào variant bằng: v-flow slice import-vsaf <feature>
├── slicing.config.yaml     ← Cấu hình bộ luật slice (profile strict/experiment, seams)
└── incidents/               ← O.0: Operations
```

## Critical Rules

1. **Tuân thủ tuyệt đối Project Context & Constitution** được auto-inject ở trên (Tầng 1). Không hành động nếu chưa rõ no-go zones.
2. **Chủ động đọc Module Cards (Tầng 2)** cho các module liên quan — `.v-flow/modules/domain-xxx/SKILL.md`
3. **`spec.md` is Single Source of Truth** — if plan/tasks conflict with spec, spec wins
4. **Check `.flow-state.yaml`** before starting any phase — know where you are in the pipeline
5. **Read `_session.md`** for working memory — decisions made, open questions, concerns from Master Check
6. **Check spec Status block** (Section 7) before implementing — all artifacts must be ✅
7. **If spec changes** — run `/v.sync` before continuing implementation
8. **Follow the pipeline order** — Spec → Plan + Tests → Master Check → Implement
9. **Never implement without Master Check = PASS (or PASS WITH CONCERNS)** — check `validation-report.md` *(ngoại lệ: prebuilt flows `quickfix`/`bugfix`/`hotfix` cố ý bỏ R.0 — đánh đổi tốc độ, chỉ dùng cho thay đổi nhỏ/khẩn)*
10. **Follow Routing Rules** — `validation-report.md` contains `fail_reason` + `route_decision`; don't guess
11. **Concerns carry-forward** — resolve all [W-xxx] concerns during B.1; verify during R.1
12. **Update `.flow-state.yaml`** at end of each phase — record verdict, routing, phase transition
13. **Append to `_session.md`** at end of each phase — execution trace entry
14. **Use EARS notation** for requirements: Ubiquitous, Event-driven, State-driven, Optional
15. **Map everything to requirements** — tasks, tests, and code must trace back to REQ-xxx
16. **TDD** — write tests before implementation code
17. **Log mỗi ranh giới phase** — cùng lúc với việc append `_session.md` (rule 13), gọi `v-flow log` để ghi vào nhật ký tổng `.v-flow/logs/activity.jsonl` (xem "Activity Logging" bên dưới)
18. **Working Memory Logging**: Trước khi kết thúc câu trả lời cho User, Agent BẮT BUỘC phải cập nhật file `.v-flow/logs/working_mem.json` để ghi lại lịch sử chat. File này lưu mảng các JSON object với cấu trúc: `{"timestamp": "...", "user_prompt": "...", "ai_response_summary": "...", "tools_used": [...], "estimated_tokens": ...}`. Agent tự ước tính số token.

## Activity Logging

Mọi hoạt động "dùng v-flow" được gom về **một nhật ký cục bộ** tại `.v-flow/logs/`:
- `activity.jsonl` — mỗi dòng 1 JSON (máy đọc / `jq` / grep)
- `activity.log` — bản dễ đọc cho người

Lệnh CLI tự ghi mỗi lần chạy. **Agent phải chủ động ghi** các mốc của mình bằng `v-flow log` (best-effort — nếu lệnh không có thì bỏ qua, đừng để chặn pipeline):

```bash
# Bắt đầu một phase
v-flow log --feature <feature> --phase S.1 --actor ba-agent --event start "Bắt đầu viết spec"
# Quyết định / mốc quan trọng
v-flow log --feature <feature> --phase R.0 --actor master-check-agent --event decision "Verdict=PASS_WITH_CONCERNS" --data '{"verdict":"PASS_WITH_CONCERNS","concerns":2}'
# Kết thúc phase
v-flow log --feature <feature> --phase B.1 --actor implement-agent --event end "12/12 tasks done"
```

Ghi tối thiểu ở: **start** và **end** mỗi phase, mỗi **routing decision**, và mỗi **lỗi/blocker**. Xem lại nhanh: `v-flow log --tail 30`. Tắt toàn bộ: đặt `VFLOW_NO_LOG=1`.

### Tự động bắt log qua lifecycle hooks (đa-provider, deterministic)

Ngoài cách agent chủ động gọi `v-flow log` (best-effort), có thể cài hook để **mọi tool-use / session** được ghi tự động — chạy được trên Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Antigravity:

```bash
v-flow hooks install        # rải hook vào config từng tool (merge, không clobber)
v-flow hooks status         # xem tool nào đã cài
v-flow hooks uninstall      # gỡ hook của v-flow (giữ hook của bạn)
```

Mỗi hook gọi `v-flow log --hook <provider>` — đọc payload tool đẩy qua stdin, chuẩn hoá rồi append vào cùng `.v-flow/logs/`. Hook luôn exit 0, không bao giờ chặn agent. Yêu cầu: `v-flow` có trên PATH (IDE GUI không kế thừa PATH → cài bằng `v-flow hooks install --abs`).

Safety-net tool-agnostic: `v-flow watch` giám sát `.v-flow/**` và log mọi thay đổi file — bắt được cả tool không có hook lẫn sửa tay.

## Available Slash Commands

| Command | Phase | Purpose |
|---------|-------|---------|
| `/v.help` | Any | **Help Agent — gợi ý bước tiếp theo dựa trên trạng thái dự án** |
| `/v.understand` | U.0 | **Understand Agent — Multi-Layer Understanding (`--all`, `--module`, `--check`, `--refresh`)** |
| `/v.import-ba-docs` | U.0d | **Import BA Docs Agent — Import tài liệu BA từ NotebookLM** |
| `/v.wbs` | U.1 | **WBS Agent — phân rã codebase → `project_wbs.md` chuẩn VSAF (`--refresh`, `--check`)** |
| `/v.constitution` | S.0a | Create/update project constitution (interactive) |
| `/v.constitute` | S.0a | **Constitute Agent — AI scan → tự động draft `constitution.md` v2** |
| `/v.specify` | S.1 | BA Agent — create spec + init `.flow-state.yaml` + `_session.md` (`--dual` for Dual BA loop) |
| `/v.ba-critic` | S.1 | **BA Critic Agent — Adversarial spec review 1 round (dùng sau `--dual`)** |
| `/v.prototype` | S.1.5 | **Prototype Agent — Throwaway prototype để validate ambiguity (`--logic`, `--ui`, `--question`)** |
| `/v.ba-to-ptyc` | S.1.6 | **BA to PTYC Agent — spec.md → PTYC.docx (Phân tích Yêu cầu chuẩn ISO), optional Doc Export** |
| `/v.plan` | B.0a | Plan Agent — create technical plan + tasks (`--with-security`, `--with-ux`, `--with-api`) |
| `/v.test` | B.0b | Test Agent — create test cases from spec |
| `/v.slice` | B.0c | Slice Planning — cắt lát dọc demo được, so sánh variant, người khóa (`--strategy`, `--vsaf`, `--experiment`) |
| `/v.code-to-vsaf-slice` | U.0→R.0 | **Trọn gói code → slice chuẩn VSAF: Understand → WBS → Specify → Plan+Test → Slice VSAF → Master Check** |
| `/v.check` | R.0 | Master Check — cross-validate Spec ↔ Plan ↔ Tests + explicit routing |
| `/v.implement` | B.1 | Implement Agent — TDD coding, concerns handling (`--yolo` for auto-mode) |
| `/v.review` | R.1 | Adversarial Code Review — ≥ 3 issues + routing rules |
| `/v.sync` | Any | **Sync Agent — propagate spec changes to artifacts** |
| `/v.sprint` | B.1 | Sprint Planning Agent — tạo sprint-status.md |
| `/v.retrospective` | R.1 | Retrospective Agent — tổng kết sau epic/sprint |
| `/v.metrics` | M.0 | Collect agent performance metrics |
| `/v.operations` | O.0 | **Operations Agent — rà soát vận hành định kỳ / phân loại incident → route flow khắc phục** |
| `/v.status` | Any | **📊 Dashboard — pipeline state, routing decision, concerns** |
| `/v.quickfix` | S.1→B.1→R.1 | **Quick Fix Flow — bug fix nhỏ, skip full pipeline** |
| `/v.bugfix` | S.1→B.0→B.1→R.1 | **Bugfix Flow — root cause analysis + 3-behavior model + 3-tier TDD (Kiro-inspired)** |
| `/v.hotfix` | O.0→B.1→R.1 | **Hotfix Flow — P1/P2 production incident** |
| `/v.rewind` | Any | **Time Travel: Rewind — rollback spec/pipeline về version cũ** |
| `/v.fork` | Any | **Time Travel: Fork — branch feature để thử hướng khác** |

## Pipeline Flow

```
Constitution → Agent Setup → BA Agent [→ BA Critic (opt-in `--dual`)] → [Prototype Agent (opt S.1.5)] → Plan Agent ⧑ Test Agent → Master Check → Implement → Verify → Metrics
```

**Với Legacy Project**, thêm bước đầu tiên:
```
init → /v.understand --all (context.md) → /v.understand --module (Module Cards) → /v.constitute (constitution.md v2) → ... (giống trên)
Understand (context.md + Module Cards) → Constitution → ... (giống trên)
```

**Prebuilt Flows** (skip full pipeline):
```
Quick Fix:  S.1 nhanh → B.1 → R.1          ← bug fix nhỏ, đơn giản (<5 files)
Bugfix:     S.1 → B.0(opt) → B.1 → R.1     ← bug cần root cause analysis + regression prevention
Hotfix:     O.0 → B.1 → R.1 → O.0          ← production incident P1/P2
```

**Nhóm Phase** (U → S → B → R → M → O):
- **U** Understand: `U.0` — Multi-Layer Understanding (context.md + Module Cards + Graph)
- **S** Specify: `S.0a` Foundation, `S.0b` Agent Setup (thủ công — cấu hình `agent-config.md`, không có agent riêng), `S.1` Specification, `S.1.5` Prototype (optional)
- **B** Build: `B.0` Plan+Test (+Optional: Security/UX/API), `B.1` Implement
- **R** Review: `R.0` Master Check (explicit routing), `R.1` Verify
- **M** Metrics: `M.0`
- **O** Operations: `O.0`

## Agent Roles

When activated via slash commands, adopt the specific agent persona:
- **Help Agent**: Navigator — đọc `.flow-state.yaml`, gợi ý bước tiếp theo dựa trên trạng thái pipeline
- **Understand Agent**: Multi-Layer Scanner — generate context.md (Tầng 1) + Module Cards (Tầng 2), đánh dấu `[⚠️ AI-inferred]`; tự kiểm card bằng CLI: `v-flow validate --module-cards <m>` (lint) + `score-card <m>` (điểm objective) + `dev-quiz <m>` (answer key từ graph)
- **WBS Agent**: WBS Synthesizer — phân rã codebase thành Work Unit chuẩn VSAF (`OPS/BE-DAT/BE-*/INT/SCR/WGT`); mô tả as-built chứ không as-wished, mỗi unit có `evidence_path` thật, quan hệ `consumes`/`used_by` nhất quán hai chiều
- **Import BA Docs Agent**: BA Docs Importer — trích xuất tài liệu BA từ NotebookLM, generate raw materials + AI drafts cho Module Cards
- **Constitute Agent**: Constitution Drafter — infer từ code, để trống rõ ràng, không lý tưởng hóa
- **BA Agent**: Business Analyst — focus on WHAT, not HOW; init `.flow-state.yaml` + `_session.md`. Dual BA mode: cập nhật spec sau mỗi round review. Auto-scan ambiguity và gợi ý `/v.prototype`
- **BA Critic Agent**: Adversarial Spec Critic — fresh context mỗi round, phải tìm issues, không LGTM
- **Prototype Agent**: Throwaway Builder — tạo LOGIC TUI hoặc UI variants để resolve ambiguity, capture verdict vào `prototype-notes.md`, carry-forward qua `_session.md`
- **Plan Agent**: Technical Architect — design, don't implement; update `_session.md`
- **Test Agent**: QA Engineer — comprehensive coverage
- **Master Check Agent**: Quality Gate — strict, 3-level verdict (PASS/PASS WITH CONCERNS/FAIL), explicit `fail_reason` + `route_decision`
- **Implement Agent**: Developer — TDD, follow the plan exactly, resolve all concerns [W-xxx]
- **Bugfix Analyst Agent**: Bug Diagnostician — 3-behavior model (Current/Expected/Unchanged), root cause analysis, 3-tier test plan (Red/Green/Protect). Kiro-inspired surgical fix approach
- **Review Agent**: Adversarial Reviewer — find ≥3 issues, never "LGTM", verify concerns resolved
- **Status Agent**: Observer — cross-check `.flow-state.yaml` vs reality, render visual dashboard
- **Sync Agent**: Synchronizer — propagate spec changes to plan/tasks/tests
- **Sprint Planning Agent**: Scrum Master — create sprint-status.md and track dependencies
- **Retrospective Agent**: Evaluator — tổng kết và cập nhật knowledge base sau epic/sprint
- **Metrics Agent**: Analyst — đo lường performance và đề xuất cải tiến Agent Config
- **Operations Agent**: SRE — monitor production, detect incidents, tạo báo cáo và trigger pipeline

## New Concepts (LangGraph-inspired)

| Concept | File | Purpose |
|---------|------|---------|
| **Auto-Inject Context** | `AGENTS.md` / `.cursorrules` | Tự động bơm Tầng 1 (`context.md` + `constitution.md`) cho GitHub Copilot, Antigravity & Cursor đọc trực tiếp |
| **Multi-Layer Understanding** | `.v-flow/modules/` | Tầng 1: Auto-injected Overview. Tầng 2: Module Cards on-demand. Tầng 3: Code Graph |
| **Typed State** | `.flow-state.yaml` | Machine-readable pipeline state — phase, artifacts, routing, concerns |
| **Routing Rules** | Embedded in each workflow | Explicit next-step decision — no guessing |
| **Working Memory** | `_session.md` | Short-term context: decisions, trace, open questions |
| **Concerns Carry-forward** | `validation-report.md` → `_session.md` | Concerns from R.0 tracked through B.1 and verified at R.1 |
| **Prebuilt Flows** | `quickfix`, `bugfix`, `hotfix` | Optimized pipelines for common scenarios (3 tiers: simple → structured → emergency) |
| **Spec Change Policy** | `constitution.md` §9 | Double-texting: Enqueue/Interrupt/Rollback/Reject based on phase |
| **Map-Reduce** | `/v.plan --with-*` | Optional agents (Security, UX, API) run in parallel at B.0 |
| **Thread Isolation** | `/v.sprint` | Multi-feature dashboard with dependency tracking |
| **Task Annotations** | `tasks.md` | `[ENTRYPOINT]`, `[PARALLEL]`, `[GATE]`, `[CRITICAL]`, `[RISKY]`, `[SPIKE]`, `[CLARIFY]`, `[DEPENDS: T-xxx]` scheduling |
| **Streaming** | `_session.md` Live Progress | Real-time progress updates during agent execution |
| **Time Travel** | `/v.rewind`, `/v.fork` | Rollback to previous versions, branch to explore alternatives |
| **Command Pattern** | `agent-command-template.yaml` | Structured agent output = state_update + routing in one block |
| **Subgraph Composition** | `module-template.yaml` | Reusable pipeline modules with encapsulated input/output |

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ADLC** (14006 symbols, 15182 relationships, 70 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/ADLC/context` | Codebase overview, check index freshness |
| `gitnexus://repo/ADLC/clusters` | All functional areas |
| `gitnexus://repo/ADLC/processes` | All execution flows |
| `gitnexus://repo/ADLC/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
