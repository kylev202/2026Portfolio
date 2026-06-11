# Portfolio — Progress Tracker

> Your personal dashboard. Update this as you build. Skim it any time to know
> exactly where things stand, what you're on, and what's next.

**Project:** Interactive AI/dev portfolio website — premium, 3D-driven, with a
built-in Claude chat assistant. The goal is a memorable site for AI/tech job
applications.

**Tech stack (installed):** Next.js + TypeScript · Three.js via React Three Fiber
(`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`) ·
Framer Motion · GSAP · Anthropic SDK (`@anthropic-ai/sdk`).

**Status legend:** ✅ done · 🚧 in progress · ⬜ todo

---

## Current focus
> _What you're actively working on right now._

- 🚧 Fill in real content (your name, bio, skills, projects, contact links).
- ⬜ Then: GitHub API integration for live repo data, and the Claude chat assistant.

**Run it:** `npm run dev` → http://localhost:3000

---

## Roadmap

### Phase 1 — Foundation
- ✅ Scaffold Next.js + TypeScript project (App Router, `src/` dir)
- ✅ Set up Tailwind + design tokens (colors, typography, spacing)
- ✅ Page skeleton: Hero · About · Projects · Contact
- ⬜ Deploy to Vercel (live URL)

### Phase 2 — Hero & 3D
- ✅ Three.js / R3F set up and working
- ✅ Animated 3D hero (wireframe icosahedron + drifting particle field)
- ✅ Scroll-triggered reveal animations (Framer Motion `Reveal` component)
- ⬜ Refine: shaders / post-processing bloom, mouse parallax

### Phase 3 — Projects
- ⬜ Project card component
- ⬜ Pull real repo data from GitHub API (stars, last commit, languages)
- ⬜ Filtering / sorting
- ⬜ Add 3–5 real projects with live demos

### Phase 4 — AI integration
- ⬜ Anthropic API route (server-side, key never exposed to client)
- ⬜ Chat interface component
- ⬜ Embed assistant ("Ask me about my projects")
- ⬜ Test with real queries

### Phase 5 — Polish & deploy
- ⬜ Micro-interactions (hover/load states)
- ⬜ Performance (lazy load, image optimization, Lighthouse)
- ⬜ Analytics (PostHog) + SEO (metadata, sitemap, OG tags)
- ⬜ Public launch

---

## Decisions log
> _Lock these in as you decide them._

- Visual direction: **Dark Tech Minimalism** ✅ (committed)
- Color palette: near-black base `#05060a` + electric cyan accent `#22d3ee` ✅
- Fonts: **JetBrains Mono** (display) / **Inter** (body) ✅
- Hosting: _TBD_ (likely Vercel)
- Styling: Tailwind v3; tokens in `tailwind.config.ts`, globals in `src/app/globals.css`

---

## Blockers / open questions
- _None yet._

---

## Project list (for the Projects section)
> _List 5–8 projects you're proud of. For each: GitHub link, live demo, AI/ML involved._

1. _TBD_
