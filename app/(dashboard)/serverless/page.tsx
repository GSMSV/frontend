"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button, Empty, Heading, ProgressBar, Text } from "@zaemoru/react";

import {
  getFunctions,
  getQuota,
  type FunctionQuota,
  type ServerlessFunction,
} from "@/lib/serverless-api";

import { FunctionList } from "@/components/serverless/function-list";

export default function ServerlessPage() {
  const [functions, setFunctions] = useState<ServerlessFunction[]>([]);
  const [quota, setQuota] = useState<FunctionQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getFunctions(), getQuota()]).then(
      ([funcsResult, quotaResult]) => {
        if (funcsResult.status === "fulfilled") setFunctions(funcsResult.value);
        if (quotaResult.status === "fulfilled") setQuota(quotaResult.value);
        setLoading(false);
      },
    );
  }, []);

  const isAtLimit = quota ? functions.length >= quota.max : false;
  const usagePercent =
    quota && quota.max > 0
      ? Math.min((functions.length / quota.max) * 100, 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Heading level="2" size="lg">
            서버리스 함수
          </Heading>
          <Text size="sm" tone="muted">
            코드를 배포하고 HTTP 트리거 또는 Cron으로 실행하세요
          </Text>
        </div>
        <Button
          variant="primary"
          disabled={isAtLimit}
          onClick={
            isAtLimit
              ? undefined
              : () => (window.location.href = "/serverless/new")
          }
        >
          + 새 함수
        </Button>
      </div>

      {isAtLimit && quota && (
        <Text size="sm" tone="muted">
          함수 한도({quota.max}개)에 도달했습니다. 기존 함수를 삭제해야 새
          함수를 만들 수 있습니다.
        </Text>
      )}

      {quota && (
        <div className="flex flex-col gap-2 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-4">
          <div className="flex items-center justify-between">
            <Text size="sm" weight="medium">
              함수 사용량
            </Text>
            <Text size="sm" tone="muted">
              {functions.length} / {quota.max} 개
            </Text>
          </div>
          <ProgressBar
            value={usagePercent}
            max={100}
            tone={usagePercent >= 100 ? "danger" : "primary"}
            size="small"
          />
        </div>
      )}

      {loading ? (
        <Text size="sm" tone="muted">
          로딩 중...
        </Text>
      ) : functions.length === 0 ? (
        <Empty title="아직 함수가 없습니다" description="첫 번째 서버리스 함수를 만들어보세요">
          <Link href="/serverless/new">
            <Button variant="primary">함수 만들기</Button>
          </Link>
        </Empty>
      ) : (
        <FunctionList
          functions={functions}
          onDeleted={(id) =>
            setFunctions((prev) => prev.filter((f) => f.id !== id))
          }
        />
      )}
    </div>
  );
}
