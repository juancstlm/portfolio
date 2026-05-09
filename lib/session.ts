import { track } from "./track";

type Entry = "home" | "apps" | "other";

let started = false;

function detectEntry(pathname: string): Entry {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/apps")) return "apps";
  return "other";
}

function readUtms(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ]) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export function startSession() {
  if (typeof window === "undefined" || started) return;
  started = true;

  const entry = detectEntry(window.location.pathname);
  const utms = readUtms(window.location.search);
  track("session_start", { entry, ...utms });
}
