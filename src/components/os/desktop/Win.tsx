"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { EASE } from "../primitives/anim";
import { MENUBAR_H, useWindows, type Rect, type WinState } from "./WindowManager";
import type { AppDef } from "./apps";

/**
 * A single desktop window: chrome + the app body. Pointer-driven drag (title
 * bar) and resize (corner), keyboard move (arrows on the focused title bar),
 * and working close / minimise / maximise. Floating geometry lives in the
 * window manager; this component only reads it and reports deltas back.
 */
export default function Win({ win, app }: { win: WinState; app: AppDef }) {
  const {
    focus,
    close,
    toggleMinimize,
    toggleMaximize,
    setRect,
    zOf,
    isTop,
    mobile,
    viewport,
    settings,
  } = useWindows();
  const reduced = useReducedMotion();
  const calm = reduced || settings.calm;

  const ref = useRef<HTMLDivElement>(null);
  const top = isTop(win.id);
  const [interacting, setInteracting] = useState(false);

  const Body = app.Component;
  const Icon = app.Icon;

  // Move keyboard/screen-reader focus into a freshly opened window, unless the
  // app focuses its own content (the Terminal grabs its input).
  useEffect(() => {
    if (!app.autoFocusContent) ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drag (title bar) ──────────────────────────────────────────────────────
  const drag = useRef<{ px: number; py: number; rect: Rect } | null>(null);

  const onBarPointerDown = (e: React.PointerEvent) => {
    if (mobile || win.maximized) return;
    if ((e.target as HTMLElement).closest("button")) return; // leave controls alone
    focus(win.id);
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported for this pointer; bubbling still tracks the drag */
    }
    drag.current = { px: e.clientX, py: e.clientY, rect: { ...win.rect } };
    setInteracting(true);
  };

  const onBarPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const x = clamp(
      d.rect.x + (e.clientX - d.px),
      -(d.rect.w - 120),
      viewport.w - 120,
    );
    const y = clamp(d.rect.y + (e.clientY - d.py), MENUBAR_H, viewport.h - 52);
    setRect(win.id, { ...d.rect, x, y });
  };

  const endBar = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    setInteracting(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const onBarKeyDown = (e: React.KeyboardEvent) => {
    if (mobile || win.maximized) return;
    if (e.target !== e.currentTarget) return; // only when the bar itself is focused
    const step = e.shiftKey ? 1 : 16;
    const r = win.rect;
    switch (e.key) {
      case "ArrowLeft":
        setRect(win.id, { ...r, x: r.x - step });
        break;
      case "ArrowRight":
        setRect(win.id, { ...r, x: r.x + step });
        break;
      case "ArrowUp":
        setRect(win.id, { ...r, y: Math.max(MENUBAR_H, r.y - step) });
        break;
      case "ArrowDown":
        setRect(win.id, { ...r, y: r.y + step });
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  // ── Resize (bottom-right handle) ──────────────────────────────────────────
  const resize = useRef<{ px: number; py: number; rect: Rect } | null>(null);

  const onResizePointerDown = (e: React.PointerEvent) => {
    if (mobile || win.maximized) return;
    e.preventDefault();
    e.stopPropagation();
    focus(win.id);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported for this pointer */
    }
    resize.current = { px: e.clientX, py: e.clientY, rect: { ...win.rect } };
    setInteracting(true);
  };

  const onResizePointerMove = (e: React.PointerEvent) => {
    const r = resize.current;
    if (!r) return;
    const w = clamp(r.rect.w + (e.clientX - r.px), win.minSize.w, viewport.w - r.rect.x - 8);
    const h = clamp(r.rect.h + (e.clientY - r.py), win.minSize.h, viewport.h - r.rect.y - 8);
    setRect(win.id, { ...r.rect, w, h });
  };

  const endResize = (e: React.PointerEvent) => {
    if (!resize.current) return;
    resize.current = null;
    setInteracting(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const z = 10 + Math.max(0, zOf(win.id));

  return (
    <m.div
      ref={ref}
      role="dialog"
      aria-label={app.name}
      aria-modal={false}
      tabIndex={-1}
      onPointerDownCapture={() => focus(win.id)}
      className={`absolute flex flex-col overflow-hidden rounded-lg border bg-surface/95 outline-none backdrop-blur-[3px] ${
        top ? "border-line-strong" : "border-line"
      } ${win.minimized ? "hidden" : ""} ${
        interacting || calm
          ? ""
          : "transition-[left,top,width,height,box-shadow] duration-200 ease-out"
      }`}
      style={{
        left: win.rect.x,
        top: win.rect.y,
        width: win.rect.w,
        height: win.rect.h,
        zIndex: z,
        boxShadow: top
          ? "0 1px 0 0 rgb(60 66 79) inset, 0 24px 56px -20px rgb(0 0 0 / 0.85)"
          : "0 1px 0 0 rgb(42 47 58) inset, 0 14px 36px -18px rgb(0 0 0 / 0.7)",
      }}
      initial={calm ? false : { opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={calm ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }}
      transition={calm ? { duration: 0 } : { duration: 0.18, ease: EASE }}
    >
      {/* Title bar / drag handle */}
      <div
        className="window-bar shrink-0 touch-none cursor-grab select-none active:cursor-grabbing"
        onPointerDown={onBarPointerDown}
        onPointerMove={onBarPointerMove}
        onPointerUp={endBar}
        onPointerCancel={endBar}
        onDoubleClick={() => !mobile && toggleMaximize(win.id)}
        onKeyDown={onBarKeyDown}
        aria-label={`${app.name} window title bar (arrow keys move, double-click maximises)`}
        tabIndex={0}
      >
        <div className="window-dots">
          <button
            type="button"
            className="win-dot"
            aria-label={`Close ${app.name}`}
            onClick={() => close(win.id)}
          >
            <span className="win-dot-face">×</span>
          </button>
          <button
            type="button"
            className="win-dot"
            aria-label={`Minimise ${app.name}`}
            onClick={() => toggleMinimize(win.id)}
          >
            <span className="win-dot-face">–</span>
          </button>
          {!mobile && (
            <button
              type="button"
              className="win-dot"
              aria-label={`${win.maximized ? "Restore" : "Maximise"} ${app.name}`}
              onClick={() => toggleMaximize(win.id)}
            >
              <span className="win-dot-face">▢</span>
            </button>
          )}
        </div>

        <span className="ml-1 inline-flex items-center gap-2 font-mono text-xs text-ink-dim">
          <Icon className="h-3.5 w-3.5 text-ink-faint" />
          {win.title}
        </span>

        {top && (
          <span className="readout ml-auto hidden text-[0.7rem] text-signal/70 sm:block">
            active
          </span>
        )}
      </div>

      {/* App body */}
      <div className="min-h-0 flex-1">
        <Body />
      </div>

      {/* Resize handle */}
      {!mobile && !win.maximized && (
        <div
          className="win-resize"
          aria-hidden
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        >
          <span className="mb-1 mr-1 h-2 w-2 border-b border-r border-line-strong" />
        </div>
      )}
    </m.div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
