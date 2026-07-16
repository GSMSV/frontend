"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  Empty,
  Heading,
  Paragraph,
  Text,
  TextField,
} from "@zaemoru/react";

import { Dialog } from "@/components/ui/dialog";

import type { VmInfo } from "@/lib/api";
import { useNotifications } from "@/lib/notification-context";
import { useControlVm, useDeleteVm, useMyVms } from "@/lib/queries";
import type { InstanceStatus, VmAction } from "@/lib/types";
import { formatBytes, formatUptime } from "@/lib/utils";

import { InstanceGridSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";

export function InstancesTable() {
  const { data: vms = [], isLoading: loading } = useMyVms(true, 15_000);
  const controlVm = useControlVm();
  const deleteVm = useDeleteVm();
  const [actionLoading, setActionLoading] = useState<{
    key: string;
    action: VmAction | "delete";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VmInfo | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const { addNotification } = useNotifications();

  const expireAlerted = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const vm of vms) {
      if (vm.expires_at && !expireAlerted.current.has(vm.vmid)) {
        const days = Math.ceil(
          (new Date(vm.expires_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );
        if (days <= 0) {
          addNotification(
            "error",
            `${vm.name}: 만료되어 정지되었습니다. ${Math.max(0, 3 + days)}일 후 완전 삭제됩니다. 연장하면 삭제가 취소됩니다.`,
          );
          expireAlerted.current.add(vm.vmid);
        } else if (days <= 7) {
          addNotification(
            "error",
            `${vm.name}: 만료까지 ${days}일 남았습니다. 연장해주세요.`,
          );
          expireAlerted.current.add(vm.vmid);
        }
      }
    }
  }, [vms, addNotification]);

  const handleAction = async (vm: VmInfo, action: VmAction) => {
    const key = `${vm.node}-${vm.vmid}`;
    setActionLoading({ key, action });
    try {
      await controlVm.mutateAsync({ node: vm.node, vmid: vm.vmid, action });
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
      await deleteVm.mutateAsync({ node: vm.node, vmid: vm.vmid });
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
          const daysUntilExpiry = vm.expires_at
            ? Math.ceil(
                (new Date(vm.expires_at).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              )
            : null;
          const isGracePeriod =
            daysUntilExpiry !== null && daysUntilExpiry <= 0;
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
                  {isGracePeriod && (
                    <Badge variant="weak" color="red" size="small">
                      삭제 대기 ·{" "}
                      {Math.max(0, 3 + (daysUntilExpiry as number))}일 후 삭제
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
            onInput={(value) => setDeleteConfirmName(value)}
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
