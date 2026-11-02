# Logic Prototype

A tiny interactive terminal app that lets the user drive a state model by hand. Use this when the question is about **business logic, state transitions, or data shape** — the kind of thing that looks reasonable on paper but only feels wrong once you push it through real cases.

If the question is "what should this look like" — wrong branch. Use [UI.md](UI.md).

## When this is the right shape

- "State machine xử lý edge case X rồi Y thế nào?"
- "Data model có thực sự biểu diễn được case này không?"
- "API nên có shape như thế nào trước khi viết thật?"
- Bất cứ khi nào user muốn **nhấn nút và xem state thay đổi**.

## Process

### 1. State the question (từ spec.md)

Đọc `spec.md` — tìm REQ-xxx có ambiguity markers. Viết rõ câu hỏi ở đầu prototype (README hoặc comment đầu file):

```
# PROTOTYPE — [Feature NNN]
# Question: [câu hỏi cụ thể lấy từ spec REQ-xxx]
# Branch: LOGIC
# Delete after: verdict captured in prototype-notes.md
```

### 2. Pick the runtime (auto-detect)

Scan project files theo thứ tự:

| Signal file | Runtime |
|------------|---------|
| `package.json` có `"@angular/core"` | Angular + TypeScript |
| `package.json` không có Angular | Node.js / TypeScript |
| `bun.lockb` hoặc `bunfig.toml` | Bun |
| `pom.xml` hoặc `build.gradle` | Java |
| `requirements.txt` hoặc `pyproject.toml` | Python |
| Không detect được | → Hỏi user chọn runtime |

Match project's existing tooling conventions — don't add a new package manager or runtime just for the prototype.

### 3. Isolate the logic in a portable module

Put actual logic behind a small, pure interface. The right shape:

- **Pure reducer** — `(state, action) => state`. Khi actions là discrete events.
- **State machine** — explicit states và transitions. Khi "actions nào legal hiện tại" là một phần câu hỏi.
- **Pure functions** over plain data type. Khi không có implicit state.
- **Class/module** với clear method surface. Khi logic cần ongoing internal state.

```
.v-flow/features/NNN/prototype/logic/
├── logic.ts        ← pure module (the thing worth keeping)
├── tui.ts          ← thin shell, throwaway
├── README.md       ← câu hỏi + run command
└── package.json    ← chỉ nếu cần isolate deps
```

Keep it pure: **no I/O, no terminal code, no `console.log` for control flow** in the logic module. TUI imports it; nothing flows the other direction. This makes the logic liftable into real code after prototype is done.

### 4. Build the smallest TUI that exposes the state

Lightweight TUI — on every tick: **clear screen + re-render whole frame**:

```
console.clear()  // Node/Bun/TypeScript
print("\033[2J\033[H")  // Python
// Java: ProcessBuilder("clear").inheritIO().start().waitFor()
```

Each frame has two parts (in this order):

1. **Current state** — pretty-printed, one field per line or formatted JSON. Use bold for field names (`\x1b[1m`), dim for less important context (`\x1b[2m`), reset (`\x1b[0m`).
2. **Keyboard shortcuts** — `[a] add item  [d] delete  [t] tick  [q] quit`. Bold key, dim description.

Behavior loop:
```
init state → render frame → read keystroke → dispatch handler → mutate state → re-render → loop until [q]
```

### 4.5. Handling Text & Number Inputs (Prompts)

Nếu TUI cần nhận dữ liệu đầu vào dài từ bàn phím (ví dụ: nhập số tiền, tên, câu trả lời), **BẮT BUỘC phải tạm thời tắt Raw Mode** để tránh xung đột phím tắt và lỗi crash.

#### Node.js (TypeScript) Blueprint:
```typescript
import readline from 'readline';

async function promptInput(questionText: string): Promise<string> {
  // 1. Tắt Raw Mode & Pause stdin để nhập văn bản bình thường
  process.stdin.setRawMode(false);
  process.stdin.pause();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(questionText, (answer) => {
      rl.close();
      // 2. Bật lại Raw Mode & Resume stdin để tiếp tục nhận phím tắt menu
      process.stdin.setRawMode(true);
      process.stdin.resume();
      resolve(answer);
    });
  });
}
```

Khi muốn gọi nhập liệu trong TUI:
```typescript
// Trong event loop handler của tui.ts
if (key === 'i') { // Ví dụ nhấn 'i' để nhập số tiền
  const amountStr = await promptInput('Nhập số tiền: ');
  const amount = parseFloat(amountStr);
  if (!isNaN(amount)) {
    state = reducer(state, { type: 'INPUT_AMOUNT', amount });
  }
  renderFrame(state);
}
```

### 5. Make it runnable in one command

Add script to project's existing task runner:

```json
// package.json
"scripts": {
  "prototype:NNN": "tsx .v-flow/features/NNN/prototype/logic/tui.ts"
}
```

```toml
# pyproject.toml
[tool.taskipy.tasks]
prototype-NNN = "python .v-flow/features/NNN/prototype/logic/tui.py"
```

