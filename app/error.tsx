"use client";

import { useEffect } from "react";

import { Button, Result } from "@zaemoru/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Boundary]", error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Result
        tone="danger"
        title="오류가 발생했습니다"
        description="예상치 못한 문제가 발생했습니다. 다시 시도해주세요."
        actions={
          <Button variant="primary" onClick={reset}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}
