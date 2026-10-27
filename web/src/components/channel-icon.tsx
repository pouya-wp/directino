"use client";

import { InstagramLogo, TelegramLogo, WhatsappLogo } from "@phosphor-icons/react";
import type { Channel } from "@/i18n/dictionaries";

const icons = { instagram: InstagramLogo, whatsapp: WhatsappLogo, telegram: TelegramLogo };

export function ChannelIcon({ channel, size = 16, className }: { channel: Channel; size?: number; className?: string }) {
  const Icon = icons[channel];
  return <Icon size={size} weight="regular" className={className} aria-hidden />;
}
