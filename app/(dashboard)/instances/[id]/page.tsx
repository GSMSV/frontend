"use client";

import { Suspense, use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Text } from "@zaemoru/react";

import { type PortInfo, getVmPorts, getVmStatus } from "@/lib/api";
import type { Instance, VmStatusResponse } from "@/lib/types";

import { Callout } from "@/components/ui/callout";
import { InstanceDetailSkeleton } from "@/components/ui/skeleton";
import { InstanceHeader } from "@/components/instances/instance-header";
import { InstanceTabs } from "@/components/instances/instance-tabs";

const POLL_INTERVAL_MS = 10000;
const PROVISIONING_POLL_INTERVAL_MS = 3000;

function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return "-";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "-";
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(0)} GB` : `${(gb * 1024).toFixed(0)} MB`;
}

function InstanceDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const node = searchParams.get("node") || "";

  const [instance, setInstance] = useState<Instance | null>(null);
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInstance = useCallback(async () => {
    if (!node || !id) return;
    const vmid = parseInt(id);
    try {
      const [statusData, portsData] = await Promise.all([
        getVmStatus(node, vmid),
        getVmPorts(node, vmid).catch(() => [] as PortInfo[]),
      ]);
      const status: VmStatusResponse = statusData;
      setInstance({
        vmid,
        name: status.name || `VM-${vmid}`,
        status: status.status || "stopped",
        node,
        cpu: status.cpus ? `${status.cpus} vCPU` : "-",
        ram: formatBytes(status.maxmem),
        disk: formatBytes(status.maxdisk),
        ip: status.internal_ip || "-",
        uptime: formatUptime(status.uptime),
        os: "Ubuntu (Cloud-Init)",
        created: status.created_at || "",
        internal_ip: status.internal_ip,
        vm_password: status.vm_password,
        public_ip: status.public_ip,
        cpu_usage: status.cpu,
        mem_usage: status.mem,
        maxmem: status.maxmem,
        maxdisk: status.maxdisk,
        uptime_seconds: status.uptime,
        expires_at: status.expires_at,
        provisioning: status.provisioning,
      });
      setPorts(portsData);
      setError("");
    } catch {
      setError("인스턴스 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, node]);

  useEffect(() => {
    fetchInstance();
  }, [fetchInstance]);

  // 주기적 폴링 — provisioning 중에는 더 자주
  useEffect(() => {
    const interval = instance?.provisioning
      ? PROVISIONING_POLL_INTERVAL_MS
      : POLL_INTERVAL_MS;
    const id = setInterval(fetchInstance, interval);
    return () => clearInterval(id);
  }, [fetchInstance, instance?.provisioning]);

  if (loading) {
    return <InstanceDetailSkeleton />;
  }

  if (error || !instance) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Text tone="muted">{error || "Instance not found"}</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InstanceHeader instance={instance} onRefresh={fetchInstance} />
      {instance.provisioning && (
        <Callout tone="warning" title="초기 환경 설정 중">
          새 VM 의 cloud-init 프로비저닝이 완료될 때까지 SSH 접속을
          자제해주세요. 보통 1~2분 정도 걸립니다.
        </Callout>
      )}
      <InstanceTabs instance={instance} ports={ports} />
    </div>
  );
}

export default function InstanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<InstanceDetailSkeleton />}>
      <InstanceDetailContent id={id} />
    </Suspense>
  );
}
