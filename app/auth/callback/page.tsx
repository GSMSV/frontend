"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Paragraph, Spinner } from "@zaemoru/react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    fetch("/api/v1/oauth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("token exchange failed");
        router.replace("/instances");
      })
      .catch(() => {
        router.replace("/login?error=oauth_failed");
      });
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="medium" />
        <Paragraph size="sm" tone="muted">
          로그인 처리 중...
        </Paragraph>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="medium" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
