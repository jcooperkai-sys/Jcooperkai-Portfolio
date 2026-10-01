import { icons, type IconName } from "./icons";
import { Gallery, type Shot } from "./gallery";

/* Everything on this page is already public: my GitHub repositories, my company's site, my email and city. */

type Badge = { src: string; alt: string };

const lang = {
  c: { src: "/badges/lang-c.svg", alt: "Language: C" },
  cpp: { src: "/badges/lang-cpp.svg", alt: "Language: C++" },
  python: { src: "/badges/lang-python.svg", alt: "Language: Python" },
  javascript: { src: "/badges/lang-javascript.svg", alt: "Language: JavaScript" },
  html: { src: "/badges/lang-html.svg", alt: "Language: HTML" },
  nsis: { src: "/badges/lang-nsis.svg", alt: "Language: NSIS" },
} satisfies Record<string, Badge>;
const mit: Badge = { src: "/badges/license-mit.svg", alt: "License: MIT" };

const links: { label: string; handle: string; href: string; icon: IconName | "webbify" }[] = [
  { label: "GitHub", handle: "jcooperkai-sys", href: "https://github.com/jcooperkai-sys", icon: "github" },
  { label: "X", handle: "@jcooperkai", href: "https://x.com/jcooperkai", icon: "x-twitter" },
  { label: "Email", handle: "jcooperkai@gmail.com", href: "mailto:jcooperkai@gmail.com", icon: "envelope" },
  { label: "Webbify", handle: "webbify.build", href: "https://webbify.build/", icon: "webbify" },
];

const projects: { name: string; repo: string; short: string; icon: IconName; blurb: string; badges: Badge[] }[] = [
  {
    name: "HisokaOS",
    repo: "HisokaOS",
    short: "A from-scratch 32-bit x86 operating system in C and assembly.",
    icon: "microchip",
    blurb:
      "A 32-bit x86 operating system I wrote from scratch in C and assembly. It boots its own kernel in QEMU to an interactive shell, with paging, PCI, an RTL8139 network driver and a RAM filesystem.",
    badges: [lang.c, mit],
  },
  {
    name: "TRDE",
    repo: "TRDE",
    short: "A transactional relational database engine in pure Python.",
    icon: "database",
    blurb:
      "A Transactional Relational Database Engine I wrote in pure Python with no dependencies: a pager, B+tree indexes, crash-safe transactions, a SQL parser and a query planner.",
    badges: [lang.python, mit],
  },
  {
    name: "The Lazy Driver",
    repo: "The-Lazy-Driver",
    short: "Self-driving perception and path prediction on dashcam footage.",
    icon: "car",
    blurb:
      "Self-driving perception and path prediction on ordinary dashcam footage. It segments lanes and drivable road, tracks vehicles with metric distances, and draws a predicted driving line kept on the road.",
    badges: [lang.python, mit],
  },
  {
    name: "AV-Viz",
    repo: "AV-Viz",
    short: "A one-file viewer for self-driving perception at an intersection.",
    icon: "road",
    blurb: "A single HTML file that shows what a self-driving car perceives at an HD-mapped four-way intersection.",
    badges: [lang.html, mit],
  },
  {
    name: "Bill",
    repo: "Bill",
    short: "A local conversational system with memory, retrieval and fact checking.",
    icon: "comments",
    blurb:
      "A conversational system that runs on my own machine: a local language model with long-term memory, retrieval, planning and fact checking, paired with a predictive concept graph I built without an ML framework.",
    badges: [lang.cpp, mit],
  },
  {
    name: "Oneiro",
    repo: "Oneiro",
    short: "A pixel-art model that paints a language model's ideas all day.",
    icon: "palette",
    blurb:
      "Generative art that runs all day. A local language model free-associates ideas, and a pixel-art model I wrote in NumPy learns to paint each one as it arrives, streaming to a live gallery.",
    badges: [],
  },
  {
    name: "Cache the Cat",
    repo: "Cache-The-Cat-AI",
    short: "A pixel-art cat assistant that lives on your Windows desktop.",
    icon: "cat",
    blurb:
      "A pixel-art cat that lives on your Windows desktop. It chats through a local model, remembers context, and runs desktop actions only after you approve them.",
    badges: [lang.javascript],
  },
  {
    name: "Reachy RL",
    repo: "Reachy-RL",
    short: "Reachy 2 in MuJoCo, set up for reinforcement learning.",
    icon: "robot",
    blurb: "The Reachy 2 robot in MuJoCo with a local viewer, set up as a base for training reinforcement learning policies from scratch.",
    badges: [lang.python],
  },
  {
    name: "GGUF Token Decoder",
    repo: "GGUF-Token-Decoder",
    short: "Decodes a GGUF model's token IDs using only the model file.",
    icon: "file-code",
    blurb: "Turns a local GGUF model's raw token IDs back into text using only the model file.",
    badges: [lang.python, mit],
  },
  {
    name: "SuperCompress Local",
    repo: "SuperCompress-Local",
    short: "SuperCompress running fully on your own machine.",
    icon: "file-zipper",
    blurb:
      "Runs Arjun Shah's SuperCompress entirely on your own machine, so agent hooks and MCP clients talk to localhost with no API key or quota.",
    badges: [lang.python],
  },
  {
    name: "Roblox Piano Hotkey",
    repo: "Roblox-Piano-Hotkey",
    short: "Plays songs on Roblox's Virtual Piano with real timing.",
    icon: "music",
    blurb:
      "An Electron app that plays songs on Roblox's Virtual Piano with real timing, including chords, rests and sustain. It comes with a MIDI converter and a check for whether a person could actually play the song.",
    badges: [lang.javascript, mit],
  },
  {
    name: "Editor Browser",
    repo: "Editor-Browser",
    short: "A full browser tab inside the VS Code editor.",
    icon: "window-maximize",
    blurb: "A VS Code extension that opens a full browser tab in the editor area, with audio, video and a real address bar.",
    badges: [lang.javascript],
  },
  {
    name: "App Installer",
    repo: "app-installer",
    short: "A Windows application with an NSIS installer.",
    icon: "box-open",
    blurb: "A Windows application packaged with an NSIS installer and a command-line interface.",
    badges: [lang.nsis],
  },
];

