"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  BottomInfo,
  Button,
  Link as ZmLink,
  SegmentedControl,
  Spinner,
  TextField,
} from "@zaemoru/react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="medium" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "true";

  const [loginRole, setLoginRole] = useState<"user" | "project_owner">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, loginRole);
      sessionStorage.setItem("notif:login", "true");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="로그인" description="GSMSV 계정으로 로그인하세요">
      <SegmentedControl
        fullWidth
        value={loginRole}
        options={[
          { value: "user", label: "일반" },
          { value: "project_owner", label: "프로젝트 오너" },
        ]}
        onChange={(value) => {
          setLoginRole(value as "user" | "project_owner");
          setError("");
        }}
      />

      {isPending && (
        <BottomInfo tone="warning">
          이메일 인증이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.
        </BottomInfo>
      )}

      {error && <BottomInfo tone="danger">{error}</BottomInfo>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <TextField
          label="비밀번호"
          type="password"
          name="password"
          value={password}
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          size="large"
          onChange={(value) => setPassword(value)}
        />
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          로그인
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-subtle,#e5e5e5)]" />
        <span className="text-xs text-[var(--color-text-muted,#999)]">또는</span>
        <div className="h-px flex-1 bg-[var(--color-border-subtle,#e5e5e5)]" />
      </div>

      <Button
        variant="secondary"
        size="large"
        fullWidth
        onClick={() => {
          window.location.href = "/api/v1/oauth/authorize";
        }}
      >
        DataGSM으로 로그인
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm">
        <span>
          계정이 없으신가요?{" "}
          <Link href="/signup">
            <ZmLink>회원가입</ZmLink>
          </Link>
        </span>
        <Link href="/reset-password">
          <ZmLink>비밀번호를 잊으셨나요?</ZmLink>
        </Link>
      </div>
    </AuthShell>
  );
}
