export function GET() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const urls = ["/","/chat","/invoices","/products"];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join("") +
    `</urlset>`, { headers: { "Content-Type":"application/xml" }});
}
