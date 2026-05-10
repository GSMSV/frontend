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
      style={
        selected
          ? {
              borderColor: "var(--zm-color-primary, #3182f6)",
              backgroundColor: "var(--zm-color-primary-subtle, #e8f1fe)",
            }
          : undefined
      }
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border-2 bg-white px-4 py-3.5 text-left transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
        !selected &&
          "border-(--zm-color-border-subtle,#e5e7eb) hover:border-(--zm-color-border-strong,#9ca3af) hover:bg-(--zm-color-bg-subtle,#f9fafb)",
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
          <CheckCircleIcon
            size={22}
            className="text-(--zm-color-primary,#3182f6)"
          />
        </div>
      </div>
    </button>
  );
}
