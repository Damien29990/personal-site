export const site = {
  name: "Damien Yu",
  identity: "Full-Stack Engineer · IoT systems & AI agents",
  proof:
    "I build end-to-end systems that take physical IoT data through backends people can trust — and into AI agent workflows that do the next job of work.",
  location: "Hong Kong",
  status: "SYSTEMS ONLINE",
  email: "damien02813@gmail.com",
  links: {
    github: "https://github.com/Damien29990",
    linkedin: "https://www.linkedin.com/in/damien-yu-3ab661260/",
  },
  nav: [
    { label: "Works", href: "#work" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  tags: ["IOT TELEMETRY", "4S PLATFORM", "AI AGENTS"],
  work: [
    {
      slug: "4s-platform",
      title: "A centralized 4S safety platform for live sites",
      eyebrow: "Selected work · Keen Rich / EC Goal (HK)",
      context:
        "Construction sites needed one place for IoT devices, alerts, records, and analysis — not a pile of separate tools that go quiet mid-shift. The platform had to stay useful while people were still on deck.",
      role: "Full-stack engineer — foundation, ongoing maintenance, and the live path connecting site devices to the operations view across thirty-plus modules.",
      decisions: [
        "Keep WebSocket alerts and streaming on the hot path, so exceptions show up before someone opens a report.",
        "Treat site devices as first-class inputs: TCP, REST, and telemetry into one PostgreSQL-backed record and analysis spine.",
        "Ship the surface thin enough to redeploy without ceremony — Redis, Cloudflare Workers, and Vercel where they earn their keep.",
      ],
      result:
        "Supervisors get a live safety and operations view instead of waiting for an export that is already wrong by morning.",
      stack: ["React", "PostgreSQL", "n8n", "WebSocket", "Redis", "Cloudflare Worker", "Vercel"],
    },
    {
      slug: "structural-health",
      title: "Edge-to-cloud structural health telemetry",
      eyebrow: "Selected work · Keen Rich / EC Goal (HK)",
      context:
        "Scaffolding and temporary works fail silently if angular displacement, rope detachment, and environment readings stay trapped on the edge. Someone on site needs the alarm while they can still walk the bay.",
      role: "Tech lead — edge ingest, cloud sync, and the alert path for structural health and environment parameters.",
      decisions: [
        "Pair Node-RED on the edge with n8n in the cloud so field and cabin see the same event.",
        "Prefer a live React operations view over a nightly spreadsheet dump.",
        "Keep Cloudflare Workers in the sync path where latency and reliability matter more than a heavier app server.",
      ],
      result:
        "Angular displacement, rope-detachment alarms, and environment parameters sync from edge to cloud in a form operations can act on.",
      stack: ["Node-RED", "n8n", "React", "PostgreSQL", "Cloudflare Worker"],
    },
    {
      slug: "job-hunter-agents",
      title: "A local multi-agent job hunt and due-diligence pipeline",
      eyebrow: "Side project · Owner",
      context:
        "Job search materials and company diligence should not start from a blank page every time. I wanted a local agent system that explores roles, checks context, and drafts materials without shipping private data to a black-box SaaS.",
      role: "Owner — agent graph, local vector store, and the generation path for search and diligence materials.",
      decisions: [
        "Run the graph on LangGraph so each agent step stays explicit and inspectable.",
        "Keep embeddings local with SQLite-vec and FastEmbed instead of a remote vector product by default.",
        "Use DeepSeek / OpenAI-compatible APIs only where generation earns the round-trip; keep the store on the machine.",
      ],
      result:
        "A local multi-agent pipeline for role exploration, automatic due diligence, and material generation — built to be owned, not rented.",
      stack: ["Python", "LangGraph", "SQLite-vec", "FastEmbed", "DeepSeek API", "Tavily"],
    },
  ],
  projects: [
    {
      slug: "anshin",
      index: "01",
      name: "Anshin",
      type: "Frontend UI study",
      description:
        "A Vue interface study from the earlier public gallery — layout, components, and how the screen feels in use.",
      stack: ["Vue"],
      image: "/projects/anshin.png",
    },
    {
      slug: "wordle",
      index: "02",
      name: "Wordle",
      type: "Web game study",
      description:
        "A browser Wordle-style game, kept as a practice trail for HTML and front-end interaction.",
      stack: ["HTML"],
      image: "/projects/wordle.png",
    },
    {
      slug: "bonsai",
      index: "03",
      name: "Bonsai",
      type: "Frontend study",
      description:
        "A recreation of the Bonsai homepage — practice work, not a selected case study.",
      stack: ["HTML", "CSS", "JavaScript"],
      image: "/projects/bonsai.png",
    },
  ],
  experience: [
    {
      company: "Keen Rich Enterprise Limited",
      title: "Senior Software Engineer",
      dates: "Mar 2026 — present",
      bullets: [
        "Own end-to-end project delivery for client systems — scope, architecture, and the path to a shippable release.",
        "Architect scalable designs across full-stack and AI/agent work: RAG, LangGraph, LiteRT, and modern vector stores such as LanceDB.",
        "Put CI/CD in place so deploys stay thin enough that a dashboard or agent change does not need a ceremony.",
      ],
    },
    {
      company: "Keen Rich Enterprise Limited",
      title: "Software Engineer",
      dates: "Nov 2024 — Mar 2026",
      bullets: [
        "Built full-stack web and mobile ecosystems in React and Flutter, including App Store and Google Play compliance and release.",
        "Engineered integrated IoT solutions and high-performance PostgreSQL schemas for site and operations data.",
        "Shipped production paths with Next.js, Vercel, Redis, Cloudflare R2 / Workers, n8n, and TypeScript / Python services.",
      ],
    },
    {
      company: "Octopus InfoTech Limited",
      title: "Part-Time Programmer",
      dates: "Aug 2023 — Nov 2023",
      bullets: [
        "Built and debugged production React interfaces for a Hong Kong private school's internal operations.",
        "Contributed backend software alongside that UI work (Java Spring Boot, MongoDB / MySQL).",
      ],
    },
    {
      company: "Edison AI (Google for Startups)",
      title: "Software Engineer Intern",
      dates: "Jun 2023 — Aug 2023",
      bullets: [
        "Built a ChatGPT-style chat interface in Vue.",
        "Wired it to an Express API that talked to a Python backend.",
      ],
    },
  ],
  education:
    "BSc (Hons) Enterprise Information Systems, The Hong Kong Polytechnic University, 2020–2024.",
  about: {
    paragraphs: [
      "I am a full-stack engineer who sits between physical IoT data, backends that stay honest, and AI agent systems that take the next step. Most of my shipped work is construction-site and operations software in Hong Kong — telemetry, alerts, and screens someone will keep open through a shift.",
      "I like scope first, then build. I am looking for full-stack, IoT, or AI/agent engineering work — especially product and start-up environments where the system has to survive contact with real users.",
    ],
    specifics: [
      "Optimize for: clarity under stress — one fact an operator can act on.",
      "Usual constraint: field networks, bilingual stakeholders, and Hong Kong local time.",
      "On paper: Hong Kong St. John Ambulance First Aid Certificate, 2024 · JLPT N3, 2024.",
      "Languages: Cantonese (native), English (fluent), Putonghua (fluent), Japanese (intermediate).",
    ],
  },
  skills: [
    {
      group: "Systems",
      items: ["Python", "FastAPI", "PostgreSQL", "Docker", "IoT telemetry"],
    },
    {
      group: "AI / agents",
      items: ["LangGraph", "MCP", "FastEmbed", "LiteRT", "LanceDB"],
    },
    {
      group: "Interface & field",
      items: ["React", "TypeScript", "Flutter", "Node-RED / n8n", "Cloudflare Workers"],
    },
  ],
  contact: {
    heading: "Hiring for full-stack, IoT, or AI agent work in Hong Kong?",
    body: "Write to me by email or LinkedIn — I read everything. GitHub is there if you want the public trail.",
    specs: [
      { key: "EMAIL", value: "damien02813@gmail.com", href: "mailto:damien02813@gmail.com" },
      { key: "CHANNEL", value: "LinkedIn", href: "https://www.linkedin.com/in/damien-yu-3ab661260/" },
      { key: "SOURCE", value: "GitHub", href: "https://github.com/Damien29990" },
      { key: "LOCALE", value: "Hong Kong", href: null },
      { key: "SITE", value: "damien29990.github.io/personal-site", href: "https://damien29990.github.io/personal-site" },
    ],
  },
  heroBuild: {
    hint: "Drag to turn · scroll or pinch to zoom",
    caption:
      "Hong Kong site diorama — green safety nets, bamboo scaffold, catch-fans, a climbing tower crane, hoist, MiC and precast, then 4S sensors. Massing follows a courtyard-tower timelapse, not one real address.",
  },
  heroLoop: {
    src: "/site-loop.mp4",
    seconds: 10,
    caption: "Site loop — a seamless 10s pass over the model.",
    hint: "Drag to rotate · click to hold",
    fallback: "The site loop cannot play in this browser.",
  },
} as const;

export type WorkItem = (typeof site.work)[number];
export type ProjectItem = (typeof site.projects)[number];
export type ExperienceItem = (typeof site.experience)[number];
