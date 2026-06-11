import { projects } from "@/lib/content";

const LIVE = new Set(["live", "shipped"]);
const isLink = (url?: string) => !!url && url !== "#";

/** Projects window — work as mounted volumes; each row expands in place. */
export default function ProjectsApp() {
  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <span className="addr text-ink-dim">~/work</span>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="addr">{projects.length} volumes mounted</span>
        <span className="addr ml-auto hidden sm:inline">↵ expand</span>
      </div>

      <ul className="mt-3 border-t border-line">
        {projects.map((project, i) => {
          const live = project.status ? LIVE.has(project.status) : false;
          const hasDemo = isLink(project.demo);
          const hasRepo = isLink(project.repo);
          return (
            <li key={project.title} className="border-b border-line">
              <details className="group">
                <summary className="proc relative flex items-center gap-3 overflow-hidden py-4 pr-1">
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal/50 transition-transform duration-500 ease-out group-hover:scale-x-100 group-open:scale-x-100"
                  />
                  <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className={`led ${live ? "led-on" : "led-idle"}`} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 className="text-base font-semibold text-ink">{project.title}</h3>
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
                    <p className="mt-0.5 truncate text-xs text-ink-dim">{project.description}</p>
                  </div>

                  <span aria-hidden className="font-mono text-xs tabular-nums text-ink-faint">
                    {project.year}
                  </span>
                  <span
                    aria-hidden
                    className="proc-marker shrink-0 font-mono text-lg leading-none text-ink-dim"
                  >
                    +
                  </span>
                </summary>

                <div className="proc-detail">
                  <div>
                    <div className="pb-5 pl-[2.6rem] pr-1">
                      {project.detail && (
                        <p className="text-xs leading-relaxed text-ink-dim">{project.detail}</p>
                      )}
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <li key={tag} className="chip">
                            {tag}
                          </li>
                        ))}
                      </ul>
                      {(hasRepo || hasDemo) && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
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
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
