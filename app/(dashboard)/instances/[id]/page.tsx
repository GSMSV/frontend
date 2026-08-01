"use client";

import { Suspense, use, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Text } from "@zaemoru/react";

import { useVmPorts, useVmStatus } from "@/lib/queries";
import type { Instance } from "@/lib/types";
import { formatBytes, formatUptime } from "@/lib/utils";

import { Callout } from "@/components/ui/callout";
import { InstanceDetailSkeleton } from "@/components/ui/skeleton";
import { InstanceHeader } from "@/components/instances/instance-header";
import { InstanceTabs } from "@/components/instances/instance-tabs";

const POLL_INTERVAL_MS = 10000;
const PROVISIONING_POLL_INTERVAL_MS = 3000;

function InstanceDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const node = searchParams.get("node") || "";
  const vmid = parseInt(id);

  const statusQuery = useVmStatus(node, vmid, (query) =>
    query.state.data?.provisioning
      ? PROVISIONING_POLL_INTERVAL_MS
      : POLL_INTERVAL_MS,
  );
  const portsQuery = useVmPorts(node, vmid);

  const status = statusQuery.data;
  const ports = portsQuery.data ?? [];
  const loading = statusQuery.isLoading;
  const error = statusQuery.isError && !status;

  const instance: Instance | null = useMemo(() => {
    if (!status) return null;
    return {
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
      purpose: status.purpose,
      ready: status.ready,
      provisioning: status.provisioning,
    };
  }, [status, node, vmid]);

  if (loading) {
    return <InstanceDetailSkeleton />;
  }

  if (error || !instance) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Text tone="muted">인스턴스 정보를 불러올 수 없습니다.</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InstanceHeader instance={instance} />
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
