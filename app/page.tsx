import { icons, type IconName } from "./icons";
import { Gallery, type Bundle } from "./gallery";
import { GitHubActivity } from "./activity";
import { AskAI } from "./ask";
import { Nav } from "./nav";
import { Logo } from "./logo";

const links: { label: string; handle: string; href: string; icon: IconName | "resume" }[] = [
  { label: "GitHub", handle: "jcooperkai-sys", href: "https://github.com/jcooperkai-sys", icon: "github" },
  { label: "X", handle: "@jcooperkai", href: "https://x.com/jcooperkai", icon: "x-twitter" },
  { label: "Email", handle: "jcooperkai@gmail.com", href: "mailto:jcooperkai@gmail.com", icon: "envelope" },
  { label: "Resume", handle: "Resume", href: "/resume", icon: "resume" },
];

const experience: { company: string; role: string; href: string; site: string; text: string; mark: string }[] = [
  {
    company: "Hyperlapse",
    role: "Head of Product & Engineering",
    href: "https://hyperlapse.com/",
    site: "hyperlapse.com",
    text: "A stock-footage marketplace. I lead product and engineering for the site, the backend and operations. hyperlapse.com is its official home.",
    mark: "/assets/hyperlapse-mark.svg",
  },
];

type Project = { name: string; href: string | null; short: string; blurb: string; meta: string };

const featured: (Project & { logo: string })[] = [
  {
    name: "Autonomous Drone Racing Policy",
    href: "#gallery-drone",
    short: "A neural policy that races a drone through gates.",
    blurb: "An autonomous neural policy that flies a racing drone through gates in simulation, lap after lap. I'm working on it now. The arrow goes to the race footage.",
    meta: "In progress · Private",
    logo: "/assets/projects/drone-racer.png",
  },
  {
    name: "GGUF Token Decoder",
    href: "https://github.com/jcooperkai-sys/GGUF-Token-Decoder",
    short: "Decodes a GGUF model's token IDs using only the model file.",
    blurb: "Turns a local GGUF model's raw token IDs back into text using only the model file.",
    meta: "Python · MIT",
    logo: "/assets/projects/gguf-token-decoder.png",
  },
  {
    name: "HisokaOS",
    href: null,
    short: "A from-scratch 32-bit x86 operating system in C and assembly.",
    blurb: "A 32-bit x86 operating system I wrote from scratch in C and assembly. It boots its own kernel in QEMU to an interactive shell, with paging, PCI, an RTL8139 network driver and a RAM filesystem.",
    meta: "C · MIT · Private",
    logo: "/assets/projects/hisokaos.png",
  },
];

const projects: Project[] = [
  {
    name: "Sentinel",
    href: null,
    short: "A home security vision system in C++ for a small mini PC and a PTZ camera. It detects and tracks people, vehicles and animals, zooms in to verify before it alerts, and patrols like a guard.",
    blurb: "",
    meta: "C++ · Private",
  },
  {
    name: "Rule-Based Motion Planner",
    href: null,
    short: "RBMP, a deterministic driving planner on real United States road geometry. It obeys a traffic-law rulebook with an explicit precedence order and comes with the benchmarks that measure it.",
    blurb: "",
    meta: "Python · Private",
  },
  {
    name: "Scan Quality Map",
    href: "https://github.com/jcooperkai-sys/Scan-Quality-Map",
    short: "My Vesuvius Challenge work. It maps where Herculaneum scroll CT scans can still separate the papyrus layers and where haze hides them, with an atlas of all 22 First Letters scrolls.",
    blurb: "",
    meta: "Python · MIT",
  },
  {
    name: "Dashcam Perception and Path Prediction Stack",
    href: null,
    short: "Lane and drivable-road segmentation, vehicle tracking with metric distances and a predicted driving line, all on ordinary dashcam footage.",
    blurb: "",
    meta: "Python · MIT · Private",
  },
  {
    name: "Local Conversational System with Memory and Fact Checking",
    href: null,
    short: "A local language model with long-term memory, retrieval, planning and fact checking, paired with a predictive concept graph built without an ML framework.",
    blurb: "",
    meta: "C++ · MIT · Private",
  },
  {
    name: "Reachy 2 Reinforcement Learning Base",
    href: null,
    short: "The Reachy 2 robot in MuJoCo with a local viewer, set up for training reinforcement learning policies from scratch.",
    blurb: "",
    meta: "Python · Private",
  },
];

