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
 *  Window manager — the state engine behind the desktop.
 * ──────────────────────────────────────────────────────────────────────────
 *  Owns every open window (one per app), the focus/z-order, min/max/restore,
 *  live geometry during drag + resize, the usable desktop "area", and the
 *  persisted desktop settings. Deliberately knows nothing about the app
 *  registry — callers pass a LaunchSpec into `open`, so there's no import cycle
 *  (registry → app components → this hook).
 * ──────────────────────────────────────────────────────────────────────────
 */

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };

export type WinState = {
  id: string; // == app id (one window per app)
  title: string; // title-bar path, e.g. "~/uplink"
  rect: Rect; // current floating geometry
  minimized: boolean;
  maximized: boolean;
  restore?: Rect; // geometry to return to when un-maximizing
  minSize: Size;
};

/** What a launcher (dock / icon / palette) hands to `open`. */
export type LaunchSpec = {
  id: string;
  title: string;
  defaultSize: Size;
  minSize?: Size;
};

export type Wallpaper = "grid" | "deep" | "rules";
export type Settings = { wallpaper: Wallpaper; calm: boolean };

export const MENUBAR_H = 44; // fixed top bar (h-11)
const DOCK_RESERVE = 84; // space the dock occupies at the bottom
const SPAWN_MARGIN = 24; // inset of the first spawned window
const CASCADE = 30; // per-window cascade offset
const DEFAULT_MIN: Size = { w: 300, h: 200 };

type Viewport = { w: number; h: number };

function readViewport(): Viewport {
  if (typeof window === "undefined") return { w: 1280, h: 800 };
  return { w: window.innerWidth, h: window.innerHeight };
}

/**
 * Treat as "mobile" (full-screen windows, no drag/resize) when the viewport is
 * narrow OR short. The height test catches landscape phones, where floating
 * windows would be uselessly cramped.
 */
const isMobileVP = (vp: Viewport) => vp.w < 768 || vp.h < 480;

/** The rectangle a maximized window fills (leaves room for bar + dock). */
function maxRect(vp: Viewport): Rect {
  const mobile = isMobileVP(vp);
  const gap = mobile ? 0 : 10;
  return {
    x: gap,
    y: MENUBAR_H + gap,
    w: vp.w - gap * 2,
    h: vp.h - MENUBAR_H - (mobile ? 64 : DOCK_RESERVE) - gap * 2,
  };
}

/** Where a freshly opened floating window lands, cascaded by how many are open. */
function spawnRect(spec: LaunchSpec, count: number, vp: Viewport): Rect {
  if (isMobileVP(vp)) return maxRect(vp);
  const usableW = vp.w - SPAWN_MARGIN * 2;
  const usableH = vp.h - MENUBAR_H - DOCK_RESERVE - SPAWN_MARGIN * 2;
  const w = Math.min(spec.defaultSize.w, usableW);
  const h = Math.min(spec.defaultSize.h, usableH);
  // Center, then cascade; wrap the cascade so it never marches off-screen.
  const baseX = (vp.w - w) / 2;
  const baseY = MENUBAR_H + Math.max(SPAWN_MARGIN, (vp.h - MENUBAR_H - DOCK_RESERVE - h) / 2.4);
  const step = (count % 5) * CASCADE;
  return clampRect({ x: baseX + step, y: baseY + step, w, h }, vp);
}

/** Keep a window inside the desktop, always leaving the title bar grabbable. */
function clampRect(rect: Rect, vp: Viewport): Rect {
  const maxW = vp.w - 8;
  const maxH = vp.h - MENUBAR_H - 8;
  const w = Math.min(rect.w, maxW);
  const h = Math.min(rect.h, maxH);
  const x = Math.min(Math.max(rect.x, -(w - 120)), vp.w - 120);
  const y = Math.min(Math.max(rect.y, MENUBAR_H), vp.h - 52);
  return { x, y, w, h };
}

type Ctx = {
  windows: WinState[];
  order: string[]; // focus order, last == topmost
  settings: Settings;
  viewport: Viewport;
  mobile: boolean;
  zOf: (id: string) => number;
  isOpen: (id: string) => boolean;
  isTop: (id: string) => boolean;
  open: (spec: LaunchSpec) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  setRect: (id: string, rect: Rect) => void;
  moveBy: (id: string, dx: number, dy: number) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  registerOpener: (el: HTMLElement | null) => void;
};

const WindowCtx = createContext<Ctx | null>(null);

export function useWindows() {
  const ctx = useContext(WindowCtx);
  if (!ctx) throw new Error("useWindows must be used inside <WindowManager>");
  return ctx;
}

const SETTINGS_KEY = "kylevos:settings:v1";

