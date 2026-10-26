"use client";

import type { ComponentPropsWithoutRef } from "react";
import { PressLink } from "./press";
import { useTransitionNav } from "./transitions";

// A pressable CTA that plays the page curtain before navigating.
export function PressNav({ href, label, radius, pressedRadius, ...rest }: { href: string; label?: string; radius?: number; pressedRadius?: number } & ComponentPropsWithoutRef<"a">) {
  const { go } = useTransitionNav();
  return (
    <PressLink
      {...rest}
      href={href}
      radius={radius}
      pressedRadius={pressedRadius}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        go(href, { label });
      }}
    />
  );
}
