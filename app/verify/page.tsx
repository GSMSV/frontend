"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  BottomInfo,
  Button,
  InputOtp,
  Link as ZmLink,
  Spinner,
  TextButton,
} from "@zaemoru/react";

import { ApiError, resendCode } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/auth/auth-shell";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="medium" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    if (code.length !== 6) {
      setError("6자리 인증 코드를 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email, code);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "인증 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setError("");
    try {
      await resendCode(email);
      setResendCooldown(60);
      setCode("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "코드 재발송에 실패했습니다.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="이메일 인증"
      description={
        email ? (
          <>
            <strong>{email}</strong>으로 발송된 6자리 코드를 입력해주세요
          </>
        ) : (
          "발송된 6자리 코드를 입력해주세요"
        )
      }
    >
      {error && <BottomInfo tone="danger">{error}</BottomInfo>}

      <div
        className="flex flex-col gap-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      >
        <div className="flex justify-center">
          <InputOtp
            parts={6}
            value={code}
            onChange={(value) => {
              setCode(value);
              setError("");
            }}
          />
        </div>
        <Button
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          disabled={loading || code.length !== 6}
          onClick={handleSubmit}
        >
          인증 완료
        </Button>
      </div>

      <div className="flex justify-center">
        <TextButton
          onClick={handleResend}
          disabled={resending || resendCooldown > 0}
        >
          {resendCooldown > 0
            ? `${resendCooldown}초 후 재발송 가능`
            : resending
              ? "발송 중..."
              : "인증 코드 재발송"}
        </TextButton>
      </div>

      <div className="text-center text-sm">
        다른 이메일로 가입하시겠어요?{" "}
        <Link href="/signup">
          <ZmLink>회원가입으로 돌아가기</ZmLink>
        </Link>
      </div>
    </AuthShell>
  );
}
