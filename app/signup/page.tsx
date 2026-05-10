"use client";

import { useState } from "react";
import Link from "next/link";

import {
  BottomInfo,
  Button,
  Link as ZmLink,
  TextField,
} from "@zaemoru/react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/password-strength";

export default function SignupPage() {
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("비밀번호 조건을 모두 충족해주세요.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      sessionStorage.setItem("notif:signup", "true");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="회원가입"
      description="새 계정을 만들어 GSMSV를 시작하세요"
    >
      {error && <BottomInfo tone="danger">{error}</BottomInfo>}

      <div
        className="flex flex-col gap-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      >
        <TextField
          label="이메일"
          type="email"
          name="email"
          value={email}
          placeholder="your@gsm.hs.kr"
          autoComplete="email"
          size="large"
          onChange={(value) => setEmail(value)}
        />
        <div className="flex flex-col gap-2">
          <TextField
            label="비밀번호"
            type="password"
            name="password"
            value={password}
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
            size="large"
            onChange={(value) => setPassword(value)}
          />
          <PasswordStrength password={password} />
        </div>
        <TextField
          label="비밀번호 확인"
          type="password"
          name="confirm"
          value={confirmPassword}
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          size="large"
          invalid={
            confirmPassword.length > 0 && password !== confirmPassword
          }
          errorMessage={
            confirmPassword.length > 0 && password !== confirmPassword
              ? "비밀번호가 일치하지 않습니다"
              : undefined
          }
          onChange={(value) => setConfirmPassword(value)}
        />
        <Button
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
        >
          계정 만들기
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 text-sm">
        <span>
          프로젝트 참여자이신가요?{" "}
          <Link href="/signup/project">
            <ZmLink>프로젝트 오너로 가입</ZmLink>
          </Link>
        </span>
        <span>
          이미 계정이 있으신가요?{" "}
          <Link href="/login">
            <ZmLink>로그인</ZmLink>
          </Link>
        </span>
      </div>
    </AuthShell>
  );
}
