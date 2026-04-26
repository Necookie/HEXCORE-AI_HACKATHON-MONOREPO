# StudyBearer — Design System

> **Canonical reference for all apps in this monorepo.**
> Every app (landing, platform, any future surface) must stay within these guidelines to ensure a consistent brand experience.

---

## 1. Brand Identity

| | |
|---|---|
| **Product** | StudyBearer |
| **Tagline** | *Stop planning to study. Start executing.* |
| **Mission** | Eradicate the cognitive load of academic planning — shift it to AI so users focus purely on learning. |
| **Personality** | Authoritative, competitive, concise. A high-end gaming dashboard, not a school tool. |
| **Mode** | Dark only. There is no light mode. |

### Voice rules
- Treat studying as a competitive sport. Use "Roadmap", "Combo", "Rank", "ELO" — never "Homework", "Grade", or "Assignment".
- Be terse. No filler copy. Every word earns its place.
- Sound like a top-tier AI companion, not an institution.

### Gamification lexicon

| Avoid | Use instead |
|---|---|
| Study plan | Roadmap / Pipeline |
| Homework | Executing a module |
| Consecutive days | Combo / Streak |
| Score / Grade | ELO / Points |
| Levels | Ranks |

**Rank ladder (low → high):** Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Mythic

---

## 2. Color System

### CSS custom properties (copy into `:root`)

```css
--bg-base:       #0B0D14;   /* Page background — deepest layer */
--bg-card:       #111420;   /* Cards, sidebar */
--bg-elevated:   #171B2C;   /* Inputs, dropdowns, hover backgrounds */
--bg-input:      #1A1E30;   /* Form input fill */
--border:        #1F2438;   /* Default border */
--border-subtle: #161928;   /* De-emphasised dividers */

--text-primary:  #E2E8FF;   /* Main readable text */
--text-secondary:#6B7599;   /* Descriptions, labels, metadata */
--text-muted:    #3D4566;   /* Placeholders, disabled labels */

--purple:        #7B5CF5;   /* Primary brand accent — CTAs, active states */
--purple-light:  #9D82FF;   /* Hover/active text, icons */
--amber:         #F0A030;   /* Streak, warnings */
--green:         #4ADE80;   /* Success, correct answer */
--red:           #F56B6B;   /* Error, danger, wrong answer */
--blue:          #60A5FA;   /* ELO, info, secondary data */
```

### Usage rules

| Token | Use for |
|---|---|
| `--bg-base` | `<body>` background |
| `--bg-card` | Cards, panels, sidebar |
| `--bg-elevated` | Hover states, nested surfaces, modals |
| `--bg-input` | Text inputs, selects, textareas |
| `--border` | All borders between surfaces |
| `--purple` | Primary buttons, active nav, progress fills, focus rings |
| `--purple-light` | Active icon color, link color |
| `--amber` | Streak counter, warnings |
| `--green` | Correct feedback, success states |
| `--red` | Errors, danger buttons, wrong answers |
| `--blue` | ELO display, informational badges |

**Never use raw hex values in components.** Always reference a token so retheming stays trivial.

---

## 3. Typography

### Font stack

```css
--font-heading: "Feather Bold", 'Nunito', sans-serif;
--font-body:    'Nunito', sans-serif;
--font-mono:    'Space Mono', monospace;
```

### Loading (add to `<head>`)

```html
<!-- Body + mono -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

<!-- Heading -->
<link href="https://db.onlinewebfonts.com/c/14936bb7a4b6575fd2eee80a3ab52cc2?family=Feather+Bold" rel="stylesheet" />
```

### Type scale

| Role | Font | Size | Weight | Token |
|---|---|---|---|---|
| Page title / logo | `var(--font-heading)` | 17–20px | 700 | `--text-primary` |
| Section heading | `var(--font-heading)` | 13–16px | 600–700 | `--text-primary` |
| Label / tag | `var(--font-heading)` | 10–12px | 600–700 | `--text-muted` or accent |
| Body copy | `var(--font-body)` | 13–14px | 400–500 | `--text-primary` |
| Supporting text | `var(--font-body)` | 11–12px | 400–500 | `--text-secondary` |
| Numbers / ELO / mono data | `var(--font-mono)` | 14–28px | 700 | accent color |
| Button label | `var(--font-heading)` | 12–14px | 600 | inherited |

### Letter-spacing
- Headings: `letter-spacing: -0.02em` (tight, premium feel)
- Uppercase labels: `letter-spacing: 0.08em` (all-caps category headers)

---

## 4. Spacing & Border Radius

### Radius tokens

