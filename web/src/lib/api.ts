// Typed client for the Go backend. Calls go browser -> API with the session cookie
// (credentials: "include"); the base URL is same-host in dev and the api. subdomain in prod.
import type { Conversation } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8099";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/v1${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      msg = (await res.json()).error ?? msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type User = { id: string; email: string; name: string; workspace: string; workspaceName: string };
export type Settings = { mode: "draft" | "approve" | "auto"; threshold: number; brandVoice: string; replyLanguage: string };

export const api = {
  base: BASE,
  signup: (b: { name: string; email: string; business: string; password: string; edition: "fa" | "en" }) =>
    call<User>("/auth/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) => call<User>("/auth/login", { method: "POST", body: JSON.stringify(b) }),
  logout: () => call<void>("/auth/logout", { method: "POST" }),
  me: () => call<User>("/auth/me"),

  conversations: () => call<Conversation[]>("/conversations"),
  conversation: (id: string) => call<Conversation>(`/conversations/${id}`),
  approve: (id: string, text?: string) => call<void>(`/conversations/${id}/approve`, { method: "POST", body: JSON.stringify({ text: text ?? "" }) }),
  reply: (id: string, text: string) => call<void>(`/conversations/${id}/reply`, { method: "POST", body: JSON.stringify({ text }) }),
  handback: (id: string) => call<Conversation>(`/conversations/${id}/handback`, { method: "POST" }),

  settings: () => call<Settings>("/settings"),
  saveSettings: (s: Settings) => call<Settings>("/settings", { method: "PUT", body: JSON.stringify(s) }),

  eventsUrl: () => `${BASE}/v1/events`,
  linkUrl: (channel: string) => `${BASE}/v1/channels/${channel}/link`,
};
