export const site = {
  name: "Damien Yu",
  drawingId: "DY-4S-001",
  identity: "ConTech / Smart Site Safety Platform Architect",
  proof:
    "I turn messy site operations into live systems that supervisors can actually keep open through a shift.",
  location: "Hong Kong",
  status: "SENSORS ONLINE",
  email: null,
  links: {
    github: "https://github.com/Damien29990",
    linkedin: "https://www.linkedin.com/in/damien-yu-3ab661260/",
  },
  nav: [
    { label: "Works", href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  tags: ["4S SPEC", "IOT TELEMETRY", "STRUCTURAL HEALTH"],
  work: [
    {
      slug: "4s-telemetry",
      title: "Live telemetry for a 4S construction site",
      eyebrow: "Selected work",
      context:
        "A smart-site safety platform is only useful if the stream stays honest: dual-axis gyros, displacement sensors, and alerts arriving while people are still on the deck. The broken version of this problem is a spreadsheet that is already wrong by morning.",
      role: "I owned the telemetry spine — ingest, time-zone truth, alert dispatch, and the query path the monitor sits on.",
      decisions: [
        "Treat Asia/Hong_Kong as the clock the field uses, not an afterthought converted in the UI.",
        "Keep numerical thresholds and state transitions in plain functions, so an alert never depends on a model guessing.",
        "Optimize the live read path first. A warehouse tomorrow does not help a supervisor tonight.",
      ],
      result:
        "The operations view can follow sensor health and exceptions in Hong Kong time, instead of waiting for an export.",
      stack: ["Python", "FastAPI", "PostgreSQL", "Node-RED / n8n", "Docker"],
    },
    {
      slug: "site-monitor",
      title: "A monitor built for glance, not for a report",
      eyebrow: "Selected work",
      context:
        "The same 4S spine still fails if the screen looks like another BI tool. People on site needed connection state and exceptions in one place they would not have to hunt through.",
      role: "I designed and shipped the live dashboard on top of that telemetry — layout, status, and what gets shown first.",
      decisions: [
        "Lead with live / not-live / needs a walk, not a wall of charts.",
        "Keep the interface thin enough to redeploy without a ceremony.",
        "Show location and exception together, so a person can leave the cabin with one fact.",
      ],
      result:
        "Site staff can see which sensors are speaking and which alerts need a walk, without opening a spreadsheet first.",
      stack: ["React", "JavaScript", "Vercel"],
    },
  ],
  experience: [
    {
      company: "ConTech Solutions Ltd",
      title: "Senior Software Engineer",
      dates: "2025 — present",
      bullets: [
        "Own the 4S telemetry spine — ingest, Hong Kong time, alert dispatch, and the live query path the monitor sits on.",
        "Package the same site data as FastAPI services, n8n / Node-RED flows, and an MCP server for internal tooling.",
        "Keep deploy thin enough that a dashboard change does not need a ceremony, so supervisors still have a screen that is current.",
      ],
    },
    {
      company: "ConTech Solutions Ltd",
      title: "Software Engineer",
      dates: "2024 — 2025",
      bullets: [
        "Built the 4S IoT path for multi-sensor streams and alert dispatch used in live site monitoring.",
        "Normalized timestamps to Asia/Hong_Kong so the operations view could stay current through a shift.",
        "Shipped the glance monitor: live / not-live / needs a walk, not a wall of charts.",
      ],
    },
    {
      company: "Octopus InfoTech Limited",
      title: "Part-Time Programmer",
      dates: "Aug 2023 — Nov 2023",
      bullets: [
        "Built and debugged React interfaces for production use.",
        "Contributed backend software next to that UI work.",
      ],
    },
    {
      company: "Edison AI",
      title: "Software Engineer Intern",
      dates: "Jun 2023 — Aug 2023 · Tokyo",
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
      "I care whether a tool survives contact with a real site: dropouts, shift changes, and people who will not wait for a spinner. Most of my work sits between sensors, clocks, and a screen someone has to trust.",
      "I like scope first, then build. If a hiring team is looking for ConTech, IoT, or site-systems work in Hong Kong, that is the conversation I want.",
    ],
    specifics: [
      "Optimize for: clarity under stress — one fact a supervisor can act on.",
      "Usual constraint: field networks, bilingual stakeholders, and Hong Kong local time.",
      "On paper: St. John Ambulance first aid certificate, 2024.",
      "Languages: Cantonese, English, Mandarin, Japanese (JLPT N3).",
    ],
  },
  skills: [
    {
      group: "Systems",
      items: ["Python", "FastAPI", "PostgreSQL", "Docker", "IoT telemetry"],
    },
    {
      group: "Interface",
      items: ["React", "JavaScript", "Vercel"],
    },
    {
      group: "Field",
      items: ["Node-RED / n8n", "Time-series queries", "MCP"],
    },
  ],
  contact: {
    heading: "Hiring for ConTech or site-systems work in Hong Kong?",
    body: "Write to me on LinkedIn — I read everything. GitHub is there if you want the public trail.",
    specs: [
      { key: "CHANNEL", value: "LinkedIn", href: "https://www.linkedin.com/in/damien-yu-3ab661260/" },
      { key: "SOURCE", value: "GitHub", href: "https://github.com/Damien29990" },
      { key: "LOCALE", value: "Hong Kong", href: null },
    ],
  },
  heroBuild: {
    hint: "Drag to scrub the build",
    caption:
      "Voxel site model — one build cycle per minute, from bare ground to commissioned sensors.",
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
export type ExperienceItem = (typeof site.experience)[number];