const privateProjects: { name: string; text: string }[] = [
  { name: "Flagger",
    text: "The traffic proxy in front of my GPU server's local language models. It holds Ollama's port and runs one GPU job at a time, most important first: client sites, then public chat, then my own tools, then background work. It also checks every client service every 15 seconds and restarts any that fail three checks in a row." },
  { name: "Personal Agent Harness",
    text: "My desktop app for working with the models on my GPU server. It has chat with tool calling, scheduled tasks that run against a real model, model downloads with live progress, and a view of both machines." },
  { name: "Latent Diffusion Image Generator",
    text: "An image generator on a 6 GB consumer GPU. I instantiate the full latent diffusion architecture myself (U-Net, VAE, CLIP text encoder, DDIM scheduler) and load open pretrained weights into it. It loads on demand and unloads itself when idle." },
  { name: "Motion-Adapter Video Generator",
    text: "Short, low-resolution video clips on the same 6 GB GPU, using a motion module added to a Stable Diffusion U-Net. I tracked an older checkpoint that only ever output noise to a fault in how its time layers merge, and switched to AnimateLCM." },
  { name: "On-Demand Language Model with Web Search",
    text: "A 4-billion-parameter model (Qwen3-4B) served on demand. It looks things up with a live web-search tool when an answer is time-sensitive." },
];

const interests = [
  "Machine learning",
  "Neural networks",
  "Frontier AI models",
  "Agentic software engineering",
  "Self-driving and motion planning",
  "Autonomous drones and robotics",
  "Computer vision",
  "Reinforcement learning",
  "Operating systems",
  "Database engines",
  "Interpretability research",
];

const skills: { group: string; items: { name: string; brand?: string }[] }[] = [
  {
    group: "Coding agents",
    items: [
      { name: "Claude Code", brand: "claude" },
      { name: "Codex", brand: "codex" },
      { name: "Cursor", brand: "cursor" },
      { name: "Grok Bot", brand: "grokbot" },
      { name: "ChatGPT", brand: "openai" },
      { name: "Gemini", brand: "gemini" },
      { name: "Perplexity", brand: "perplexity" },
      { name: "T3 Code", brand: "t3code" },
      { name: "OpenCode", brand: "opencode" },
      { name: "Kimi", brand: "kimi" },
      { name: "Manus", brand: "manus" },
      { name: "Muse", brand: "muse" },
      { name: "Wispr Flow", brand: "wisprflow" },
      { name: "Local agents (Ollama)", brand: "ollama" },
      { name: "Hark", brand: "hark" },
    ],
  },
  {
    group: "Languages",
    items: [
      { name: "Python", brand: "python" },
      { name: "C++", brand: "cplusplus" },
      { name: "C", brand: "c" },
      { name: "TypeScript", brand: "typescript" },
      { name: "JavaScript", brand: "javascript" },
      { name: "Rust", brand: "rust" },
      { name: "C#", brand: "dotnet" },
      { name: "Swift", brand: "swift" },
      { name: "HTML", brand: "html5" },
      { name: "CSS", brand: "css" },
      { name: "Luau", brand: "luau" },
      { name: "GDScript", brand: "godotengine" },
      { name: "Bash", brand: "gnubash" },
      { name: "PowerShell" },
      { name: "SQL" },
      { name: "CMake", brand: "cmake" },
      { name: "Make", brand: "make" },
      { name: "LaTeX", brand: "latex" },
      { name: "x86 assembly" },
    ],
  },
  {
    group: "Machine learning",
    items: [
      { name: "PyTorch", brand: "pytorch" },
      { name: "NVIDIA CUDA", brand: "nvidia" },
      { name: "FFmpeg", brand: "ffmpeg" },
      { name: "QEMU", brand: "qemu" },
      { name: "OpenStreetMap", brand: "openstreetmap" },
      { name: "MuJoCo" },
      { name: "CARLA" },
    ],
  },
  {
    group: "Web and infrastructure",
    items: [
      { name: "Next.js", brand: "nextdotjs" },
      { name: "React", brand: "react" },
      { name: "Node.js", brand: "nodedotjs" },
      { name: "Cloudflare Workers", brand: "cloudflareworkers" },
      { name: "PostgreSQL", brand: "postgresql" },
      { name: "SQLite", brand: "sqlite" },
      { name: "Stripe", brand: "stripe" },
      { name: "Caddy", brand: "caddy" },
      { name: "Tailscale", brand: "tailscale" },
      { name: "Linux", brand: "linux" },
      { name: "GitHub", brand: "github" },
      { name: "Electron", brand: "electron" },
    ],
  },
];

