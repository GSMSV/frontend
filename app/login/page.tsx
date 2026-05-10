"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Button,
  Link as ZmLink,
  Spinner,
  Tab,
  TextField,
} from "@zaemoru/react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
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
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "true";

  const [loginRole, setLoginRole] = useState<"user" | "project_owner">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPending) {
      toast(
        "warning",
        "이메일 인증이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.",
      );
    }
  }, [isPending, toast]);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await login(email, password, loginRole);
      sessionStorage.setItem("notif:login", "true");
    } catch (err) {
      toast(
        "danger",
        err instanceof ApiError ? err.detail : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="로그인" description="GSMSV 계정으로 로그인하세요">
      <Tab
        fullWidth
        value={loginRole}
        items={[
          { value: "user", label: "일반" },
          { value: "project_owner", label: "프로젝트 오너" },
        ]}
        onChange={(value) => setLoginRole(value as "user" | "project_owner")}
      />

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
          onInput={(value) => setEmail(value)}
        />
        <TextField
          label="비밀번호"
          type="password"
          name="password"
          value={password}
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          size="large"
          onInput={(value) => setPassword(value)}
        />
        <Button
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
        >
          로그인
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-(--zm-color-border-subtle,#e5e7eb)" />
        <span className="text-xs text-(--zm-color-text-muted,#94a3b8)">또는</span>
        <div className="h-px flex-1 bg-(--zm-color-border-subtle,#e5e7eb)" />
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
