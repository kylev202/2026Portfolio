# Claude Working Notes — Portfolio

> **For Claude (future sessions): read this file FIRST.** It's the condensed
> memory of this project so you don't have to re-read the whole chat or scan
> every file. At the end of a working session, append a dated entry to the
> **Session diary** and update **Project snapshot** / **TODO** if state changed.
> Keep it terse and skimmable — this is a diary, not documentation.
> (See also `../CLAUDE.md` for the auto-loaded project memory.)

---

## Project snapshot
_Last updated: 2026-06-11_

- **Root:** `C:\Users\Klizs\Documents\Code\Portfolio`
- **What it is:** Personal portfolio site for a **software-engineering student /
  early-career dev**. Direction: **"The Runtime"** — a dark OS/instrument
  (blue-tinted near-black, bone ink, single amber signal; see `DESIGN.md`).
  Scroll page at `/` + windowed desktop at `/desktop`. Tasteful motion only.
- **Stack:** Next.js 15 (App Router, `src/` dir) + TypeScript (strict) ·
  React 19 · Framer Motion · Tailwind v3.
  ⚠️ Three.js / R3F / GSAP / `@anthropic-ai/sdk` were **removed** in the
  2026-05-30 redesign — do not reintroduce without a reason.
- **Fonts:** Martian Mono (`--font-mono`) + Hanken Grotesk (`--font-sans`) via
  `next/font/google`. (The earlier Fraunces/Inter/JetBrains editorial set is gone.)
- **Build status:** ✅ `npm run build` passes (types + lint clean), prerenders
  static. Prod server returns `GET / 200` with content rendered.
- **Run:** `npm run dev` → http://localhost:3000.
- **⭐ All content lives in `src/lib/content.ts`** — edit there, not components.
- **Companion files:** `../PROGRESS.md` (human tracker — now STALE, still
  describes the old 3D/AI vision) and `../CLAUDE.md`.

---

## Architecture decisions
_Append-only. Date each entry._

- **2026-05-30** — **Full redesign.** User rejected the entire old design
  ("destroy it"). Chose, via AskUserQuestion: **Editorial/typographic** aesthetic,
  **"keep it lively" but tasteful** motion (no gimmicks), **student/early-career**
  framing (honest copy, no inflated stats). Tore out the 3D hero, aurora,
  scramble, neon gradients, glow, count-up stats. Removed deps `three`,
  `@react-three/*`, `gsap`, `@anthropic-ai/sdk` from `package.json` and the
  `transpilePackages: ["three"]` line from `next.config.mjs`.
- **2026-05-30** — New palette: warm **paper** bg (`#f6f4ee`), near-black **ink**,
  single rust **accent** (`#bb4b27`), **line** hairlines — tokens in
  `tailwind.config.ts`. Editorial utilities in `globals.css`: `.eyebrow`, `.rule`,
  `.link-underline`, `.chip`, `.text-hero`, `.text-section`. Global
  `prefers-reduced-motion` block added.
- **2026-05-30** — **Content centralised in `src/lib/content.ts`** (profile,
  socials, nav, about, skills, projects, timeline). Components are presentational
  and import from it; user edits one file. Shared `SectionHeading` + `Reveal`
  keep sections consistent.
- _(superseded)_ **2026-05-29** — Original "Dark Tech Minimalism" + 3D R3F hero +
  planned Claude chat assistant. All replaced by the redesign above.

---

## Key file map

- `CLAUDE.md` — auto-loaded project memory (concise)
- `.claude/NOTES.md` — this file (working diary)
- `PROGRESS.md` — human tracker (STALE — pre-redesign)
- **Config:** `next.config.mjs` (now minimal), `tsconfig.json` (`@/*` → `src/*`),
  `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`
- **App:** `src/app/layout.tsx` (3 fonts + metadata from content), `page.tsx`
  (Nav → Hero → About → Projects → Path → Contact → Footer), `globals.css`
- **Content:** `src/lib/content.ts` ⭐ single source of truth
- **Components:** `Nav.tsx` (scroll-aware + mobile menu), `Hero.tsx` (line-by-line
  serif headline, availability badge, skills marquee), `Reveal.tsx` (Framer
  scroll-reveal, `as` prop), `SectionHeading.tsx` (index + eyebrow + rule + title),
  `Footer.tsx`
- **Sections:** `src/components/sections/{About,Projects,Path,Contact}.tsx`
  - `Projects` = editorial list (index · title · year · tags · ↗ hover)
  - `Path` = education/experience timeline
- **Placeholders to replace (in `content.ts`, marked `TODO`):** name, initials,
  university, LinkedIn URL, the 3 demo projects, `resume.pdf` in `/public`.
- **Obsolete leftover:** `.env.local.example` references the removed Anthropic key.

---

## Gotchas / environment notes
- **Shell:** Windows 11, PowerShell. Bash tool also available.
- **⚠️ Git root is the HOME directory** (`C:\Users\Klizs`), NOT the Portfolio
  folder. Portfolio has no own repo. Do not `git add`/`commit` casually — it
  would stage the entire home dir. `git init` a dedicated repo first if needed.
  Confirm with the user before any git write.
