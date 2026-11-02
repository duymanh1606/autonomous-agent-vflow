# UI Prototype

Generate **several radically different UI variations** on a single route, switchable from a floating bottom bar. User flips between variants in the browser, picks one (or steals bits from each), then throws the rest away.

If the question is about logic/state rather than what something looks like — wrong branch. Use [LOGIC.md](LOGIC.md).

---

## Hai mode: Reproduce vs Explore

UI branch có hai mode — Prototype Agent chọn ở Bước 1a:

| Mode | Khi nào | Output | Throwaway? |
|------|---------|--------|-----------|
| **Reproduce** (`--from-mockup`) | UC đã có mockup định hướng (`ui/mockups/`) | **1** render trung thực qua DESIGN.md → `ui/approved/UC-NN.*` | KHÔNG — là contract |
| **Explore** (mặc định) | Chưa có giao diện, cần khám phá | Nhiều variant switchable → chọn 1 | Có — xóa sau verdict |

Phần lớn tài liệu dưới đây mô tả **Explore mode** (multi-variant). Reproduce mode xem ngay §dưới.

---

## Mode: Reproduce (`--from-mockup`)

Biến mockup định hướng (ảnh khách/BA đưa) thành **một** bản render bằng design system thật, chốt làm contract trước khi code.

**Nguyên tắc tách tầng** (nên không mâu thuẫn):
- **Mockup quản cấu trúc** — layout, vùng, thành phần nào, luồng tương tác. Lấy *ý đồ* từ ảnh.
- **DESIGN.md quản style** — màu, spacing, typography, component thật. KHÔNG copy màu/spacing/font từ ảnh.

**Quy trình:**
1. Đọc UI Intent của UC trong `spec.md §2`: `Mockup nguồn`, `Bố cục`, `Kế thừa trang`, `Mức ràng buộc`. **Lấy ảnh mockup** theo con trỏ `Mockup nguồn`: `figma:<link>` → **Figma MCP** (`get_design_context` + `get_screenshot`); `docs/*.pdf#p<trang>` → đọc trang PDF; `ui/mockups/*.png|svg` → đọc file. Không có Figma MCP / không đọc được ảnh → yêu cầu human export ảnh vào `ui/mockups/`, KHÔNG bịa.
2. Đọc `DESIGN.md` tokens (lookup order ở §DESIGN.md dưới).
3. Nếu `Kế thừa trang` trỏ trang cũ → đọc/đối chiếu để render đồng bộ phong cách (tinh thần Sub-shape A: reuse shell, chỉ dựng body).
4. Dựng **1** render (không variant) khớp cấu trúc mockup, style từ tokens. `Mức ràng buộc = Định hướng` → ưu tiên đúng layout/thành phần/luồng, không cần pixel; `= Bắt buộc` → bám sát mockup hơn.
5. **Verify (§4.5)** — compile/serve không lỗi.
6. Handover cho stakeholder duyệt → sửa theo feedback.
7. Lưu render đã duyệt vào `ui/approved/UC-NN.*` (**GIỮ**). Ghi `prototype-notes.md` + cập nhật spec UI Intent "Render đã chốt".

> ⚠️ **Dựng lại khi `ui/approved/` đã có**: hỏi rõ ý định trước — *làm mới bản chốt* (reproduce → ghi đè + reset `verdict`/`approved_by` về null, phải duyệt lại) **hay** *explore hướng khác* (→ `prototype/ui/` throwaway, KHÔNG đụng `ui/approved/`).

**Verdict (reproduce):**
- `VALIDATED` — render khớp ý đồ + dùng đúng DESIGN.md + **stakeholder duyệt (ghi tên + vai trò người duyệt vào prototype-notes / flow-state `approved_by`)** → `ui/approved/` là contract.
- `REJECTED` — mockup mâu thuẫn DESIGN.md / không khả thi / stakeholder bác → ghi lý do, route `/v.specify` chỉnh UI Intent.
- `INCONCLUSIVE` — mockup mờ / thiếu state → hỏi stakeholder.

**Khác Explore:** không floating switcher, không multi-variant, **KHÔNG xóa** output (render là contract, không phải throwaway).

---

## When this is the right shape (Explore mode)

- "Màn hình này nên trông như thế nào?"
- "Cho tôi xem vài options cho dashboard này trước khi commit."
- "Thử layout khác cho settings screen."
- Bất cứ khi nào user sẽ mất thời gian chọn giữa 3 mockup mơ hồ trong đầu.

---

## Hai Sub-shape — Luôn ưu tiên Sub-shape A

UI prototype phán xét tốt nhất khi đặt trong **context thật** — real header, real sidebar, real data, real density. Một variant đứng riêng trong vacuum: mọi cái trông đều ổn. Đặt vào existing page mới lộ ra design problems.

