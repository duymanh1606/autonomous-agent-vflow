# V Flow 🚀

**Agentic AI Software Development — Spec-Driven Development**

> 🇻🇳 [Phiên bản tiếng Việt](#-phiên-bản-tiếng-việt) bên dưới.

---

## Overview

V Flow uses **16 specialized AI Agents** orchestrated in a structured pipeline:

```
[U] Understand → [S] Specify → [B] Build → [R] Review → [M] Metrics → [O] Operations
```

| Phase | Code | Agent | Output |
|-------|------|-------|--------|
| Understand | **U.0** | Understand Agent | `context.md` + Module Cards *(legacy)* |
| Foundation | **S.0a** | Constitute Agent | `constitution.md` |
| Specification | **S.1** | BA Agent | `spec.md` (EARS notation) |
| Planning | **B.0a** | Plan Agent | `plan.md`, `tasks.md` |
| Testing | **B.0b** | Test Agent | `test-cases.md` |
| Master Check | **R.0** | Master Check Agent | `validation-report.md` |
| Implementation | **B.1** | Implement Agent | Working code + tests |
| Verification | **R.1** | Review Agent | Code review (5-chiều có bằng chứng) |
| Metrics | **M.0** | Metrics Agent | `metrics-report.md` |

### Key Features

- 🎯 **Spec-Driven** — Define "what" before "how" via EARS notation
- 🔄 **3-Level Master Check** — PASS / PASS WITH CONCERNS / FAIL with explicit routing
- 🤖 **4-Target AI Sync** — Antigravity, GitHub Copilot, Cursor, Claude Code (auto-synced, config-driven)
- ⚔️ **Adversarial Review** — Evidence-based 5-dimension review (no rubber stamps, no forced issue quota)
- 🔀 **Dual BA Mode** — Opt-in spec critique loop
- ⏮️ **Time Travel** — `/v.rewind` and `/v.fork` for spec versioning
- 📊 **Typed State** — Machine-readable `.flow-state.yaml` tracking
- 🧰 **14 Skills** — Action-oriented guidance for every pipeline phase

---

## ⚡ Quick Start

### CLI Installation

```bash
# Install globally
npm install -g v-flow-cli

# Initialize in your project
v-flow init my-project

# Verify setup
v-flow check

# View pipeline status
v-flow status
```

### Slash Commands (in AI Agent)

```
/v.help            → Project status & next step suggestion
/v.understand      → Multi-Layer Understanding (--all, --module)
/v.specify         → BA Agent creates spec (--dual for critique loop)
/v.plan            → Plan Agent designs architecture
/v.test            → Test Agent generates test cases
/v.check           → Master Check cross-validation
/v.implement       → Implement Agent — TDD coding (--yolo: auto-mode)
/v.review          → Adversarial Code Review (evidence-based, no forced quota)
/v.quickfix        → Quick fix for small bugs (< 5 files)
/v.hotfix          → Hotfix for P1/P2 production incidents
```

<details>
<summary>📋 All 23 Slash Commands</summary>

| Command | Phase | Description |
|---------|-------|-------------|
| `/v.help` | Any | Project status & next step |
| `/v.understand` | U.0 | Codebase scan → context.md + Module Cards |
| `/v.import-ba-docs` | U.0d | Import BA docs from NotebookLM |
| `/v.constitution` | S.0a | Interactive constitution setup |
| `/v.constitute` | S.0a | AI auto-draft constitution.md |
| `/v.specify` | S.1 | BA Agent → spec.md (--dual for critique) |
| `/v.ba-critic` | S.1 | Adversarial spec review |
| `/v.prototype` | S.1.5 | Throwaway prototype to validate ambiguity |
| `/v.ba-to-ptyc` | S.1.6 | spec.md → PTYC.docx (ISO requirements doc, optional) |
| `/v.plan` | B.0a | Plan Agent → plan.md + tasks.md |
| `/v.test` | B.0b | Test Agent → test-cases.md |
| `/v.check` | R.0 | Master Check → validation-report.md |
| `/v.implement` | B.1 | Implement Agent → TDD coding |
| `/v.review` | R.1 | Adversarial Code Review |
| `/v.sync` | Any | Propagate spec changes |
| `/v.sprint` | B.1 | Sprint planning dashboard |
| `/v.retrospective` | R.1 | Post-sprint summary |
| `/v.metrics` | M.0 | Agent performance metrics |
| `/v.status` | Any | Visual pipeline dashboard |
| `/v.quickfix` | S.1→R.1 | Quick bug fix flow |
| `/v.bugfix` | S.1→R.1 | Bugfix flow — root cause + 3-tier TDD |
| `/v.hotfix` | O.0→R.1 | Production incident flow |
| `/v.rewind` | Any | Time Travel: rollback |
| `/v.fork` | Any | Time Travel: branch |

</details>

---

## 🤖 Supported AI Agents

| Agent | Integration | Config Files |
|-------|------------|-------------|
| **Antigravity** | `.agents/workflows/` + `AGENTS.md` | Auto-available slash commands |
| **GitHub Copilot** | `.github/prompts/` + `copilot-instructions.md` | Prompt files for Agent Mode |
| **Cursor** | `.cursor/rules/` + `.cursorrules` | Rules `.mdc` + Agent personas |
| **Claude Code** | `.claude/commands/` + `CLAUDE.md` | Slash commands + subagents + skills |

> ➕ Targets are config-driven — add a vendor by appending one entry to `cli/lib/sync-targets.js` (no engine changes).

---

## 🔧 CLI Reference

| Command | Description |
|---------|-------------|
| `v-flow init [name]` | Initialize `.v-flow/` + AI agent files |
| `v-flow check` | Verify setup and artifact status |
| `v-flow status [feature]` | Pipeline progress for features |
| `v-flow feature create <name>` | Create feature folder + scaffold |
| `v-flow sync [--apply]` | Sync commands/agents/skills → AI folders |
| `v-flow doctor [--fix]` | Deep health check |
| `v-flow upgrade [--check]` | Upgrade templates and agents |
| `v-flow validate [feature]` | Validate artifact structure & quality |
| `v-flow validate --module-cards [module]` | Lint module card structure + business-quiz language |
| `v-flow score-card [module]` | Objective scorecard (6 pts) for a module card, with evidence trail |
| `v-flow dev-quiz <module>` | Machine-graded technical check (GitNexus graph = answer key) |

---

## 📚 Documentation

| Doc | Description |
|-----|------------|
| 📖 [V-Flow Guide](docs/v-flow-guide.md) | Full technical documentation |
| 📚 [Learning Path](learn/) | 7-step tutorial |
| 📘 [Golden Example](examples/001-user-login/) | End-to-end: spec → metrics |
| 🏗️ [Legacy Example](examples/002-legacy-crud/) | Legacy refactor example |
| ⚡ [Quick Fix Example](examples/003-quickfix-bug/) | Bug fix flow |
| 🚨 [Hotfix Example](examples/004-hotfix-p1/) | P1 incident response |
| 🎯 [Best Practices](docs/best-practices.md) | Anti-patterns & tips |
| 📐 [EARS Notation](docs/ears-notation-guide.md) | Requirements writing guide |
| ⚙️ [Skills Blueprint](docs/skills-blueprint.md) | Skills system design |

---

## Philosophy

- **Spec first, code later** — Define "what" before "how"
- **Consistency via Constitution** — All Agents follow the same rules
- **Cross-validation** — Master Check ensures Spec ↔ Plan ↔ Tests alignment
- **Human-in-the-loop** — AI drafts, humans decide
- **Closed-loop** — Production feedback flows back into the pipeline

---

## Inspiration

- [Kiro](https://kiro.dev/) — Spec-driven development, EARS notation
- [GitHub Spec Kit](https://github.com/github/spec-kit) — Constitution, SDD workflow
- [Microsoft AI-Led SDLC](https://developer.microsoft.com/blog/spec-driven-development-spec-kit) — Agentic lifecycle
- [EPAM ADLC](https://www.epam.com/insights/ai/blogs/agentic-development-lifecycle-explained) — Agent governance
- [LangGraph](https://github.com/langchain-ai/langgraph) — Typed state, routing, time travel

---

---

# 🇻🇳 Phiên Bản Tiếng Việt

## Tổng quan nhanh

V Flow sử dụng **19 AI Agent chuyên biệt** phối hợp theo pipeline:

```
[U] Understand → [S] Specify → [B] Build → [R] Review/Verify → [M] Metrics → [O] Operations
```

*[U] chỉ cần lần đầu với legacy project*

| Phase | Code | Agent | Output |
|-------|------|-------|--------|
| Understand | **U.0** | Understand Agent (AI scan) + Tech Lead + BA | `context.md` + Module Cards *(legacy)* |
| Foundation | **S.0a** | Constitute Agent (AI draft) + Tech Lead | `constitution.md` |
| Agent Setup | **S.0b** | — | `agent-config.md` |
| Specification | **S.1** | BA Agent | `spec.md` |
| Planning | **B.0a** | Plan Agent | `plan.md`, `tasks.md` |
| Testing | **B.0b** | Test Agent | `test-cases.md` |
| Master Check | **R.0** | Master Check Agent | `validation-report.md` |
| Implementation | **B.1** | Implement Agent | Working code + tests |
| Verification | **R.1** | CI/CD + QA + PO | UAT report |
| Agent Metrics | **M.0** | — | `metrics-report.md` |
| Operations | **O.0** | Operations Agent | `operations-report.md` |

---

## ⚡ Bắt đầu nhanh

### Cách 1: Dùng CLI Tool

```bash
# Cài đặt global
npm install -g v-flow-cli

# Khởi tạo trong dự án hiện tại
v-flow init my-project

# Kiểm tra setup
v-flow check

# Xem pipeline status
v-flow status
```

### Cách 2: Dùng Slash Commands (trong AI Agent)

```
/v.help            → [Any]  Xem trạng thái dự án & gợi ý bước tiếp
/v.understand      → [U.0]  Multi-Layer Understanding (--all, --module, --check, --refresh)
/v.specify         → [S.1]  BA Agent tạo spec + init state files (--dual for Dual BA)
/v.plan            → [B.0a] Plan Agent thiết kế kiến trúc
/v.test            → [B.0b] Test Agent tạo test cases
/v.check           → [R.0]  Master Check cross-validate + explicit routing
/v.implement       → [B.1]  Implement Agent coding TDD (--yolo: auto-mode)
/v.review          → [R.1]  Adversarial Code Review (5-chiều có bằng chứng)
/v.quickfix        → [S.1→R.1] Quick fix cho bug nhỏ (< 5 files)
/v.hotfix          → [O.0→R.1] Hotfix cho P1/P2 production incident
```

### Cách 3: Manual

1. **Đọc quy trình**: [v-flow.md](v-flow.md)
2. **Legacy project**: chạy `v-flow init` → `/v.understand --all` → `/v.understand --module {tên}` → Human review
3. **Thiết lập Constitution**: chạy `/v.constitute` (AI draft) → Tech Lead review `constitution.md`
4. **Chạy theo workflow**: [full-flow.md](workflows/full-flow.md) hoặc [quick-feature.md](workflows/quick-feature.md)
5. **Xem ví dụ**: [examples/001-user-login](examples/001-user-login/) — Golden Example end-to-end

---

## 🔧 CLI Reference

| Command | Description |
|---------|-------------|
| `v-flow init [name]` | Khởi tạo `.v-flow/` + AI agent files |
| `v-flow check` | Kiểm tra setup và artifacts status |
| `v-flow status [feature]` | Xem pipeline progress cho features |
| `v-flow feature create <name>` | Tạo feature folder + scaffold artifacts |
| `v-flow sync [--apply]` | Đồng bộ commands/agents/skills → AI agent folders |
| `v-flow doctor [--fix]` | Deep health check — verify installation integrity |
| `v-flow upgrade [--check]` | Upgrade templates, agents khi có version mới |
| `v-flow validate [feature]` | Kiểm tra cấu trúc và chất lượng artifacts |
| `v-flow validate --module-cards [module]` | Lint cấu trúc module card + ngôn ngữ business-quiz (bỏ trống = tất cả) |
| `v-flow score-card [module]` | Chấm điểm objective (6đ) cho module card, có evidence trail |
| `v-flow dev-quiz <module>` | Kiểm chứng kỹ thuật — chấm máy theo GitNexus impact (graph = answer key) |

---

## 🔄 Sync System

> **Source of Truth**: `commands/`, `agents/`, `skills/`
> **Distribution**: `.agents/`, `.github/`, `.cursor/` (auto-synced)

```bash
v-flow sync              # Preview (dry-run)
v-flow sync --apply      # Apply sync
v-flow sync --apply --verbose  # Detailed output
```

> 💡 **Legacy scripts** (`scripts/_deprecated/`) đã deprecated — dùng `v-flow sync --apply`.

---

## Cấu trúc thư mục

```
v-flow/
├── AGENTS.md                 ← Instructions cho AI agents
├── v-flow.md                 ← Quy trình chi tiết (v4.1)
├── package.json              ← npm CLI package
├── cli/                      ← CLI Tool source (8 commands)
│   ├── index.js
│   ├── commands/             ← init, check, status, feature, sync, doctor, upgrade, validate
│   └── lib/
│       ├── templates.js      ← Scaffold & features
│       ├── scanner.js        ← Codebase analysis (multi-language)
│       ├── cli-error.js      ← Unified error handling
│       └── sync-core.js      ← Shared sync logic
├── commands/                 ← Slash Commands (21 commands, source of truth)
├── agents/                   ← Agent definitions (16 agents)
├── skills/                   ← Agent Skills (14 skills, 6 groups)
├── templates/                ← Templates cho artifacts
├── workflows/                ← 10 workflow definitions
├── examples/                 ← 4 ví dụ end-to-end (full, legacy, quickfix, hotfix)
├── learn/                    ← 📚 Learning Path (7 bài)
├── docs/                     ← Tài liệu bổ sung
├── scripts/                  ← Automation (pre-commit hook)
│   └── _deprecated/          ← Legacy scripts (reference only)
├── .agents/                  ← Antigravity (auto-synced)
├── .github/                  ← GitHub Copilot (auto-synced)
└── .cursor/                  ← Cursor (auto-synced)
```

---

## Triết lý

- **Spec trước, Code sau** — Định nghĩa "cần gì" trước khi bàn "làm thế nào"
- **Nhất quán qua Constitution** — Mọi Agent tuân thủ cùng bộ quy tắc
- **Cross-validation** — Master Check đảm bảo Spec ↔ Plan ↔ Tests đồng nhất
- **Human-in-the-loop** — AI tạo draft, con người quyết định
- **Closed-loop** — Feedback từ production quay lại pipeline

---

## License

MIT © [quochoang228](https://github.com/quochoang228)
