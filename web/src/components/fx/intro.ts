// The preloader runs once per browser session; hero motion waits for it.
const KEY = "dx-intro-seen";
export const INTRO_SECONDS = 1.9;

export function introSeen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
}

export function introDelay(): number {
  if (typeof window === "undefined") return 0;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  return introSeen() ? 0 : INTRO_SECONDS - 0.3;
}
