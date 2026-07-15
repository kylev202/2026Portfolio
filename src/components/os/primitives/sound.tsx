"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * ──────────────────────────────────────────────────────────────────────────
 *  Interface sound — the instrument makes its own sounds.
 * ──────────────────────────────────────────────────────────────────────────
 *  A tiny Web Audio synth (no audio files, no deps) plays short, low, filtered
 *  blips shaped to match the dark-console mood: warm, quiet, no harsh
 *  transients. Delivered site-wide by global event delegation, so every
 *  interactive element with a hover/press affordance is "heard" without wiring
 *  a handler into each component.
 *
 *  Discipline mirrors the rest of the system:
 *   - OFF by default; opt-in via a visible toggle, remembered in localStorage.
 *   - Hover ticks only on fine pointers (no machine-gun on touch), and
 *     rate-limited so sweeping across a list doesn't stutter.
 *   - Audio is unlocked from inside the enable click (a real user gesture),
 *     satisfying browser autoplay policy.
 * ──────────────────────────────────────────────────────────────────────────
 */

type SfxName = "hover" | "tap" | "on" | "off" | "boot" | "bootOk" | "bootInfo" | "bootDone";

const STORAGE_KEY = "kylevos:sound:v1";

/* Anything you can click or that lights up on hover. Elements (or ancestors)
   carrying [data-no-sfx] opt out — used by the sound toggle, which voices its
   own on/off cue. Text inputs are intentionally excluded (no per-keystroke tick). */
export const INTERACTIVE =
  'a[href],button:not([disabled]),summary,[role="button"],[role="option"],[role="switch"],[role="menuitem"],[role="tab"],[tabindex]:not([tabindex="-1"]),.module';

type BlipSpec = {
  type: OscillatorType;
  freq: number;
  glideTo?: number;
  cutoff: number;
  peak: number;
  attack: number;
  release: number;
};

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastHoverAt = 0;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  /** Resume the context from within a user gesture (call on enable). */
  unlock() {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  play(name: SfxName) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;

    switch (name) {
      case "hover": {
        // Rate-limit so sweeping a row of links doesn't machine-gun; a hair of
        // pitch jitter keeps repeats from sounding mechanical.
        if (t - this.lastHoverAt < 0.04) return;
        this.lastHoverAt = t;
        this.blip(t, {
          type: "triangle",
          freq: 640 + Math.random() * 60,
          cutoff: 2600,
          peak: 0.045,
          attack: 0.002,
          release: 0.055,
        });
        return;
      }
      case "tap": {
        // A warm two-part confirm: a low body + a short click that dips in pitch.
        this.blip(t, { type: "sine", freq: 190, cutoff: 1400, peak: 0.1, attack: 0.001, release: 0.11 });
        this.blip(t, {
          type: "triangle",
          freq: 520,
          glideTo: 430,
          cutoff: 2200,
          peak: 0.06,
          attack: 0.001,
          release: 0.07,
        });
        return;
      }
      case "boot": {
        // A quiet data tick, one per streamed boot/transcript line — soft
        // enough to repeat many times without becoming a machine gun.
        this.blip(t, {
          type: "sine",
          freq: 900,
          cutoff: 3000,
          peak: 0.03,
          attack: 0.001,
          release: 0.03,
        });
        return;
      }
      case "bootOk": {
        // Systemd "[  OK  ]" confirm — brighter than a plain boot tick.
        this.blip(t, {
          type: "triangle",
          freq: 700,
          cutoff: 2800,
          peak: 0.05,
          attack: 0.001,
          release: 0.05,
        });
        return;
      }
      case "bootInfo": {
        // Systemd "[ INFO ]" — same weight as bootOk, lower and softer.
        this.blip(t, {
          type: "sine",
          freq: 500,
          cutoff: 2200,
          peak: 0.045,
          attack: 0.001,
          release: 0.06,
        });
        return;
      }
      case "bootDone": {
        // "System online" signature — a warmer, longer two-note rise than
        // the sound toggle's "on" cue.
        this.blip(t, {
          type: "triangle",
          freq: 460,
          cutoff: 2600,
          peak: 0.09,
          attack: 0.002,
          release: 0.1,
        });
        this.blip(t + 0.08, {
          type: "triangle",
          freq: 660,
          cutoff: 2600,
          peak: 0.09,
          attack: 0.002,
          release: 0.14,
        });
        return;
      }
      default: {
        // on / off — a two-note cue the sound switch voices for itself.
        const rising = name === "on";
        this.blip(t, {
          type: "triangle",
          freq: rising ? 440 : 620,
          cutoff: 2400,
          peak: 0.08,
          attack: 0.002,
          release: 0.09,
        });
        this.blip(t + 0.07, {
          type: "triangle",
          freq: rising ? 620 : 440,
          cutoff: 2400,
          peak: 0.08,
          attack: 0.002,
          release: 0.12,
        });
      }
    }
  }

  private blip(start: number, o: BlipSpec) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = o.cutoff;

    osc.type = o.type;
    osc.frequency.setValueAtTime(o.freq, start);
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, start + o.release);

    const end = start + o.attack + o.release;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(o.peak, start + o.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(lp).connect(gain).connect(master);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

const SoundCtx = createContext<{
  enabled: boolean;
  toggle: () => void;
  play: (name: SfxName) => void;
} | null>(null);

export function useSound() {
  const ctx = useContext(SoundCtx);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  // The synth is created on mount (never during render / SSR); every caller
  // fires only after a user interaction, so it's always ready in time.
  const engineRef = useRef<SfxEngine | null>(null);

  // Mirror reactive state into refs so the imperative, once-installed document
  // listeners always read the latest values without re-binding.
  const enabledRef = useRef(false);
  const fineRef = useRef(false);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    engineRef.current = new SfxEngine();
  }, []);

  // Restore the saved preference (SSR stays deterministic — always off first).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration
      if (window.localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
    } catch {
      /* storage unavailable — stay muted */
    }
  }, []);

  // Hover cues are for fine pointers only (a tick per tap is fine; a tick per
  // touch-scroll drift is not).
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      fineRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const play = useCallback((name: SfxName) => {
    if (!enabledRef.current) return;
    engineRef.current?.play(name);
  }, []);

  const toggle = useCallback(() => {
    // Side effects live outside setState so they fire exactly once (a setState
    // updater must be pure — StrictMode invokes it twice in dev). enabledRef is
    // updated eagerly so the document listeners are correct on the next event.
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);

    const engine = engineRef.current;
    if (engine) {
      engine.unlock(); // inside the click gesture → unlocks the AudioContext
      engine.play(next ? "on" : "off");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
  }, []);

  // Global delegation — every interactive element gets hover/press feedback
  // without touching each component. Capture phase so nothing can
  // stopPropagation its way out of being heard.
  useEffect(() => {
    let lastHover: Element | null = null;

    const match = (target: EventTarget | null): Element | null => {
      const el = target instanceof Element ? target.closest(INTERACTIVE) : null;
      if (!el || el.closest("[data-no-sfx]")) return null;
      return el;
    };

    const onOver = (e: PointerEvent) => {
      if (!enabledRef.current || !fineRef.current) return;
      const el = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      if (el === lastHover) return; // still inside the same control → silent
      lastHover = el;
      if (el && !el.closest("[data-no-sfx]")) engineRef.current?.play("hover");
    };

    const onDown = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      if (e.pointerType === "mouse" && e.button !== 0) return; // primary click only
      if (match(e.target)) engineRef.current?.play("tap");
    };

    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, []);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}
