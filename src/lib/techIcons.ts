import { withBasePath } from "@/lib/paths";

/**
 * Brand icon URLs for stack chips. Uses Simple Icons CDN — no extra npm deps.
 * Unknown names fall back to a text-only chip in `TechStack`.
 * Tavily and VS Code are not on the current Simple Icons CDN, so they use local marks in `public/tech/`.
 */
const SIMPLE = "https://cdn.simpleicons.org";

const ICONS: Record<string, string> = {
  HTML: `${SIMPLE}/html5/E34F26`,
  HTML5: `${SIMPLE}/html5/E34F26`,
  CSS: `${SIMPLE}/css/663399`,
  JavaScript: `${SIMPLE}/javascript/F7DF1E`,
  Cursor: `${SIMPLE}/cursor/000000`,
  "VS Code": withBasePath("/tech/vscode.svg"),
  VSCode: withBasePath("/tech/vscode.svg"),
  "Visual Studio Code": withBasePath("/tech/vscode.svg"),
  Colab: `${SIMPLE}/googlecolab/F9AB00`,
  "Google Colab": `${SIMPLE}/googlecolab/F9AB00`,
  TypeScript: `${SIMPLE}/typescript/3178C6`,
  "Three.js": `${SIMPLE}/threedotjs/000000`,
  React: `${SIMPLE}/react/61DAFB`,
  "React.js": `${SIMPLE}/react/61DAFB`,
  Vue: `${SIMPLE}/vuedotjs/4FC08D`,
  "Vue.js": `${SIMPLE}/vuedotjs/4FC08D`,
  Python: `${SIMPLE}/python/3776AB`,
  FastAPI: `${SIMPLE}/fastapi/009688`,
  PostgreSQL: `${SIMPLE}/postgresql/4169E1`,
  PostgresQL: `${SIMPLE}/postgresql/4169E1`,
  MySQL: `${SIMPLE}/mysql/4479A1`,
  MongoDB: `${SIMPLE}/mongodb/47A248`,
  Redis: `${SIMPLE}/redis/DC382D`,
  SQLite: `${SIMPLE}/sqlite/003B57`,
  "SQLite-vec": `${SIMPLE}/sqlite/003B57`,
  Docker: `${SIMPLE}/docker/2496ED`,
  Flutter: `${SIMPLE}/flutter/02569B`,
  FlutterFlow: `${SIMPLE}/flutter/02569B`,
  Obsidian: `${SIMPLE}/obsidian/7C3AED`,
  Vercel: `${SIMPLE}/vercel/000000`,
  "Next.js": `${SIMPLE}/nextdotjs/000000`,
  NextJS: `${SIMPLE}/nextdotjs/000000`,
  "Node.js": `${SIMPLE}/nodedotjs/5FA04E`,
  n8n: `${SIMPLE}/n8n/EA4B71`,
  "Node-RED": `${SIMPLE}/nodered/8F0000`,
  "Node-RED / n8n": `${SIMPLE}/nodered/8F0000`,
  "Cloudflare Worker": `${SIMPLE}/cloudflare/F38020`,
  "Cloudflare Workers": `${SIMPLE}/cloudflare/F38020`,
  "Cloudflare R2": `${SIMPLE}/cloudflare/F38020`,
  Cloudflare: `${SIMPLE}/cloudflare/F38020`,
  WebSocket: `${SIMPLE}/socketdotio/010101`,
  LangGraph: `${SIMPLE}/langchain/1C3C3C`,
  MCP: `${SIMPLE}/modelcontextprotocol/000000`,
  LiteRT: `${SIMPLE}/tensorflow/FF6F00`,
  TensorFlow: `${SIMPLE}/tensorflow/FF6F00`,
  PyTorch: `${SIMPLE}/pytorch/EE4C2C`,
  LanceDB: `${SIMPLE}/databricks/FF3621`,
  FastEmbed: `${SIMPLE}/huggingface/FFD21E`,
  "DeepSeek API": `${SIMPLE}/deepseek/4D6BFE`,
  Tavily: withBasePath("/tech/tavily.svg"),
  Tailwind: `${SIMPLE}/tailwindcss/06B6D4`,
  "Tailwind CSS": `${SIMPLE}/tailwindcss/06B6D4`,
  "IoT telemetry": `${SIMPLE}/mqtt/660066`,
  Git: `${SIMPLE}/git/F05032`,
  GitHub: `${SIMPLE}/github/181717`,
  "GitHub Actions": `${SIMPLE}/githubactions/2088FF`,
  Express: `${SIMPLE}/express/000000`,
  "Express.js": `${SIMPLE}/express/000000`,
  "Java Spring Boot": `${SIMPLE}/springboot/6DB33F`,
};

/** Normalize stack labels so "postgresql" and "PostgreSQL" share one icon. */
function normalizeKey(name: string): string {
  return name.trim();
}

export function techIconSrc(name: string): string | null {
  const key = normalizeKey(name);
  if (ICONS[key]) return ICONS[key]!;

  const lower = key.toLowerCase();
  for (const [label, src] of Object.entries(ICONS)) {
    if (label.toLowerCase() === lower) return src;
  }

  // Loose contains for compound labels like "Node-RED / n8n"
  if (lower.includes("postgresql") || lower.includes("postgres")) return ICONS.PostgreSQL!;
  if (lower.includes("cloudflare")) return ICONS["Cloudflare Workers"]!;
  if (lower.includes("flutter")) return ICONS.Flutter!;
  if (lower.includes("obsidian")) return ICONS.Obsidian!;
  if (lower.includes("react")) return ICONS.React!;
  if (lower.includes("n8n")) return ICONS.n8n!;
  if (lower.includes("node-red") || lower.includes("nodered")) return ICONS["Node-RED"]!;
  if (lower === "html" || lower.includes("html5")) return ICONS.HTML!;
  if (lower.includes("colab")) return ICONS.Colab!;
  if (lower.includes("cursor")) return ICONS.Cursor!;
  if (lower.includes("vs code") || lower.includes("vscode") || lower.includes("visual studio code")) {
    return ICONS["VS Code"]!;
  }
  if (lower.includes("javascript") || lower === "js") return ICONS.JavaScript!;
  if (lower === "css" || lower.includes("css3")) return ICONS.CSS!;
  if (lower.includes("vercel")) return ICONS.Vercel!;
  if (lower.includes("github actions") || lower.includes("githubactions")) {
    return ICONS["GitHub Actions"]!;
  }
  if (lower.includes("github")) return ICONS.GitHub!;
  if (lower.includes("redis")) return ICONS.Redis!;
  if (lower.includes("mysql")) return ICONS.MySQL!;

  return null;
}
