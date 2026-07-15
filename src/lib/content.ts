/**
 * ──────────────────────────────────────────────────────────────────────────
 *  EDIT YOUR PORTFOLIO HERE
 * ──────────────────────────────────────────────────────────────────────────
 *  Everything the site displays lives in this file. Change the values below
 *  and the whole portfolio updates — you never need to touch the components.
 *  Anything marked `TODO` is a placeholder waiting for your real details.
 *
 *  Concept: "The Runtime" — the site is framed as a personal developer
 *  instrument / OS. Copy stays plain, specific, and honest (student framing).
 * ──────────────────────────────────────────────────────────────────────────
 */

/** The OS framing — shown in the chrome, the boot sequence, and the footer. */
export const system = {
  name: "kylev.os", // TODO: your handle + ".os" — appears in the status bar
  version: "v1.0.0",
  /**
   * Boot lines. Keep them honest — these describe what the site actually loads.
   * The last line should read as "done" (e.g. "ready", "online").
   */
  boot: [
    "initialising runtime",
    "mounting projects",
    "loading skills",
    "opening contact channels",
    "ready",
  ],
  /**
   * Desktop boot — systemd-style unit lines for the mock Linux boot shown once
   * (per tab session) when the /desktop route first loads. Purely decorative;
   * edit freely. `status: "ok"` renders a green [  OK  ] marker, `"info"` a
   * dim [ INFO ] (used for "starting…" steps that resolve a beat later).
   */
  services: [
    { msg: "Reached target Local File Systems", status: "ok" },
    { msg: "Mounted /home/kylev", status: "ok" },
    { msg: "Started Project Index Service", status: "ok" },
    { msg: "Loaded language & skill modules", status: "ok" },
    { msg: "Started Contact Channel Daemon", status: "ok" },
    { msg: "Reached target Network", status: "ok" },
    { msg: "Starting Window Manager", status: "info" },
    { msg: "Started Portfolio Compositor", status: "ok" },
    { msg: "Reached target Graphical Interface", status: "ok" },
  ],
  /** Shown in the footer "shell" line. */
  colophon: "Built with Next.js, TypeScript & Framer Motion. No templates.",
} as const;

export const profile = {
  name: "Kyle Vu", // TODO: your full name (shown big in the hero)
  handle: "kylev", // TODO: short handle (status bar, prompt)
  role: "AI Engineering Student", // keep it honest
  location: "Melbourne, Australia", // TODO
  // The hero statement. One sentence, broken where it should breathe.
  headline: ["I build ideas", "for the web,", "and I ship them."],
  // One or two sentences under the headline. Keep the self-description in sync
  // with `role` above — the critique flagged three different role strings.
  intro:
    "AI engineering student who turns rough ideas into real applications. Focused on web apps, clean interfaces, and learning to ship end-to-end.",
  available: true,
  availableLabel: "Open to 2026 internships",
  email: "kylevu858@gmail.com",
  resumeUrl: "/resume.pdf", // TODO: drop a resume.pdf in /public, or set to ""
} as const;

export const socials = [
  { label: "GitHub", short: "GH", href: "https://github.com/kylev202" },
  { label: "LinkedIn", short: "IN", href: "https://www.linkedin.com/in/duy-khiem-vu-8a0283313/" }, // TODO
  { label: "Email", short: "@", href: "mailto:kylevu858@gmail.com" },
] as const;

/**
 * Sections, in order. `path` is shown in the window title bar (e.g. "~/work").
 * Labels are deliberately plain English (a non-technical screener must be able
 * to scan them); the `path` carries the OS flavor.
 */
export const nav = [
  { label: "About", id: "about", path: "~/about" },
  { label: "Projects", id: "work", path: "~/work" },
  { label: "Experience", id: "path", path: "~/path" },
  { label: "Contact", id: "contact", path: "~/contact" },
] as const;