```css
--radius-sm: 8px;    /* Tags, small chips, day toggles */
--radius-md: 12px;   /* Buttons, inputs, nav items */
--radius-lg: 16px;   /* Cards, panels */
--radius-xl: 24px;   /* Large modals, hero cards */
```

### Spacing rhythm

Use multiples of **4px** for all margins, gaps, and padding.

| Scale | Value | Use |
|---|---|---|
| xs | 4px | Icon-to-text gap, tight badge padding |
| sm | 8px | Button padding vertical, nav item gap |
| md | 12–16px | Card internal padding, section gaps |
| lg | 20–24px | Card padding, section spacing |
| xl | 28–32px | Page-level padding |

---

## 5. Component Patterns

### 5.1 Buttons

All `<button>` elements in the platform automatically receive the **3D press effect** via global CSS — no class required.

**Opt out** with `class="no-3d"` for inline text buttons (e.g. "Sign out", "Change file").

#### Variants

| Variant | Background | Border | 3D shadow color |
|---|---|---|---|
| `primary` | `#7B5CF5` | `#9D82FF` top / `#4A2DB0` depth | `#4A2DB0` / `#2A1570` |
| `secondary` | `var(--bg-elevated)` | `#2A3050` | `#0C0F1C` / `#080A14` |
| `ghost` | `var(--bg-card)` | `#252A3E` | `#0D1022` / `#080A14` |
| `success` | `#4ADE80` | `#6EE7A0` | `#166534` / `#0d3d20` |
| `danger` | `rgba(245,107,107,0.14)` | `rgba(245,107,107,0.4)` | `#7f1d1d` / `#4d0e0e` |

#### Sizes

| Size | Padding | Font size |
|---|---|---|
| `sm` | `5px 13px` | 12px |
| `md` | `8px 18px` | 13px |
| `lg` | `11px 24px` | 14px |

#### CSS classes for 3D shadows

```css
/* Apply ONE of these alongside the button's visual style */
.btn-3d-primary
.btn-3d-secondary
.btn-3d-ghost
.btn-3d-success
.btn-3d-danger
```

On `:active` each class presses 3px down (`translateY(3px)`) and shrinks the shadow to 1px.

---

### 5.2 Cards

```css
background:    var(--bg-card);
border:        1px solid var(--border);
border-radius: var(--radius-lg);
padding:       20px;
```

**Clickable cards** add class `card-hover`:
```css
.card-hover { transition: all 0.2s ease; cursor: pointer; }
.card-hover:hover {
  border-color: rgba(123,92,245,0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
```

**Accent cards** (highlighted panels):
```css
background: rgba(123,92,245,0.08);
border:     1px solid rgba(123,92,245,0.22);
```

---

### 5.3 Badges / Tags

```css
border-radius: 99px;
padding:       4px 12px;   /* sm: 2px 9px */
font-size:     12px;       /* sm: 11px */
font-weight:   600;
font-family:   var(--font-heading);
```

| Color | Background | Text | Border |
|---|---|---|---|
| purple | `rgba(123,92,245,0.14)` | `#9D82FF` | `rgba(123,92,245,0.32)` |
| amber | `rgba(240,160,48,0.14)` | `#F0A030` | `rgba(240,160,48,0.32)` |
| green | `rgba(74,222,128,0.14)` | `#4ADE80` | `rgba(74,222,128,0.32)` |
| red | `rgba(245,107,107,0.14)` | `#F56B6B` | `rgba(245,107,107,0.32)` |
| blue | `rgba(96,165,250,0.14)` | `#60A5FA` | `rgba(96,165,250,0.32)` |

---

### 5.4 Form Inputs

```css
.sb-input {
  background:    var(--bg-input);
  border:        1px solid var(--border);
  border-radius: var(--radius-md);
  padding:       10px 14px;
  color:         var(--text-primary);
  font-size:     14px;
  outline:       none;
  transition:    border-color 0.18s ease;
}
.sb-input:focus { border-color: rgba(123,92,245,0.5); }
```

- `input[type=range]` → `accent-color: var(--purple)`
- `input[type=date]` → `color-scheme: dark`
- Scrollbars → 5px wide, `var(--border)` thumb, transparent track

---

### 5.5 Progress Bar

```css
/* Track */
height: 6px; background: var(--border); border-radius: 99px; overflow: hidden;

/* Fill */
background: var(--purple);  /* or accent color */
transition: width 0.7s cubic-bezier(.4,0,.2,1);
```

---

### 5.6 Quiz Option Buttons

Class `.option-3d` — same shadow depth as buttons but styled as a full-width choice row:

