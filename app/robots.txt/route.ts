export function GET() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`);
}
