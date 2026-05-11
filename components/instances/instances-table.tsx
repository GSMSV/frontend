"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  Dialog,
  Empty,
  Heading,
  Paragraph,
  Text,
  TextField,
} from "@zaemoru/react";

import { type VmInfo, controlVm, deleteVm, getMyVms } from "@/lib/api";
import { useNotifications } from "@/lib/notification-context";
import type { InstanceStatus } from "@/lib/types";

import { InstanceGridSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";

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

export function InstancesTable() {
  const [vms, setVms] = useState<VmInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{
    key: string;
    action: "start" | "shutdown" | "reboot" | "delete";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VmInfo | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const { addNotification } = useNotifications();

  const [expireAlerted, setExpireAlerted] = useState<Set<number>>(new Set());

  const fetchVms = useCallback(async () => {
    try {
      const data = await getMyVms();
      setVms(data);

      for (const vm of data) {
        if (vm.expires_at && !expireAlerted.has(vm.vmid)) {
          const days = Math.ceil(
            (new Date(vm.expires_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          );
          if (days <= 15 && days > 0) {
            addNotification(
              "error",
              `${vm.name}: 만료까지 ${days}일 남았습니다. 연장해주세요.`,
            );
            setExpireAlerted((prev) => new Set(prev).add(vm.vmid));
          }
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [expireAlerted, addNotification]);

  useEffect(() => {
    const initial = setTimeout(fetchVms, 0);
    const interval = setInterval(fetchVms, 15000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [fetchVms]);

  const handleAction = async (
    vm: VmInfo,
    action: "start" | "shutdown" | "reboot",
  ) => {
    const key = `${vm.node}-${vm.vmid}`;
    setActionLoading({ key, action });
    try {
      await controlVm(vm.node, vm.vmid, action);
      await fetchVms();
      const delays =
        action === "reboot"
          ? [3000, 8000, 15000, 25000]
          : [2000, 5000, 10000];
      delays.forEach((ms) => setTimeout(fetchVms, ms));
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "작업 요청 실패",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (vm: VmInfo) => {
    setDeleteTarget(null);
    const key = `${vm.node}-${vm.vmid}`;
    setActionLoading({ key, action: "delete" });
    try {
      await deleteVm(vm.node, vm.vmid);
      setVms((prev) => prev.filter((v) => v.vmid !== vm.vmid));
      addNotification("success", `VM ${vm.name}이(가) 삭제되었습니다.`);
    } catch {
      addNotification("error", `VM ${vm.name} 삭제에 실패했습니다.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <InstanceGridSkeleton count={3} />;
  }

  if (vms.length === 0) {
    return (
      <Empty
        title="인스턴스가 없습니다"
        description="새 인스턴스를 생성해보세요."
      >
        <Link href="/deploy">
          <Button variant="primary">인스턴스 생성</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {vms.map((vm) => {
          const status = (vm.status || "stopped") as InstanceStatus;
          const key = `${vm.node}-${vm.vmid}`;
          const isActioning = actionLoading?.key === key;
          const activeAction =
            actionLoading?.key === key ? actionLoading.action : null;

          return (
            <Card key={key} padding="large">
              <div className="flex min-h-[48px] items-start justify-between gap-4">
                <Link
                  href={`/instances/${vm.vmid}?node=${vm.node}`}
                  className="min-w-0 flex-1"
                >
                  <Heading level="3" size="md">
                    {vm.name}
                  </Heading>
                  <Text size="xs" tone="muted">
                    VMID: {vm.vmid} · {vm.node}
                  </Text>
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge status={status} />
                  {vm.provisioning && (
                    <Badge variant="weak" color="yellow" size="small">
                      설정 중
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat
                  label="CPU"
                  value={
                    vm.cpu_usage !== undefined
                      ? `${(vm.cpu_usage * 100).toFixed(1)}%`
                      : "-"
                  }
                />
                <Stat
                  label="메모리"
                  value={
                    vm.mem_usage !== undefined && vm.maxmem
                      ? `${((vm.mem_usage / vm.maxmem) * 100).toFixed(1)}%`
                      : "-"
                  }
                />
                <Stat label="디스크" value={formatBytes(vm.maxdisk)} />
                <Stat label="가동 시간" value={formatUptime(vm.uptime)} />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#eef0f2] pt-4">
                {status === "stopped" ? (
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={isActioning}
                    loading={activeAction === "start"}
                    onClick={() => handleAction(vm, "start")}
                  >
                    시작
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={isActioning}
                    loading={activeAction === "shutdown"}
                    onClick={() => handleAction(vm, "shutdown")}
                  >
                    중지
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  disabled={isActioning}
                  loading={activeAction === "reboot"}
                  onClick={() => handleAction(vm, "reboot")}
                >
                  재시작
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  disabled={isActioning}
                  loading={activeAction === "delete"}
                  onClick={() => {
                    setDeleteTarget(vm);
                    setDeleteConfirmName("");
                  }}
                >
                  삭제
                </Button>
                <Link href={`/instances/${vm.vmid}?node=${vm.node}`}>
                  <Button variant="primary" size="small">
                    관리
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={!!deleteTarget}
        kind="confirm"
        title="인스턴스 삭제"
        description={
          deleteTarget
            ? `${deleteTarget.name} (VMID ${deleteTarget.vmid})을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구 삭제됩니다.`
            : ""
        }
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteConfirmName("");
        }}
        onConfirm={() => {
          if (
            deleteTarget &&
            deleteConfirmName === deleteTarget.name
          ) {
            handleDelete(deleteTarget);
          }
        }}
      >
        <div className="flex flex-col gap-2 px-2 pb-2">
          <Paragraph size="sm">
            삭제하려면 인스턴스 이름을 입력해주세요.
          </Paragraph>
          <TextField
            placeholder={deleteTarget?.name}
            value={deleteConfirmName}
            onChange={(value) => setDeleteConfirmName(value)}
          />
        </div>
      </Dialog>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[64px] flex-col justify-center gap-1 rounded-md border border-[#eef0f2] bg-[#f9fafb] px-3 py-2">
      <Text size="xs" tone="muted" weight="medium">
        {label}
      </Text>
      <Text size="sm" weight="semibold">
        {value}
      </Text>
    </div>
  );
}
