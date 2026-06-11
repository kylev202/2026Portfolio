import { timeline } from "@/lib/content";

/** Career window — the path as a git log: a spine, commit nodes, a live HEAD. */
export default function PathApp() {
  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="addr text-ink-dim">~/path</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr">git log · {timeline.length} entries</span>
        <span className="addr ml-auto hidden sm:inline">newest first</span>
      </div>

      <div className="relative mt-7 ml-1 pl-8">
        <span
          aria-hidden
          className="absolute left-0 top-1 w-px bg-line"
          style={{ height: "calc(100% - 0.5rem)" }}
        />
        <ol>
          {timeline.map((item, i) => {
            const head = i === 0;
            return (
              <li key={`${item.period}-${item.title}`} className="relative pb-8 last:pb-0">
                <span
                  aria-hidden
                  className={`absolute -left-[2.05rem] top-1 h-3 w-3 rounded-full ${
                    head ? "led led-live" : "border border-line-strong bg-bg"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="readout text-signal/90">{item.period}</span>
                  {head && (
                    <span className="rounded border border-signal/40 px-1.5 font-mono text-[0.7rem] uppercase tracking-label text-signal">
                      head
                    </span>
                  )}
                  <span className="font-mono text-[0.7rem] tabular-nums text-ink-faint">
                    {String(timeline.length - i).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-ink">
                  {item.title}
                  <span className="font-normal text-ink-faint"> · {item.org}</span>
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-dim">{item.detail}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
