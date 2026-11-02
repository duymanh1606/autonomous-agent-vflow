---
version: alpha
name: VCC Design System
description: >
  Design system của VCC — thương hiệu đỏ đặc trưng (VCC Red) kết hợp
  với Neutral scale sạch, hỗ trợ cả Light mode và Dark mode.
  Font chữ kép: SF Pro Text cho UI text, FS PF BeauSans Pro cho brand heading.

colors:
  # ── Brand (VCC Red) ──────────────────────────────────────────────────────
  primary:          "#E81D2C"
  primary-hover:    "#D01627"
  primary-press:    "#B31222"
  primary-subtle:   "#FFF5F5"
  primary-subtle-hover: "#FFE3E3"
  primary-strong:   "#680A13"
  primary-50:       "#FFF5F5"
  primary-100:      "#FFE3E3"
  primary-200:      "#FFBDBD"
  primary-300:      "#FF9999"
  primary-400:      "#F56C6C"
  primary-500:      "#E81D2C"
  primary-600:      "#D01627"
  primary-700:      "#B31222"
  primary-800:      "#8E0E1A"
  primary-900:      "#680A13"
  primary-950:      "#42060D"

  # ── Neutral ───────────────────────────────────────────────────────────────
  neutral:          "#737373"
  neutral-50:       "#F7F7F7"
  neutral-100:      "#F2F2F2"
  neutral-200:      "#E5E5E5"
  neutral-300:      "#D1D1D1"
  neutral-400:      "#A3A3A3"
  neutral-500:      "#737373"
  neutral-600:      "#525252"
  neutral-700:      "#2E2E2E"
  neutral-800:      "#1F1F1F"
  neutral-900:      "#191919"
  neutral-950:      "#121212"

  # ── Base ──────────────────────────────────────────────────────────────────
  white:            "#FFFFFF"
  black:            "#000000"

  # ── Status: Success ───────────────────────────────────────────────────────
  success:          "#34B766"
  success-hover:    "#259450"
  success-subtle:   "#F1FCF5"

  # ── Status: Info ──────────────────────────────────────────────────────────
  info:             "#3B82F6"
  info-hover:       "#2570EB"
  info-subtle:      "#EFF5FF"

  # ── Status: Warning ───────────────────────────────────────────────────────
  warning:          "#F9A006"
  warning-hover:    "#DD7802"
  warning-subtle:   "#FFFBEB"

  # ── Status: Error ─────────────────────────────────────────────────────────
  error:            "#F63737"
  error-hover:      "#E41E1E"
  error-subtle:     "#FFF1F1"

  # ── Semantic: Background (Light mode) ─────────────────────────────────────
  bg-default:       "{colors.white}"
  bg-surface:       "{colors.neutral-50}"
  bg-surface-1:     "{colors.neutral-100}"
  bg-surface-2:     "{colors.neutral-200}"
  bg-disabled:      "{colors.neutral-200}"
  bg-brand:         "{colors.primary-500}"
  bg-brand-subtle:  "{colors.primary-50}"
  bg-success-subtle: "{colors.success-subtle}"
  bg-info-subtle:   "{colors.info-subtle}"
  bg-warning-subtle: "{colors.warning-subtle}"
  bg-error-subtle:  "{colors.error-subtle}"

  # ── Semantic: Text & Icon ─────────────────────────────────────────────────
  text-strong:      "{colors.neutral-950}"
  text-medium:      "{colors.neutral-700}"
  text-normal:      "{colors.neutral-600}"
  text-light:       "{colors.neutral-500}"
  text-disabled:    "{colors.neutral-400}"
  text-white:       "{colors.white}"
  text-brand:       "{colors.primary-500}"
  text-success:     "{colors.success}"
  text-info:        "{colors.info}"
  text-warning:     "{colors.warning}"
  text-error:       "{colors.error}"

  # ── Semantic: Border ──────────────────────────────────────────────────────
  border-default:   "{colors.neutral-950}"
  border-medium:    "{colors.neutral-300}"
  border-light:     "{colors.neutral-200}"
  border-disabled:  "{colors.neutral-200}"
  border-brand:     "{colors.primary-500}"
  border-success:   "{colors.success}"
  border-info:      "{colors.info}"
  border-warning:   "{colors.warning}"
  border-error:     "{colors.error}"

typography:
  # ── Display ───────────────────────────────────────────────────────────────
  display-xl:
    fontFamily: FS PF BeauSans Pro
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-lg:
    fontFamily: FS PF BeauSans Pro
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-md:
    fontFamily: FS PF BeauSans Pro
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em

  # ── Heading ───────────────────────────────────────────────────────────────
  h1:
    fontFamily: FS PF BeauSans Pro
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  h2:
    fontFamily: FS PF BeauSans Pro
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.01em
  h3:
    fontFamily: SF Pro Text
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  h4:
    fontFamily: SF Pro Text
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0em
  h5:
    fontFamily: SF Pro Text
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0em
  h6:
    fontFamily: SF Pro Text
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0em

  # ── Body ──────────────────────────────────────────────────────────────────
  body-xl:
    fontFamily: SF Pro Text
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-lg:
    fontFamily: SF Pro Text
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-md:
    fontFamily: SF Pro Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: SF Pro Text
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  body-xs:
    fontFamily: SF Pro Text
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em

  # ── Label / UI ────────────────────────────────────────────────────────────
  label-lg:
    fontFamily: SF Pro Text
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0em
  label-md:
    fontFamily: SF Pro Text
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0em
  label-sm:
    fontFamily: SF Pro Text
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0em

