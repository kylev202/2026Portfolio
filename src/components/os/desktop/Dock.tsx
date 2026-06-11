"use client";

import { useRef } from "react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { EASE } from "../primitives/anim";
import { APPS, type AppDef } from "./apps";
import { useWindows } from "./WindowManager";

const BASE = 44; // resting tile size (px)
const PEAK = 62; // size directly under the pointer
const REACH = 110; // px on either side the magnification influences

/**
 * The dock: launches apps, shows a running indicator, restores/focuses. On a
 * fine pointer it magnifies under the cursor (Plank/macOS style) via a shared
 * `mouseX` motion value; touch / reduced-motion get a clean static dock.
 */
export default function Dock() {
  const { mobile } = useWindows();
  const reduced = useReducedMotion();
  const magnify = !mobile && !reduced;

  // Pointer x in viewport coords; Infinity == "away", so every tile rests.
  const mouseX = useMotionValue(Infinity);

  return (
    <m.div
      className="absolute inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      initial={reduced ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.55, ease: EASE, delay: 0.15 }}
    >
      <div
        onPointerMove={(e) => {
          if (magnify && e.pointerType === "mouse") mouseX.set(e.clientX);
        }}
        onPointerLeave={() => mouseX.set(Infinity)}
        className="no-scrollbar flex max-w-full items-end gap-1 overflow-x-auto rounded-2xl border border-line bg-surface-raised/80 p-2 shadow-[0_18px_44px_-22px_rgb(0_0_0/0.85)] backdrop-blur-xl sm:gap-1.5"
      >
        {APPS.map((app) => (
          <DockItem key={app.id} app={app} mouseX={mouseX} magnify={magnify} />
        ))}
      </div>
    </m.div>
  );
}

function DockItem({
  app,
  mouseX,
  magnify,
}: {
  app: AppDef;
  mouseX: MotionValue<number>;
  magnify: boolean;
}) {
  const { open, isOpen, windows, focus, toggleMinimize, registerOpener } = useWindows();
  const ref = useRef<HTMLButtonElement>(null);

  const openNow = isOpen(app.id);
  const win = windows.find((w) => w.id === app.id);

  // Distance from pointer to this tile's centre → size, smoothed by a spring.
  const distance = useTransform(mouseX, (val) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return REACH * 2;
    return val - (b.x + b.width / 2);
  });
  const sizeTarget = useTransform(distance, [-REACH, 0, REACH], [BASE, PEAK, BASE]);
  const size = useSpring(sizeTarget, { stiffness: 340, damping: 22, mass: 0.45 });
  // Icon grows a touch more aggressively than the tile so it stays crisp.
  const iconScale = useTransform(size, [BASE, PEAK], [1, 1.32]);
  const labelLift = useTransform(size, [BASE, PEAK], [0, -6]);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!openNow) {
      registerOpener(e.currentTarget); // only matters when launching
      open(app);
    } else if (win?.minimized) {
      toggleMinimize(app.id);
    } else {
      focus(app.id);
    }
  };

  return (
    <m.button
      ref={ref}
      type="button"
      onClick={onClick}
      title={app.name}
      aria-label={openNow ? `Focus ${app.name}` : `Open ${app.name}`}
      style={magnify ? { width: size, height: size } : undefined}
      whileTap={{ scale: 0.9 }}
      className={`group relative grid shrink-0 place-items-center rounded-xl text-ink-dim transition-colors hover:text-ink ${
        magnify ? "" : "h-11 w-11 sm:h-12 sm:w-12"
      }`}
    >
      {/* Hover wash sits behind the icon so the tile itself never jumps. */}
      <span
        aria-hidden
        className="absolute inset-1 rounded-lg bg-surface opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <m.span aria-hidden className="relative" style={magnify ? { scale: iconScale } : undefined}>
        <app.Icon className="h-5 w-5" />
      </m.span>

      {/* Running indicator — an amber pill that widens when active. */}
      <span
        aria-hidden
        className={`absolute bottom-1 h-1 rounded-full transition-all duration-300 ${
          openNow
            ? win?.minimized
              ? "w-1.5 bg-signal/50"
              : "w-4 bg-signal"
            : "w-1 bg-transparent"
        }`}
      />

      {/* Tooltip — lifts a little further when the tile is magnified. */}
      <m.span
        aria-hidden
        style={magnify ? { y: labelLift } : undefined}
        className="pointer-events-none absolute -top-9 hidden whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 font-mono text-[0.7rem] text-ink opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 sm:block"
      >
        {app.name}
      </m.span>
    </m.button>
  );
}