const bundles: Bundle[] = [
  {
    id: "drone",
    name: "Autonomous drone racing",
    note: "The neural policy flying in simulation.",
    items: [
      { kind: "video", thumb: "/assets/gallery/drone/fpv-race-cooper-circuit-thumb.webp", full: "/assets/gallery/drone/fpv-race-cooper-circuit.mp4", width: 640, height: 480, title: "Gate circuit, onboard", alt: "Onboard view of the drone banking toward a green gate on the gate circuit." },
      { kind: "video", thumb: "/assets/gallery/drone/fpv-race-speedway-launch-thumb.webp", full: "/assets/gallery/drone/fpv-race-speedway-launch.mp4", width: 640, height: 480, title: "Speedway launch, onboard", alt: "Onboard view of the drone accelerating off the line toward the first gate." },
      { kind: "video", thumb: "/assets/gallery/drone/fpv-race-speedway-night-thumb.webp", full: "/assets/gallery/drone/fpv-race-speedway-night.mp4", width: 640, height: 480, title: "Speedway at night, onboard", alt: "Onboard view of the drone racing through lit gates in the dark." },
      { kind: "video", thumb: "/assets/gallery/drone/fpv-race-splits-thumb.webp", full: "/assets/gallery/drone/fpv-race-splits.mp4", width: 640, height: 480, title: "Split course, onboard", alt: "Onboard view of the drone threading gates on the split course." },
      { kind: "video", thumb: "/assets/gallery/drone/chase-race-splits-thumb.webp", full: "/assets/gallery/drone/chase-race-splits.mp4", width: 640, height: 480, title: "Split course, chase camera", alt: "Chase-camera view of the drone passing an orange gate on the split course." },
      { kind: "video", thumb: "/assets/gallery/drone/fpv-bando-smokestack-dive-thumb.webp", full: "/assets/gallery/drone/fpv-bando-smokestack-dive.mp4", width: 640, height: 480, title: "Smokestack dive, onboard", alt: "Onboard view of the drone diving down a smokestack." },
    ],
  },
  {
    id: "hisokaos",
    name: "HisokaOS",
    note: "Running in QEMU.",
    items: [
      { kind: "image", thumb: "/assets/gallery/hisokaos/boot-thumb.webp", full: "/assets/gallery/hisokaos/boot.png", width: 720, height: 400, title: "Boot", alt: "HisokaOS booting in QEMU: kernel start-up messages on a dark console." },
      { kind: "image", thumb: "/assets/gallery/hisokaos/setup-thumb.webp", full: "/assets/gallery/hisokaos/setup.png", width: 720, height: 400, title: "Setup screen", alt: "The HisokaOS setup screen in QEMU: a green ASCII-art logo and a welcome message on a dark blue console." },
    ],
  },
  {
    id: "ducky",
    name: "Ducky Diffusion",
    note: "Images from my latent diffusion image generator.",
    items: [
      { kind: "image", thumb: "/assets/gallery/ducky/01-thumb.webp", full: "/assets/gallery/ducky/01.webp", width: 512, height: 512, title: "Generation 1", alt: "Two white and tan dogs sitting side by side on a stone path. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/02-thumb.webp", full: "/assets/gallery/ducky/02.webp", width: 512, height: 512, title: "Generation 2", alt: "Sunlight breaking through clouds over a valley framed by flowers. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/03-thumb.webp", full: "/assets/gallery/ducky/03.webp", width: 512, height: 512, title: "Generation 3", alt: "A misty river valley between forested mountains. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/04-thumb.webp", full: "/assets/gallery/ducky/04.webp", width: 512, height: 512, title: "Generation 4", alt: "An oil portrait of an eighteenth-century man in a white wig. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/05-thumb.webp", full: "/assets/gallery/ducky/05.webp", width: 512, height: 512, title: "Generation 5", alt: "A lighthouse on a rocky coast at sunset. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/06-thumb.webp", full: "/assets/gallery/ducky/06.webp", width: 512, height: 512, title: "Generation 6", alt: "A log cabin in snow with smoke rising behind it. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/07-thumb.webp", full: "/assets/gallery/ducky/07.webp", width: 512, height: 512, title: "Generation 7", alt: "A neon city skyline at night with elevated roads. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/08-thumb.webp", full: "/assets/gallery/ducky/08.webp", width: 512, height: 512, title: "Generation 8", alt: "An astronaut standing alone on red desert sand. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/09-thumb.webp", full: "/assets/gallery/ducky/09.webp", width: 512, height: 512, title: "Generation 9", alt: "A bowl of noodle soup with herbs. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/10-thumb.webp", full: "/assets/gallery/ducky/10.webp", width: 512, height: 512, title: "Generation 10", alt: "A fox on a path through a foggy forest. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/11-thumb.webp", full: "/assets/gallery/ducky/11.webp", width: 512, height: 512, title: "Generation 11", alt: "A wood-panelled library corridor lined with books. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/12-thumb.webp", full: "/assets/gallery/ducky/12.webp", width: 512, height: 512, title: "Generation 12", alt: "A white sailboat on turquoise water under palm trees. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/13-thumb.webp", full: "/assets/gallery/ducky/13.webp", width: 512, height: 512, title: "Generation 13", alt: "A humanoid robot standing in a greenhouse. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/14-thumb.webp", full: "/assets/gallery/ducky/14.webp", width: 512, height: 512, title: "Generation 14", alt: "A stone arch bridge over a rocky mountain stream. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/15-thumb.webp", full: "/assets/gallery/ducky/15.webp", width: 512, height: 512, title: "Generation 15", alt: "A suit of plate armor standing in a stone archway. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/16-thumb.webp", full: "/assets/gallery/ducky/16.webp", width: 512, height: 512, title: "Generation 16", alt: "Orange and pink coral on a blue reef. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/17-thumb.webp", full: "/assets/gallery/ducky/17.webp", width: 512, height: 512, title: "Generation 17", alt: "Hot air balloons rising at sunset. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/18-thumb.webp", full: "/assets/gallery/ducky/18.webp", width: 512, height: 512, title: "Generation 18", alt: "Red sandstone cliffs under an evening sky. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/19-thumb.webp", full: "/assets/gallery/ducky/19.webp", width: 512, height: 512, title: "Generation 19", alt: "A saxophone player with an umbrella on a wet city street at night. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/20-thumb.webp", full: "/assets/gallery/ducky/20.webp", width: 512, height: 512, title: "Generation 20", alt: "A thatched treehouse on stilts in a jungle. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/21-thumb.webp", full: "/assets/gallery/ducky/21.webp", width: 512, height: 512, title: "Generation 21", alt: "A miniature typewriter resting on printed pages. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/22-thumb.webp", full: "/assets/gallery/ducky/22.webp", width: 512, height: 512, title: "Generation 22", alt: "A wolf pack on snow under a full moon. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/23-thumb.webp", full: "/assets/gallery/ducky/23.webp", width: 512, height: 512, title: "Generation 23", alt: "A small pagoda in a rock garden. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/24-thumb.webp", full: "/assets/gallery/ducky/24.webp", width: 512, height: 512, title: "Generation 24", alt: "An owl perched on a branch at night. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/25-thumb.webp", full: "/assets/gallery/ducky/25.webp", width: 512, height: 512, title: "Generation 25", alt: "Yellow taxis on a crowded mid-century city avenue. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/26-thumb.webp", full: "/assets/gallery/ducky/26.webp", width: 512, height: 512, title: "Generation 26", alt: "A stone cottage beside a lake. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/27-thumb.webp", full: "/assets/gallery/ducky/27.webp", width: 512, height: 512, title: "Generation 27", alt: "A white cow standing in a green field. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/28-thumb.webp", full: "/assets/gallery/ducky/28.webp", width: 512, height: 512, title: "Generation 28", alt: "A hooded figure among trees in a black and white forest. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/29-thumb.webp", full: "/assets/gallery/ducky/29.webp", width: 512, height: 512, title: "Generation 29", alt: "An astronaut floating above coral. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/30-thumb.webp", full: "/assets/gallery/ducky/30.webp", width: 512, height: 512, title: "Generation 30", alt: "A lighthouse on a sea rock under storm clouds. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/31-thumb.webp", full: "/assets/gallery/ducky/31.webp", width: 512, height: 512, title: "Generation 31", alt: "Tall bare trees against a purple sky. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/32-thumb.webp", full: "/assets/gallery/ducky/32.webp", width: 512, height: 512, title: "Generation 32", alt: "A still life of grapes, pears and strawberries on a table. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/33-thumb.webp", full: "/assets/gallery/ducky/33.webp", width: 512, height: 512, title: "Generation 33", alt: "An empty yellow corridor with office doors. Generated by Ducky Diffusion." },
      { kind: "image", thumb: "/assets/gallery/ducky/34-thumb.webp", full: "/assets/gallery/ducky/34.webp", width: 512, height: 512, title: "Generation 34", alt: "A stone bridge over a stream in autumn leaves. Generated by Ducky Diffusion." },
    ],
  },
];

