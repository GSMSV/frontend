"use client";

import Link from "next/link";

import { Card } from "@zaemoru/react";

import { ArrowLeftIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type SkeletonBlockProps = {
  shape?: "text" | "rect" | "circle";
  width: string;
  height: string;
  className?: string;
};

function SkeletonBlock({
  shape = "rect",
  width,
  height,
  className,
}: SkeletonBlockProps) {
  const radius =
    shape === "circle"
      ? "9999px"
      : shape === "text"
        ? "var(--zm-radius-sm, 4px)"
        : "var(--zm-radius-md, 8px)";

  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-[#e5e8eb]", className)}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function InstanceCardSkeleton() {
  return (
    <Card padding="large">
      <div className="flex min-h-[48px] items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <SkeletonBlock shape="text" width="46%" height="24px" />
          <SkeletonBlock shape="text" width="58%" height="14px" />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <SkeletonBlock shape="rect" width="48px" height="20px" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[64px] flex-col justify-center gap-2 rounded-md border border-[#eef0f2] bg-[#f9fafb] px-3 py-2"
          >
            <SkeletonBlock shape="text" width="34%" height="12px" />
            <SkeletonBlock shape="text" width="48%" height="18px" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#eef0f2] pt-4">
        <SkeletonBlock shape="rect" width="56px" height="32px" />
        <SkeletonBlock shape="rect" width="68px" height="32px" />
        <SkeletonBlock shape="rect" width="56px" height="32px" />
        <SkeletonBlock shape="rect" width="56px" height="32px" />
      </div>
    </Card>
  );
}

export function InstanceGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <InstanceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function InstanceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Link
          href="/instances"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--zm-color-text-muted,#94a3b8)] hover:text-[var(--zm-color-text-primary,#0f172a)]"
        >
          <ArrowLeftIcon size={16} />
          인스턴스 목록으로 돌아가기
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonBlock shape="text" width="180px" height="32px" />
              <SkeletonBlock shape="rect" width="48px" height="20px" />
            </div>
            <SkeletonBlock shape="text" width="280px" height="18px" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock shape="rect" width="56px" height="32px" />
            <SkeletonBlock shape="rect" width="56px" height="32px" />
            <SkeletonBlock shape="rect" width="68px" height="32px" />
            <SkeletonBlock shape="rect" width="56px" height="32px" />
          </div>
        </div>
      </div>
      <div className="flex min-h-11 items-center gap-2 border-b border-[#eef0f2]">
        {["개요", "모니터링", "방화벽", "설정"].map((tab, index) => (
          <div
            key={tab}
            className={cn(
              "flex h-11 items-center px-3 text-sm font-medium",
              index === 0
                ? "border-b-2 border-[var(--zm-color-primary,#3182f6)] text-[var(--zm-color-primary,#3182f6)]"
                : "text-[var(--zm-color-text-muted,#94a3b8)]",
            )}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} elevation="low" padding="medium">
            <SkeletonBlock shape="text" width="34%" height="22px" />
            <div className="mt-3 flex flex-col">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <SkeletonBlock shape="text" width="72px" height="18px" />
                  <SkeletonBlock shape="text" width="88px" height="18px" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
