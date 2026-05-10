"use client";

import type { ReactNode } from "react";

import { CheckCircleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function SelectableCard({
  selected,
  disabled,
  onClick,
  badge,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40"
          : "border-[var(--zm-color-border-subtle,#e5e7eb)] hover:border-[var(--zm-color-border-strong,#9ca3af)] hover:bg-[var(--zm-color-bg-subtle,#f9fafb)]",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-opacity",
            selected ? "opacity-100" : "opacity-0",
          )}
        >
          <CheckCircleIcon size={22} className="text-blue-500 dark:text-blue-400" />
        </div>
      </div>
    </button>
  );
}
