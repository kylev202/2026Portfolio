# Product

## Register

brand

## Users

Two readers, in order of importance:

1. **Recruiters and hiring managers** screening for 2026 software-engineering
   internships / early-career roles. They skim. They are on a laptop, often with
   many tabs open, deciding in under a minute whether this person can build and
   ship. They want: what they make, proof it works (live links / repos), and how
   to reach them. Fast.
2. **Fellow engineers** (potential collaborators, people who found a repo) who
   appreciate craft and will notice if the site itself is well built.

The job to be done: in one short visit, convince a skeptical reader that this is
a capable early-career engineer worth a reply, and make contacting them
frictionless.

## Product Purpose

A personal portfolio that doubles as a proof-of-skill: the site is itself a
small, well-engineered piece of software, framed as a **personal runtime /
developer instrument** (the "Machine / OS" concept). The medium argues the case
the copy can't. Success = a recruiter reaches the work and the contact path
without friction, and comes away thinking "this person can build."

## Brand Personality

Three words: **precise, instrumental, alive.**

- **Precise** — engineered, deliberate, nothing decorative-for-its-own-sake.
- **Instrumental** — reads like a tool you operate (a command palette, status
  readouts, panels), not a brochure. Avionics-at-night, mission control, a
  well-designed IDE: a machine you'd trust.
- **Alive** — it's running. Subtle ambient motion, a live clock/status, a boot
  ritual. Calm, not frantic.

Voice: plain, specific, a little wry. Honest student framing (no inflated
stats). Confident about the craft, modest about the experience.

## Anti-references

What this must NOT become:

- **The green-on-black "hacker terminal" cliché.** No Matrix rain, no neon
  lime, no fake verbose `npm install` log spam, no blinking-block-cursor as the
  entire hero. The OS metaphor is a *designed instrument*, not a movie hacker
  screen.
- **The editorial-typographic AI default** (display serif + tiny mono eyebrows +
  ruled three-column restraint). The previous redesign drifted exactly here;
  it's the saturated 2026 reflex. Avoid.
- **The occult/"mysterious eye" mood** of the prior live build. Atmospheric is
  good; spooky/portent is wrong for a hireability surface.
- **Identical icon-heading-text card grids** and **hero-metric stat templates.**
- Style-over-substance: a concept so immersive the work gets buried. The work
  must always be one action away.

## Design Principles

1. **The medium is the proof.** The site demonstrates engineering by being a
   well-built instrument: a real, keyboard-accessible command palette beats a
   description of one. Don't fake the machine; build it.
2. **Concept earns the entrance; clarity earns the reply.** A striking boot +
   desktop up front, then work that is scannable, legible, and fast. The wow
   never costs a recruiter the information they came for.
3. **Operable, not just viewable.** Everything reachable by keyboard. The OS
   framing means real affordances (jump-to, copy email, open repo) that work.
4. **Honest instrumentation.** Live readouts reflect real things (local time,
   availability, section state), never invented metrics.
5. **Restraint is the luxury.** Monochrome instrument + one signal color. The
   mood comes from contrast, depth, and motion, not from piling on hues.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA**. Body text ≥ 4.5:1, large/label text ≥ 3:1 against the
  dark surfaces (verified, not assumed).
- **Full keyboard operability**, especially the command palette: focus trap,
  arrow-key navigation, Escape to close, visible focus rings, ARIA roles, and an
  announced open/close.
- **Reduced motion is a first-class path**, not an afterthought: the boot
  sequence and ambient motion collapse to instant/static under
  `prefers-reduced-motion`; content is never gated behind an animation.
- Mono is used for chrome/labels/data (where it's legible and on-concept) and
  **never for long body prose** — prose is set in a humanist grotesk for
  readability.