> [!IMPORTANT]
> **Default là Sub-shape A.** Chỉ dùng Sub-shape B khi thực sự không có existing page phù hợp.

### Sub-shape A — Gắn vào existing page (preferred)

Route đã tồn tại. Variants được render **trên cùng route**, gated bởi `?variant=` URL search param. Data fetching, auth, params đều giữ nguyên — chỉ swap phần rendering.

**Áp dụng cả khi** feature chưa có page riêng nhưng _sẽ tự nhiên nằm trong_ một page có sẵn (section mới trong dashboard, card mới trong settings, bước mới trong existing flow) → mount variants bên trong host page.

```
Existing route: /dashboard
Variants mount vào: <DashboardLayout> → swap <DashboardBody variant={v}>
Switcher float bottom: ?variant=A | B | C
```

### Sub-shape B — Tạo route mới (last resort)

Chỉ dùng khi feature **genuinely không có existing page** để đặt vào — ví dụ: top-level surface hoàn toàn mới, flow không embed được ở đâu hợp lý.

Trước khi chọn Sub-shape B, kiểm tra: "Có thực sự không có existing page nào host được không?" — một route empty ẩn đi design problems mà populated route sẽ expose.

Tạo **throwaway route** theo routing convention của project. Đặt tên rõ là prototype (vd: `/prototype/feature-name`, `_prototype_FeatureName`). Same `?variant=` pattern.

> Cả hai sub-shapes đều dùng chung floating bottom bar.

---

## DESIGN.md — Design System Source

Trước khi generate variants, load design tokens:

```
Lookup order:
  1. [project-root]/DESIGN.md         ← project override (user đặt thủ công)
  2. [project-root]/.v-flow/DESIGN.md ← fallback (auto-copy lúc v-flow init)

Nếu cả hai không tồn tại: báo lỗi + hướng dẫn chạy v-flow init
```

Đọc YAML frontmatter của `DESIGN.md` để lấy: colors, typography, spacing, rounded, components. Dùng khi generate variant styles.

---

## Output format

### Mặc định: HTML + CSS + JS thuần

Vì prototype chạy ở **S.1.5 — trước khi có bất kỳ code thật nào** (Sub-shape B), hoặc khi team muốn xem nhanh không cần dev server (Sub-shape A mockup):

```
.v-flow/features/NNN/prototype/ui/
├── index.html    ← JS được inline để chạy được khi double-click (file:// safe)
├── styles.css    ← design tokens từ DESIGN.md
├── app.js        ← bản JS riêng sạch hơn (dùng khi chạy qua dev server)
└── README.md     ← câu hỏi + sub-shape + 2 cách chạy
```

**Cách 1 — Double-click `index.html`** (không cần gì):
JS được inline trực tiếp trong `<script>` của HTML. Mở ngay trên trình duyệt.

**Cách 2 — Dev server** (tùy chọn, nếu cần):
```bash
npx serve .            # Node (có sẵn trong hầu hết môi trường)
python -m http.server  # Python
```

### Override: `--framework <name>`

Khi user chỉ định framework (thường dùng với Sub-shape A — embed vào existing app):

| Flag | Output | Cấu trúc |
|------|--------|---------|
| (không có) | HTML + CSS + JS thuần | `index.html`, `styles.css`, `app.js`, `README.md` |
| `--framework react` | TSX + CSS Module | `VariantA.tsx`, `VariantB.tsx`, `VariantC.tsx`, `*.module.css` |
| `--framework vue` | Vue SFC | `VariantA.vue`, `VariantB.vue`, `VariantC.vue` |
| `--framework angular` | Angular Component | `variant-a/`, `variant-b/`, `variant-c/` |
| `--framework next` | Next.js page | `page.tsx`, tương thích App Router |

Với framework mode: user cần có dev server của project chạy. Run command phải được ghi rõ trong `prototype-notes.md`.

---

## Process

### 1. State the question, chọn Sub-shape, và pick N (từ spec.md)

Đọc `spec.md` — tìm REQ-xxx có UI ambiguity (hoặc dùng `--req REQ-xxx` để chỉ định). Default: **3 variants**. Không quá 5.

**Chọn Sub-shape:**
```
Có existing page phù hợp host variants? → Sub-shape A (embed)
  ↳ Tìm route/page gần nhất với feature đang prototype
  ↳ Xác nhận với user: "Tôi sẽ embed variants vào /settings — OK không?"

Không có existing page? → Sub-shape B (new route)
  ↳ Confirm: "Không tìm được page phù hợp, sẽ tạo /prototype/NNN — OK không?"
```

Ghi rõ ở đầu `README.md` của prototype:

