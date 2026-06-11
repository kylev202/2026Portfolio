# CLAUDE.md — Portfolio

Project memory for Claude Code. Read this first; the deeper working diary lives
in [`.claude/NOTES.md`](.claude/NOTES.md) and the full visual spec in
[`DESIGN.md`](DESIGN.md).

## What this is
A personal portfolio site for a **software-engineering student / early-career
dev**, framed as **"The Runtime"** — a personal developer instrument / OS seen
at night. Dark, blue-tinted near-black surfaces, warm bone text, **one amber
signal accent**. Mood comes from contrast and depth, not extra hues. Reference
points: mission-control consoles, refined terminals (Warp/Ghostty), Linear/
Vercel restraint. **Dark only** (light mode intentionally out of scope);
deliberately *not* green-on-black. No 3D, no neon/glow, no text-scramble.

Two experiences:
- **`/` (the instrument)** — scrolling page: Boot → Hero (typed headline) →
  SystemBus ticker → About → Work → Path → Contact (interactive terminal) →
  Footer, plus a fixed StatusBar, a ⌘K command palette, and a DepthRail.
- **`/desktop` (the desktop)** — a real windowed mini-OS: menu bar, dock,
  desktop icons, draggable/resizable windows running apps that reuse the same
  content (`apps/` bodies + a window manager).

## Stack
- **Next.js 15** (App Router, `src/` dir) · **React 19** · **TypeScript** (strict)
- **Tailwind v3** (PostCSS + autoprefixer) · **Framer Motion** (LazyMotion `m`)
- Fonts via `next/font/google`: **Martian Mono** (`--font-mono`: chrome, labels,
  identity headline) + **Hanken Grotesk** (`--font-sans`: prose, headings)

There is **no** Three.js / R3F / GSAP / Anthropic SDK — removed 2026-05-30.

## ⭐ Editing content
**All copy lives in [`src/lib/content.ts`](src/lib/content.ts)** — system/boot
lines, profile, socials, nav, about, skills, projects, timeline. Edit that one
file; never hardcode copy in components. Placeholders are marked `TODO`.

## Project structure
- `src/app/layout.tsx` — fonts + metadata · `page.tsx` → `<OS />` ·
  `desktop/page.tsx` → `<DesktopShell />` · `globals.css` — tokens-in-use
- `src/components/os/` — `OS` (assembly), `Boot`, `Hero`, `StatusBar`,
  `CommandBar` (⌘K palette + provider), `Footer`, `DesktopBoot`
- `src/components/os/sections/` — `About`, `Work`, `Path`, `Contact`, `Terminal`
  (a real REPL; `embedded` prop drops its chrome for the desktop app)
- `src/components/os/primitives/` — `anim.ts` (EASE/DUR), `Reveal`, `SystemBus`,
  `DepthRail`
- `src/components/os/desktop/` — `WindowManager` (state engine), `Win` (window
  chrome/drag/resize), `Desktop`, `MenuBar`, `Dock`, `DesktopIcons`, `apps.tsx`
  registry + `apps/*` bodies, `icons.tsx`

## Design system (where the tokens live)
- **Colors / fonts / z-scale / keyframes:** `tailwind.config.ts`
  - `bg` (+`deep`), `surface` (+`raised`), `line` (+`strong`), `ink` (3 steps),
    `signal` (amber — for **state/emphasis only**, never body prose)
- **Reusable utilities:** `globals.css` — `.label`, `.readout`, `.addr`,
  `.window`/`.window-bar`, `.btn`/`.btn-ghost`, `.chip`, `.kbd`, `.led`,
  `.module`/`.matrix`, `.skip-link`, `.text-display`/`.text-section`,
  `.ghost-num`, `.grain-layer`/`.vignette-layer`
- **Motion:** single easing `[0.22,1,0.36,1]` (ease-out-quint), durations from
  `primitives/anim.ts`. Reveals enhance already-visible content (never gate it).
  **Reduced motion** is honoured everywhere (global CSS block + per-component
  `useReducedMotion`); the desktop also has a "calm" setting. Keep new motion safe.
- Section identity = the address strip (`~/work` …), not eyebrows. One accent
  only; caps reserved for short mono labels.

## Commands
```
npm run dev     # http://localhost:3000  (and /desktop)
npm run build   # production build — must pass clean (types + lint)
npm run lint
```

## Gotchas
- **⚠️ The git repo root is the HOME dir (`C:\Users\Klizs`), not this project.**
  Never run a casual `git add`/`commit` — it would stage the entire home folder.
  If version control is wanted, `git init` a dedicated repo inside the project
  first. Confirm with the user before any git write.
- **Shell:** Windows 11, PowerShell. Bash tool also available.
- The TS error `Cannot find module './globals.css'` is benign — Next handles CSS
  side-effect imports; TypeScript just lacks a declaration.
- IDE CSS hints about `scrollbar-width` / `text-wrap` support are harmless —
  both degrade gracefully; `next lint` stays clean.
- Keep copy **honest** (student framing, no inflated stats) — explicit user
  preference. Boot lines must describe what the site actually loads.
- `PROGRESS.md` is the user's tracker and is **stale** (describes the pre-2026
  3D/AI vision) — don't treat it as current direction.
