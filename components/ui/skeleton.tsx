"use client";

import { Card, Skeleton } from "@zaemoru/react";

export function InstanceCardSkeleton() {
  return (
    <Card elevation="low" padding="medium">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton shape="text" width="50%" height="20px" />
          <Skeleton shape="text" width="80%" height="14px" />
        </div>
        <Skeleton shape="rect" width="56px" height="22px" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton shape="text" width="40%" height="11px" />
            <Skeleton shape="text" width="60%" height="16px" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Skeleton shape="rect" width="56px" height="32px" />
        <Skeleton shape="rect" width="56px" height="32px" />
        <Skeleton shape="rect" width="56px" height="32px" />
        <Skeleton shape="rect" width="56px" height="32px" />
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
        <Skeleton shape="text" width="40%" height="14px" />
        <Skeleton shape="text" width="60%" height="12px" />
      </div>
      <Skeleton shape="rect" width="60px" height="24px" />
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
          <Skeleton shape="text" width="60%" height="14px" />
          <Skeleton shape="circle" width="8px" height="8px" />
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
          <Skeleton shape="text" width="50%" height="16px" />
          <Skeleton shape="text" width="70%" height="12px" />
        </div>
        <Skeleton shape="rect" width="48px" height="22px" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton shape="text" width="90%" height="12px" />
        <Skeleton shape="text" width="60%" height="12px" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton shape="rect" width="50%" height="32px" />
        <Skeleton shape="rect" width="50%" height="32px" />
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
          <Skeleton shape="text" width="80%" height="14px" />
          <Skeleton shape="text" width="60%" height="14px" />
        </div>
        <Skeleton shape="rect" width="64px" height="22px" />
      </div>
      <div className="mt-2">
        <Skeleton shape="text" width="120px" height="11px" />
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
        <Skeleton shape="text" width="200px" height="12px" />
        <div className="flex items-center gap-2">
          <Skeleton shape="text" width="180px" height="28px" />
          <Skeleton shape="rect" width="64px" height="22px" />
        </div>
        <Skeleton shape="text" width="280px" height="14px" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Skeleton shape="rect" width="64px" height="32px" />
          <Skeleton shape="rect" width="64px" height="32px" />
          <Skeleton shape="rect" width="64px" height="32px" />
          <Skeleton shape="rect" width="64px" height="32px" />
        </div>
      </div>
      <Skeleton shape="rect" width="100%" height="44px" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} elevation="low" padding="medium">
            <Skeleton shape="text" width="40%" height="18px" />
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton shape="text" width="30%" height="14px" />
                  <Skeleton shape="text" width="20%" height="14px" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