spacing:
  "0":   0px
  "2":   2px
  "4":   4px
  "6":   6px
  "8":   8px
  "10":  10px
  "12":  12px
  "14":  14px
  "16":  16px
  "20":  20px
  "24":  24px
  "28":  28px
  "32":  32px
  "36":  36px
  "40":  40px
  "44":  44px
  "48":  48px
  "56":  56px
  "64":  64px
  "72":  72px
  "80":  80px
  "96":  96px
  "112": 112px
  "128": 128px
  "160": 160px
  "192": 192px
  "224": 224px
  "256": 256px
  "320": 320px

rounded:
  none: 0px
  xs:   2px
  sm:   4px
  md:   8px
  lg:   12px
  xl:   16px
  "2xl": 20px
  "3xl": 24px
  full: 9999px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-press:
    backgroundColor: "{colors.primary-press}"
  button-primary-disabled:
    backgroundColor: "{colors.bg-disabled}"
    textColor: "{colors.text-disabled}"

  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-secondary-hover:
    backgroundColor: "{colors.primary-subtle}"

  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-normal}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-ghost-hover:
    backgroundColor: "{colors.bg-surface}"

  input-default:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-strong}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 14px
  input-focus:
    backgroundColor: "{colors.white}"
  input-error:
    backgroundColor: "{colors.white}"
  input-disabled:
    backgroundColor: "{colors.bg-disabled}"
    textColor: "{colors.text-disabled}"

  badge-brand:
    backgroundColor: "{colors.bg-brand-subtle}"
    textColor: "{colors.primary-600}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  badge-success:
    backgroundColor: "{colors.success-subtle}"
    textColor: "{colors.success-hover}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  badge-error:
    backgroundColor: "{colors.error-subtle}"
    textColor: "{colors.error-hover}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  badge-warning:
    backgroundColor: "{colors.warning-subtle}"
    textColor: "{colors.warning-hover}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  badge-info:
    backgroundColor: "{colors.info-subtle}"
    textColor: "{colors.info-hover}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
---

# VCC Design System

## Overview

VCC là thương hiệu trong lĩnh vực dịch vụ/thương mại với nhận diện màu đỏ đặc trưng. Design system hướng đến cảm giác **đáng tin cậy, hiện đại và chuyên nghiệp** — không cầu kỳ, không thừa chi tiết. UI luôn rõ ràng và dễ scan.

Hai font song song phục vụ hai vai trò tách biệt:
- **FS PF BeauSans Pro** — brand personality: dùng cho tiêu đề lớn (Display, H1, H2), nơi bản sắc VCC cần được nhìn thấy ngay lập tức.
- **SF Pro Text** — system clarity: toàn bộ UI text còn lại — body, label, input, button. Ưu tiên legibility trên mọi kích thước.

VCC Red (`#E81D2C`) là màu hành động duy nhất — dùng cho CTA chính, link active, và trạng thái brand. Không pha trộn tùy ý với status colors.

## Colors

Palette được xây dựng trên 3 nhóm chính: **Brand (VCC Red)**, **Neutral**, và **Status**.

### Brand — VCC Red
Màu đỏ VCC là trung tâm nhận diện. Mọi tương tác chính (button primary, link, focus ring) đều dùng brand scale này.