/* The three I lead with, in this order, each with its own logo. They also appear in the full list below. */
const featured: { repo: string; logo: string }[] = [
  { repo: "GGUF-Token-Decoder", logo: "/assets/projects/gguf-token-decoder.png" },
  { repo: "TRDE", logo: "/assets/projects/trde.png" },
  { repo: "HisokaOS", logo: "/assets/projects/hisokaos.png" },
];

/* Private repositories: the name expands to what it is. Descriptions approved by me, 2026-09-30. */
const privateProjects: { name: string; text: string }[] = [
  { name: "Flagger",
    text: "The traffic proxy in front of my GPU server's local language models. It holds Ollama's port and runs one GPU job at a time, most important first: Webbify clients, then public chat, then my own tools, then background work. It also checks every Webbify service every 15 seconds and restarts any that fail three checks in a row." },
  { name: "Ducky Studio",
    text: "My desktop app for working with the models on my GPU server. It has chat with tool calling, scheduled tasks that run against a real model, model downloads with live progress, and a view of both machines." },
  { name: "Latent Diffusion Image Generator",
    text: "An image generator on a 6 GB consumer GPU. I instantiate the full latent diffusion architecture myself (U-Net, VAE, CLIP text encoder, DDIM scheduler) and load open pretrained weights into it. It loads on demand and unloads itself when idle." },
  { name: "Motion-Adapter Video Generator",
    text: "Short, low-resolution video clips on the same 6 GB GPU, using a motion module added to a Stable Diffusion U-Net. I tracked an older checkpoint that only ever output noise to a fault in how its time layers merge, and switched to AnimateLCM." },
  { name: "On-Demand Language Model with Web Search",
    text: "A 4-billion-parameter model (Qwen3-4B) served on demand. It looks things up with a live web-search tool when an answer is time-sensitive." },
  { name: "Wingwall Neural World",
    text: "Real driving scenes rebuilt as navigable 3D worlds with Gaussian splatting, made as a place to test a self-driving planner. It reaches 21.5 dB PSNR on held-out views." },
];

const shots: Shot[] = [
  { thumb: "/assets/gallery/lidar-thumb.jpg", full: "/assets/gallery/lidar.jpg", width: 1280, height: 720,
    title: "Lidar Map in CARLA", alt: "A dense grey lidar point cloud of a city street, with my car following a green planned path around a bend." },
  { thumb: "/assets/gallery/hisokaos-thumb.png", full: "/assets/gallery/hisokaos.png", width: 720, height: 400,
    title: "HisokaOS setup screen", alt: "The HisokaOS setup screen in QEMU: a green ASCII-art logo and a welcome message on a dark blue console." },
  { thumb: "/assets/gallery/ducky-diffusion.jpg", full: "/assets/gallery/ducky-diffusion.jpg", width: 512, height: 512,
    title: "Ducky Diffusion", alt: "A misty river valley between forested mountains, generated by Ducky Diffusion." },
];

