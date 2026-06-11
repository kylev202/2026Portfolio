"use client";

import { m, useReducedMotion } from "framer-motion";
import { EASE } from "../primitives/anim";
import { APPS } from "./apps";
import { useWindows } from "./WindowManager";

/**
 * The classic desktop affordance: a column of app icons, top-left. Single click
 * opens (more accessible than double-click and standard on the web); Enter /
 * Space activate. Hidden on mobile, where the dock is the launcher.
 */
export default function DesktopIcons() {
  const { open, registerOpener, settings } = useWindows();
  const reduced = useReducedMotion();
  const calm = reduced || settings.calm;

  return (
    <m.ul
      className="absolute left-[max(0.5rem,env(safe-area-inset-left))] top-[calc(env(safe-area-inset-top)_+_3.5rem)] z-0 hidden w-[5.5rem] flex-col gap-1 sm:flex"
      initial={calm ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={calm ? { duration: 0 } : { delay: 0.25, duration: 0.4, ease: EASE }}
    >
      {APPS.map((app, i) => (
        <m.li
          key={app.id}
          initial={calm ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={calm ? { duration: 0 } : { delay: 0.3 + i * 0.05, duration: 0.32, ease: EASE }}
        >
          <button
            type="button"
            title={`Open ${app.name}`}
            onClick={(e) => {
              registerOpener(e.currentTarget);
              open(app);
            }}
            className="group flex w-full flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-colors hover:bg-surface/50 focus-visible:bg-surface/50"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-surface/60 text-ink-dim transition-colors group-hover:border-line-strong group-hover:text-ink">
              <app.Icon className="h-5 w-5" />
            </span>
            <span className="font-mono text-[0.7rem] text-ink-dim transition-colors group-hover:text-ink">
              {app.name}
            </span>
          </button>
        </m.li>
      ))}
    </m.ul>
  );
}