Document the exact command in `prototype-notes.md` → "Run command" field.

### 5.5. Runtime Verification (Verify before handover)

Trước khi gửi lệnh chạy cho người dùng, Agent **BẮT BUỘC** phải tự chạy thử lệnh chạy đó trên Workspace bằng tool `run_command` để verify:
- Không bị lỗi biên dịch (TypeScript compile error).
- Không bị lỗi import path (ví dụ: `@/` path resolution lỗi).
- Chương trình TUI hiển thị được giao diện ban đầu thành công mà không bị crash ngay lập tức.
- Bạn có thể chạy thử lệnh với tham số chờ/timeout ngắn (ví dụ: `WaitMsBeforeAsync: 1000` hoặc chạy bất đồng bộ rồi kill task sau 1 giây) để đảm bảo process khởi động thành công và exit code bằng 0 hoặc process vẫn đang run bình thường.

### 6. Hand it over

Give the user the run command. They'll drive it themselves. Interesting moments: "wait, that shouldn't be possible" or "huh, I assumed X" — những lỗi trong _idea_, đó mới là mục tiêu.

### 7. Capture the answer → prototype-notes.md

Khi prototype đã trả lời câu hỏi:

1. Điền verdict vào `prototype-notes.md` (VALIDATED / REJECTED / INCONCLUSIVE)
2. Map verdict về REQ-xxx trong spec — prototype finding này ảnh hưởng requirement nào?
3. Append execution trace vào `_session.md`
4. Update `artifacts.prototype.*` trong `.flow-state.yaml`
5. Xóa prototype code — chỉ giữ `prototype-notes.md`

## Anti-patterns

- **Don't add tests** — prototype that needs tests is no longer a prototype
- **Don't wire to real DB** — in-memory unless question is specifically about persistence
- **Don't generalise** — "what if we want X later" is out of scope. Answer one question.
- **Don't blur logic and TUI** — if reducer references `console.log` or escape codes, it's no longer portable
- **Don't ship TUI to production** — shell is optimised for hand-driven terminal, not users

---

## Async / Event-driven State Machines

Khi câu hỏi liên quan đến **timers, polling, hoặc external events** (webhooks, queue messages, websocket), TUI cần mô phỏng async mà không cần infrastructure thật.

### Pattern: Manual tick command

Thêm `[t] tick` vào keyboard shortcuts — mỗi lần nhấn `t` giả lập 1 đơn vị thời gian trôi qua:

```typescript
// logic.ts — async events được model thành discrete actions
type Action =
  | { type: 'SUBMIT' }
  | { type: 'TICK' }          // ← giả lập thời gian trôi qua (polling cycle, timer, etc.)
  | { type: 'WEBHOOK_OK' }    // ← giả lập external event thành công
  | { type: 'WEBHOOK_FAIL' }  // ← giả lập external event thất bại

function reducer(state: State, action: Action): State {
  switch (state.status) {
    case 'PENDING':
      if (action.type === 'SUBMIT') return { ...state, status: 'PROCESSING', ticks: 0 };
      break;
    case 'PROCESSING':
      if (action.type === 'TICK') {
        const ticks = state.ticks + 1;
        // Giả lập timeout sau 5 ticks
        return ticks >= 5 ? { ...state, status: 'TIMED_OUT' } : { ...state, ticks };
      }
      if (action.type === 'WEBHOOK_OK')   return { ...state, status: 'DONE' };
      if (action.type === 'WEBHOOK_FAIL') return { ...state, status: 'FAILED', retries: state.retries + 1 };
      break;
  }
  return state;
}
```

```typescript
// tui.ts — keyboard shortcuts map sang actions + external events
const keyMap: Record<string, Action> = {
  's': { type: 'SUBMIT' },
  't': { type: 'TICK' },           // "[t] tick (simulate time passing)"
  'o': { type: 'WEBHOOK_OK' },     // "[o] webhook ok"
  'f': { type: 'WEBHOOK_FAIL' },   // "[f] webhook fail"
};
```

Frame render hiển thị `ticks` để user biết đang ở đâu trong timeline:

```
Status: PROCESSING
Ticks elapsed: 3 / 5 (timeout at 5)
Retries: 0

[s] submit  [t] tick  [o] webhook ok  [f] webhook fail  [q] quit
```

### Khi nào dùng pattern này

- Câu hỏi về **timeout/retry logic** — bao nhiêu ticks thì timeout? retry có reset counter không?
- Câu hỏi về **race condition** — submit 2 lần trước khi webhook về thì sao?
- Câu hỏi về **external event ordering** — nếu webhook về trước khi processing xong thì state là gì?

### Anti-patterns (async-specific)

- **Đừng dùng `setTimeout` thật trong TUI** — async loop phức tạp, khó debug, khó drive by hand. Manual tick đủ để trả lời câu hỏi.
- **Đừng mock real HTTP** — dùng keyboard shortcut `[o]`/`[f]` thay vì `fetch()` stub. Mục tiêu là drive state, không phải simulate network.

