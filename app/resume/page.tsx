import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resume, Jeffery Eckert", alternates: { canonical: "/resume" } };

const experience = [
  {
    company: "Hyperlapse",
    role: "Head of Product & Engineering",
    when: "Current",
    where: "hyperlapse.com",
    points: [
      "Lead product and engineering for a stock-footage marketplace: the site, the backend and operations in one repository.",
      "Built the seller upload flow, catalog search, credits, payouts ledger and the legal and release steps contributors go through.",
      "Run a pull-request-only release process where a change ships only after tests, security checks and an independent review pass.",
      "Keep every rate limit and abuse control in one central policy module, with backups, alerts and a rehearsed staging-to-production cutover.",
    ],
  },
];

const projects = [
  { name: "Sentinel", stack: "C++17, LibTorch, ncnn, PPO", text: "Home security vision system for a small mini PC and a PTZ camera. It detects and tracks people, vehicles and animals, zooms in to verify before alerting, and patrols like a guard. Training, export and runtime are all C++." },
  { name: "Autonomous Drone Racing Policy", stack: "Reinforcement learning, simulation", text: "A neural policy that flies a racing drone through gates in simulation, lap after lap. In progress." },
  { name: "Rule-Based Motion Planner (RBMP)", stack: "Python, SUMO, OpenStreetMap", text: "Deterministic driving planner on real United States road geometry. It obeys a traffic-law rulebook with an explicit precedence order and ships with the benchmarks that measure it." },
  { name: "Scan Quality Map", stack: "Python, OME-Zarr", text: "Maps where Herculaneum scroll CT scans can still separate the papyrus layers and where haze hides them, with an atlas of all 22 First Letters scrolls. Built for the Vesuvius Challenge." },
  { name: "HisokaOS", stack: "C, x86 assembly, QEMU", text: "A 32-bit x86 operating system from scratch: its own kernel, paging, PCI, an RTL8139 network driver, a RAM filesystem and an interactive shell." },
  { name: "GGUF Token Decoder", stack: "Python", text: "Turns a local GGUF model's raw token IDs back into text using only the model file, with no ML framework." },
];

const skills = [
  { area: "LLMs and agents", items: "Claude Code, Codex, Cursor, Grok Bot, ChatGPT, Gemini, Perplexity, T3 Code, OpenCode, Kimi, Manus, multi-agent workflows, tool calling, local models with Ollama and GGUF, retrieval and long-term memory" },
  { area: "Machine learning", items: "PyTorch and LibTorch, object detection and segmentation, reinforcement learning (PPO), latent diffusion, Gaussian splatting, path prediction" },
  { area: "MLOps", items: "Single-GPU training on rented hardware, budget guards, checkpoint sync and verification, ncnn export, on-device inference on small PCs" },
  { area: "Web backend", items: "Python services, Cloudflare Workers, PostgreSQL, SQLite, Stripe billing, rate limiting, webhooks" },
  { area: "Full stack", items: "TypeScript, React, Next.js, accessible responsive interfaces, Electron desktop apps" },
  { area: "Infrastructure", items: "Linux servers, Caddy, systemd, Tailscale, Cloudflare, backups and restore drills, alerting, CI gates" },
  { area: "Data", items: "Crash-safe storage engines, B+tree indexes, SQL parsing and planning, OME-Zarr volumes, OpenStreetMap road data" },
  { area: "Languages", items: "Python, C++, C, TypeScript, JavaScript, Rust, C#, Swift, Luau, GDScript, SQL, Bash, PowerShell, x86 assembly" },
];

export default function Resume() {
  return (
    <>
      <div className="sky" aria-hidden="true">
        <div className="sky-a" />
        <div className="sky-b" />
        <div className="sky-c" />
      </div>
      <div className="frame resume-frame">
        <header className="top">
          <a className="brand" href="/">jcooperkai</a>
        </header>
        <main className="doc resume-wrap" id="main">
          <div className="resume-bar">
            <h1 className="label">Resume</h1>
            <p className="doc-links">
              <a className="link-button" href="/">Back home</a>
              <a className="link-button" href="/assets/Jeffery-Eckert-Resume.pdf" download>Download PDF</a>
            </p>
          </div>
          <article className="paper">
            <header>
              <p className="paper-name">Jeffery Eckert</p>
              <p className="paper-contact">
                Florida, USA · <a href="mailto:jcooperkai@gmail.com">jcooperkai@gmail.com</a> ·{" "}
                <a href="https://jcooperkai.com/">jcooperkai.com</a> ·{" "}
                <a href="https://github.com/jcooperkai-sys">github.com/jcooperkai-sys</a> ·{" "}
                <a href="https://x.com/jcooperkai">x.com/jcooperkai</a>
              </p>
            </header>

            <section>
              <h2>Summary</h2>
              <p>
                Agentic engineer who goes by Cooper. Working with AI since 2022. I direct coding agents to build and run
                production software, and I build machine learning systems from scratch: vision models, driving planners,
                an operating system and a database engine.
              </p>
            </section>

            <section>
              <h2>Experience</h2>
              {experience.map((job) => (
                <div className="paper-item" key={job.company}>
                  <p className="paper-line">
                    <strong>{job.role}</strong>
                    <span>{job.when}</span>
                  </p>
                  <p className="paper-line paper-sub">
                    <span>{job.company}</span>
                    <span>{job.where}</span>
                  </p>
                  <ul>
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section>
              <h2>Projects</h2>
              {projects.map((project) => (
                <div className="paper-item" key={project.name}>
                  <p className="paper-line">
                    <strong>{project.name}</strong>
                    <span>{project.stack}</span>
                  </p>
                  <p>{project.text}</p>
                </div>
              ))}
            </section>

            <section>
              <h2>Technical skills</h2>
              <dl className="paper-skills">
                {skills.map((skill) => (
                  <div key={skill.area}>
                    <dt>{skill.area}</dt>
                    <dd>{skill.items}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </article>
        </main>
      </div>
    </>
  );
}
