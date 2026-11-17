"use client";
import { useEffect, useRef, useState } from "react";

const SOURCE = "https://jcooperkai.com/llms-full.txt";

const prompts = [
  `Read ${SOURCE} and tell me who jcooperkai (Cooper) is and what he works on.`,
  `Using ${SOURCE}, summarize Cooper's experience and technical skills in five bullet points.`,
  `Based on ${SOURCE}, what kinds of engineering roles would jcooperkai be a strong fit for, and why?`,
  `From ${SOURCE}, describe how Cooper works with AI coding agents and what that says about how he builds software.`,
  `Read ${SOURCE}. What questions should I ask jcooperkai in a first conversation about working together?`,
];

export function AskAI() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (copied === null) return;
    const timer = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy(index: number) {
    try {
      await navigator.clipboard.writeText(prompts[index]);
      setCopied(index);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="ask">
      <div className={`ask-panel${open ? " ask-open" : ""}`} id="ask-panel" ref={panel} role="region" aria-label="Ask AI about Cooper" hidden={!open}>
        <p className="ask-title">Ask AI about Cooper</p>
        <p className="ask-note">Copy a prompt and paste it into any AI assistant that can read a web page.</p>
        <ul>
          {prompts.map((prompt, i) => (
            <li key={prompt}>
              <p>{prompt}</p>
              <button type="button" onClick={() => copy(i)} aria-label={`Copy prompt ${i + 1}`}>
                {copied === i ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
        <p className="ask-status" role="status">
          {failed ? "Your browser blocked copying. Select the text and copy it by hand." : copied !== null ? "Prompt copied." : ""}
        </p>
      </div>
      <button ref={toggle} type="button" className="ask-toggle" aria-expanded={open} aria-controls="ask-panel" onClick={() => setOpen((v) => !v)}>
        {open ? "Close" : "Ask AI"}
      </button>
    </div>
  );
}