/**
 * The "About" section. `paragraphs` are body copy; `now` are honest, current
 * facts (no inflated stats) shown as a status list.
 */
export const about = {
  paragraphs: [
    "I started programming because I wanted to build the tools and sites I enjoyed using. That curiosity became a degree, a steady stream of side projects, and a habit of taking things apart until I understand them.",
    "I care about readable code, interfaces that feel obvious, and finishing what I start. I'm early in my career and treat that as an advantage: fast to learn, quick to ask questions, and not yet set in any one way of doing things.",
  ],
  now: [
    "Studying Computer Science", // TODO
    "Building side projects in different languages and frameworks",
    "Learning backend systems and databases",
    "Looking for a 2026 internship",
  ],
} as const;

/** Skills grouped by area. Keep these to things you can actually talk about. */
export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML/CSS"] },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion"] },
  { group: "Backend & data", items: ["Node.js", "PostgreSQL", "REST APIs", "Git"] },
  { group: "Learning now", items: ["Docker", "Testing", "System design"] },
];

export type Project = {
  title: string;
  year: string;
  /** One short line: what it is, what you built, what you learned. */
  description: string;
  /** Longer detail revealed when the row expands. */
  detail?: string;
  tags: string[];
  /** Honest one-word status, e.g. "shipped", "live", "in progress", "archived". */
  status?: string;
  repo?: string;
  demo?: string;
};

/**
 * Selected work. 3–5 projects you're genuinely proud of beats a long list.
 * Lead with what you built and the outcome. Honest > impressive.
 */
export const projects: Project[] = [
  {
    title: "Arbora",
    year: "2026",
    description:
      "A local-first study assistant that turns lectures and PDFs into cited notes, flashcards, and spaced-repetition quizzes — everything processed on-device.",
    detail:
      "A Tauri desktop app with a Rust core orchestrating a Python AI sidecar (Ollama, FAISS, Whisper) over a local SQLite store. Every generated item is grounded in the source with citations and gated behind human review before it enters a deck, and reviews are scheduled with FSRS. The hard part was keeping the whole pipeline offline and trustworthy — no data ever leaves the machine.",
    tags: ["Tauri", "Rust", "React", "TypeScript", "Python"],
    status: "in progress",
    repo: "https://github.com/kylev202/Arbora",
  },
  {
    title: "Project Two",
    year: "2025",
    description:
      "A second project showing a different skill — a backend, an API, or a data project.",
    detail:
      "Focus on the problem you solved and the trade-offs you made. Mention scale, constraints, or anything that made it non-trivial.",
    tags: ["Python", "PostgreSQL", "REST"],
    status: "shipped",
    repo: "https://github.com/kylev202",
  },
  {
    title: "Project Three",
    year: "2024",
    description: "An earlier build is fine — it shows growth.",
    detail:
      "Note what you'd do differently now; that kind of reflection reads well to interviewers. Honesty about the rough edges beats pretending it was perfect.",
    tags: ["React", "Node.js"],
    status: "archived",
    repo: "https://github.com/kylev202",
    demo: "#",
  },
];

export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  detail: string;
};

/**
 * Your "path" — education, work, and milestones, most recent first.
 * As a student this is where coursework, jobs, and clubs go.
 */
export const timeline: TimelineItem[] = [
  {
    period: "2024 → now",
    title: "Bachelor of Computer Science", // TODO
    org: "Swinburne University of Technology", // TODO
    detail:
      "Data structures, algorithms, databases, and web development. Maintaining a strong GPA while building projects on the side.",
  },
  {
    period: "2025",
    title: "Personal projects",
    org: "Self-directed",
    detail:
      "Designing and shipping small web apps end-to-end — idea, UI, deployment. Replace this with a real role or club when you have one.",
  },
  {
    period: "2023",
    title: "First lines of code",
    org: "Self-taught",
    detail:
      "Started with the basics and kept going, building increasingly ambitious projects to learn how real software fits together.",
  },
];
