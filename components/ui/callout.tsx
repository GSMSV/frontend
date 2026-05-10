"use client";

import type { ReactNode } from "react";

import { Text } from "@zaemoru/react";

import { cn } from "@/lib/utils";

type Tone = "info" | "warning" | "danger" | "success";

const TONE_STYLES: Record<
  Tone,
  { bg: string; border: string; icon: string; iconBg: string }
> = {
  info: {
    bg: "bg-[#e8f1fe]",
    border: "border-[#3182f6]/30",
    icon: "text-[#3182f6]",
    iconBg: "bg-white",
  },
  warning: {
    bg: "bg-[#fef6e0]",
    border: "border-[#f5a623]/40",
    icon: "text-[#b76e00]",
    iconBg: "bg-white",
  },
  danger: {
    bg: "bg-[#fde8e8]",
    border: "border-[#e02b2b]/30",
    icon: "text-[#c81e1e]",
    iconBg: "bg-white",
  },
  success: {
    bg: "bg-[#e6f7ee]",
    border: "border-[#16a34a]/30",
    icon: "text-[#15803d]",
    iconBg: "bg-white",
  },
};

const TONE_ICON: Record<Tone, string> = {
  info: "ⓘ",
  warning: "!",
  danger: "!",
  success: "✓",
};

export function Callout({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const s = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-4",
        s.bg,
        s.border,
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold",
          s.icon,
          s.iconBg,
        )}
      >
        {TONE_ICON[tone]}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && (
          <Text size="sm" weight="semibold">
            {title}
          </Text>
        )}
        {children && (
          <div className="text-sm leading-relaxed text-[var(--zm-color-text-secondary,#475569)]">
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
