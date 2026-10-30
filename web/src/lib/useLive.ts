"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "./format";
import { api } from "./api";
import type { Conversation } from "./types";
import { demoConversations } from "./mock";

// The demo adapter returns the API Conversation shape, so the fallback keeps the
// dashboard alive and interactive when no backend is connected.
type Live = {
  conversations: Conversation[];
  live: boolean; // true when backed by the real API
  loading: boolean;
  approve: (id: string, text?: string) => Promise<void>;
  reply: (id: string, text: string) => Promise<void>;
  handback: (id: string) => Promise<void>;
  patch: (id: string, fn: (c: Conversation) => Conversation) => void;
};

export function useLive(lang: Lang): Live {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const mock = useRef(false);

  const upsert = useCallback((c: Conversation) => {
    setConversations((prev) => {
      const i = prev.findIndex((x) => x.id === c.id);
      const next = i === -1 ? [c, ...prev] : prev.map((x) => (x.id === c.id ? c : x));
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.conversations();
        if (cancelled) return;
        setConversations(list);
        setLive(true);
        setLoading(false);
      } catch {
        // No backend reachable: run on demo data so the UI still demonstrates.
        if (cancelled) return;
        mock.current = true;
        setConversations(demoConversations(lang));
        setLive(false);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // Live updates over SSE while the API is driving.
  useEffect(() => {
    if (!live) return;
    const es = new EventSource(api.eventsUrl(), { withCredentials: true });
    es.addEventListener("conversation", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as { conversation?: Conversation };
        if (data.conversation) upsert(data.conversation);
      } catch {}
    });
    es.onerror = () => {}; // EventSource retries on its own
    return () => es.close();
  }, [live, upsert]);

  const patch = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  // In demo mode, mutations update local state; with the API, the server echoes over SSE.
  const approve = useCallback(
    async (id: string, text?: string) => {
      if (mock.current) {
        patch(id, (c) => ({ ...c, draft: null, status: "ai", messages: [...c.messages, { id: crypto.randomUUID(), from: "ai", text: text || c.draft?.text || "", at: new Date().toISOString() }] }));
        return;
      }
      await api.approve(id, text);
    },
    [patch],
  );
  const reply = useCallback(
    async (id: string, text: string) => {
      if (mock.current) {
        patch(id, (c) => ({ ...c, humanOnly: true, draft: null, status: "closed", messages: [...c.messages, { id: crypto.randomUUID(), from: "human", text, at: new Date().toISOString() }] }));
        return;
      }
      await api.reply(id, text);
    },
    [patch],
  );
  const handback = useCallback(
    async (id: string) => {
      if (mock.current) {
        patch(id, (c) => ({ ...c, humanOnly: false }));
        return;
      }
      await api.handback(id);
    },
    [patch],
  );

  return { conversations, live, loading, approve, reply, handback, patch };
}
