"use client";

import { ProgressBar, Text } from "@zaemoru/react";

export type PasswordCheck = { label: string; pass: boolean };

export const passwordChecks = (password: string): PasswordCheck[] => [
  { label: "8자 이상", pass: password.length >= 8 },
  { label: "영문 포함", pass: /[a-zA-Z]/.test(password) },
  { label: "숫자 포함", pass: /\d/.test(password) },
  {
    label: "특수문자 포함",
    pass: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~`]/.test(password),
  },
];

export function PasswordStrength({ password }: { password: string }) {
  if (password.length === 0) return null;

  const checks = passwordChecks(password);
  const strength = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const tone =
    strength === total ? "success" : strength >= total - 1 ? "warning" : "danger";

  return (
    <div className="flex flex-col gap-2">
      <ProgressBar value={strength} max={total} tone={tone} size="small" />
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <Text
            key={c.label}
            size="xs"
            tone={c.pass ? "primary" : "muted"}
          >
            {c.pass ? "✓" : "○"} {c.label}
          </Text>
        ))}
      </div>
    </div>
  );
}

export function isPasswordValid(password: string) {
  return passwordChecks(password).every((c) => c.pass);
}
