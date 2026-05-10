"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Button,
  Link as ZmLink,
  Tab,
  TextField,
} from "@zaemoru/react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/password-strength";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    if (password !== confirmPassword) {
      toast("danger", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isPasswordValid(password)) {
      toast("danger", "비밀번호 조건을 모두 충족해주세요.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      sessionStorage.setItem("notif:signup", "true");
    } catch (err) {
      toast(
        "danger",
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
      description="계정 유형을 선택하고 가입 정보를 입력하세요"
    >
      <Tab
        fullWidth
        value="user"
        items={[
          { value: "user", label: "일반" },
          { value: "project_owner", label: "프로젝트" },
        ]}
        onChange={(value) => {
          if (value === "project_owner") router.push("/signup/project");
        }}
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
        <div className="flex flex-col gap-2">
          <TextField
            label="비밀번호"
            type="password"
            name="password"
            value={password}
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
            size="large"
            onInput={(value) => setPassword(value)}
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
          onInput={(value) => setConfirmPassword(value)}
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
        <span className="inline-flex max-w-full flex-wrap items-baseline justify-center gap-x-1">
          <span>이미 계정이 있으신가요?</span>
          <Link href="/login">
            <ZmLink>로그인</ZmLink>
          </Link>
        </span>
      </div>
    </AuthShell>
  );
}
