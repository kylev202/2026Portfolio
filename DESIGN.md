# Design

Visual system for the **Machine / OS** portfolio: a personal runtime / developer
instrument. Dark, atmospheric, precise. Mood from contrast and depth, not hue.

## Theme

A designed developer instrument seen at night: a blue-tinted near-black surface,
warm bone text, and a single amber signal color for "live" state. Reference
points: mission-control / avionics consoles, a refined terminal (Warp,
Ghostty), Linear/Vercel restraint. Deliberately **not** green-on-black.

Mode: **dark only.** The instrument lives at night; light mode would dilute the
concept. (Reduced-motion is supported; light mode is intentionally out of scope.)

## Color (OKLCH, dark)

Background ramp (blue-tinted near-black):

| Token            | OKLCH                | ~Hex      | Use                              |
| ---------------- | -------------------- | --------- | -------------------------------- |
| `bg.deep`        | `oklch(0.13 0.010 255)` | `#08090d` | boot screen, deepest wells       |
| `bg`             | `oklch(0.17 0.010 255)` | `#0d0f14` | page background                  |
| `surface`        | `oklch(0.21 0.012 255)` | `#15181f` | window / panel fills             |
| `surface.raised` | `oklch(0.25 0.013 255)` | `#1d212a` | command bar, raised rows         |
| `line`           | `oklch(0.31 0.012 255)` | `#2a2f3a` | hairlines, window chrome         |
| `line.strong`    | `oklch(0.40 0.014 255)` | `#3c424f` | focused borders, dividers        |

Ink (warm off-white, slightly counter to the cool bg for life):

| Token       | OKLCH                  | ~Hex      | Contrast on `bg` | Use                          |
| ----------- | ---------------------- | --------- | ---------------- | ---------------------------- |
| `ink`       | `oklch(0.93 0.008 85)` | `#e9e6df` | ~14:1            | primary text, headings       |
| `ink.dim`   | `oklch(0.76 0.008 80)` | `#b8b3a9` | ~7.5:1           | secondary text               |
| `ink.faint` | `oklch(0.66 0.008 80)` | `#9b958a` | ~5.6:1           | labels/meta (AA, incl. on surfaces) |

Signal (the one accent — warm amber against the cool dark):

| Token         | OKLCH                  | ~Hex      | Use                                  |
| ------------- | ---------------------- | --------- | ------------------------------------ |
| `signal`      | `oklch(0.81 0.145 78)` | `#f4a83a` | live/active state, key accents, focus|
| `signal.dim`  | `oklch(0.66 0.120 70)` | `#c47e2c` | hovered/pressed accent               |
| `signal.deep` | `oklch(0.38 0.070 65)` | `#5e3f1c` | accent fills/tints behind text       |

Rules: amber is for **state and emphasis**, never for body prose. Text stays
bone. One accent only — no second hue. Contrast verified against `bg`/`surface`.

## Typography

Two families on a contrast axis (mechanical fixed-width vs proportional
humanist). Both deliberately off the AI-reflex list (no Inter, no JetBrains
Mono).

- **Mono — Martian Mono** (`--font-mono`): system chrome, labels, the command
  palette, data/numeric readouts, AND the large identity headline (set big and
  tight — this is what makes it read as a machine). Weights 400/500/700.
- **Sans — Hanken Grotesk** (`--font-sans`): all body prose, section headings,
  comfortable UI text. Weights 400/500/600/700.

Mono is never used for long prose. Caps reserved for short labels (≤ 4 words).

### Scale (fluid, ≥1.25 steps)

- `display` (identity headline, mono): `clamp(1.9rem, 7.5vw, 5.5rem)`, line-height
  0.98, letter-spacing -0.02em. (Floor sized so the longest headline line clears
  a 360px viewport in Martian Mono without wrapping.)