```css
.option-3d {
  box-shadow: 0 4px 0 0 #0C0F1C, 0 4px 0 1px #080A14;
  transition: all 0.18s ease;
}
.option-3d:hover:not(:disabled) {
  border-color: rgba(123,92,245,0.4);
  background:   rgba(123,92,245,0.06);
  box-shadow:   0 5px 0 0 #0C0F1C, 0 5px 0 1px #080A14;
}
.option-3d:active:not(:disabled) {
  transform:  translateY(3px);
  box-shadow: 0 1px 0 0 #0C0F1C, 0 1px 0 1px #080A14;
}
```

Correct answer → green border + `rgba(74,222,128,0.08)` bg  
Wrong answer → red border + `rgba(245,107,107,0.08)` bg

---

## 6. Animation System

### Keyframes

```css
@keyframes fadeIn  { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
@keyframes spin    { to { transform:rotate(360deg); } }
```

### Utility classes

| Class | Effect | Duration |
|---|---|---|
| `.fade-in` | Fade + 8px slide up | 0.35s ease |
| `.slide-up` | Fade + 18px slide up | 0.4s ease |
| `.float-anim` | Gentle vertical float loop | 3s ease-in-out infinite |

### Timing guidelines

| Interaction | Duration | Easing |
|---|---|---|
| Button press | 0.1s | ease |
| Hover filter | 0.18s | ease |
| Card hover | 0.2s | ease |
| Sidebar collapse | 0.22s | `cubic-bezier(0.4,0,0.2,1)` |
| Toggle icon rotate | 0.3s | `cubic-bezier(0.4,0,0.2,1)` |
| Page enter | 0.35–0.4s | ease |
| Progress bar fill | 0.7s | `cubic-bezier(.4,0,.2,1)` |

---

## 7. Layout

### Platform shell

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (240px, collapsible to 64px)  │ Main content │
│  bg: --bg-card                         │ bg: --bg-base│
│  border-right: 1px solid --border      │              │
│  ─────────────────────────────────────  │              │
│  Logo  (36×36 icon + wordmark)          │   <slot />   │
│  Streak strip (amber)                   │              │
│  Nav links                              │              │
│  [flex: 1 spacer]                       │              │
│  User / sign-out footer                 │              │
└──────────────────────────────────────────────────────┘
```

- `html, body` → `height: 100%; overflow: hidden; margin: 0`
- Sidebar uses `.sidebar` CSS class for width + collapse transition
- Main content area → `flex: 1; overflow: hidden`
- Scrollable page content → `.content-scroll` (`overflow-y: auto; overflow-x: hidden`)

### Sidebar collapse states

| State | Width | What hides |
|---|---|---|
| Expanded | `240px` | Nothing |
| Collapsed | `64px` | Labels (`.sb-nav-label`), streak strip (`.sb-streak`), logo text, user name/signout |

Collapsed nav links → icons centered, tooltips shown on hover via `position:fixed` JS tooltip.

---

## 8. Iconography

Icons are **monoline SVG**, `stroke-width: 1.75`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none`. Default size 17–20px.

Color follows context:
- Active / accent → `var(--purple-light)` (`#9D82FF`)
- Default → `var(--text-secondary)` (`#6B7599`)
- Muted / disabled → `var(--text-muted)` (`#3D4566`)
- Success → `var(--green)`
- Warning → `var(--amber)`
- Error → `var(--red)`

---

## 9. Mascot / Logo

The StudyBearer mascot is a **studious panda wearing round glasses**, reading a book. File: `apps/platform/src/assets/sb_symbol_blk.png` (black on transparent).

**Rendering on dark backgrounds:** apply `filter: invert(1)` to flip to white. Do not recolor to purple or any accent — the mascot is always white on dark.

The wordmark "**StudyBearer**" uses `var(--font-heading)` at 17px / weight 700 / `letter-spacing: -0.025em`.  
Subtitle "AI Study Companion" uses `var(--font-body)` at 11px / `var(--text-secondary)`.

---

## 10. Do / Don't

| Do | Don't |
|---|---|
| Use CSS tokens for every color value | Hard-code hex values in components |
| Apply 3D depth to all interactive buttons | Use flat buttons with no shadow |
| Use `var(--font-heading)` for labels and buttons | Use body font for UI chrome |
| Keep text concise and competitive in tone | Write institutional or passive copy |
| Use `border-radius: var(--radius-md)` on buttons/inputs | Mix arbitrary radius values |
| Add `class="no-3d"` to inline text-only buttons | Add 3D shadow to ghost text actions |
| Fade in page content with `.fade-in` | Pop in content with no transition |
| Dark mode only | Add a light mode or white backgrounds |