export function WindowManager({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WinState[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [viewport, setViewport] = useState<Viewport>(() => readViewport());
  const [settings, setSettings] = useState<Settings>({ wallpaper: "grid", calm: false });

  // Element to refocus when a given window closes (the thing that launched it).
  const openers = useRef<Map<string, HTMLElement | null>>(new Map());
  const pendingOpener = useRef<HTMLElement | null>(null);

  const mobile = isMobileVP(viewport);

  // Hydrate persisted settings after mount (keeps SSR markup deterministic).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration
      if (raw) setSettings((s) => ({ ...s, ...(JSON.parse(raw) as Partial<Settings>) }));
    } catch {
      /* ignore unavailable / malformed storage */
    }
  }, []);

  // Track viewport; reflow maximized windows and clamp floating ones on resize.
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const vp = readViewport();
        const nowMobile = isMobileVP(vp);
        setViewport(vp);
        setWindows((ws) =>
          ws.map((w) => {
            // On (or into) mobile/landscape-phone, force full-screen windows.
            if (nowMobile) return { ...w, maximized: true, rect: maxRect(vp) };
            return w.maximized
              ? { ...w, rect: maxRect(vp) }
              : { ...w, rect: clampRect(w.rect, vp) };
          }),
        );
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const focus = useCallback((id: string) => {
    setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((x) => x !== id), id]));
  }, []);

  const open = useCallback(
    (spec: LaunchSpec) => {
      // Remember what to refocus on close.
      const opener =
        pendingOpener.current ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      pendingOpener.current = null;

      setWindows((ws) => {
        const existing = ws.find((w) => w.id === spec.id);
        if (existing) {
          // Already open — un-minimize; geometry untouched.
          return ws.map((w) => (w.id === spec.id ? { ...w, minimized: false } : w));
        }
        if (!openers.current.has(spec.id)) openers.current.set(spec.id, opener);
        const vp = readViewport();
        const startMaximized = isMobileVP(vp);
        const rect = startMaximized ? maxRect(vp) : spawnRect(spec, ws.length, vp);
        const next: WinState = {
          id: spec.id,
          title: spec.title,
          rect,
          minimized: false,
          maximized: startMaximized,
          minSize: spec.minSize ?? DEFAULT_MIN,
        };
        return [...ws, next];
      });
      focus(spec.id);
    },
    [focus],
  );

  const registerOpener = useCallback((el: HTMLElement | null) => {
    pendingOpener.current = el;
  }, []);

  const close = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
    setOrder((o) => o.filter((x) => x !== id));
    const opener = openers.current.get(id);
    openers.current.delete(id);
    // Restore focus to the launcher (or fall back to the body) after unmount.
    window.requestAnimationFrame(() => {
      if (opener && document.contains(opener)) opener.focus();
    });
  }, []);

  const toggleMinimize = useCallback(
    (id: string) => {
      const win = windows.find((w) => w.id === id);
      if (!win) return;
      const next = !win.minimized;
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: next } : w)));
      // Minimizing drops the window to the bottom (focus falls to the next
      // visible one); restoring lifts it back to the top.
      setOrder((o) => {
        const rest = o.filter((x) => x !== id);
        return next ? [id, ...rest] : [...rest, id];
      });
    },
    [windows],
  );

  const toggleMaximize = useCallback(
    (id: string) => {
      setWindows((ws) =>
        ws.map((w) => {
          if (w.id !== id) return w;
          if (w.maximized) return { ...w, maximized: false, rect: w.restore ?? w.rect };
          return { ...w, maximized: true, restore: w.rect, rect: maxRect(viewport) };
        }),
      );
      focus(id);
    },
    [viewport, focus],
  );

  const setRect = useCallback((id: string, rect: Rect) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const moveBy = useCallback((id: string, dx: number, dy: number) => {
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id && !w.maximized
          ? { ...w, rect: { ...w.rect, x: w.rect.x + dx, y: w.rect.y + dy } }
          : w,
      ),
    );
  }, []);

  const setSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => {
      const next = { ...s, [key]: value };
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const zOf = useCallback((id: string) => order.indexOf(id), [order]);
  const isOpen = useCallback((id: string) => windows.some((w) => w.id === id), [windows]);
  const isTop = useCallback(
    (id: string) => {
      // Topmost among non-minimized windows.
      for (let i = order.length - 1; i >= 0; i--) {
        const w = windows.find((x) => x.id === order[i]);
        if (w && !w.minimized) return w.id === id;
      }
      return false;
    },
    [order, windows],
  );

  const value = useMemo<Ctx>(
    () => ({
      windows,
      order,
      settings,
      viewport,
      mobile,
      zOf,
      isOpen,
      isTop,
      open,
      close,
      focus,
      toggleMinimize,
      toggleMaximize,
      setRect,
      moveBy,
      setSetting,
      registerOpener,
    }),
    [
      windows,
      order,
      settings,
      viewport,
      mobile,
      zOf,
      isOpen,
      isTop,
      open,
      close,
      focus,
      toggleMinimize,
      toggleMaximize,
      setRect,
      moveBy,
      setSetting,
      registerOpener,
    ],
  );

  return <WindowCtx.Provider value={value}>{children}</WindowCtx.Provider>;
}
