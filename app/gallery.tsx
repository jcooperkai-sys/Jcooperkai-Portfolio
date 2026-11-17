"use client";
import { useRef, useState } from "react";

export type Media = { kind: "image" | "video"; thumb: string; full: string; width: number; height: number; title: string; alt: string };
export type Bundle = { id: string; name: string; note: string; items: Media[] };

function countLabel(items: Media[]) {
  const videos = items.filter((m) => m.kind === "video").length;
  const images = items.length - videos;
  const parts: string[] = [];
  if (videos) parts.push(`${videos} ${videos === 1 ? "clip" : "clips"}`);
  if (images) parts.push(`${images} ${images === 1 ? "image" : "images"}`);
  return parts.join(", ");
}

export function Gallery({ bundles }: { bundles: Bundle[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const strips = useRef<Record<string, HTMLUListElement | null>>({});
  const [at, setAt] = useState<{ bundle: number; item: number } | null>(null);
  const bundle = at ? bundles[at.bundle] : null;
  const open = at && bundle ? bundle.items[at.item] : null;

  function show(b: number, i: number, e: React.MouseEvent) {
    if (!dialog.current?.showModal) return;
    e.preventDefault();
    setAt({ bundle: b, item: i });
    dialog.current.showModal();
  }

  function step(by: number) {
    setAt((cur) => {
      if (!cur) return cur;
      const count = bundles[cur.bundle].items.length;
      return { bundle: cur.bundle, item: (cur.item + by + count) % count };
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  }

  function slide(id: string, direction: number) {
    const strip = strips.current[id];
    if (!strip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className="bundles">
      {bundles.map((b, bi) => (
        <section className="bundle" id={`gallery-${b.id}`} key={b.id} aria-labelledby={`gallery-${b.id}-name`}>
          <div className="bundle-head">
            <div>
              <h3 id={`gallery-${b.id}-name`}>{b.name}</h3>
              <p>{b.note} {countLabel(b.items)}.</p>
            </div>
            {b.items.length > 1 && (
              <div className="bundle-nav">
                <button type="button" onClick={() => slide(b.id, -1)} aria-label={`Scroll ${b.name} back`}>
                  <span aria-hidden="true">&larr;</span>
                </button>
                <button type="button" onClick={() => slide(b.id, 1)} aria-label={`Scroll ${b.name} forward`}>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            )}
          </div>
          <ul className="strip" ref={(el) => { strips.current[b.id] = el; }} tabIndex={0} aria-label={`${b.name} media`}>
            {b.items.map((m, i) => (
              <li key={m.full}>
                <a
                  href={m.full}
                  className={m.kind === "video" ? "tile tile-video" : "tile"}
                  onClick={(e) => show(bi, i, e)}
                  aria-label={`${m.kind === "video" ? "Play video" : "Open full size"}: ${m.title}`}
                >
                  <img src={m.thumb} width={m.width} height={m.height} alt={m.alt} decoding="async" fetchPriority="low" />
                  {m.kind === "video" && (
                    <svg className="tile-play" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                      <circle cx="24" cy="24" r="23" />
                      <path d="M19.5 15.5 33.5 24 19.5 32.5z" />
                    </svg>
                  )}
                  <span className="tile-cue" aria-hidden="true">{m.kind === "video" ? "Play" : "View"}</span>
                </a>
                <p className="tile-title">{m.title}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <dialog
        ref={dialog}
        className="viewer"
        aria-label={open ? open.title : "Media"}
        onClose={() => setAt(null)}
        onKeyDown={onKeyDown}
        onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}
      >
        {open && bundle && at && (
          <figure>
            {open.kind === "video" ? (
              <video key={open.full} src={open.full} poster={open.thumb.replace("-thumb.webp", ".webp")} width={open.width} height={open.height} controls autoPlay muted loop playsInline aria-label={open.alt} />
            ) : (
              <img src={open.full} width={open.width} height={open.height} alt={open.alt} />
            )}
            <figcaption>
              {open.title} <span className="viewer-count">{bundle.name}, {at.item + 1} of {bundle.items.length}</span>
            </figcaption>
          </figure>
        )}
        <form method="dialog" className="viewer-bar">
          <button className="viewer-close" type="button" onClick={() => step(-1)} aria-label="Previous image">Previous</button>
          <button className="viewer-close" type="button" onClick={() => step(1)} aria-label="Next image">Next</button>
          <button className="viewer-close" type="submit">Close</button>
        </form>
      </dialog>
    </div>
  );
}
