"use client";
import { useEffect, useRef, useState } from "react";

export function Nav({ sections }: { sections: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    function onResize() {
      if (window.innerWidth > 820) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <nav aria-label="Sections" className={open ? "nav nav-open" : "nav"}>
      <button
        ref={toggle}
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-list"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <ul id="nav-list">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={() => setOpen(false)}>{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
