// Shapes the Go backend returns. Kept separate from mock.ts so both the live and
// demo data layers share one type.
import type { Channel } from "@/i18n/dictionaries";

export type Author = "customer" | "ai" | "human";
export type ConvStatus = "needs" | "ai" | "closed";

export type Message = { id: string; from: Author; text: string; at: string };

export type Draft = { text: string; confidence: number; intent: string; handoff: boolean; reason: string };

export type Contact = { id: string; handle: string; name: string };

// CRM fields shown in the inbox side panel. The backend omits them for now; the demo
// data layer fills them so the panel still has something to show.
export type CustomerCard = {
  since: string;
  spent: number;
  orders: { id: string; item: string; status: string }[];
  tags: string[];
};

export type Conversation = {
  id: string;
  workspace: string;
  channel: Channel;
  account: string;
  threadId: string;
  contact: Contact;
  status: ConvStatus;
  humanOnly: boolean;
  messages: Message[];
  draft?: Draft | null;
  updatedAt: string;
  // Relative time + unread are presentation helpers the demo supplies; with the API,
  // time is derived from updatedAt and unread defaults to 0.
  time?: string;
  unread?: number;
  customer?: CustomerCard;
};
