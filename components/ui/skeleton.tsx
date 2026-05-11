"use client";

import { Card } from "@zaemoru/react";

type SkeletonBlockProps = {
  shape?: "text" | "rect" | "circle";
  width: string;
  height: string;
};

function SkeletonBlock({
  shape = "rect",
  width,
  height,
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
      className="animate-pulse bg-[#e5e8eb]"
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function InstanceCardSkeleton() {
  return (
    <Card elevation="low" padding="medium">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <SkeletonBlock shape="text" width="50%" height="20px" />
          <SkeletonBlock shape="text" width="80%" height="14px" />
        </div>
        <SkeletonBlock shape="rect" width="56px" height="22px" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <SkeletonBlock shape="text" width="40%" height="11px" />
            <SkeletonBlock shape="text" width="60%" height="16px" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <SkeletonBlock shape="rect" width="56px" height="32px" />
        <SkeletonBlock shape="rect" width="56px" height="32px" />
        <SkeletonBlock shape="rect" width="56px" height="32px" />
        <SkeletonBlock shape="rect" width="56px" height="32px" />
      </div>
    </Card>
  );
}

export function InstanceGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <InstanceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-(--zm-color-border-subtle,#e5e7eb) p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <SkeletonBlock shape="text" width="40%" height="14px" />
        <SkeletonBlock shape="text" width="60%" height="12px" />
      </div>
      <SkeletonBlock shape="rect" width="60px" height="24px" />
    </div>
  );
}

export function RowListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarVmSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2">
          <SkeletonBlock shape="text" width="60%" height="14px" />
          <SkeletonBlock shape="circle" width="8px" height="8px" />
        </div>
      ))}
    </div>
  );
}

export function ApprovalCardSkeleton() {
  return (
    <Card elevation="low" padding="medium">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <SkeletonBlock shape="text" width="50%" height="16px" />
          <SkeletonBlock shape="text" width="70%" height="12px" />
        </div>
        <SkeletonBlock shape="rect" width="48px" height="22px" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <SkeletonBlock shape="text" width="90%" height="12px" />
        <SkeletonBlock shape="text" width="60%" height="12px" />
      </div>
      <div className="mt-4 flex gap-2">
        <SkeletonBlock shape="rect" width="50%" height="32px" />
        <SkeletonBlock shape="rect" width="50%" height="32px" />
      </div>
    </Card>
  );
}

export function ApprovalGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ApprovalCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function QuestionRowSkeleton() {
  return (
    <Card elevation="low" padding="medium">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <SkeletonBlock shape="text" width="80%" height="14px" />
          <SkeletonBlock shape="text" width="60%" height="14px" />
        </div>
        <SkeletonBlock shape="rect" width="64px" height="22px" />
      </div>
      <div className="mt-2">
        <SkeletonBlock shape="text" width="120px" height="11px" />
      </div>
    </Card>
  );
}

export function QuestionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <QuestionRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function InstanceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <SkeletonBlock shape="text" width="200px" height="12px" />
        <div className="flex items-center gap-2">
          <SkeletonBlock shape="text" width="180px" height="28px" />
          <SkeletonBlock shape="rect" width="64px" height="22px" />
        </div>
        <SkeletonBlock shape="text" width="280px" height="14px" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <SkeletonBlock shape="rect" width="64px" height="32px" />
          <SkeletonBlock shape="rect" width="64px" height="32px" />
          <SkeletonBlock shape="rect" width="64px" height="32px" />
          <SkeletonBlock shape="rect" width="64px" height="32px" />
        </div>
      </div>
      <SkeletonBlock shape="rect" width="100%" height="44px" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} elevation="low" padding="medium">
            <SkeletonBlock shape="text" width="40%" height="18px" />
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <SkeletonBlock shape="text" width="30%" height="14px" />
                  <SkeletonBlock shape="text" width="20%" height="14px" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