- `h2` (section title, sans 700): `clamp(1.6rem, 3.2vw, 2.6rem)`, lh 1.05.
- `h3`: `clamp(1.15rem, 1.6vw, 1.4rem)`.
- `body`: 1rem / 1.65, max width 68ch. (Light-on-dark gets the looser
  line-height.)
- `label` (mono): 0.72–0.8rem, uppercase, tracking 0.18em.

## Components

- **Window / Panel** — the core container. A `surface` block with a `line`
  border, a thin **title bar** showing the section as a path (`~/work`) plus
  three minimal window dots and a right-aligned meta readout. The title bar is
  the section's identity; it *replaces* per-section eyebrows (deliberate, named
  system — not scaffolding). Never nest windows inside windows.
- **Status bar** — fixed top strip: identity handle (left), plain-English
  section links (≥lg — recognition over recall; ⌘K stays the fast path), live
  clock + availability dot, `⌘K` hint. The persistent "OS chrome."
- **Address strips** — each section opens with a **plain label first**
  (About / Projects / Experience / Contact) so a non-technical screener can
  scan; the `~/path` and flavor meta follow. Concept earns the entrance;
  clarity earns the reply.
- **Command palette (⌘K)** — centered dialog over a blurred backdrop. Mono
  input, filtered list grouped (Navigate / Open / Actions), arrow-key nav, Enter
  to run, Esc to close. The signature interaction.
- **Work list** — projects as expandable "process" rows (index · name · year ·
  tags · ↗), not a card grid. Hover/focus raises the row; amber index.
- **Path** — a typed timeline (ordered, so numbers are earned).
- **Buttons / links** — text + signal underline that grows on hover; primary
  actions get an amber hairline border that fills `signal.deep` on hover.

## Layout

- Centered max-width column (~72rem) with generous, fluid vertical rhythm —
  section gap is `clamp(2rem, 5vw, 4.5rem)` plus each section's own padding.
  Asymmetry inside panels for interest.
- Status bar fixed top; content scrolls under it. Footer = a "shell" status
  line (uptime, build, colophon).
- Responsive: single column on mobile; window title bars and the status bar
  collapse gracefully. Test headline copy at every breakpoint (no overflow).

## Motion (tasteful; two signature moments)

- **Signature 1 — Boot.** ~1.2s: a progress meter fills while 3–4 honest status
  lines reveal (`mounting projects`, `loading skills`, `ready`), then hands off
  to the desktop. Skippable (any key / click). Reduced-motion → skip straight to
  desktop.
- **Signature 2 — Command palette** spring-in (scale 0.98→1 + fade + backdrop
  blur), list items stagger.
- **Ambient** (subtle, kept deliberately sparse): a faint static film grain +
  vignette over the background; the live clock; a soft amber pulse on the
  availability dot; a slow telemetry ticker. No animated scanline veil — the
  desktop favours stillness so the motion that remains reads as intentional.
- **LED discipline**: `led-live` (pulsing) is reserved for genuinely live state
  — availability, the timeline HEAD, footer uptime. Lists and rows use the
  static `led-on` so at most a couple of things on screen ever pulse at once.
- **Type floor**: anything a user is meant to *read* is ≥ 0.7rem mono and at
  least `ink-dim`; `ink-faint` + sub-0.7rem is for decorative chrome only.
- **Reveals**: per-section fade-up on scroll, staggered list rows. Each reveal
  enhances already-visible content (never gates visibility).
- Easing: ease-out-quint `[0.22, 1, 0.36, 1]`. No bounce/elastic.
- Every effect has a `prefers-reduced-motion` path (crossfade or instant).

## Accessibility

- AA contrast verified (table above). Visible amber focus ring, offset.
- Skip-to-content link (`.skip-link`) is the first tab stop on the home page;
  it slides into view only when focused and jumps past the fixed chrome.
- Command palette: focus trap, roving arrow-key selection, Esc, ARIA dialog +
  listbox semantics, restore focus on close.
- All ambient + entrance motion disabled under reduced motion; content static
  and fully present without JS animation.