- The TS error `Cannot find module './globals.css'` is benign (Next handles CSS
  side-effect imports).
- `text-wrap: balance` triggers a "Chrome < 114" lint warning — harmless, degrades
  gracefully.
- `node_modules` still contains the removed packages until someone runs
  `npm install` / `npm prune`. The build ignores them.

---

## TODO / next steps
1. **User:** fill real content in `src/lib/content.ts` (name, university, real
   projects + links, LinkedIn, drop `resume.pdf` in `/public`).
2. Run `npm install` to prune the removed deps from `node_modules` (optional).
3. Optional polish: Open Graph image, working contact form, Lighthouse pass.
4. Deploy to Vercel.
5. Refresh/retire the stale `PROGRESS.md` and obsolete `.env.local.example`.

---

## Session diary
_Newest entries on top. Format: `### YYYY-MM-DD — summary`._

### 2026-07-09 — Interface sound (SFX) for interactive components
- Added an opt-in **Web Audio** UI-sound layer — "the instrument makes its own
  sounds". No deps, no audio files: a tiny synth (`SfxEngine`) plays short,
  low, low-pass-filtered blips shaped for the dark-console mood (warm, quiet,
  no harsh transients). Sounds: `hover` (soft tick, pitch-jittered),
  `tap` (two-part warm confirm), `on`/`off` (two-note cue the switch voices).
- **`src/components/os/primitives/sound.tsx`** — `SoundProvider` + `useSound()`.
  Delivered by **global event delegation** (capture-phase `pointerover` /
  `pointerdown` on `document`), so every interactive/hover element is covered
  without wiring each component. Selector = links, buttons, `summary`,
  role=button/option/switch/menuitem/tab, focusables, `.module`; opt out with
  `[data-no-sfx]`. Hover ticks are fine-pointer only + rate-limited (no
  machine-gun / no touch-scroll ticks); text inputs excluded (no keystroke tick).
- **OFF by default**, opt-in via a visible speaker toggle
  (`primitives/SoundToggle.tsx`) added to the **StatusBar**, desktop **MenuBar**
  tray, and a "sound" row in **Settings**. Preference persists to
  `localStorage` (`kylevos:sound:v1`). Audio unlocks inside the enable click
  (real user gesture → satisfies autoplay policy).
- Mounted `SoundProvider` in `app/layout.tsx` so it spans both `/` and `/desktop`.
- ⚠️ Note: toggle side effects live **outside** the `setEnabled` updater — a
  setState updater must be pure (StrictMode double-invokes it in dev, which was
  double-firing the cue + double-writing storage). `enabledRef` is updated
  eagerly so the document listeners stay correct.
- Verified: `npm run build` clean (types + lint); drove the real page in
  Chromium/Playwright instrumenting Web Audio — OFF = silent, enable = one
  2-note cue, hover onto a control = exactly one tick, single tap = one
  two-part sound (not doubled), preference survives reload, no console errors.

### 2026-06-11 (later) — Acted on the `.impeccable` critique (32/40, 2026-06-03)
- Source: `.impeccable/critique/2026-06-03T06-57-44Z__src-components-os-os-tsx.md`.
  Several findings were already fixed by then (OG image, hardcoded "cs student",
  `demo:"#"` guards, scanline veil, ink.faint contrast). Implemented the rest:
  - **Scannability (P2 + heuristic 6):** every address strip now leads with a
    plain label (About / Projects / Experience / Contact) before the `~/path`;
    nav labels in `content.ts` renamed Work→Projects, Path→Experience (flows to
    ⌘K, DepthRail); desktop app "Career"→"Experience". StatusBar gained a
    visible section nav at ≥lg.
  - **Ambient density (P1):** new static `.led-on`; About "ps" list, Work/
    ProjectsApp rows now use it. Pulsing `led-live` reserved for availability,
    timeline HEAD, footer uptime.
  - **Legibility floor (P1):** readable mono raised to ≥0.7rem (rail tooltips,
    descend cue, head badges, dock/desktop-icon labels, Settings captions);
    boot skip hints now 0.72rem `ink-dim`.
  - **Identity (P1):** intro now says "AI engineering student" matching
    `profile.role`. ⚠️ User should still verify name/handle/LinkedIn consistency
    (Kyle Vu / kylev / khiem-vu) — personal facts, not guessed at.
  - **P0 (placeholder projects) left for the user** — real content can't be
    fabricated. DESIGN.md updated (address-strip labels, LED discipline, type
    floor, status-bar nav).

