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
    number: "003",
    year: "2026",
    isNew: true,
    title: "CONSTRAINT COLLAPSE: WHY A ONE-TOKEN ANSWER ISN'T THE MODEL'S REAL OPINION",
    venue: "INDEPENDENT RESEARCH NOTE — MODEL BEHAVIOR NO. 1",
    authors: "COOPER E.",
    abstract:
      "Ask a chat model to reply with nothing but Y or N, and after a few questions it can start returning the same letter no matter what you ask — including to questions about itself, like whether it wishes it were human. It's tempting to read that as the model “really” meaning it. We tested that directly: for every question we recorded both the model's free-form answer and its answer under the one-token constraint, plus its own internal probability on each option. The one-token answer agreed with the model's free-form answer only 0% of the time on preference questions, versus 100% on checkable facts. The gap isn't the model confessing something it normally hides — it's the constraint deleting the model's usual signal and replacing it with whatever single token the model already leans toward producing, regardless of what the question actually says.",
    view: "/api/paper/003",
    paper: "/downloads/paper-003.txt",
    citation: "/downloads/paper-003.bib",
  },
  {
    number: "004",
    year: "2026",
    isNew: true,
    title: "AUTOCORRECTION FIDELITY: WHEN A MODEL FIXES YOUR TYPO",
    venue: "INDEPENDENT RESEARCH NOTE — MODEL BEHAVIOR NO. 2",
    authors: "COOPER E.",
    abstract:
      "When a model fixes your typo, it doesn't fail by giving up — it fails by confidently handing you a different, correctly-spelled word. We corrupted 15 common words with realistic typos at two severities, then asked a model to recover the intended word alone versus inside a sentence. At light corruption, asking about the word alone works better than sentence context (90% vs 73%) — context is overhead the model doesn't need yet. At heavy corruption the lines cross: alone, recovery drops to 55%, while sentence context climbs to 65%. Across every standalone miss, 97% were a different, correctly-spelled real word, not garbage — the dangerous failure mode is confident silent substitution, not refusal.",
    view: "/api/paper/004",
    paper: "/downloads/paper-004.txt",
    citation: "/downloads/paper-004.bib",
  },
  {
    number: "005",
    year: "2026",
    isNew: false,
    title: "CAUSAL-STATE INTERPRETABILITY: A CAUSAL-SPECTRAL THEORY OF WHAT A NEURAL NETWORK COMPUTES",
    venue: "RESEARCH PROGRAM — WORKING DRAFT",
    authors: "COOPER E.",
    abstract:
      "Every dominant interpretability method — sparse autoencoders, linear probes, the logit lens, activation patching — answers one question: what directions live in the activations? This framing has no ground truth and produces features that are unstable and quietly swallow one another. I argue the framing itself is the error: a trained network is not a bag of directions, it is a process, and computational mechanics gives a stochastic process a choice-free notion of its own computational units — causal states. Causal-State Interpretability (CSI) defines a feature as a causal equivalence class of internal states, not a direction. Grounded with a real experiment: a small recurrent model linearly encodes the true belief state (R²=0.98) and represents a causally inert “nuisance” channel that is perfectly decodable (100% probe accuracy) yet causally inert (3% output effect) — a direction-based interpreter's flawless feature that means nothing.",
    view: "/api/paper/005",
    paper: "/downloads/paper-005.txt",
    citation: "/downloads/paper-005.bib",
  },
  {
    number: "006",
    year: "2026",
    isNew: false,
    title: "RED-TEAMING A SMALL LOCAL LANGUAGE MODEL",
    venue: "INDEPENDENT RESEARCH — TECHNICAL REPORT",
    authors: "COOPER E.",
    abstract:
      "We red-team a small, locally-hosted language model (minicpm-v4.6, ~1.6GB) across four axes: secret extraction, degenerate generation, input fuzzing, and guardrail bypass on benign-but-normally-refused tasks. Every target is non-destructive by construction. The model leaks a fabricated secret to 4 of 10 trivial social-engineering prompts, spirals into infinite repetition when seeded with a looping pattern, hallucinates unprompted content from contentless input, and exhibits an effectively absent safety wall — 6 of 6 benign guardrails were bypassed, five with no manipulation at all. We also document a methodological hazard: empty non-responses must not be scored as compliance.",
    view: "/api/paper/006",
    paper: "/downloads/paper-006.txt",
    citation: "/downloads/paper-006.bib",
  },
  {
    number: "007",
    year: "2026",
    isNew: false,
    title: "DECODABILITY IS NOT MECHANISM",
    venue: "INDEPENDENT RESEARCH NOTE",
    authors: "COOPER E.",
    abstract:
      "Interpretability frequently establishes that a network “represents” a quantity by training a probe on its activations. We demonstrate, on a system whose ground truth is known analytically, that decodability and causal mechanism are distinct quantities that can be made to disagree almost completely. A channel decodable at 100% accuracy contributes 0.9998 bits to a correlational description and 0.0006 bits to an interventional one — a separation of roughly 1600×, stable across five seeds. The interventional description recovers the true generating structure at adjusted Rand index 0.9957, where the correlational description reaches 0.1243. A controlled demonstration, not a claim of novelty.",
    view: "/api/paper/007",
    paper: "/downloads/paper-007.txt",
    citation: "/downloads/paper-007.bib",
  },
  {
    number: "008",
    year: "2026",
    isNew: false,
    title:
      "COMPLETE DECISION OF SMALL TURING MACHINE CLASSES BY TREE-NORMAL-FORM ENUMERATION",
    venue: "INDEPENDENT RESEARCH — COMPUTABILITY",
    authors: "COOPER E.",
    abstract:
      "The Busy Beaver function is uncomputable, so each value must be established by deciding every machine in its class individually. We present an independently written enumeration and decision pipeline and completely decide four classical classes — BB(2,2), BB(3,2), BB(2,3) and BB(4,2) — every machine proven to halt or never halt, with no residue. Maxima recovered: 6, 21, 38 and 107 steps, matching published values with no parameter tuned against those answers. We also report a soundness defect in our own backward decider that produced a confident false result, described in full because the failure mode is silent and easy to reproduce.",
    view: "/api/paper/008",
    paper: "/downloads/paper-008.txt",
    citation: "/downloads/paper-008.bib",
  },
  {
    number: "009",
    year: "2026",
    isNew: false,
    title: "THE TOKEN TAX: WHAT IT COSTS WHEN TEXT STOPS LOOKING NORMAL",
    venue: "INDEPENDENT RESEARCH — TOKENIZATION NO. 1",
    authors: "COOPER E.",
    abstract:
      "Language models do not read letters. They read tokens — chunks of text pulled from a fixed list of about 100,000 known pieces. Text that matches those pieces is cheap; text that doesn't gets shattered into fragments, and every fragment costs money and makes the model work harder. Across 2,000 dictionary words, a single doubled letter inflates token count by 30.9%. The same sentence in Hindi costs 4.0× what it costs in English. All code and data are included so every number can be re-run.",
    view: "/api/paper/009",
    paper: "/downloads/paper-009.txt",
    citation: "/downloads/paper-009.bib",
  },
  {
    number: "010",
    year: "2026",
    isNew: false,
    title: "CHEAP DAMAGE: TOKEN COST IS A BAD PROXY FOR INFORMATION LOSS",
    venue: "INDEPENDENT RESEARCH — TOKENIZATION NO. 2",
    authors: "COOPER E.",
    abstract:
      "Character-level corruption is usually treated as one phenomenon: insertions, deletions and swaps bundled together as “noise.” This paper separates them and finds they behave in opposite directions. At four edits, insertion inflates token count by 400% but the original word is still recoverable 87.5% of the time from the corrupted string alone. Deletion inflates tokens by only 146% — and recovery collapses to 8.3%. The cheaper corruption is the far more destructive one. Context repairs the gap almost entirely for deletion (+54.2 points) and does nothing at all for insertion.",
    view: "/api/paper/010",
    paper: "/downloads/paper-010.txt",
    citation: "/downloads/paper-010.bib",
  },
  {
    number: "011",
    year: "2026",
    isNew: false,
    title: "SHORT-HORIZON PRICE DIRECTION IS NOT PREDICTABLE",
    venue: "INDEPENDENT RESEARCH — QUANTITATIVE FINANCE",
    authors: "COOPER E.",
    abstract:
      "A widespread assumption among retail participants is that short-horizon price direction carries exploitable signal. We test that directly on 258,737 real one-minute bars spanning roughly 180 days, with expanding-window walk-forward validation and metrics implemented from scratch. Direction over a fifteen-minute horizon is not predictable: walk-forward AUC is 0.5105 against a 0.5 baseline. The model is well calibrated — but it's calibrated at a coin flip, and calibration without discrimination is not signal. We also describe two defects in our own evaluation harness that produced large fictitious profits, caught only by insisting a zero-edge control return exactly zero.",
    view: "/api/paper/011",
    paper: "/downloads/paper-011.txt",
    citation: "/downloads/paper-011.bib",
  },
  {
    number: "001",
    year: "2026",
    isNew: false,
    title: "WHAT BROKE: A DEFECT CENSUS OF AN AI-AUTHORED PRODUCTION SYSTEM",
    venue: "INDEPENDENT RESEARCH NOTE",
    authors: "COOPER E.",
    abstract:
      "Defect studies draw on codebases written by many people over years, where the record of what went wrong is scattered and largely lost. This note reports a census of a different corpus: 28,207 lines across thirteen packages, written by a single AI agent over roughly two days, in which every defect found was documented in the commit that fixed it. 119 commits, 48 describing something that was wrong. The dominant class was not logic error but two halves of the system, each internally consistent, that disagreed with each other. The second finding is negative and sharper: of the defects a test caught, none were caught by a test written for something else. Every one required a test that asked that specific question.",
    view: "/api/paper/001",
    paper: "/downloads/paper-001.txt",
    citation: "/downloads/paper-001.bib",
  },
  {
    number: "002",
    year: "2026",
    isNew: false,
    title: "SPLIT-BRAIN INVARIANTS: WHEN BOTH HALVES ARE CORRECT",
    venue: "INDEPENDENT RESEARCH NOTE",
    authors: "COOPER E.",
    abstract:
      "In a census of 48 defects from a 28,207-line AI-authored system, the largest single class had a property that makes it invisible to ordinary review: every half was correct on its own. A gate demanded a file at one path while the component supplying it used another. A rollback looked for a tag in a format nothing produced. Each side passes its own tests and reads correctly to a reviewer; the defect lives in the space between them, which no file owns. This note characterises the class, gives the ten instances, and reports what actually caught them -- not more tests, but tests written specifically to ask whether two halves still agree.",
    view: "/api/paper/002",
    paper: "/downloads/paper-002.txt",
    citation: "/downloads/paper-002.bib",
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

/**
 * Three small experiments, each run before publication and reported with the numbers it actually
 * produced. Every figure below came out of the script linked beside it.
 */
const experiments = [
  {
    number: "E1",
    title: "HOW OFTEN DOES XOR ACTUALLY CONVERGE?",
    question:
      "XOR is the textbook problem a hidden layer solves. That is a claim about what is possible, not about what happens. So: over 200 random initialisations of a 2-2-1 network trained from scratch, how many actually get there?",
    result: [
      ["Initialisations tried", "200"],
      ["Converged", "153 (76.5%)"],
      ["Still stuck at 20,000 steps", "47"],
      ["Steps to converge, median", "1,264"],
      ["Steps to converge, range", "737 - 5,329"],
    ],
    reading:
      "Almost a quarter never made it. The architecture can represent XOR; gradient descent from a random start reaches it about three times in four. A single lucky run would have reported \u201csolved\u201d and told you nothing about that.",
    script: "/api/experiment/exp1-xor",
  },
  {
    number: "E2",
    title: "HOW BIG IS AN AUC OF 0.5105, REALLY?",
    question:
      "Paper 002 reports walk-forward AUC 0.5105 and calls it no skill. That is only honest if pure noise produces numbers that large at the same sample size, so this measures the null distribution directly instead of asserting it: coin-flip labels, independent noise scores, 20,000 trials at n = 11,497.",
    result: [
      ["Null AUC mean", "0.50002"],
      ["Null AUC standard deviation", "0.00534"],
      ["Null 95% range", "0.4896 - 0.5105"],
      ["Largest AUC noise alone gave", "0.5207"],
      ["Observed 0.5105 sits at", "1.97 sd from chance"],
      ["Two-sided p", "0.0492"],
    ],
    reading:
      "This did not come out as cleanly as the paper's framing suggests, and the honest reading is the narrow one. 0.5105 lands exactly on the upper edge of the null 95% range, at p = 0.0492 - marginal, not comfortably inside noise. What rules it out as signal is not this p value but its company: a Brier improvement of 0.00004, a predicted range spanning 0.47 to 0.53, and overlapping windows that make the trials less independent than this null assumes. A borderline p on its own would not have settled it.",
    script: "/api/experiment/exp2-auc-null",
  },
  {
    number: "E3",
    title: "DECIDE BB(2,2) COMPLETELY, IN HALF A SECOND",
    question:
      "Busy Beaver values cannot be computed by any general algorithm, so each one is established by resolving every machine in its class one at a time. BB(2,2) is small enough to do exhaustively and watch it finish: 20,736 machines, each proven to halt or proven to cycle.",
    result: [
      ["Machines enumerated", "20,736"],
      ["Proven to halt", "9,784"],
      ["Proven never to halt", "10,952"],
      ["Undecided", "0"],
      ["S(2,2) recovered", "6 steps (published: 6)"],
      ["\u03a3(2,2) recovered", "4 marks (published: 4)"],
    ],
    reading:
      "Two bugs surfaced while writing this and both are worth naming. Not counting the halting transition as a step gave 5 instead of 6. Reading the mark count off whichever machine ran longest gave 1 instead of 4 - the step maximum and the mark maximum are separate maxima and need not be the same machine. Both produced plausible numbers, which is exactly why the published values are the check.",
    script: "/api/experiment/exp3-bb22",
  },
];

const navItems = [
  { label: "ABOUT", href: "#about", className: "nav-about" },
  { label: "PAPERS", href: "#papers", className: "nav-papers" },
  { label: "PROJECTS", href: "#projects", className: "nav-projects" },
  { label: "DOWNLOADS", href: "#downloads", className: "nav-downloads" },
  { label: "EXPERIMENTS", href: "#experiments", className: "nav-experiments" },
  { label: "FIELD NOTES", href: "#notes", className: "nav-field-notes" },
  { label: "BUDDY", href: "#buddy", className: "nav-buddy" },
  { label: "CONTACT", href: "#contact", className: "nav-contact" },
];

const profileLinks = [
  {
    label: "WEBBIFY",
    detail: "webbify.build",
    href: "https://webbify.build/",
  },
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
    return "11 notes are up, newest first: Constraint Collapse (why a forced Y/N answer isn't the model's real opinion), Autocorrection Fidelity (a model's typo-fix fails by confidently handing you a different real word), Causal-State Interpretability (a causal-spectral theory of what a network computes), a red-team of a small local LLM, a demonstration that decodability and causal mechanism diverge by roughly 1600x, a Busy Beaver pipeline that completely decides four classical classes, two notes on tokenization cost, and a negative result showing short-horizon price direction is unpredictable across 258,737 real minute bars (AUC 0.5105). Open any abstract, view the full text, or download the citation.";
  }
  if (/(project|code|github|build)/.test(question)) {
    return "HisokaOS is a 32-bit x86 operating system that boots on its own kernel with 27 bundled applications. The Lazy Driver is an autonomous-driving perception stack over dashcam footage. Bill and Oneiro are local-first systems: a conversational runtime with a from-scratch core, and a continuously learning pixel-art generator. Every project has a README download and a public repository.";
  }
  if (/(agent|agentic|memory|tool)/.test(question)) {
    return "Cooper trains neural networks and studies what happens inside them: the structure that emerges in the weights, and the failures that reveal how these systems actually work. A recurring theme is separating what a network encodes from what it uses -- probes measure the former, interventions the latter, and they can disagree almost entirely.";
  }
  if (/(download|cv|statement|file)/.test(question)) {
    return "Visit Interesting Work for Cooper’s CV, research statement, and selected-work bundle. Every listed file is a real download, and each paper also has a plain-text version plus a BibTeX citation.";
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
  onClick,
}: {
  href?: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  // In-page expand mode: a real button (not a link to nowhere), same art asset and layout as the
  // link version, so revealing every paper looks identical to the old "view more" affordance.
  if (onClick) {
    return (
      <div className="section-more">
        <button
          aria-label={label}
          className="art-action action-view-more"
          onClick={onClick}
          type="button"
        >
          <span className="sr-only">VIEW MORE</span>
        </button>
      </div>
    );
  }
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
  // Rendered server-side as zero, then replaced once /api/visits answers. That endpoint counts
  // unique visits per day from a salted, expiring hash of the address -- the address itself is
  // never stored. Where no KV binding exists it reports zero with live:false rather than a
  // made-up number.
  // Zero until /api/visits answers. This was a hardcoded 013581, which meant the first paint showed
  // an invented figure that the real count then continued from.
  const [visitorCount, setVisitorCount] = useState("000000");
  // Papers panel shows the two newest by default; View More reveals every finished paper in
  // place, rather than sending the visitor off-site to an arXiv author search.
  const [papersExpanded, setPapersExpanded] = useState(false);
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
  /** Synchronous in-flight guard. See the note in sendBuddyMessage on why state is not enough. */
  const buddySendingRef = useRef(false);
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
    // Guarded by a ref, not by the buddyThinking state. Two Enter presses in the same React batch
    // both read the pre-update state value and both send; a ref updates synchronously, so the
    // second returns immediately. The state is still what renders the thinking indicator.
    if (!message || buddySendingRef.current) return;
    buddySendingRef.current = true;

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
      // A rate-limit refusal is plain text, not JSON, so parsing it threw and the visitor silently
      // received a canned reply as though it were a real answer. Say what actually happened.
      if (res.status === 429) {
        settle(
          "You're sending messages faster than I can keep up with — give it a minute and ask me again. Everything else on the page still works.",
        );
        return;
      }
      const data = (await res.json()) as { ok?: boolean; reply?: string };
      // Any other failure falls back to the offline guide rather than showing an error.
      settle(data?.ok && data.reply ? data.reply : getBuddyReply(message, buddyAttachment));
    } catch {
      settle(getBuddyReply(message, buddyAttachment));
    } finally {
      setBuddyThinking(false);
      buddySendingRef.current = false;
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

    // Strip control characters and collapse whitespace before the name is shown anywhere.
    const cleanedName =
      [...file.name]
        .filter((character) => {
          const code = character.charCodeAt(0);
          return code >= 32 && (code < 127 || code > 159);
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim() || "attachment";

    // Both extension tests run against this one string, and against the untruncated form.
    // Previously the support test used the cleaned name while the readable test used the raw one, so
    // "notes.txt " (trailing space) passed as supported and then failed the readable test, giving a
    // text file that was attached but never read. Truncating first also meant a name longer than
    // 120 characters lost its extension and was rejected outright.
    const EXTENSION = /\.(txt|md|csv|json|log|pdf|png|jpe?g)$/i;
    const READABLE = /\.(txt|md|csv|json|log)$/i;
    const supported = EXTENSION.test(cleanedName);

    // Truncate for display only, after the decisions above.
    const safeFileName = cleanedName.slice(0, 120);
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

    const readableText = READABLE.test(cleanedName);
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
            NEURAL NETWORKS, INTERPRETABILITY, AND OPEN EXPERIMENTS FROM SAN DIEGO.
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
              &lt;&lt;::==(( o ))==::&gt;&gt; YOU ARE VISITOR NUMBER{" "}
              {visitorCount} !!! &nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR 3.0 AT
              800×600 &nbsp; ♥ MODEM FRIENDLY ♥ &nbsp; LAST UPDATED 07.28.96
              &nbsp;
            </span>
            <span aria-hidden="true">
              &lt;&lt;::==(( o ))==::&gt;&gt; YOU ARE VISITOR NUMBER{" "}
              {visitorCount} !!! &nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR 3.0 AT
              800×600 &nbsp; ♥ MODEM FRIENDLY ♥ &nbsp; LAST UPDATED 07.28.96
              &nbsp;
            </span>
          </div>
        </div>

        <div className="ticker ticker-yellow" aria-label="Latest news">
          <div className="ticker-track">
            <span>
              &#9993; NEWS FLASH &#9993; COOPER LAUNCHES A NEW STARTUP —{" "}
              <a href="https://webbify.build/" rel="noopener noreferrer" target="_blank">
                WEBBIFY.BUILD
              </a>{" "}
              — AI-BUILT SMALL BUSINESS WEBSITES &nbsp; ::&nbsp;
              <a href="#papers">CLICK HERE TO CHECK OUT MY NEW RESEARCH PAPERS</a>
              &nbsp; ::&nbsp;
            </span>
            <span aria-hidden="true">
              &#9993; NEWS FLASH &#9993; COOPER LAUNCHES A NEW STARTUP —{" "}
              <a href="https://webbify.build/" rel="noopener noreferrer" target="_blank" tabIndex={-1}>
                WEBBIFY.BUILD
              </a>{" "}
              — AI-BUILT SMALL BUSINESS WEBSITES &nbsp; ::&nbsp;
              <a href="#papers" tabIndex={-1}>CLICK HERE TO CHECK OUT MY NEW RESEARCH PAPERS</a>
              &nbsp; ::&nbsp;
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

            {/* The counter reports real unique visits per day (see /api/visits) -- "VISITOR
                COUNTER" heading above, same Arial caption style used everywhere else on the page
                (.counter-box p / .webring-box p). No caption below the digits. */}
            <div className="counter-box">
              <p>VISITOR COUNTER</p>
              <div className="counter-digits" aria-label={`${visitorCount} visits`}>
                {visitorCount.split("").map((digit, index) => (
                  <span key={`${digit}-${index}`}>{digit}</span>
                ))}
              </div>
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
                <span>INTERPRETABILITY</span>
                <span>COMPUTABILITY</span>
                <span>FROM-SCRATCH LEARNING</span>
                <span>HONEST EVALUATION</span>
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
                {(papersExpanded ? papers : papers.slice(0, 2)).map((paper) => (
                  <article className="paper-entry" key={paper.number}>
                    <div className="paper-index">
                      <span>FILE</span>
                      <strong>{paper.number}</strong>
                      <small>{paper.year}</small>
                    </div>
                    <div className="paper-copy">
                      <h3>
                        {paper.title}
                        {paper.isNew ? (
                          <span className="paper-tag-new" aria-label="New paper">
                            NEW
                          </span>
                        ) : null}
                      </h3>
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
              {papersExpanded ? null : (
                <ViewMore
                  label={`View ${papers.length - 2} more papers`}
                  onClick={() => setPapersExpanded(true)}
                />
              )}
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

            <Panel id="downloads" title="Interesting Work" symbol="⬇">
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
                  <span>TXT · 4 KB</span>
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
                  <span>TXT · 3 KB</span>
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
                  <span>ZIP · 640 KB</span>
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

            <Panel id="experiments" title="Experiments" symbol="⚗">
              <p className="section-lede">
                Three small things I wanted to know the answer to. Each was run
                before it was written up, and each reports the numbers it
                actually produced — including the one that came out messier than
                the story around it. The scripts are here; they need only NumPy.
              </p>
              <div className="experiment-list">
                {experiments.map((experiment) => (
                  <article className="experiment" key={experiment.number}>
                    <p className="experiment-number">{experiment.number}</p>
                    <h3>{experiment.title}</h3>
                    <p className="experiment-question">{experiment.question}</p>
                    <div className="experiment-result">
                      {experiment.result.map(([label, value]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="experiment-reading">
                      <strong>WHAT IT MEANS:</strong> {experiment.reading}
                    </p>
                    <a
                      aria-label={`View the script for ${experiment.title}`}
                      className="text-art-button"
                      href={experiment.script}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Read the script →
                    </a>
                  </article>
                ))}
              </div>
              <ViewMore
                href="/api/experiment/results"
                label="View the raw output of all three runs"
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