```
# PROTOTYPE — [Feature NNN]
# Question: [lấy từ spec REQ-xxx]
# Sub-shape: A — embedded in /settings | B — new route at /prototype/NNN
# Plan: 3 variants, switchable via ?variant=
# Output: [HTML+CSS | React | Vue | Angular | Next]
# Delete after: verdict captured in prototype-notes.md
```

### 2. Generate radically different variants

Đọc `DESIGN.md` tokens. Draft mỗi variant. Mỗi variant phải:

- Đúng với purpose của page và data có sẵn
- Dùng đúng design system từ `DESIGN.md` (colors, typography, spacing, components)
- Có exported component name rõ ràng: `VariantA`, `VariantB`, `VariantC`

Variants phải **structurally different** — different layout, different information hierarchy, different primary affordance. Ba card grid hơi khác màu **không phải** UI prototype. Nếu 2 drafts quá giống nhau: redo một cái với explicit "no card grid" constraint.

### 3. Wire them together

**Sub-shape A (existing page) — React / Next.js:**

```tsx
// Trong existing page component — chỉ swap phần render, giữ nguyên data fetching
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {/* Giữ nguyên existing page wrapper, header, etc. */}
    {variant === 'A' && <VariantA {...existingData} />}
    {variant === 'B' && <VariantB {...existingData} />}
    {variant === 'C' && <VariantC {...existingData} />}
    <PrototypeSwitcher variants={['A','B','C']} current={variant} />
  </>
);
```

**Sub-shape A (existing page) — Angular:**

```typescript
// existing-page.component.ts — inject ActivatedRoute, không thay đổi data fetching
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({ /* ... */ })
export class ExistingPageComponent {
  variant$ = this.route.queryParamMap.pipe(
    map(params => params.get('variant') ?? 'A')
  );

  constructor(private route: ActivatedRoute) {}
}
```

```html
<!-- existing-page.component.html — giữ nguyên page wrapper, chỉ swap body -->
<app-page-shell>
  <ng-container [ngSwitch]="variant$ | async">
    <app-variant-a *ngSwitchCase="'A'" [data]="existingData$ | async" />
    <app-variant-b *ngSwitchCase="'B'" [data]="existingData$ | async" />
    <app-variant-c *ngSwitchDefault  [data]="existingData$ | async" />
  </ng-container>
  <app-prototype-switcher [variants]="['A','B','C']" [current]="variant$ | async" />
</app-page-shell>
```

```typescript
// prototype-switcher.component.ts — shared cho cả Sub-shape A và B
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-prototype-switcher',
  template: `
    <div class="proto-switcher">
      <button (click)="cycle(-1)">←</button>
      <span>{{ current }}</span>
      <button (click)="cycle(1)">→</button>
    </div>
  `,
  styles: [`
    .proto-switcher {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: #111; color: #fff; padding: 8px 20px; border-radius: 999px;
      display: flex; gap: 16px; align-items: center; font-family: monospace;
      box-shadow: 0 4px 12px rgba(0,0,0,.3); z-index: 9999;
    }
    button { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
  `]
})
export class PrototypeSwitcherComponent {
  @Input() variants: string[] = ['A', 'B', 'C'];
  @Input() current = 'A';

  constructor(private router: Router, private route: ActivatedRoute) {}

  cycle(dir: number) {
    const idx = (this.variants.indexOf(this.current) + dir + this.variants.length) % this.variants.length;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { variant: this.variants[idx] },
      queryParamsHandling: 'merge'
    });
  }
}
// Lưu ý: Declare component này trong một PrototypeModule riêng (không import vào AppModule production)
```

> [!IMPORTANT]
> Angular: Dùng `queryParamsHandling: 'merge'` để không xóa các query params khác của page.
> Không import `PrototypeSwitcherComponent` vào bất kỳ production module nào.

**Sub-shape B (new route) — HTML mode (mặc định):**

`index.html` chứa cả 3 variants, JS được **inline** trong `<script>` để chạy được qua `file://` protocol:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Prototype — [Feature NNN]</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Variants — chỉ hiện 1 cái tại một thời điểm -->
  <div data-variant="A"><!-- Variant A markup --></div>
  <div data-variant="B" hidden><!-- Variant B markup --></div>
  <div data-variant="C" hidden><!-- Variant C markup --></div>

  <!-- Floating switcher -->
  <div id="switcher">...</div>

  <!-- Inline JS: works on file:// AND http:// -->
  <script>
    /* app.js inlined — see app.js for editable version */
    const variants = ['A','B','C'];
    function showVariant(v) {
      document.querySelectorAll('[data-variant]').forEach(el => {
        el.hidden = el.dataset.variant !== v;
      });
      document.getElementById('variant-label').textContent = v;
      history.replaceState(null, '', '?variant=' + v);
    }
    const initial = new URLSearchParams(location.search).get('variant') ?? 'A';
    showVariant(initial);
    function switchVariant(dir) {
      const cur = new URLSearchParams(location.search).get('variant') ?? 'A';
      const idx = (variants.indexOf(cur) + dir + variants.length) % variants.length;
      showVariant(variants[idx]);
    }
    document.addEventListener('keydown', e => {
      if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'ArrowLeft') switchVariant(-1);
      if (e.key === 'ArrowRight') switchVariant(1);
    });
  </script>
