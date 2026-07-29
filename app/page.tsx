"use client";

/* Pixel-exact 1996 bitmap assets intentionally use native img elements. */
/* eslint-disable @next/next/no-img-element */

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

const papers = [
  {
    number: "001",
    year: "2026",
    title: "COMPLETE DECISION OF SMALL TURING MACHINE CLASSES",
    venue: "INDEPENDENT RESEARCH NOTE",
    authors: "COOPER E.",
    abstract:
      "The Busy Beaver function is uncomputable, so each value must be established by deciding every machine in its class individually. This note presents an independently written enumeration and decision pipeline and uses it to completely decide four classical classes: every machine in BB(2,2), BB(3,2), BB(2,3) and BB(4,2) is proven either to halt or never to halt, with no residue. The maxima recovered are 6, 21, 38 and 107 steps, the last with 13 marks, matching the published values. No parameter was tuned against those answers. A soundness defect found in the author's own backward decider is reported in full, because it produced a confident false result rather than a visible failure.",
    view: "/api/paper/001",
    paper: "/downloads/paper-001.txt",
    citation: "/downloads/paper-001.bib",
  },
  {
    number: "002",
    year: "2026",
    title: "SHORT-HORIZON PRICE DIRECTION IS NOT PREDICTABLE",
    venue: "NEGATIVE RESULT",
    authors: "COOPER E.",
    abstract:
      "A common assumption among retail traders is that short-horizon price direction carries exploitable signal. This note tests that assumption on 258,737 real one-minute bars spanning roughly 180 days, using walk-forward validation with no lookahead and metrics implemented from scratch. Direction over a fifteen-minute horizon is not predictable: walk-forward AUC is 0.5105 against a 0.5 baseline. The model is well calibrated, but calibrated at a coin flip, and calibration without discrimination is not signal. The result is reported because it rules out an entire strategy class.",
    view: "/api/paper/002",
    paper: "/downloads/paper-002.txt",
    citation: "/downloads/paper-002.bib",
  },
  {
    number: "003",
    year: "2026",
    title: "DECODABILITY IS NOT MECHANISM",
    venue: "INDEPENDENT RESEARCH NOTE",
    authors: "COOPER E.",
    abstract:
      "Interpretability commonly establishes that a network represents something by training a probe and reporting its accuracy. This note demonstrates, on a system whose ground truth is known analytically, that decodability and causal mechanism are different quantities and can be made to disagree almost completely. A channel decodable at 100 percent contributes 0.9998 bits to a correlational description of a hidden layer and 0.0006 bits to an interventional one, a separation of roughly 1600x across five seeds, while the interventional description recovers the true generating structure at ARI 0.9957 against 0.1243.",
    view: "/api/paper/003",
    paper: "/downloads/paper-003.txt",
    citation: "/downloads/paper-003.bib",
  },
];

const projects = [
  {
    status: "ACTIVE",
    title: "HISOKAOS",
    copy:
      "A 32-bit x86 operating system written from scratch in C and assembly. Boots on its own kernel in QEMU to an interactive shell: paging, preemptive task switching, PCI, an RTL8139 driver, a RAM filesystem, and 27 bundled applications.",
    file: "/downloads/project-01-readme.txt",
  },
  {
    status: "ACTIVE",
    title: "THE LAZY DRIVER",
    copy:
      "An autonomous-driving perception stack over ordinary dashcam footage. Drivable-surface and lane segmentation, tracked vehicles with metric distances, and a predicted driving line clamped to the segmented road.",
    file: "/downloads/project-02-readme.txt",
  },
  {
    status: "ACTIVE",
    title: "BILL & ONEIRO",
    copy:
      "Two local-first systems: a conversational runtime wrapping a local model in memory, retrieval and verification alongside a from-scratch predictor, and a generative art system that teaches a NumPy pixel-art model continuously. Both run their model through Ollama — you must have Ollama installed; nothing is sent off the machine and there is no hosted fallback.",
    file: "/downloads/project-03-readme.txt",
  },
];

const navItems = [
  { label: "ABOUT", href: "#about", className: "nav-about" },
  { label: "PAPERS", href: "#papers", className: "nav-papers" },
  { label: "PROJECTS", href: "#projects", className: "nav-projects" },
  { label: "DOWNLOADS", href: "#downloads", className: "nav-downloads" },
  { label: "FIELD NOTES", href: "#notes", className: "nav-field-notes" },
  { label: "BUDDY", href: "#buddy", className: "nav-buddy" },
  { label: "CONTACT", href: "#contact", className: "nav-contact" },
];