function Icon({ name, className }: { name: IconName; className?: string }) {
  const i = icons[name];
  return (
    <svg className={className} viewBox={i.viewBox} aria-hidden="true" focusable="false">
      <path d={i.d} />
    </svg>
  );
}

function ResumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 2h8l5 5v15H6V2zm7.5 1.8V8h4.2L13.5 3.8zM8.5 12v1.6h8V12h-8zm0 3.4V17h8v-1.6h-8zm0 3.4v1.6h5v-1.6h-5z" fillRule="evenodd" />
    </svg>
  );
}

const sections = [
  { id: "activity", label: "Activity" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "gallery", label: "Gallery" },
];

function ProjectLink({ project }: { project: Project }) {
  if (!project.href) return <>{project.name}</>;
  const external = project.href.startsWith("http");
  return (
    <a href={project.href} {...(external ? { rel: "noopener noreferrer" } : {})}>{project.name}</a>
  );
}

export default function Home() {
  return (
    <>
      <link rel="preload" href="/api/github" as="fetch" crossOrigin="anonymous" />
      <a className="skip" href="#main">Skip to content</a>
      <div className="sky" aria-hidden="true">
        <div className="sky-a" />
        <div className="sky-b" />
        <div className="sky-c" />
        <div className="sky-shoot" />
      </div>

      <div className="frame" id="top">
        <header className="top">
          <a className="brand" href="#top">jcooperkai</a>
          <Nav sections={sections} />
          <p className="top-where">Florida, USA</p>
        </header>

        <main id="main">
          <div className="hero">
            <div className="hero-name">
              <div className="hero-mark">
                <Logo className="hero-logo" title="JC logo" />
              </div>
              <h1>jcooperkai</h1>
              <p className="role">Agentic Engineer</p>
              <p className="where">
                <Icon name="location-dot" className="where-icon" />
                Florida, USA
              </p>
            </div>
            <div className="hero-about">
              <p className="intro">
                Hi, I&apos;m Cooper, a professional agentic engineer and the Head of Product &amp; Engineering at
                Hyperlapse. I started hobbying AI in 2022 and I&apos;ve been using it ever since. I am an enthusiast for
                the acceleration of frontier AI models. This is my portfolio. Come check me out!
              </p>
              <ul className="links" aria-label="Find me elsewhere">
                {links.map((l) => (
                  <li key={l.label}>
                    <a className="link-button" href={l.href} {...(l.href.startsWith("http") ? { rel: l.label === "GitHub" || l.label === "X" ? "me noopener noreferrer" : "noopener noreferrer" } : {})}>
                      {l.icon === "resume" ? (
                        <ResumeIcon className="link-icon" />
                      ) : (
                        <Icon name={l.icon} className="link-icon" />
                      )}
                      {l.label !== l.handle && <span className="sr-only">{l.label}: </span>}
                      {l.handle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section className="band" aria-labelledby="activity">
            <GitHubActivity />
          </section>

          <section className="band" aria-labelledby="experience">
            <div className="band-rail">
              <h2 className="label" id="experience">Experience</h2>
            </div>
            <ul className="rows">
              {experience.map((job) => (
                <li className="row row-featured row-job" key={job.company}>
                  <img className="row-logo row-logo-mark" src={job.mark} width={44} height={44} alt="" />
                  <div>
                    <h3>
                      <a href={job.href} rel="noopener noreferrer">{job.role}</a>
                    </h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <p>{job.text}</p>
                  <p className="row-meta">
                    <span className="live-dot" aria-hidden="true" />
                    Current
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="band" aria-labelledby="projects">
            <div className="band-rail">
              <h2 className="label" id="projects">Projects</h2>
            </div>
            <div>
              <ul className="rows">
                {featured.map((p) => (
                  <li className={p.href ? "row row-featured" : "row row-featured row-static"} key={p.name}>
                    <img className="row-logo" src={p.logo} width={56} height={56} alt="" decoding="async" />
                    <h3>
                      <ProjectLink project={p} />
                    </h3>
                    <p>{p.blurb}</p>
                    <p className="row-meta">{p.meta}</p>
                  </li>
                ))}
              </ul>

              <h3 className="sub" id="all-projects">All projects</h3>
              <ul className="rows rows-plain" aria-labelledby="all-projects">
                {projects.map((p) => (
                  <li className={p.href ? "row" : "row row-static"} key={p.name}>
                    <h4>
                      <ProjectLink project={p} />
                    </h4>
                    <p>{p.short}</p>
                    <p className="row-meta">{p.meta}</p>
                  </li>
                ))}
              </ul>
              <p className="more">
                <a className="link-button" href="https://github.com/jcooperkai-sys?tab=repositories" rel="noopener noreferrer">
                  <Icon name="github" className="link-icon" />
                  See more projects on GitHub
                </a>
              </p>
            </div>
          </section>

          <section className="band" aria-labelledby="private">
            <div className="band-rail">
              <h2 className="label" id="private">Other projects</h2>
              <p className="rail-note">Private repositories. Open a name to read what it is.</p>
            </div>
            <ul className="private-list">
              {privateProjects.map((p) => (
                <li key={p.name}>
                  <details>
                    <summary>{p.name}</summary>
                    <p>{p.text}</p>
                  </details>
                </li>
              ))}
            </ul>
          </section>

          <section className="band" aria-labelledby="skills">
            <div className="band-rail">
              <h2 className="label" id="skills">Skills</h2>
            </div>
            <div className="skills">
              {skills.map((group) => (
                <div className="skill-group" key={group.group}>
                  <h3>{group.group}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.name}>
                        {item.brand && (
                          <svg className="skill-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <use href={`/assets/brands.svg#${item.brand}`} />
                          </svg>
                        )}
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="skill-group skill-interests">
                <h3 id="interests">Interests</h3>
                <p>{interests.join(", ")}.</p>
              </div>
            </div>
          </section>

          <section className="band" aria-labelledby="gallery">
            <div className="band-rail">
              <h2 className="label" id="gallery">Gallery</h2>
              <p className="rail-note">Media by project. Scroll each row sideways.</p>
            </div>
            <Gallery bundles={bundles} />
          </section>
        </main>

        <footer className="foot">
          <p className="copyright">
            <img src="/assets/jc-logo.svg" width={21} height={24} alt="" />
            &copy; 2026 Cooper. E
          </p>
          <nav aria-label="Site policies">
            <a href="/privacy">Privacy &amp; local files</a>
            <a href="/security-policy">Responsible disclosure</a>
            <a href="mailto:jcooperkai@gmail.com">jcooperkai@gmail.com</a>
          </nav>
        </footer>
      </div>
      <AskAI />
    </>
  );
}
