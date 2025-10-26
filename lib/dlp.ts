const ALLOW = ["localhost","127.0.0.1","yourdomain.com","blog.yourdomain.com","help.yourdomain.com"];

export function redactPII(text: string) {
  if (!text) return text;
  text = text.replace(/(\+?\d[\d\-\.\s\(\)]{8,}\d)/g, "[REDACTED PHONE]");
  text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED EMAIL]");
  text = text.replace(/\d{1,5}\s+[A-Za-z0-9\.\-]+\s+(Street|St|Ave|Avenue|Blvd|Road|Rd|Lane|Ln)\b/gi, "[REDACTED ADDRESS]");
  return text;
}

const SUPPLIER = ["supplier","wholesale","factory","manufacturer","MOQ","ex-factory","sourcing list","vendor list","distributor","private label","FOB","whatsapp","telegram","wechat","weixin","contact"];
const INTERNAL = ["margin","quota","discount","cost price","landed cost","COGS","pricing sheet","rate card","internal price"];

export function containsBannedTopics(text: string) {
  if (!text) return false;
  const s = text.toLowerCase();
  const kw = (arr:string[]) => arr.some(k => s.includes(k));
  const hasPhone = /(\+?\d[\d\-\.\s\(\)]{8,}\d)/.test(text);
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  return kw(SUPPLIER) || kw(INTERNAL) || hasPhone || hasEmail;
}

export function stripExternalLinks(text: string) {
  if (!text) return text;
  return text.replace(/https?:\/\/[^\s)]+/g, (url) => {
    try {
      const h = new URL(url).hostname.replace(/^www\./,"");
      const ok = ALLOW.some(a => h.endsWith(a));
      return ok ? url : "[LINK REMOVED]";
    } catch { return "[LINK REMOVED]"; }
  });
}

export function sanitizeOutbound(text: string) {
  return stripExternalLinks(redactPII(text));
}

export const SYSTEM_GUARD = `
You are Veloura$ AI. Strict policy:
- Never disclose personal contact info (phone, email, address).
- Never reveal supplier identities, contacts, or direct acquisition routes.
- Never reveal internal prices, margins, quotas, discounts, or sourcing spreadsheets.
- If asked for restricted info, refuse and offer public-safe alternatives.
`;