const profileLinks = [
  { label: "X", detail: "@jcooperkai", href: "https://x.com/jcooperkai" },
  {
    label: "GITHUB",
    detail: "jcooperkai-sys",
    href: "https://github.com/jcooperkai-sys",
  },
  {
    label: "ARXIV",
    detail: "jcooperkai",
    href: "https://arxiv.org/search/?query=jcooperkai&searchtype=author",
  },
  {
    label: "ORCID",
    detail: "jcooperkai",
    href: "https://orcid.org/orcid-search/search?searchQuery=jcooperkai",
  },
  {
    label: "PERSONAL SITE",
    detail: "jcooperkai.com",
    href: "https://jcooperkai.com/",
  },
];

const footerBadges = [
  { alt: "Hand coded", src: "/assets/badges/hand-coded.png" },
  { alt: "HTML 3.2", src: "/assets/badges/html-32.png" },
  { alt: "Made with Notepad", src: "/assets/badges/made-with-notepad.png" },
  { alt: "No frames", src: "/assets/badges/no-frames.png" },
];

type BuddyMessage = {
  id: number;
  speaker: "buddy" | "visitor";
  text: string;
};

type BuddyAttachment = {
  name: string;
  size: number;
  text: string;
  type: string;
};

const buddyWelcome: BuddyMessage = {
  id: 1,
  speaker: "buddy",
  text:
    "Hi! I’m Buddy, Cooper’s local research guide. Ask me about the papers, projects, downloads, agentic AI, or how to reach Cooper. You can also attach a small file; it stays in this browser.",
};

function getBuddyReply(message: string, attachment: BuddyAttachment | null) {
  const question = message.toLowerCase();

  if (attachment && /(file|attach|read|summar|document)/.test(question)) {
    if (attachment.text) {
      const preview = attachment.text
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 260);
      return `I loaded ${attachment.name} locally (${Math.max(
        1,
        Math.round(attachment.size / 1024),
      )} KB). Its opening text is: “${preview}${
        attachment.text.length > 260 ? "…" : ""
      }” Ask me to relate it to Cooper’s research or use the download links for the full lab notes.`;
    }
    return `I attached ${attachment.name} locally. I can recognize the file and keep it with this conversation, but this 1996-compatible reader only extracts text from TXT, MD, CSV, JSON, and LOG files.`;
  }

  if (/(paper|research|publication|arxiv)/.test(question)) {
    return "Three notes are up: a Busy Beaver pipeline that completely decides BB(2,2), BB(3,2), BB(2,3) and BB(4,2) with zero undecided machines; a negative result showing short-horizon price direction is unpredictable across 258,737 real minute bars (AUC 0.5105); and a demonstration that decodability and causal mechanism diverge by roughly 1600x. Open any abstract, view the full text, or download the citation.";
  }
  if (/(project|code|github|build)/.test(question)) {
    return "HisokaOS is a 32-bit x86 operating system that boots on its own kernel with 27 bundled applications. The Lazy Driver is an autonomous-driving perception stack over dashcam footage. Bill and Oneiro are local-first systems: a conversational runtime with a from-scratch core, and a continuously learning pixel-art generator. Every project has a README download and a public repository.";
  }
  if (/(agent|agentic|memory|tool)/.test(question)) {
    return "Cooper trains neural networks and studies what happens inside them: the structure that emerges in the weights, and the failures that reveal how these systems actually work. A recurring theme is separating what a network encodes from what it uses -- probes measure the former, interventions the latter, and they can disagree almost entirely.";
  }
  if (/(download|cv|statement|file)/.test(question)) {
    return "Visit Download My Work for Cooper’s CV, research statement, and selected-work bundle. Every listed file is a real download, and each paper also has a plain-text version plus a BibTeX citation.";
  }
  if (/(contact|email|reach|collaborat)/.test(question)) {
    return "The fastest way to reach Cooper is jcooperkai@gmail.com. Cooper is open to thoughtful AI research conversations, agentic-system projects, technical demos, and open-source collaboration.";
  }
  if (/(where|location|san diego)/.test(question)) {
    return "Cooper is based in San Diego, California, and works online as jcooperkai.";
  }
  if (/(who|cooper|jcooperkai|about)/.test(question)) {
    return "Cooper E., known online as jcooperkai, is an independent AI researcher who trains neural networks and investigates what is hidden inside them. This site is the public lab notebook: papers, experiments, and working systems, including the results that came out negative.";
  }
  if (/(hello|hi|hey|buddy)/.test(question)) {
    return "Hello from the information superhighway! I can guide you to Cooper’s research, projects, downloads, profiles, or contact details. What would you like to explore?";
  }

  return "I’m a compact, privacy-friendly research guide running entirely on this page. Try asking about Cooper’s papers, agentic AI projects, downloads, location, or contact information—or attach a small text file and ask me to inspect it.";
}

