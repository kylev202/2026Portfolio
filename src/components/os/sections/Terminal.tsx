"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { about, profile, projects, skills, socials, system, timeline } from "@/lib/content";

/**
 * The uplink — a genuinely interactive REPL, not a scripted log. Every command
 * returns a real fact from content (nothing fabricated). It's the proof in the
 * pudding: a recruiter can *operate* the site. The explicit buttons in Contact
 * remain the fast path for anyone who won't type.
 */

type Block = { id: number; kind: "in" | "out" | "sys"; content: ReactNode };

const PROMPT = `${profile.handle}@os`;

function List({ rows }: { rows: ReactNode[] }) {
  return (
    <div className="space-y-0.5">
      {rows.map((r, i) => (
        <div key={i} className="term-line">
          {r}
        </div>
      ))}
    </div>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      className="link-underline text-signal"
    >
      {children}
    </a>
  );
}

export default function Terminal({ embedded = false }: { embedded?: boolean } = {}) {
  const seq = useRef(0);
  const nextId = useCallback(() => (seq.current += 1), []);

  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [history, setHistory] = useState<Block[]>(() => [
    { id: 0, kind: "sys", content: `${system.name} ${system.version} — uplink established` },
    {
      id: -1,
      kind: "sys",
      content: (
        <span className="text-ink-faint">
          type <span className="text-signal">help</span> or tap a command below.
        </span>
      ),
    },
  ]);
  const [recall, setRecall] = useState<string[]>([]);
  const [recallIdx, setRecallIdx] = useState<number | null>(null);

  // The command table. Aliases share a handler; `help` lists the primary names.
  const commands = useMemo<
    Record<string, { primary?: string; desc?: string; run: () => ReactNode | Promise<ReactNode> }>
  >(() => {
    const table: Record<
      string,
      { primary?: string; desc?: string; run: () => ReactNode | Promise<ReactNode> }
    > = {
      whoami: {
        primary: "whoami",
        desc: "who you're talking to",
        run: () => `${profile.name} · ${profile.role} · ${profile.location}`,
      },
      about: {
        primary: "about",
        desc: "the short version",
        run: () => about.paragraphs[0],
      },
      skills: {
        primary: "skills",
        desc: "the stack",
        run: () => (
          <List
            rows={skills.map((g) => (
              <span key={g.group}>
                <span className="text-ink-faint">{g.group.padEnd(14)}</span>
                <span className="text-ink-dim">{g.items.join(", ")}</span>
              </span>
            ))}
          />
        ),
      },
      work: {
        primary: "work",
        desc: "selected projects",
        run: () => (
          <List
            rows={projects.map((p, i) => (
              <span key={p.title}>
                <span className="text-signal">{String(i + 1).padStart(2, "0")} </span>
                <span className="text-ink">{p.title}</span>
                <span className="text-ink-faint">
                  {"  "}
                  {p.year}
                  {p.status ? ` · ${p.status}` : ""}
                </span>
              </span>
            ))}
          />
        ),
      },
      path: {
        primary: "path",
        desc: "how i got here",
        run: () => (
          <List
            rows={timeline.map((t) => (
              <span key={`${t.period}-${t.title}`}>
                <span className="text-ink-faint">{t.period.padEnd(12)}</span>
                <span className="text-ink-dim">
                  {t.title} — {t.org}
                </span>
              </span>
            ))}
          />
        ),
      },
      socials: {
        primary: "socials",
        desc: "find me elsewhere",
        run: () => (
          <List
            rows={socials.map((s) => (
              <span key={s.label}>
                <span className="text-ink-faint">{s.label.padEnd(10)}</span>
                <Ext href={s.href}>{s.href.replace(/^https?:\/\//, "").replace(/^mailto:/, "")}</Ext>
              </span>
            ))}
          />
        ),
      },
      email: {
        primary: "email",
        desc: "copy my address",
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            return (
              <span>
                copied <span className="text-ink">{profile.email}</span> to clipboard ✓
              </span>
            );
          } catch {
            return (
              <span>
                <Ext href={`mailto:${profile.email}`}>{profile.email}</Ext>
              </span>
            );
          }
        },
      },
    };

    if (profile.resumeUrl) {
      table.resume = {
        primary: "resume",
        desc: "open my résumé",
        run: () => {
          window.open(profile.resumeUrl, "_blank", "noopener,noreferrer");
          return (
            <span>
              opening résumé… <Ext href={profile.resumeUrl}>{profile.resumeUrl}</Ext>
            </span>
          );
        },
      };
    }

    // a wry easter egg — still honest about the call to action
    table.sudo = {
      run: () => (
        <span>
          permission granted. the fastest way in:{" "}
          <Ext href={`mailto:${profile.email}`}>{profile.email}</Ext>
        </span>
      ),
    };

    // aliases
    table.ls = table.work;
    table.stack = table.skills;
    table.log = table.path;
    table.contact = table.socials;
    table.hire = table.sudo;

    return table;
  }, []);

  const primaryCommands = useMemo(
    () => Object.values(commands).filter((c) => c.primary),
    [commands],
  );

  const push = useCallback((blocks: Block[]) => setHistory((h) => [...h, ...blocks]), []);

  const run = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      // echo the input line either way
      const inBlock: Block = { id: nextId(), kind: "in", content: cmd };

      if (cmd === "") {
        push([inBlock]);
        return;
      }
      if (cmd === "clear" || cmd === "cls") {
        setHistory([]);
        return;
      }

      setRecall((r) => [cmd, ...r].slice(0, 30));

      const name = cmd.split(/\s+/)[0].toLowerCase();

      if (name === "help") {
        push([
          inBlock,
          {
            id: nextId(),
            kind: "out",
            content: (
              <List
                rows={[
                  <span key="h" className="text-ink-faint">
                    available commands:
                  </span>,
                  ...primaryCommands.map((c) => (
                    <span key={c.primary}>
                      <span className="text-signal">{(c.primary ?? "").padEnd(10)}</span>
                      <span className="text-ink-dim">{c.desc}</span>
                    </span>
                  )),
                  <span key="clr">
                    <span className="text-signal">{"clear".padEnd(10)}</span>
                    <span className="text-ink-dim">wipe the screen</span>
                  </span>,
                ]}
              />
            ),
          },
        ]);
        return;
      }

      const entry = commands[name];
      if (!entry) {
        push([
          inBlock,
          {
            id: nextId(),
            kind: "out",
            content: (
              <span className="text-ink-dim">
                command not found: <span className="text-ink">{name}</span> — try{" "}
                <span className="text-signal">help</span>
              </span>
            ),
          },
        ]);
        return;
      }

      // show the input immediately, then resolve (possibly async) output
      push([inBlock]);
      const output = await entry.run();
      push([{ id: nextId(), kind: "out", content: output }]);
    },
    [commands, primaryCommands, push, nextId],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value;
    setValue("");
    setRecallIdx(null);
    void run(v);
  };

  // Up/Down recall previous inputs.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (recall.length === 0) return;
      const idx = recallIdx === null ? 0 : Math.min(recallIdx + 1, recall.length - 1);
      setRecallIdx(idx);
      setValue(recall[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (recallIdx === null) return;
      const idx = recallIdx - 1;
      if (idx < 0) {
        setRecallIdx(null);
        setValue("");
      } else {
        setRecallIdx(idx);
        setValue(recall[idx]);
      }
    }
  };

  // Keep the newest output in view.
  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const focusInput = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (!t.closest("a, button, input")) inputRef.current?.focus();
  };

  return (
    <div
      className={
        embedded
          ? "flex h-full flex-col overflow-hidden"
          : "window flex flex-col overflow-hidden"
      }
      onClick={focusInput}
      role="group"
      aria-label="Interactive contact terminal"
    >
      {!embedded && (
        <div className="window-bar">
          <div className="window-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="font-mono text-xs text-ink-dim">~/uplink — secure channel</span>
          <span className="readout ml-auto hidden text-signal/80 sm:block">● connected</span>
        </div>
      )}

      {/* Output log */}
      <div
        ref={screenRef}
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        className={`term-screen overflow-y-auto px-4 py-4 sm:px-5 ${
          embedded ? "min-h-0 flex-1" : "max-h-72"
        }`}
      >
        {history.map((b) => (
          <div key={b.id} className="mb-1.5">
            {b.kind === "in" ? (
              <div className="flex gap-2">
                <span aria-hidden className="shrink-0 text-signal">
                  {PROMPT} ❯
                </span>
                <span className="text-ink">{b.content}</span>
              </div>
            ) : b.kind === "sys" ? (
              <div className="text-ink-faint">{b.content}</div>
            ) : (
              <div className="text-ink-dim">{b.content}</div>
            )}
          </div>
        ))}

        {/* Active input line */}
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <label htmlFor="uplink-input" className="shrink-0 text-signal">
            {PROMPT} ❯
          </label>
          <input
            id="uplink-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Type a command, then press Enter"
            className="w-full min-w-0 bg-transparent text-ink caret-signal placeholder:text-ink-faint focus:outline-none"
            placeholder="help"
          />
        </form>
      </div>

      {/* One-tap suggestions for non-typers */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
        <span className="addr mr-1">try</span>
        {["help", "whoami", "work", "email"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              inputRef.current?.focus();
              void run(c);
            }}
            className="rounded border border-line px-2 py-0.5 font-mono text-[0.72rem] text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
