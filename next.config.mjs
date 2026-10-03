import fs from "node:fs";
import path from "node:path";

// Reindirizzamenti 301 dai vecchi URL WordPress (alla radice) ai nuovi /progetti/[slug]
const dir = path.join(process.cwd(), "content/projects");
const redirects = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => {
    const p = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const from = p.legacyPath.replace(/\/$/, "");
    const to = `/progetti/${p.slug}`;
    return [
      { source: from, destination: to, statusCode: 301 },
      { source: `${from}/`, destination: to, statusCode: 301 },
    ];
  });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};
export default nextConfig;
