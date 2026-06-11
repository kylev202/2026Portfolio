import { projects } from "@/lib/content";
import Reveal from "../primitives/Reveal";

const LIVE = new Set(["live", "shipped"]);

/** Treat empty or placeholder ("#") URLs as absent so we never render a dead link. */
const isLink = (url?: string) => !!url && url !== "#";

/**
 * Subsystem 02 — "the filesystem". Projects as mounted volumes in a directory
 * listing: full-width rows, a status LED, an oversized ghosted year filling the
 * right margin, and a hairline that fills left-to-right on hover (a volume
 * "mounting"). Each row expands in place (native <details>, works without JS)
 * into a two-column manifest.
 */
export default function Work() {
  return (
    <Reveal as="section" id="work" className="scroll-mt-24 py-8">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="font-mono text-xs font-medium text-ink">Projects</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr text-ink-dim">~/work</span>
        <span className="addr hidden sm:inline">{projects.length} volumes mounted</span>
        <span className="ml-auto hidden font-mono text-xs text-ink-faint sm:inline">
          ↵ expand a row
        </span>
      </div>

      <h2 id="work-title" className="text-section mt-8 text-ink">
        Selected work
      </h2>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        A few things I&apos;ve built. Expand a row for the detail, the stack, and the links.
      </p>

      <ul className="mt-8 border-t border-line">
        {projects.map((project, i) => {
          const live = project.status ? LIVE.has(project.status) : false;
          const hasDemo = isLink(project.demo);
          const hasRepo = isLink(project.repo);
          return (
            <li key={project.title} className="border-b border-line">
              <details className="group">
                <summary className="proc relative flex items-center gap-4 overflow-hidden py-6 pr-2 sm:gap-6">
                  {/* mount line — fills on hover/open */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal/50 transition-transform duration-500 ease-out group-hover:scale-x-100 group-open:scale-x-100"
                  />

                  <span className="w-9 shrink-0 font-mono text-xs text-signal tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span aria-hidden className={`led ${live ? "led-on" : "led-idle"}`} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold text-ink sm:text-xl">{project.title}</h3>
                      {project.status && (
                        <span
                          className={`font-mono text-[0.7rem] uppercase tracking-label ${
                            live ? "text-signal" : "text-ink-faint"
                          }`}
                        >
                          {project.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 max-w-prose truncate text-sm text-ink-dim">
                      {project.description}
                    </p>
                  </div>

                  {/* oversized ghosted year filling the right margin */}
                  <span
                    aria-hidden
                    className="ghost-num hidden text-[2.5rem] leading-none transition-colors duration-300 group-hover:text-line-strong sm:block"
                  >
                    {project.year}
                  </span>

                  <span
                    aria-hidden
                    className="proc-marker shrink-0 font-mono text-xl leading-none text-ink-dim"
                  >
                    +
                  </span>
                </summary>

                <div className="proc-detail">
                  <div>
                    <div className="grid gap-6 pb-8 pl-[3.25rem] pr-2 sm:grid-cols-[1fr_auto] sm:gap-12">
                      <div>
                        {project.detail && (
                          <p className="max-w-prose text-sm leading-relaxed text-ink-dim">
                            {project.detail}
                          </p>
                        )}
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <li key={tag} className="chip">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <p className="addr">
                          year <span className="text-ink-dim">{project.year}</span>
                        </p>
                        {(hasRepo || hasDemo) && (
                          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs sm:justify-end">
                            {hasDemo && (
                              <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-underline text-signal"
                              >
                                Live demo <span aria-hidden>↗</span>
                              </a>
                            )}
                            {hasRepo && (
                              <a
                                href={project.repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-underline text-ink-dim hover:text-ink"
                              >
                                Source <span aria-hidden>↗</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
