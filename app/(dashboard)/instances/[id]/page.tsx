"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BottomInfo, Spinner, Text } from "@zaemoru/react";

import { type PortInfo, getVmPorts, getVmStatus } from "@/lib/api";
import type { Instance, VmStatusResponse } from "@/lib/types";

import { InstanceHeader } from "@/components/instances/instance-header";
import { InstanceTabs } from "@/components/instances/instance-tabs";

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

  useEffect(() => {
    if (!node || !id) return;
    const vmid = parseInt(id);

    Promise.all([
      getVmStatus(node, vmid),
      getVmPorts(node, vmid).catch(() => []),
    ])
      .then(([statusData, portsData]: [VmStatusResponse, PortInfo[]]) => {
        setInstance({
          vmid,
          name: statusData.name || `VM-${vmid}`,
          status: statusData.status || "stopped",
          node,
          cpu: statusData.cpus ? `${statusData.cpus} vCPU` : "-",
          ram: formatBytes(statusData.maxmem),
          disk: formatBytes(statusData.maxdisk),
          ip: statusData.internal_ip || "-",
          uptime: formatUptime(statusData.uptime),
          os: "Ubuntu (Cloud-Init)",
          created: statusData.created_at || "",
          internal_ip: statusData.internal_ip,
          vm_password: statusData.vm_password,
          public_ip: statusData.public_ip,
          cpu_usage: statusData.cpu,
          mem_usage: statusData.mem,
          maxmem: statusData.maxmem,
          maxdisk: statusData.maxdisk,
          uptime_seconds: statusData.uptime,
          expires_at: statusData.expires_at,
          provisioning: statusData.provisioning,
        });
        setPorts(portsData);
      })
      .catch(() => setError("인스턴스 정보를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [id, node]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="medium" />
      </div>
    );
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
      <InstanceHeader instance={instance} />
      {instance.provisioning && (
        <BottomInfo tone="warning">
          초기 환경을 설정하고 있습니다. 완료될 때까지 SSH 접속을 자제해주세요.
        </BottomInfo>
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
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner size="medium" />
        </div>
      }
    >
      <InstanceDetailContent id={id} />
    </Suspense>
  );
}
