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
import { useRouter } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { nav, profile, socials } from "@/lib/content";
import { DUR, EASE } from "./primitives/anim";

type Command = {
  id: string;
  label: string;
  group: "Navigate" | "Open" | "Actions";
  hint?: string;
  keywords?: string;
  run: () => void | Promise<void>;
};

const CommandBarContext = createContext<{ open: () => void; toggle: () => void } | null>(null);

export function useCommandBar() {
  const ctx = useContext(CommandBarContext);
  if (!ctx) throw new Error("useCommandBar must be used inside <CommandBarProvider>");
  return ctx;
}

export function CommandBarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const lastFocused = useRef<HTMLElement | null>(null);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Global hotkey: ⌘K / Ctrl+K toggles the palette anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // Remember focus to restore it when the dialog closes, and lock body scroll.
  useEffect(() => {
    if (!isOpen) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [isOpen]);

  const ctx = useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <CommandBarContext.Provider value={ctx}>
      {children}
      <AnimatePresence>
        {isOpen && <Palette key="palette" onClose={close} reduced={!!reduced} />}
      </AnimatePresence>
    </CommandBarContext.Provider>
  );
}

function Palette({ onClose, reduced }: { onClose: () => void; reduced: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const scrollToId = useCallback(
    (id: string) => {
      onClose();
      // Defer so the dialog unmounts (and releases scroll lock) first.
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      });
    },
    [onClose, reduced],
  );

  const openExternal = useCallback(
    (href: string) => {
      onClose();
      window.open(href, "_blank", "noopener,noreferrer");
    },
    [onClose],
  );

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }, []);

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: "open-desktop",
        label: "Enter desktop",
        group: "Open",
        hint: "/desktop",
        keywords: "os windows apps launch operate gui",
        run: () => {
          onClose();
          router.push("/desktop");
        },
      },
    ];

    list.push(
      ...nav.map<Command>((n) => ({
        id: `nav-${n.id}`,
        label: n.label,
        group: "Navigate",
        hint: n.path,
        keywords: `${n.id} section ${n.path}`,
        run: () => scrollToId(n.id),
      })),
    );

    for (const s of socials) {
      const isEmail = s.href.startsWith("mailto:");
      list.push({
        id: `open-${s.label.toLowerCase()}`,
        label: isEmail ? `Email ${profile.handle}` : `Open ${s.label}`,
        group: "Open",
        hint: isEmail ? profile.email : s.href.replace(/^https?:\/\//, ""),
        keywords: s.label,
        run: () => {
          if (isEmail) window.location.href = s.href;
          else openExternal(s.href);
        },
      });
    }

    if (profile.resumeUrl) {
      list.push({
        id: "open-resume",
        label: "Open résumé",
        group: "Open",
        hint: "PDF",
        keywords: "cv resume pdf",
        run: () => openExternal(profile.resumeUrl),
      });
    }

    list.push(
      {
        id: "action-copy-email",
        label: "Copy email address",
        group: "Actions",
        hint: profile.email,
        keywords: "clipboard contact",
        run: copyEmail,
      },
      {
        id: "action-top",
        label: "Back to top",
        group: "Actions",
        hint: "scroll",
        keywords: "home hero start",
        run: () => scrollToId("top"),
      },
    );

    return list;
  }, [copyEmail, openExternal, scrollToId, router, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Focus the input on open.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the active option scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, filtered.length]);

  const runActive = () => {
    const cmd = filtered[active];
    if (cmd) void cmd.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(Math.max(0, filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        runActive();
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "Tab":
        // Combobox pattern: trap focus on the input, arrows drive selection.
        e.preventDefault();
        break;
    }
  };

  // Group the filtered commands for display while keeping a flat index for a11y.
  let runningIndex = -1;
  const groups: { name: Command["group"]; items: { cmd: Command; index: number }[] }[] = [];
  for (const cmd of filtered) {
    runningIndex += 1;
    const idx = runningIndex;
    const g = groups.find((x) => x.name === cmd.group);
    if (g) g.items.push({ cmd, index: idx });
    else groups.push({ name: cmd.group, items: [{ cmd, index: idx }] });
  }

  const backdropTransition = reduced ? { duration: 0 } : { duration: DUR.micro, ease: EASE };
  const dialogTransition = reduced ? { duration: 0 } : { duration: DUR.quick, ease: EASE };

  return (
    <div className="fixed inset-0 z-palette flex items-start justify-center">
      {/* Backdrop */}
      <m.button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 z-backdrop cursor-default bg-bg-deep/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={backdropTransition}
        onClick={onClose}
      />

      {/* Dialog */}
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="window relative z-palette mt-[16vh] w-[min(92vw,40rem)] overflow-hidden bg-surface-raised/95"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
        transition={dialogTransition}
        onKeyDown={onKeyDown}
      >
        {/* Prompt + input */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span aria-hidden className="font-mono text-sm text-signal">
            ❯
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Type a command or jump to a section…"
            aria-label="Search commands"
            aria-controls="command-listbox"
            aria-activedescendant={
              filtered[active] ? `cmd-${filtered[active].id}` : undefined
            }
            role="combobox"
            aria-expanded={filtered.length > 0 ? "true" : "false"}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <span className="kbd" aria-hidden>
            esc
          </span>
        </div>

        {/* Results — div-based listbox/group/option (valid ARIA child roles). */}
        {filtered.length === 0 ? (
          <p
            id="command-listbox"
            className="px-3 py-8 text-center font-mono text-xs text-ink-faint"
          >
            No matching commands
          </p>
        ) : (
          <div
            ref={listRef}
            id="command-listbox"
            role="listbox"
            aria-label="Commands"
            className="max-h-[min(56vh,22rem)] overflow-y-auto p-2"
          >
            {groups.map((group) => (
              <div key={group.name} role="group" aria-label={group.name} data-label={group.name} className="cmd-group">
                {group.items.map(({ cmd, index }) => {
                  const isActive = index === active;
                  return (
                    <div
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={isActive ? "true" : "false"}
                      data-active={isActive}
                      onMouseMove={() => setActive(index)}
                      onClick={() => void cmd.run()}
                      className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-signal/10 text-ink" : "text-ink-dim"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`font-mono text-xs ${isActive ? "text-signal" : "text-ink-faint"}`}
                      >
                        ▸
                      </span>
                      <span className="font-sans">{cmd.label}</span>
                      {cmd.hint && (
                        <span className="ml-auto truncate pl-4 font-mono text-[0.7rem] text-ink-faint">
                          {cmd.hint}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Footer hints + copy feedback */}
        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-ink-faint">
          <span className="flex items-center gap-1.5 font-mono text-[0.68rem]">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span>
            navigate
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[0.68rem]">
            <span className="kbd">↵</span>
            run
          </span>
          <span aria-live="polite" className="ml-auto font-mono text-[0.7rem] text-signal">
            {copied ? "email copied ✓" : ""}
          </span>
        </div>
      </m.div>
    </div>
  );
}