function Icon({ name, className }: { name: IconName; className?: string }) {
  const i = icons[name];
  return (
    <svg className={className} viewBox={i.viewBox} aria-hidden="true" focusable="false">
      <path d={i.d} />
    </svg>
  );
}

/* The hero art: the hero itself is the off-white sky; this is the grey slope and charcoal hill, pinned to the
   bottom at a fixed height so it never runs into the text. Drawn twice, wide and narrow, so the angle stays
   gentle on a phone. The charcoal hill becomes the page below it. */
function HeroArt() {
  return (
    <>
      <svg className="hero-art hero-art-wide" viewBox="0 0 1600 268" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="0,0 1600,176 1600,268 0,268" fill="var(--slope)" />
        <polygon points="0,80 1600,228 1600,268 0,268" fill="var(--ground)" />
      </svg>
      <svg className="hero-art hero-art-narrow" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="0,0 600,92 600,200 0,200" fill="var(--slope)" />
        <polygon points="0,68 600,152 600,200 0,200" fill="var(--ground)" />
      </svg>
    </>
  );
}

export default function Home() {
  return (
    <>
      <header className="hero">
        <HeroArt />
        <div className="hero-inner">
          <img className="hero-logo" src="/assets/jc-logo.png" width={128} height={86} alt="JC logo" />
          <h1>jcooperkai</h1>
          <p className="role">Agentic Engineer</p>
          <p className="where">
            <Icon name="location-dot" className="where-icon" />
            San Diego
          </p>
          <ul className="links" aria-label="Find me elsewhere">
            {links.map((l) => (
              <li key={l.label}>
                <a className="link-button" href={l.href} {...(l.href.startsWith("http") ? { rel: "noopener noreferrer" } : {})}>
                  {l.icon === "webbify" ? (
                    <img className="link-icon" src="/assets/webbify-mark.png" width={18} height={17} alt="" />
                  ) : (
                    <Icon name={l.icon} className="link-icon" />
                  )}
                  <span className="sr-only">{l.label}: </span>
                  {l.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="page">

        <section aria-labelledby="company">
          <h2 id="company">Company</h2>
          <ul className="list">
            <li className="item">
              <img className="item-icon" src="/assets/webbify-mark.png" width={28} height={26} alt="" />
              <div>
                <h3>
                  <a href="https://webbify.build/" rel="noopener noreferrer">Webbify</a>
                </h3>
                <p>
                  AI agents rebuild and run small-business websites, each with a live client dashboard.
                </p>
                <p className="badges">
                  <img src="/badges/status-live.svg" height={20} alt="Status: live" />
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section aria-labelledby="projects">
          <h2 id="projects">Projects</h2>
          <ul className="list">
            {featured.map((f) => {
              const p = projects.find((x) => x.repo === f.repo)!;
              return (
                <li className="item item-featured" key={p.repo}>
                  <img className="item-logo" src={f.logo} width={56} height={56} alt="" />
                  <div>
                    <h3>
                      <a href={`https://github.com/jcooperkai-sys/${p.repo}`} rel="noopener noreferrer">{p.name}</a>
                    </h3>
                    <p>{p.blurb}</p>
                    {p.badges.length > 0 && (
                      <p className="badges">
                        {p.badges.map((b) => (
                          <img key={b.src} src={b.src} height={20} alt={b.alt} />
                        ))}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <h3 className="sub" id="all-projects">All projects</h3>
          <ul className="plain-links" aria-labelledby="all-projects">
            {projects.map((p) => (
              <li key={p.repo}>
                <a className="blue" href={`https://github.com/jcooperkai-sys/${p.repo}`} rel="noopener noreferrer">{p.name}</a>
                <span>{p.short}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="private">
          <h2 id="private">Other projects</h2>
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

        <section aria-labelledby="gallery">
          <h2 id="gallery">Gallery</h2>
          <Gallery shots={shots} />
        </section>
      </main>

      <footer className="foot">
        <nav aria-label="Site policies">
          <a href="/privacy.txt">Privacy &amp; local files</a>
          <a href="/security-policy.txt">Responsible disclosure</a>
          <a href="mailto:jcooperkai@gmail.com">jcooperkai@gmail.com</a>
        </nav>
        <p className="copyright">
          <img src="/assets/jc-logo.png" width={36} height={24} alt="" />
          &copy; 2026 Cooper. E
        </p>
      </footer>
    </>
  );
}