</body>
</html>
```

`app.js` là bản JS riêng giống hệt nhưng không inline — dùng khi chạy qua dev server và muốn edit JS sạch hơn.

### 4. Build the floating switcher

Small fixed-position bar at bottom-centre với ba thành phần:

- **Left arrow** — cycles previous variant (wraps around)
- **Variant label** — current variant key + name nếu có. e.g. `B — Sidebar layout`
- **Right arrow** — cycles forward (wraps around)

Behavior:
- Click arrow → update URL search param (framework router hoặc `history.replaceState`) — URL shareable + reload-stable
- Keyboard: `←` `→` cycle variants. KHÔNG intercept khi `<input>`, `<textarea>`, `[contenteditable]` đang focused
- Visually distinct — high-contrast pill, subtle shadow — rõ ràng không phải part of design
- Hidden in production (`process.env.NODE_ENV !== 'production'` hoặc equivalent)

**HTML mode:**
```html
<div id="switcher" style="
  position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
  background:#111; color:#fff; padding:8px 20px; border-radius:999px;
  display:flex; gap:16px; align-items:center; font-family:monospace;
  box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999;
">
  <button onclick="switchVariant(-1)" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer">←</button>
  <span id="variant-label" style="font-size:13px;letter-spacing:1px">A</span>
  <button onclick="switchVariant(1)" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer">→</button>
</div>
```

**Framework mode:** Build `<PrototypeSwitcher>` component — 1 component dùng cho cả Sub-shape A và B.

### 4.5. Runtime Verification (Verify before handover)

Trước khi gửi URL hoặc hướng dẫn chạy cho người dùng, Agent **BẮT BUỘC** phải:
- Chạy thử compile lệnh để đảm bảo tất cả UI variants không bị lỗi compile (TypeScript/Sass/Vue/React errors).
- Nếu sử dụng framework (Sub-shape A/B), đảm bảo server khởi chạy thành công mà không bị crash render ban đầu.
- Nếu là HTML thuần, đảm bảo file `index.html` và các file CSS/JS liên quan tồn tại và link đúng đường dẫn tương đối.

### 5. Hand it over

**HTML mode:** Cung cấp 2 cách chạy trong `README.md`:

```md
## Chạy prototype

**Cách 1 — Double-click** (nhanh nhất):
Mở file `index.html` trực tiếp trong browser.

**Cách 2 — Local dev server** (nếu cần load app.js riêng):
```bash
npx serve .            # chạy tại .v-flow/features/NNN/prototype/ui/
python -m http.server
```
Rồi mở http://localhost:3000
```

**Framework mode (Sub-shape A):** Surface URL của existing page + `?variant=` keys. User flip trong khi dev server đang chạy.

Interesting feedback: **"Tôi muốn header của B với sidebar của C"** — đó là actual design họ muốn.

### 6. Capture the answer → prototype-notes.md

Khi variant đã được chọn:

1. Điền verdict vào `prototype-notes.md` (VALIDATED / REJECTED / INCONCLUSIVE)
2. Ghi rõ variant nào thắng, tại sao, và sub-shape đã dùng
3. Map về REQ-xxx — finding này ảnh hưởng requirement nào?
4. Append execution trace vào `_session.md`
5. Update `artifacts.prototype.*` trong `.flow-state.yaml`
6. **Sub-shape A**: Xóa variant components và switcher — fold winner vào existing page
7. **Sub-shape B**: Promote winning variant → real route, xóa throwaway route và switcher

Đừng để variant components hoặc switcher nằm lại trong repo. Chúng rot nhanh và confuse người đọc tiếp theo.

---

## Anti-patterns

- **Variants chỉ khác màu hoặc copy** — đó là tweak, không phải prototype. Real variants disagree về structure.
- **Share quá nhiều code giữa variants** — `<Header>` share được; `<Layout>` share là thất bại. Mỗi variant phải tự do throw out layout.
- **Bỏ qua Sub-shape A** — luôn hỏi "có existing page không?" trước khi tạo route mới. Xem Gotcha G-005.
- **Wire variants to real mutations** — read-only prototypes là fine. Nếu cần mutate, dùng stub.
- **Promote prototype trực tiếp lên production** — variant code viết dưới prototype constraints (no tests, minimal error handling). Rewrite properly khi fold vào real code.
