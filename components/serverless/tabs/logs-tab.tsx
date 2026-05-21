"use client";

import { useEffect, useState } from "react";

import { Badge, Button, Dialog, Text } from "@zaemoru/react";

import {
  deleteFunctionLogs,
  getFunctionLogs,
  type ExecutionLog,
} from "@/lib/serverless-api";
import { ArrowPathIcon, ChevronDownIcon, ChevronRightIcon, TrashIcon } from "@/components/ui/icons";

interface LogsTabProps {
  funcId: string;
}

function statusColor(status: string): "green" | "red" | "yellow" {
  if (status === "success") return "green";
  if (status === "error") return "red";
  return "yellow";
}

function statusLabel(status: string): string {
  if (status === "success") return "성공";
  if (status === "error") return "에러";
  if (status === "timeout") return "타임아웃";
  return status;
}

function LogItem({ log }: { log: ExecutionLog }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(log.error || log.logs.length > 0 || log.response);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
        onClick={() => hasDetail && setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Badge variant="weak" color={statusColor(log.status)} size="small">
            {statusLabel(log.status)}
          </Badge>
          <Badge variant="weak" color="blue" size="small">
            {log.trigger}
          </Badge>
          <Text size="sm" tone="muted">
            {log.duration}ms
          </Text>
          <Text size="sm" tone="muted">
            {new Date(log.createdAt).toLocaleString("ko-KR")}
          </Text>
        </div>
        {hasDetail && (
          open ? (
            <ChevronDownIcon size={14} />
          ) : (
            <ChevronRightIcon size={14} />
          )
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-t border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-subtle,#f3f4f6)] px-3 py-2.5">
          {log.error && (
            <div className="flex flex-col gap-1">
              <Text size="sm" weight="medium" tone="danger">
                에러
              </Text>
              <pre className="overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-600">
                {log.error}
              </pre>
            </div>
          )}
          {log.logs.length > 0 && (
            <div className="flex flex-col gap-1">
              <Text size="sm" weight="medium">
                출력 로그
              </Text>
              <pre className="overflow-x-auto rounded border border-[var(--zm-color-border-subtle,#e5e7eb)] bg-white p-2 text-xs">
                {log.logs.join("\n")}
              </pre>
            </div>
          )}
          {log.response && (
            <div className="flex flex-col gap-1">
              <Text size="sm" weight="medium">
                응답
              </Text>
              <pre className="overflow-x-auto rounded border border-[var(--zm-color-border-subtle,#e5e7eb)] bg-white p-2 text-xs">
                {log.response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LogsTab({ funcId }: LogsTabProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearOpen, setClearOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getFunctionLogs(funcId)
      .then(setLogs)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [funcId]);

  const handleClear = async () => {
    await deleteFunctionLogs(funcId);
    setLogs([]);
    setClearOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text size="sm" weight="medium">
          실행 로그 ({logs.length})
        </Text>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="small"
            disabled={loading}
            onClick={load}
          >
            <span className="inline-flex items-center gap-1.5">
              <ArrowPathIcon size={14} />
              새로고침
            </span>
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setClearOpen(true)}
          >
            <span className="inline-flex items-center gap-1.5">
              <TrashIcon size={14} />
              전체 삭제
            </span>
          </Button>
        </div>
      </div>

      <Dialog
        open={clearOpen}
        kind="confirm"
        title="로그 전체 삭제"
        description="모든 실행 로그를 삭제합니다. 이 작업은 되돌릴 수 없습니다."
        onCancel={() => setClearOpen(false)}
        onConfirm={handleClear}
      />

      {loading ? (
        <Text size="sm" tone="muted">
          로딩 중...
        </Text>
      ) : logs.length === 0 ? (
        <Text size="sm" tone="muted">
          실행 로그가 없습니다.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
