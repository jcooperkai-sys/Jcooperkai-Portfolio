"use client";
/* Square thumbnails that open the full image. Each tile is a plain link to the full file, so it works with
   JavaScript off; with it on, the image opens over the page and Escape, the close button or a click outside closes it. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

export type Shot = { thumb: string; full: string; width: number; height: number; title: string; alt: string };

export function Gallery({ shots }: { shots: Shot[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Shot | null>(null);

  function show(s: Shot, e: React.MouseEvent) {
    if (!dialog.current?.showModal) return;          // no <dialog> support: follow the link instead
    e.preventDefault();
    setOpen(s);
    dialog.current.showModal();
  }

  return (
    <>
      <ul className="gallery">
        {shots.map((s) => (
          <li key={s.full}>
            <a href={s.full} onClick={(e) => show(s, e)} aria-label={`Open full size: ${s.title}`}>
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
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}
      >
        {open && (
          <figure>
            <img src={open.full} width={open.width} height={open.height} alt={open.alt} />
            <figcaption>{open.title}</figcaption>
          </figure>
        )}
        <form method="dialog">
          <button className="viewer-close" type="submit">Close</button>
        </form>
      </dialog>
    </>
  );
}
