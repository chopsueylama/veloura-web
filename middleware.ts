import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = { matcher: ["/embed/:path*"] };

// Allow embedding from your dev, ngrok, and production domains
const ALLOWED = [
  "http://localhost:8081",              // your local test iframe server
  "http://localhost:3000",              // Next.js dev server
  "https://*.ngrok-free.app",           // ngrok tunnels
  "https://your-website.com",           // your production domain
  "https://www.your-website.com"        // alternate domain
];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const csp = `frame-ancestors 'self' ${ALLOWED.join(" ")};`;
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "ALLOW-FROM https://your-website.com");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