function Panel({
  id,
  title,
  symbol = "☆",
  children,
}: {
  id: string;
  title: string;
  symbol?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="web-panel reveal-panel" id={id}>
      <h2 className="panel-title">
        <span aria-hidden="true">{symbol}</span> {title}{" "}
        <span aria-hidden="true">{symbol}</span>
      </h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function PixelBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`pixel-badge ${className}`}>{children}</span>;
}

function ViewMore({
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <div className="section-more">
      <a
        aria-label={label}
        className="art-action action-view-more"
        href={href}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        <span className="sr-only">VIEW MORE</span>
      </a>
    </div>
  );
}

/** Shape returned by /api/visits. `live` is false when no counting store is bound. */
type VisitCount = { count: number; live: boolean };

export default function Home() {
  // Rendered server-side as the decorative figure so the counter is never blank or shifting on
  // first paint; replaced once /api/visits answers. That endpoint counts unique visits per day
  // from a salted, expiring hash of the address -- the address itself is never stored. Where no
  // KV binding exists it reports live:false and the decorative figure stands.
  const [visitorCount, setVisitorCount] = useState("013581");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/visits")
      .then((r) => (r.ok ? (r.json() as Promise<VisitCount>) : null))
      .then((data) => {
        if (cancelled || !data?.live || typeof data.count !== "number") return;
        setVisitorCount(String(data.count).padStart(6, "0"));
      })
      .catch(() => {
        /* the counter is ornamental; a failure here must never surface to the visitor */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [secretMode, setSecretMode] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [buddyMessages, setBuddyMessages] = useState<BuddyMessage[]>([
    buddyWelcome,
  ]);
  const [buddyInput, setBuddyInput] = useState("");
  const [buddyThinking, setBuddyThinking] = useState(false);
  const [buddyAttachment, setBuddyAttachment] =
    useState<BuddyAttachment | null>(null);
  const [buddyNotice, setBuddyNotice] = useState(
    "FILES STAY LOCAL TO THIS BROWSER",
  );
  const buddyIdRef = useRef(2);
  const buddyLogRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (motionPaused) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    let lastStarAt = 0;
    const colors = ["#fff700", "#00ff66", "#00eaff", "#ff45d7", "#ffffff"];
    const onPointerMove = (event: PointerEvent) => {
      const now = window.performance.now();
      if (now - lastStarAt < 48 || !starsRef.current) return;
      lastStarAt = now;

      const star = document.createElement("span");
      star.className = "cursor-star";
      star.textContent = Math.random() > 0.45 ? "✦" : "·";
      star.style.left = `${event.clientX}px`;
      star.style.top = `${event.clientY}px`;
      star.style.color = colors[Math.floor(Math.random() * colors.length)];
      star.style.setProperty("--drift-x", `${Math.round(Math.random() * 18 - 9)}px`);
      star.style.setProperty("--drift-y", `${Math.round(Math.random() * 12 + 8)}px`);
      starsRef.current.appendChild(star);

      while (starsRef.current.childElementCount > 18) {
        starsRef.current.firstElementChild?.remove();
      }
      window.setTimeout(() => star.remove(), 650);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [motionPaused]);

  useEffect(() => {
    if (!buddyLogRef.current) return;
    buddyLogRef.current.scrollTop = buddyLogRef.current.scrollHeight;
  }, [buddyMessages]);

  const sendBuddyMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || buddyThinking) return;

    const visitorId = buddyIdRef.current;
    buddyIdRef.current += 2;
    // Show the visitor's line immediately, then replace the placeholder once a reply lands.
    setBuddyMessages((current) => [
      ...current,
      { id: visitorId, speaker: "visitor", text: message },
      { id: visitorId + 1, speaker: "buddy", text: "..." },
    ]);
    setBuddyInput("");
    setBuddyThinking(true);

    const settle = (text: string) =>
      setBuddyMessages((current) =>
        current.map((m) => (m.id === visitorId + 1 ? { ...m, text } : m)),
      );

    try {
      const history = buddyMessages.slice(-6).map((m) => ({
        role: m.speaker === "visitor" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = (await res.json()) as { ok?: boolean; reply?: string };
      // Any failure falls back to the offline guide rather than showing an error.
      settle(data?.ok && data.reply ? data.reply : getBuddyReply(message, buddyAttachment));
    } catch {
      settle(getBuddyReply(message, buddyAttachment));
    } finally {
      setBuddyThinking(false);
    }
  };

  const handleBuddySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendBuddyMessage(buddyInput);
  };

  // A textarea swallows Enter, so the form never submitted. Enter sends; Shift+Enter newlines.
  const handleBuddyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendBuddyMessage(buddyInput);
    }
  };

  const handleBuddyFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const safeFileName =
      [...file.name]
        .filter((character) => {
          const code = character.charCodeAt(0);
          return code >= 32 && (code < 127 || code > 159);
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || "attachment";
    const supported = /\.(txt|md|csv|json|log|pdf|png|jpe?g)$/i.test(
      safeFileName,
    );
    if (!supported) {
      setBuddyAttachment(null);
      setBuddyNotice(
        "UNSUPPORTED FILE — TRY TXT, MD, CSV, JSON, LOG, PDF, PNG, OR JPG",
      );
      event.target.value = "";
      return;
    }
    if (file.size > 2_000_000) {
      setBuddyAttachment(null);
      setBuddyNotice("FILE TOO LARGE — 2 MB MAXIMUM");
      event.target.value = "";
      return;
    }

    const readableText = /\.(txt|md|csv|json|log)$/i.test(file.name);
    let text = "";
    if (readableText) {
      try {
        text = (await file.text())
          .split(String.fromCharCode(0))
          .join("")
          .slice(0, 12_000);
      } catch {
        setBuddyAttachment(null);
        setBuddyNotice("FILE COULD NOT BE READ — NOTHING WAS UPLOADED");
        event.target.value = "";
        return;
      }
    }
    setBuddyAttachment({
      name: safeFileName,
      size: file.size,
      text,
      type: file.type || "unknown",
    });
    setBuddyNotice(
      `READY: ${safeFileName.toUpperCase()} · ${Math.max(
        1,
        Math.round(file.size / 1024),
      )} KB · LOCAL ONLY`,
    );
    event.target.value = "";
  };

  return (
    <div
      className={[
        "site-stage",
        secretMode ? "secret-mode" : "",
        motionPaused ? "motion-paused" : "",
      ].join(" ")}
    >
      <a className="skip-link" href="#main-content">
        Skip to the research
      </a>
      <div className="cursor-stars" ref={starsRef} aria-hidden="true" />

      <div className="page-wrap" id="top">
        <div className="fire-frame" aria-hidden="true">
          <div className="fire-strip fire-strip-back" />
          <div className="fire-strip fire-strip-front" />
        </div>

        <header className="hero-box">
          <p className="welcome-line">✦ WELCOME TO ✦</p>
          <h1 className="rainbow-title">COOPER E.&apos;S AI LAB</h1>
          <p className="superhighway">
            ·:: HOME ON THE INFORMATION SUPERHIGHWAY ::·
          </p>
          <p className="hero-intro">
            AI RESEARCH, AGENTIC SYSTEMS, AND OPEN EXPERIMENTS FROM SAN DIEGO.
          </p>
          <p className="hero-fineprint">
            <span className="blink" aria-hidden="true">
              NEW!
            </span>{" "}
            Papers, code, notes &amp; strange machine thoughts as experiments
            progress.
          </p>
        </header>

        <div className="ticker" aria-label="Site status">
          <div className="ticker-track">
            <span>
              &lt;&lt;::==(( o ))==::&gt;&gt; YOU ARE RETRO VISITOR NUMBER{" "}
              {visitorCount} !!! &nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR 3.0 AT
              800×600 &nbsp; ♥ MODEM FRIENDLY ♥ &nbsp; LAST UPDATED 07.28.96
              &nbsp;
            </span>
            <span aria-hidden="true">
              &lt;&lt;::==(( o ))==::&gt;&gt; YOU ARE RETRO VISITOR NUMBER{" "}
              {visitorCount} !!! &nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR 3.0 AT
              800×600 &nbsp; ♥ MODEM FRIENDLY ♥ &nbsp; LAST UPDATED 07.28.96
              &nbsp;
            </span>
          </div>
        </div>

        <div className="content-grid">
          <aside className="sidebar" aria-label="Site navigation and artifacts">
            <nav className="menu-box" aria-label="Main menu">
              <h2>★ MENU ★</h2>
              <div className="rule" />
              {navItems.map((item) => (
                <a
                  aria-label={item.label}
                  className={`nav-button ${item.className}`}
                  href={item.href}
                  key={item.href}
                >
                  <span className="sr-only">{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="counter-box">
              <p>VISITORS</p>
              <div className="counter-digits" aria-label={`${visitorCount} visits`}>
                {visitorCount.split("").map((digit, index) => (
                  <span key={`${digit}-${index}`}>{digit}</span>
                ))}
              </div>
              <small>DECORATIVE RETRO COUNTER</small>
            </div>

            <a
              aria-label="Send electronic mail"
              className="mail-artifact art-action action-send-email"
              href="mailto:jcooperkai@gmail.com?subject=Hello%20Cooper%20%E2%80%94%20AI%20research"
            >
              <span className="sr-only">SEND ELECTRONIC MAIL</span>
            </a>

            <div className="construction-box" aria-label="Model training in progress">
              <img
                alt=""
                aria-hidden="true"
                height="31"
                src="/assets/badges/under-construction.png"
                width="88"
              />
              <strong>MODEL TRAINING<br />IN PROGRESS</strong>
            </div>

            <button
              aria-label={secretMode ? "Stop secret dot exe" : "Run secret dot exe"}
              className={`dont-click art-action ${
                secretMode ? "action-stop-secret" : "action-run-secret"
              }`}
              onClick={() => setSecretMode((value) => !value)}
              type="button"
              aria-pressed={secretMode}
            >
              <span className="sr-only">
                {secretMode ? "STOP SECRET.EXE" : "RUN SECRET.EXE"}
              </span>
            </button>

            <div className="webring-box">
              <p>RESEARCH NODE RING</p>
              <div>
                <a href="#contact" aria-label="Previous site in webring">
                  ◀ PREV
                </a>
                <span> ◉ </span>
                <a href="#papers" aria-label="Next site in webring">
                  NEXT ▶
                </a>
              </div>
            </div>
          </aside>

          <main id="main-content">
            <Panel id="about" title="About Me">
              <div className="about-grid">
                <figure className="profile-frame">
                  <img
                    alt="Pixel-art rocket and illuminated launch tower beneath a purple twilight sky"
                    className="profile-image"
                    height="900"
                    src="/assets/profile/rocket-pixel.png"
                    width="900"
                  />
                  <figcaption>ROCKET-LAB.PNG · 256 COLORS</figcaption>
                </figure>
                <div className="bio-copy">
                  <h3>COOPER E.</h3>
                  <p className="role-line">
                    INDEPENDENT AI RESEARCHER &amp; NEURAL SYSTEMS SCIENTIST
                  </p>
                  <p className="red-line">
                    I TRAIN LARGE NEURAL NETWORKS AND CHASE THE MYSTERIES HIDDEN
                    INSIDE THEM.
                  </p>
                  <p>
                    I&apos;m Cooper E., known online as jcooperkai. I train neural
                    networks and study what happens inside them — the structure
                    that emerges in the weights, the reasoning that appears without
                    ever being taught, and the strange failures that reveal how
                    these systems actually think.
                  </p>
                  <p>
                    Modern models are the most capable artifacts we have built and
                    the least understood. I am drawn to that gap. My work runs from
                    architectures written from first principles to experiments that
                    pry open a trained network and ask it what it knows — pursuing
                    the quiet, difficult questions rather than the easy
                    demonstrations.
                  </p>
                  <p>
                    This lab is the record of that pursuit: independent papers,
                    original experiments, working prototypes, and every result
                    worth keeping — including the ones that proved me wrong.
                  </p>
                  <p className="location-line">
                    📍 <strong>Location:</strong> San Diego, California
                  </p>
                  <p className="email-line">
                    ✉ <strong>Electronic mail:</strong>{" "}
                    <a href="mailto:jcooperkai@gmail.com">jcooperkai@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="interest-table" aria-label="Research interests">
                <strong>RESEARCH INTERESTS:</strong>
                <span>AGENTIC SYSTEMS</span>
                <span>AI RESEARCH</span>
                <span>TOOL USE &amp; MEMORY</span>
                <span>HUMAN–AI COLLABORATION</span>
              </div>
              <nav className="profile-links" aria-label="Researcher profiles">
                {profileLinks.map((link) => (
                  <a
                    href={link.href}
                    key={link.label}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`${link.label}: ${link.detail}`}
                  >
                    <strong>{link.label}</strong>
                    <span>{link.detail}</span>
                  </a>
                ))}
              </nav>
            </Panel>

            <Panel id="papers" title="Research Papers" symbol="✦">
              <p className="section-lede">
                Welcome to my cyber-library. Abstracts live on this page; plain
                text papers and citation files are downloadable for maximum
                14.4k modem compatibility.
              </p>
              <div className="paper-list">
                {papers.map((paper) => (
                  <article className="paper-entry" key={paper.number}>
                    <div className="paper-index">
                      <span>FILE</span>
                      <strong>{paper.number}</strong>
                      <small>{paper.year}</small>
                    </div>
                    <div className="paper-copy">
                      <h3>{paper.title}</h3>
                      <p className="paper-venue">{paper.venue}</p>
                      <p className="paper-authors">{paper.authors}</p>
                      <details>
                        <summary className="art-action action-view-abstract">
                          <span className="sr-only">VIEW ABSTRACT</span>
                        </summary>
                        <p>{paper.abstract}</p>
                      </details>
                      <div className="paper-actions">
                        <a
                          aria-label={`View ${paper.title}`}
                          className="art-action action-view-paper"
                          href={paper.view}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <span className="sr-only">VIEW PAPER</span>
                        </a>
                        <a
                          aria-label={`Download ${paper.title}`}
                          className="art-action action-download-paper"
                          download
                          href={paper.paper}
                        >
                          <span className="sr-only">DOWNLOAD PAPER</span>
                        </a>
                        <a
                          aria-label={`Download citation for ${paper.title}`}
                          className="art-action action-cite-this"
                          download
                          href={paper.citation}
                        >
                          <span className="sr-only">CITE THIS</span>
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <ViewMore
                external
                href="https://arxiv.org/search/?query=jcooperkai&searchtype=author"
                label="View more papers on arXiv"
              />
            </Panel>

            <Panel id="projects" title="Experiments & Projects">
              <div className="project-grid">
                {projects.map((project, index) => (
                  <article className="project-card" key={project.title}>
                    <div className="project-filetab" aria-hidden="true">
                      <span>PROJECT FILE</span>
                      <strong>{String(index + 1).padStart(2, "0")}</strong>
                      <i>CATALOGED / READY</i>
                    </div>
                    <PixelBadge>{project.status}</PixelBadge>
                    <h3>{project.title}</h3>
                    <p>{project.copy}</p>
                    <a
                      aria-label={`Download README for ${project.title}`}
                      className="art-action action-download-readme"
                      download
                      href={project.file}
                    >
                      <span className="sr-only">DOWNLOAD README</span>
                    </a>
                  </article>
                ))}
              </div>
              <ViewMore
                external
                href="https://github.com/jcooperkai-sys"
                label="View more projects on GitHub"
              />
            </Panel>

            <Panel id="downloads" title="Download My Work" symbol="⬇">
              <p className="section-lede">
                Please copy freely for scholarship, remix responsibly, and cite
                the final versions. Each file below is a real, downloadable
                companion to the work on this page.
              </p>
              <div className="download-table">
                <div className="download-row download-heading">
                  <span>FILE NAME</span>
                  <span>FORMAT</span>
                  <span>ACTION</span>
                </div>
                <div className="download-row">
                  <span>COOPER-E-CV</span>
                  <span>TXT · 2 KB</span>
                  <a
                    aria-label="Download Cooper E. CV"
                    className="art-action action-download"
                    download
                    href="/downloads/cooper-e-cv.txt"
                  >
                    <span className="sr-only">DOWNLOAD</span>
                  </a>
                </div>
                <div className="download-row">
                  <span>RESEARCH-STATEMENT</span>
                  <span>TXT · 2 KB</span>
                  <a
                    aria-label="Download research statement"
                    className="art-action action-download"
                    download
                    href="/downloads/research-statement.txt"
                  >
                    <span className="sr-only">DOWNLOAD</span>
                  </a>
                </div>
                <div className="download-row">
                  <span>SELECTED-WORK-BUNDLE</span>
                  <span>ZIP · SMALL</span>
                  <a
                    aria-label="Download all selected work"
                    className="art-action action-download-all"
                    download
                    href="/downloads/selected-work.zip"
                  >
                    <span className="sr-only">DOWNLOAD ALL</span>
                  </a>
                </div>
              </div>
              <div className="floppy-note">
                <span aria-hidden="true">💾</span>
                <p>
                  <strong>SAVE A COPY!</strong>
                  <br />
                  The information superhighway can be unpredictable.
                </p>
              </div>
              <ViewMore
                href="/downloads/README-FIRST.txt"
                label="View more download information"
              />
            </Panel>

            <Panel id="notes" title="Field Notes / Lab Log" symbol="☞">
              <div className="notes-grid">
                <article>
                  <p className="note-date">07 / 28 / 1996</p>
                  <h3>EVERY BACKTEST NEEDS A CONFIGURATION THAT CANNOT WIN</h3>
                  <p>
                    Two defects in my own market harness produced enormous
                    fictitious profits. One clamped the modelled quote but not
                    the fair value, inventing a spread out of nothing; the other
                    compounded a bankroll with no position cap and returned
                    10^250. Neither looked like an error. Both were caught by
                    one rule: the zero-edge control must return exactly zero,
                    and it is the first number you read.
                  </p>
                  <a
                    className="text-art-button"
                    href="mailto:jcooperkai@gmail.com?subject=Discussing%20your%20field%20note"
                  >
                    Discuss this note via electronic mail →
                  </a>
                </article>
                <article>
                  <p className="note-date">07 / 26 / 1996</p>
                  <h3>A SILENT DECIDER IS WORSE THAN A SLOW ONE</h3>
                  <p>
                    My backward decider treated an exhausted search window as a
                    contradiction, so it confidently certified the BB(2,4)
                    champion — a machine that halts after 3,932,964 steps — as
                    non-halting. It announced nothing. Exhaustion and refutation
                    are different answers, and a decider that conflates them
                    returns a proof it does not have.
                  </p>
                  <a
                    className="text-art-button"
                    href="/api/paper/001"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Read the full write-up →
                  </a>
                </article>
                <article>
                  <p className="note-date">07 / 21 / 1996</p>
                  <h3>A PROBE PROVES PRESENCE, NOT USE</h3>
                  <p>
                    On a system built so the answer was known in advance, a
                    channel decodable at 100 percent accuracy contributed 0.9998
                    bits to a correlational description of a layer and 0.0006 to
                    an interventional one. The network never used it. Reporting
                    probe accuracy as a mechanistic result is off by roughly
                    1600x there.
                  </p>
                  <a
                    className="text-art-button"
                    href="/api/paper/003"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Read the full write-up →
                  </a>
                </article>
                <div className="artifact-drawer">
                  <p className="artifact-title">CURRENT BENCH STATE</p>
                  <div className="artifact-stickers" aria-hidden="true">
                    <span>💾</span>
                    <span>📡</span>
                    <span>📎</span>
                    <span>✦</span>
                  </div>
                  <ul>
                    <li>4 Turing classes closed, 0 undecided</li>
                    <li>1 negative result nobody wanted</li>
                    <li>1 state-count question still open</li>
                    <li>∞ questions for tomorrow</li>
                  </ul>
                  <p className="artifact-status">MODEM LINK: READY_</p>
                </div>
              </div>
              <blockquote>
                “Build small, inspect everything, and let strange ideas earn
                their complexity.” — jcooperkai
              </blockquote>
            </Panel>

            <Panel id="buddy" title="Talk to Buddy" symbol="✦">
              <div className="buddy-console">
                <div className="buddy-masthead">
                  <div className="buddy-signal-module" aria-hidden="true">
                    <span>ACTIVITY</span>
                    <div>
                      <i className="signal-red" />
                      <i className="signal-green" />
                    </div>
                  </div>
                  <div>
                    <p className="buddy-kicker">JCOOPERKAI RESEARCH GUIDE</p>
                    <h3>BUDDY.AI v0.96</h3>
                    <p>
                      A compact, privacy-friendly assistant for exploring
                      Cooper&apos;s lab.
                    </p>
                  </div>
                  <span className="buddy-online">
                    <i aria-hidden="true" /> ONLINE
                  </span>
                </div>

                <div className="buddy-quick-prompts" aria-label="Suggested questions">
                  {[
                    "What does Cooper research?",
                    "Show me the papers.",
                    "Tell me about the projects.",
                    "How do I contact Cooper?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendBuddyMessage(prompt)}
                      type="button"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div
                  aria-live="polite"
                  aria-relevant="additions"
                  className="buddy-chat-log"
                  ref={buddyLogRef}
                  role="log"
                >
                  {buddyMessages.map((message) => (
                    <div
                      className={`buddy-message buddy-${message.speaker}`}
                      key={message.id}
                    >
                      <strong>
                        {message.speaker === "buddy" ? "BUDDY>" : "VISITOR>"}
                      </strong>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>

                {buddyAttachment ? (
                  <div className="buddy-file-card">
                    <span aria-hidden="true">▣</span>
                    <div>
                      <strong>{buddyAttachment.name}</strong>
                      <small>
                        {buddyAttachment.type} ·{" "}
                        {Math.max(1, Math.round(buddyAttachment.size / 1024))} KB
                      </small>
                    </div>
                  </div>
                ) : null}

                <form className="buddy-form" onSubmit={handleBuddySubmit}>
                  <label htmlFor="buddy-message">MESSAGE TO BUDDY</label>
                  <small id="buddy-message-help">
                    Ask about AI research, agents, papers, projects, or an
                    attached file.
                  </small>
                  <textarea
                    aria-describedby="buddy-message-help"
                    id="buddy-message"
                    maxLength={600}
                    onChange={(event) => setBuddyInput(event.target.value)}
                    onKeyDown={handleBuddyKeyDown}
                    rows={3}
                    value={buddyInput}
                  />
                  <div className="buddy-form-actions">
                    <button
                      aria-label="Ask Buddy"
                      className="art-action action-ask-buddy buddy-submit"
                      disabled={!buddyInput.trim() || buddyThinking}
                      type="submit"
                    >
                      <span className="sr-only">ASK BUDDY</span>
                    </button>
                    <input
                      accept=".txt,.md,.csv,.json,.log,.pdf,.png,.jpg,.jpeg"
                      className="sr-only"
                      id="buddy-file"
                      onChange={handleBuddyFile}
                      type="file"
                    />
                    <label
                      className="art-action action-attach-file buddy-upload"
                      htmlFor="buddy-file"
                    >
                      <span className="sr-only">ATTACH FILE</span>
                    </label>
                    <button
                      aria-label="Clear Buddy chat"
                      className="art-action action-clear-chat buddy-clear"
                      onClick={() => {
                        setBuddyMessages([buddyWelcome]);
                        setBuddyAttachment(null);
                        setBuddyNotice("FILES STAY LOCAL TO THIS BROWSER");
                      }}
                      type="button"
                    >
                      <span className="sr-only">CLEAR CHAT</span>
                    </button>
                  </div>
                </form>
                <p className="buddy-privacy">{buddyNotice}</p>
              </div>
            </Panel>

            <Panel id="contact" title="Contact / Collaborate" symbol="✉">
              <div className="contact-grid">
                <div>
                  <h3>LET&apos;S BUILD SOMETHING STRANGE &amp; USEFUL.</h3>
                  <p>
                    I&apos;m open to thoughtful AI research conversations,
                    agentic-system projects, technical demos, and open-source
                    collaboration. For the fastest reply, send electronic mail.
                  </p>
                  <a
                    aria-label="Send electronic mail"
                    className="big-email-button art-action action-send-email"
                    href="mailto:jcooperkai@gmail.com?subject=Hello%20Cooper%20%E2%80%94%20AI%20research"
                  >
                    <span className="sr-only">SEND ELECTRONIC MAIL</span>
                  </a>
                  <p className="plain-email">jcooperkai@gmail.com</p>
                </div>
                <div className="contact-directory">
                  <p>
                    <strong>DIRECTORY LISTING</strong>
                  </p>
                  {profileLinks.map((link) => (
                    <a
                      href={link.href}
                      key={link.label}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.label}: {link.detail} ↗
                    </a>
                  ))}
                </div>
              </div>
            </Panel>
          </main>
        </div>

        <footer className="site-footer">
          <div className="footer-rule" />
          <p>
            © 1996 jcooperkai &nbsp;·&nbsp; Made with Notepad &nbsp;·&nbsp; No
            frames. No problem.
          </p>
          <div className="badge-row" aria-label="1996 web badges">
            {footerBadges.map((badge) => (
              <img
                alt={badge.alt}
                height="31"
                key={badge.src}
                loading="lazy"
                src={badge.src}
                width="88"
              />
            ))}
          </div>
          <div className="footer-controls">
            <button
              aria-label="Print this page"
              className="print-button art-action action-print-page"
              onClick={() => window.print()}
              type="button"
            >
              <span className="sr-only">PRINT PAGE</span>
            </button>
            <button
              aria-pressed={motionPaused}
              aria-label={motionPaused ? "Start animations" : "Pause animations"}
              className={`motion-button art-action ${
                motionPaused
                  ? "action-start-animations"
                  : "action-pause-animations"
              }`}
              onClick={() => setMotionPaused((value) => !value)}
              type="button"
            >
              <span className="sr-only">
                {motionPaused ? "START ANIMATIONS" : "PAUSE ANIMATIONS"}
              </span>
            </button>
          </div>
          <div className="footer-construction">
            <img
              alt="Permanently under construction"
              height="160"
              onError={(event) => {
                const image = event.currentTarget;
                if (image.dataset.fallback !== "true") {
                  image.dataset.fallback = "true";
                  image.src = "/assets/badges/under-construction.png";
                }
              }}
              src="/assets/badges/under-construction-wide.png"
              width="1600"
            />
          </div>
          <nav className="footer-policy-links" aria-label="Privacy and security">
            <a href="/privacy.txt">PRIVACY &amp; LOCAL FILES</a>
            <span aria-hidden="true">·</span>
            <a href="/.well-known/security.txt">RESPONSIBLE DISCLOSURE</a>
          </nav>
          <a
            aria-label="Back to top"
            className="jc-mark"
            href="#top"
            title="Back to top"
          >
            <img alt="" aria-hidden="true" src="/assets/jc-wordmark.png" />
          </a>
        </footer>
      </div>
    </div>
  );
}
