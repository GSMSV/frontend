"use client";

import { useEffect } from "react";

import { Button, Result } from "@zaemoru/react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Result
        tone="danger"
        title="페이지 로딩 중 오류가 발생했습니다"
        description="문제가 지속되면 관리자에게 문의해주세요."
        actions={
          <Button variant="secondary" onClick={reset}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}
