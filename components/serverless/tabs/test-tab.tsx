"use client";

import { useState } from "react";

import { Badge, BottomInfo, Button, Card, Text } from "@zaemoru/react";

import { executeFunction, type ExecutionResult } from "@/lib/serverless-api";
import { PlayIcon } from "@/components/ui/icons";

interface TestTabProps {
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

export function TestTab({ funcId }: TestTabProps) {
  const [payload, setPayload] = useState('{\n  "key": "value"\n}');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setRunning(true);
    setError("");
    try {
      let parsed: unknown = {};
      try {
        parsed = JSON.parse(payload);
      } catch {
        setError("페이로드가 유효한 JSON이 아닙니다.");
        setRunning(false);
        return;
      }
      const res = await executeFunction(funcId, parsed);
      setResult(res);
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setError(e.detail || e.message || "실행 실패");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Text size="sm" weight="medium">
          요청 페이로드 (JSON)
        </Text>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-canvas,#fafafa)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--zm-color-border-emphasis,#94a3b8)] focus:ring-1 focus:ring-[var(--zm-color-border-emphasis,#94a3b8)]"
        />
      </div>

      {error && <BottomInfo tone="danger">{error}</BottomInfo>}

      <Button
        variant="primary"
        loading={running}
        disabled={running}
        onClick={handleRun}
      >
        <span className="inline-flex items-center gap-1.5">
          <PlayIcon size={14} />
          {running ? "실행 중..." : "실행"}
        </span>
      </Button>

      {result && (
        <Card elevation="low" padding="medium">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Text size="sm" weight="medium">
                실행 결과
              </Text>
              <Badge variant="weak" color={statusColor(result.status)} size="small">
                {statusLabel(result.status)}
              </Badge>
              <Text size="sm" tone="muted">
                {result.duration}ms
              </Text>
              <Text size="sm" tone="muted">
                HTTP {result.statusCode}
              </Text>
            </div>
            {result.error && (
              <pre className="overflow-x-auto rounded bg-red-50 p-3 text-xs text-red-600">
                {result.error}
              </pre>
            )}
            {result.logs.length > 0 && (
              <div className="flex flex-col gap-1">
                <Text size="sm" weight="medium">
                  출력 로그
                </Text>
                <pre className="overflow-x-auto rounded bg-[var(--zm-color-bg-subtle,#f3f4f6)] p-3 text-xs">
                  {result.logs.join("\n")}
                </pre>
              </div>
            )}
            {result.body && (
              <div className="flex flex-col gap-1">
                <Text size="sm" weight="medium">
                  응답 본문
                </Text>
                <pre className="overflow-x-auto rounded bg-[var(--zm-color-bg-subtle,#f3f4f6)] p-3 text-xs">
                  {result.body}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
