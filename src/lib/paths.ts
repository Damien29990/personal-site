/** Empty on Vercel/local; `/personal-site` when `GITHUB_PAGES=true`. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("#")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

export function homeUrl(hash?: string): string {
  const home = `${basePath}/`;
  if (!hash) return home;
  return `${home}${hash.startsWith("#") ? hash : `#${hash}`}`;
}
