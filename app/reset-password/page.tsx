"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  BottomInfo,
  Button,
  InputOtp,
  Link as ZmLink,
  Result,
  SegmentedControl,
  TextButton,
  TextField,
} from "@zaemoru/react";

import {
  ApiError,
  confirmPasswordReset,
  requestPasswordReset,
  type ResetRole,
} from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/password-strength";

type Step = "email" | "code";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loginRole, setLoginRole] = useState<ResetRole>("user");
  const [emailLoading, setEmailLoading] = useState(false);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailLoading(true);
    try {
      await requestPasswordReset(email, loginRole);
      setStep("code");
      setResendCooldown(60);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "요청 중 오류가 발생했습니다.",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setError("");
    try {
      await requestPasswordReset(email, loginRole);
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

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("6자리 인증 코드를 모두 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setError("비밀번호 조건을 모두 충족해주세요.");
      return;
    }
    setSubmitLoading(true);
    try {
      await confirmPasswordReset(email, code, newPassword, loginRole);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "비밀번호 재설정 중 오류가 발생했습니다.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Result
          tone="success"
          title="비밀번호 변경 완료"
          description="새 비밀번호로 로그인해주세요."
          actions={
            <Link href="/login">
              <Button variant="primary" size="large">
                로그인으로 이동
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <AuthShell
      title={step === "email" ? "비밀번호 재설정" : "새 비밀번호 설정"}
      description={
        step === "email"
          ? "가입한 이메일을 입력하면 인증 코드를 보내드립니다"
          : `${email}으로 발송된 코드와 새 비밀번호를 입력해주세요`
      }
    >
      {error && <BottomInfo tone="danger">{error}</BottomInfo>}

      {step === "email" && (
        <div className="flex flex-col gap-4">
          <SegmentedControl
            fullWidth
            value={loginRole}
            options={[
              { value: "user", label: "일반" },
              { value: "project_owner", label: "프로젝트 오너" },
            ]}
            onChange={(value) => {
              setLoginRole(value as ResetRole);
              setError("");
            }}
          />

          <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
            <TextField
              label="이메일"
              type="email"
              value={email}
              placeholder="your@gsm.hs.kr"
              autoComplete="email"
              size="large"
              onChange={(value) => setEmail(value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={emailLoading}
              disabled={emailLoading || !email}
            >
              인증 코드 발송
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login">
              <ZmLink>로그인으로 돌아가기</ZmLink>
            </Link>
          </div>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={handleConfirmReset} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
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
            <div className="flex justify-center">
              <TextButton
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `${resendCooldown}초 후 재발송`
                  : resending
                    ? "발송 중..."
                    : "코드 재발송"}
              </TextButton>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <TextField
              label="새 비밀번호"
              type="password"
              value={newPassword}
              placeholder="새 비밀번호를 입력하세요"
              autoComplete="new-password"
              size="large"
              onChange={(value) => setNewPassword(value)}
            />
            <PasswordStrength password={newPassword} />
          </div>

          <TextField
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            size="large"
            invalid={
              confirmPassword.length > 0 && newPassword !== confirmPassword
            }
            errorMessage={
              confirmPassword.length > 0 && newPassword !== confirmPassword
                ? "비밀번호가 일치하지 않습니다"
                : undefined
            }
            onChange={(value) => setConfirmPassword(value)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={() => {
                setStep("email");
                setError("");
                setCode("");
              }}
            >
              이전
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={submitLoading}
              disabled={submitLoading}
            >
              비밀번호 변경
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
