"use client";

import { useState } from "react";

import {
  Card,
  Heading,
  IconButton,
  ProgressBar,
  Text,
} from "@zaemoru/react";

import type { PortInfo } from "@/lib/api";
import type { Instance } from "@/lib/types";
import {
  CopiedIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@/components/ui/icons";

function Row({
  label,
  value,
  trailing,
}: {
  label: string;
  value: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <Text size="sm" tone="muted">
        {label}
      </Text>
      <div className="flex items-center gap-1">
        <Text size="sm" weight="medium">
          {value}
        </Text>
        {trailing}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      variant="ghost"
      size="small"
      ariaLabel="복사"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <CopiedIcon /> : <CopyIcon />}
    </IconButton>
  );
}

export function OverviewTab({
  instance,
  ports = [],
}: {
  instance: Instance;
  ports?: PortInfo[];
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [now] = useState(() => Date.now());

  const createdDate = instance.created
    ? new Date(instance.created).toLocaleDateString("ko-KR")
    : "-";

  const expiresDate = instance.expires_at
    ? new Date(instance.expires_at).toLocaleDateString("ko-KR")
    : null;

  const daysUntilExpiry = instance.expires_at
    ? Math.ceil(
        (new Date(instance.expires_at).getTime() - now) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const cpuPercent =
    instance.cpu_usage != null ? instance.cpu_usage * 100 : null;
  const memPercent =
    instance.mem_usage != null && instance.maxmem
      ? (instance.mem_usage / instance.maxmem) * 100
      : null;

  const sshPort = ports.find((p) =>
    p.service?.toLowerCase().includes("ssh"),
  )?.public_port;
  const sshCommand = sshPort
    ? `ssh ubuntu@ssh.gsmsv.site -p ${sshPort}`
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          리소스
        </Heading>
        <div className="mt-3 flex flex-col">
          <Row label="CPU" value={instance.cpu} />
          <Row label="메모리" value={instance.ram} />
          <Row label="디스크" value={instance.disk} />
        </div>
      </Card>

      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          사용률
        </Heading>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Row
              label="CPU"
              value={cpuPercent != null ? `${cpuPercent.toFixed(1)}%` : "-"}
            />
            {cpuPercent != null && (
              <ProgressBar
                value={cpuPercent}
                max={100}
                tone={
                  cpuPercent >= 90
                    ? "danger"
                    : cpuPercent >= 70
                      ? "warning"
                      : "primary"
                }
                size="small"
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Row
              label="메모리"
              value={memPercent != null ? `${memPercent.toFixed(1)}%` : "-"}
            />
            {memPercent != null && (
              <ProgressBar
                value={memPercent}
                max={100}
                tone={
                  memPercent >= 90
                    ? "danger"
                    : memPercent >= 70
                      ? "warning"
                      : "primary"
                }
                size="small"
              />
            )}
          </div>
        </div>
      </Card>

      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          시스템
        </Heading>
        <div className="mt-3 flex flex-col">
          <Row label="운영체제" value={instance.os} />
          <Row label="가동 시간" value={instance.uptime} />
          <Row label="생성일" value={createdDate} />
          {expiresDate && (
            <Row
              label="만료일"
              value={
                daysUntilExpiry !== null && daysUntilExpiry <= 0
                  ? `${expiresDate} (만료됨 · ${Math.max(0, 3 + daysUntilExpiry)}일 후 완전 삭제)`
                  : `${expiresDate} (${daysUntilExpiry}일 남음)`
              }
            />
          )}
        </div>
      </Card>

      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          접속 정보
        </Heading>
        <div className="mt-3 flex flex-col">
          <Row label="SSH 계정" value="ubuntu" />
          <Row
            label="SSH 비밀번호"
            value={
              instance.vm_password
                ? showPassword
                  ? instance.vm_password
                  : "••••••••"
                : "-"
            }
            trailing={
              instance.vm_password ? (
                <>
                  <IconButton
                    variant="ghost"
                    size="small"
                    ariaLabel="표시"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </IconButton>
                  <CopyButton text={instance.vm_password} />
                </>
              ) : undefined
            }
          />
          <Row
            label="내부 IP"
            value={instance.internal_ip || "-"}
            trailing={
              instance.internal_ip ? (
                <CopyButton text={instance.internal_ip} />
              ) : undefined
            }
          />
          {sshCommand && (
            <Row
              label="SSH 빠른 접속"
              value={
                <code className="font-mono text-xs">{sshCommand}</code>
              }
              trailing={<CopyButton text={sshCommand} />}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
