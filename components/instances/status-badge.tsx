"use client";

import { Badge } from "@zaemoru/react";

import type { InstanceStatus } from "@/lib/types";

const config: Record<
  InstanceStatus,
  { label: string; color: "green" | "red" | "yellow" }
> = {
  running: { label: "실행 중", color: "green" },
  stopped: { label: "중지됨", color: "red" },
  pending: { label: "대기 중", color: "yellow" },
  error: { label: "오류", color: "red" },
};

export function StatusBadge({ status }: { status: InstanceStatus }) {
  const c = config[status] ?? config.stopped;
  return (
    <Badge variant="weak" size="small" color={c.color}>
      {c.label}
    </Badge>
  );
}