### 2026-06-11 — UI/UX polish pass (audit of every component)
- Reviewed all shell, section, primitive, and desktop components against
  `DESIGN.md`. Quality was already high; applied targeted fixes:
  - **Type:** `.text-display` floor 2.4rem → `clamp(1.9rem, 7.5vw, 5.5rem)`
    (longest headline line was wrapping under ~400px in wide Martian Mono);
    `text-wrap: balance` on h2/h3.
  - **Spacing:** section rhythm now fluid — `space-y-[clamp(2rem,5vw,4.5rem)]`
    in `OS.tsx` (was fixed `space-y-8`), per DESIGN's "fluid vertical rhythm".
  - **A11y/UX:** `.skip-link` (first tab stop, slides in on focus → `#main`);
    ⌘K input got combobox ARIA (`role`, `aria-expanded`, `aria-autocomplete`);
    aria-labels for icon-only mobile controls (StatusBar Desktop link + Command
    button, MenuBar Exit); `summary.proc:focus-visible` now matches hover.
  - **Color:** Firefox scrollbar themed (`scrollbar-width/color` on html).
  - **Motion:** Boot tightened ~2.9s → ~2.45s (stagger 0.24, hold 0.85).
  - **Docs:** rewrote stale `CLAUDE.md` (still described the dead editorial/paper
    design); DESIGN.md scale + layout + a11y lines updated to match.
- ⚠️ `src/components/os/primitives/Window.tsx` is **dead code** (no imports —
  Hero uses `.window` classes; desktop has `Win.tsx`). Deletion was blocked by
  tool permissions this session — user should remove it.
- Build verified clean after changes (see below).

### 2026-06-06 — Interactive desktop OS (`/desktop`)
- Built a real windowed desktop as a **separate route** (`/desktop`), launched
  from the home page (Hero "Enter desktop" CTA, StatusBar "▸ Desktop" link, and a
  new ⌘K command "Enter desktop"). The scrolling instrument page stays the
  default landing (recruiter fast-path preserved, per PRODUCT.md).
- New module: `src/components/os/desktop/`
  - `WindowManager.tsx` — context/state engine: open windows (one per app),
    focus z-order, min/max/restore, live geometry, usable "area", and persisted
    settings (`localStorage` key `kylevos:settings:v1`). Knows nothing about the
    app registry (callers pass a `LaunchSpec` → no import cycle).
  - `Win.tsx` — draggable (title bar) + resizable (corner) window; pointer-based
    (mouse+touch), keyboard move (arrows on focused bar), functional close /
    minimise / maximise, double-click to maximise. Geometry is inline style
    (dynamic) — IDE CSS-lint warns; `next lint` is clean.
  - `Desktop.tsx` (wallpaper + Esc-to-close + auto-open Readme), `MenuBar.tsx`,
    `Dock.tsx`, `DesktopIcons.tsx`, `DesktopShell.tsx` (route client entry).
  - `apps.tsx` registry + `apps/*` bodies (About, Projects, Contact, Path,
    Readme, Settings) all reuse `content.ts`; Terminal embedded via a new
    `embedded` prop on `sections/Terminal.tsx` (drops its own chrome).
  - `icons.tsx` — minimal monoline app icons (no skeuomorphic tiles).
- Design: extends the committed brand verbatim (instrument dark + amber signal,
  Martian Mono / Hanken Grotesk). Window dots are **functional + monochrome**
  (glyph on hover) — amber stays reserved for active/state. Wallpaper variants in
  Settings (grid / deep / rules); calm mode + reduced-motion both disable motion.
- Tokens: added `.win-dot` + `.wp-rules` to `globals.css`. Desktop chrome at
  `z-50`, windows dynamic (`10 + order`), so the home ⌘K layer is untouched.
- Status: `npm run build` clean (types + lint); `/desktop` prerenders static
  (~8.7 kB). Dev server serves `/` and `/desktop` 200, no console/compile errors.
  ⚠️ **Not yet eyeballed in a browser** — this harness has no screenshot tool;
  needs a visual pass (drag/resize feel, mobile, focus order).

### 2026-05-30 — Full redesign (editorial / typographic)
- User: "destroy it and start making a professional portfolio." Confirmed
  direction via AskUserQuestion (editorial · lively-but-tasteful · student framing).
- Replaced the entire site: new paper/serif design system, `content.ts` as single
  source of truth, rebuilt Nav/Hero/About/Projects(list)/Path(timeline)/Contact/
  Footer + shared `SectionHeading`. Deleted `HeroScene.tsx` and `ui/TextScramble.tsx`.
- Removed deps (three, R3F, gsap, anthropic-sdk) from `package.json`; trimmed
  `next.config.mjs`. Verified: `npm run build` clean, prod server `GET / 200` with
  new copy rendering.
- Content is still placeholder (name = "Your Name", demo projects) — user edits
  `content.ts` next.
- Then: created `CLAUDE.md` and rewrote this file to match the redesign.

### 2026-05-29 — Scaffolded the app (Phases 1 & 2 done) [SUPERSEDED]
- Manually scaffolded Next.js 15 + TS + Tailwind v3; built old "Dark Tech
  Minimalism" design with 3D R3F hero (icosahedron + particles), Framer reveals,
  placeholder About/Projects/Contact. **Entirely replaced on 2026-05-30.**

### 2026-05-29 — Project memory bootstrapped
- Created `PROGRESS.md` (human tracker) and this `.claude/NOTES.md`.
- Added `.vscode/settings.json` so `.claude` + dotfiles stay visible in Explorer.