- **`primary` (#E81D2C):** Đỏ VCC — CTA chính, icon active, border focus.
- **`primary-hover` (#D01627):** Trạng thái hover — tối hơn một bước.
- **`primary-press` (#B31222):** Trạng thái pressed — tối nhất trong interaction.
- **`primary-subtle` (#FFF5F5):** Background nhẹ cho tag/badge brand, không cạnh tranh với content.
- **`primary-strong` (#680A13):** Text brand trên nền sáng, đảm bảo contrast cao.

### Neutral
Xương sống của mọi surface, text và border. Scale từ `neutral-50` (gần trắng) đến `neutral-950` (gần đen).

- **Text hierarchy:** `text-strong` → `text-medium` → `text-normal` → `text-light` → `text-disabled`
- **Surface hierarchy:** `bg-default` (white) → `bg-surface` (#F7F7F7) → `bg-surface-1` (#F2F2F2) → `bg-surface-2` (#E5E5E5)
- **Border hierarchy:** `border-default` (full contrast) → `border-medium` → `border-light`

### Status Colors
Chỉ dùng đúng ngữ cảnh ngữ nghĩa — không dùng thay thế brand color.

| Role | Default | Subtle BG | Usage |
|------|---------|-----------|-------|
| Success | `#34B766` | `#F1FCF5` | Thành công, xác nhận, upload done |
| Info | `#3B82F6` | `#EFF5FF` | Thông tin trung tính, tooltip |
| Warning | `#F9A006` | `#FFFBEB` | Cảnh báo nhẹ, chưa critical |
| Error | `#F63737` | `#FFF1F1` | Lỗi form, trạng thái thất bại |

### Dark Mode
Dark mode đảo ngược hierarchy: `bg-default` → `neutral-950` (#121212), text scale tăng sáng, brand color nhẹ hơn một bậc (`primary-400` thay vì `primary-500`). Tất cả semantic tokens tự động chuyển đổi theo mode.

## Typography

Hai font family phục vụ hai vai trò tách biệt rõ ràng:

**FS PF BeauSans Pro** — Brand voice. Dùng từ `display-xl` đến `h2`. Đây là nơi nhận diện VCC được thể hiện mạnh nhất.

**SF Pro Text** — System clarity. Dùng từ `h3` trở xuống (heading nhỏ, body, label, button). Ưu tiên readability trên mọi density.

### Font Weight Scale
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Label, caption, metadata |
| Semibold | 600 | Subheading, emphasis |
| Bold | 700 | Heading, display |
| Extra Bold | 800 | Hero headline (dùng tiết kiệm) |
| Black | 900 | Marketing, mascot text (rất hiếm) |

### Letter Spacing
Heading lớn dùng `letterSpacing: -0.02em` để tạo cảm giác gọn và cao cấp hơn. Body text dùng `0em` — không điều chỉnh.

## Layout & Spacing

Spacing scale dùng bội số của `4px`, bắt đầu từ `2px` cho micro-adjustments.

**Khuyến nghị áp dụng:**
- `4–8px` — khoảng cách trong component (icon ↔ text, label ↔ input)
- `12–16px` — padding bên trong component (button, input, card)
- `20–24px` — khoảng cách giữa các element trong một nhóm
- `32–48px` — khoảng cách giữa các section trong page
- `64px+` — layout gap, page margin ngoài cùng

## Shapes

Border radius theo scale từ `none` đến `full`. Nguyên tắc chọn radius phản ánh cảm giác của component:

- **Button:** `rounded.md` (8px) — hiện đại nhưng không quá tròn
- **Input:** `rounded.md` (8px) — đồng bộ với button
- **Card:** `rounded.lg` (12px) — tạo cảm giác container mềm mại hơn
- **Modal/Dialog:** `rounded.xl` (16px) — nổi bật, tách khỏi background
- **Badge/Tag:** `rounded.full` (9999px) — pill shape, dễ nhận diện
- **Avatar/Chip nhỏ:** `rounded.full`

## Components

### Button
Ba loại button chính theo thứ tự hierarchy:

1. **`button-primary`** — CTA chính. Nền đỏ VCC, text trắng. Chỉ có 1 primary button visible mỗi màn hình.
2. **`button-secondary`** — Action thứ cấp. Nền trắng, viền mỏng, text đỏ. Dùng khi có cả hai action ngang nhau.
3. **`button-ghost`** — Action bổ sung / destructive nhẹ. Không nền, text neutral. Dùng cho "Cancel", "Back".

Kích thước padding chuẩn: `10px 16px`. Không thay đổi trừ khi có explicit size variant (sm/lg).

### Input
Input chuẩn có `border-light` làm default border. Khi focus: dùng `border-brand` + focus ring `primary` với opacity 20%. Khi error: `border-error`. Khi disabled: `bg-disabled` + `text-disabled`.

### Badge / Status Tag
Pill shape (`rounded.full`) với màu subtle background tương ứng role. Text dùng `label-sm` (12px medium). Không dùng bold cho badge — quá nặng ở kích thước nhỏ.

## Do's and Don'ts

**✅ Do:**
- Dùng `primary-500` (#E81D2C) cho **duy nhất 1 CTA chính** mỗi màn hình
- Dùng **semantic tokens** (`text-strong`, `bg-surface`) trong code, không hard-code primitive values
- Giữ heading Display/H1/H2 dùng **FS PF BeauSans Pro** — đây là nhận diện thương hiệu
- Test contrast WCAG AA (4.5:1) cho mọi text-background combination
- Dùng `dark mode` semantic tokens — chúng đã được map sẵn cho dark context

**❌ Don't:**
- Đừng dùng VCC Red (`primary`) như màu decoration — nó là màu hành động
- Đừng mix status color với brand color trong cùng một component
- Đừng hard-code hex values — luôn dùng token reference `{colors.xxx}`
- Đừng thêm font weight không có trong scale (ví dụ: 300 Light)
- Đừng dùng `letter-spacing` dương (+) cho heading — sẽ trông rời rạc và không chuyên nghiệp
- Đừng để nhiều hơn 1 `button-primary` visible cùng lúc trên màn hình
