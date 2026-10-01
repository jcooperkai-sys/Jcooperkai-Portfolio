"use client";
/* Square thumbnails that open the full image. Each tile is a plain link to the full file, so it works with
   JavaScript off; with it on, the image opens over the page. Left and Right step through the images,
   and Escape, the close button or a click outside closes it. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

export type Shot = { thumb: string; full: string; width: number; height: number; title: string; alt: string };

export function Gallery({ shots }: { shots: Shot[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const open = index === null ? null : shots[index];

  function show(i: number, e: React.MouseEvent) {
    if (!dialog.current?.showModal) return;          // no <dialog> support: follow the link instead
    e.preventDefault();
    setIndex(i);
    dialog.current.showModal();
  }

  function step(by: number) {
    setIndex((i) => (i === null ? i : (i + by + shots.length) % shots.length));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  }

  return (
    <>
      <ul className="gallery">
        {shots.map((s, i) => (
          <li key={s.full}>
            <a href={s.full} onClick={(e) => show(i, e)} aria-label={`Open full size: ${s.title}`}>
              <img src={s.thumb} width={512} height={512} alt={s.alt} loading="lazy" decoding="async" />
            </a>
            <p className="gallery-title">{s.title}</p>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className="viewer"
        aria-label={open ? open.title : "Image"}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}
      >
        {open && (
          <figure>
            <img src={open.full} width={open.width} height={open.height} alt={open.alt} />
            <figcaption>
              {open.title} <span className="viewer-count">{index! + 1} of {shots.length}</span>
            </figcaption>
          </figure>
        )}
        <form method="dialog" className="viewer-bar">
          <button className="viewer-close" type="button" onClick={() => step(-1)} aria-label="Previous image">Previous</button>
          <button className="viewer-close" type="button" onClick={() => step(1)} aria-label="Next image">Next</button>
          <button className="viewer-close" type="submit">Close</button>
        </form>
      </dialog>
    </>
  );
}
