import type { Config } from "tailwindcss";

/**
 * ──────────────────────────────────────────────────────────────────────────
 *  "THE RUNTIME" — a personal developer instrument.
 *  Dark, blue-tinted near-black surfaces · warm bone ink · one amber signal.
 *  Mood comes from contrast and depth, not from extra hues. (See DESIGN.md.)
 * ──────────────────────────────────────────────────────────────────────────
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Background ramp — cool, blue-tinted near-black.
        bg: {
          DEFAULT: "#0d0f14", // page background
          deep: "#08090d", // boot screen, deepest wells
        },
        surface: {
          DEFAULT: "#15181f", // window / panel fills
          raised: "#1d212a", // command bar, raised rows
        },
        line: {
          DEFAULT: "#2a2f3a", // hairlines, window chrome
          strong: "#3c424f", // focused borders, dividers
        },
        // Ink — warm off-white, set counter to the cool background.
        ink: {
          DEFAULT: "#e9e6df",
          dim: "#b8b3a9",
          // Lifted from #8a857b so small/tracked mono meta clears AA on the
          // tinted surfaces (not just on the page bg), without losing the step.
          faint: "#9b958a",
        },
        // Signal — the single accent. Warm amber against the cool dark.
        signal: {
          DEFAULT: "#f4a83a",
          dim: "#c47e2c",
          deep: "#5e3f1c",
        },
      },
      fontFamily: {
        // Mono carries the "machine": chrome, labels, data, identity headline.
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        // Sans carries readable prose + section headings.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.18em",
        wide: "0.28em",
      },
      maxWidth: {
        prose: "68ch",
        shell: "72rem",
      },
      // Semantic z-index scale (never arbitrary 9999).
      zIndex: {
        base: "0",
        rail: "20", // depth rail / fixed side instrument
        chrome: "30", // status bar / fixed OS chrome
        grain: "40", // ambient overlays (non-interactive)
        backdrop: "50", // command palette backdrop
        palette: "60", // command palette dialog
        toast: "70",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Soft amber inhale/exhale for the "available" status dot.
        "pulse-signal": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        // Terminal caret blink (used sparingly, on the prompt only).
        caret: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-signal": "pulse-signal 2.6s ease-in-out infinite",
        caret: "caret 1.1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
