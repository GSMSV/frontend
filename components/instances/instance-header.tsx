"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Badge,
  Button,
  Heading,
  Paragraph,
  Text,
  TextField,
} from "@zaemoru/react";

import { Dialog } from "@/components/ui/dialog";

import { useNotifications } from "@/lib/notification-context";
import { useControlVm, useDeleteVm, useExtendVm } from "@/lib/queries";
import type { Instance, VmAction } from "@/lib/types";
import { ArrowLeftIcon } from "@/components/ui/icons";

import { StatusBadge } from "./status-badge";

type ActionKey = VmAction | "extend" | "delete";

export function InstanceHeader({ instance }: { instance: Instance }) {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const controlVm = useControlVm();
  const deleteVm = useDeleteVm();
  const extendVm = useExtendVm();
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [now] = useState(() => Date.now());

  const isProvisioning = !!instance.provisioning || instance.ready === false;
  const anyActionRunning = actionLoading !== null;

  const expiresAt = instance.expires_at ? new Date(instance.expires_at) : null;
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24))
    : null;
  const canExtend = daysUntilExpiry !== null && daysUntilExpiry <= 7;
  // 만료 후 3일 유예(강제 정지) 뒤 완전 삭제 — 유예 중이면 남은 일수 표시
  const isGracePeriod = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const daysUntilPurge = isGracePeriod
    ? Math.max(0, 3 + (daysUntilExpiry as number))
    : null;

  const handleExtend = async () => {
    setActionLoading("extend");
    try {
      const res = await extendVm.mutateAsync({
        node: instance.node,
        vmid: instance.vmid,
      });
      addNotification("success", res.message);
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "연장 실패",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (action: VmAction) => {
    if (anyActionRunning) return;
    setActionLoading(action);
    try {
      await controlVm.mutateAsync({
        node: instance.node,
        vmid: instance.vmid,
        action,
      });
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "작업 요청 실패",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== instance.name) return;
    setActionLoading("delete");
    setDeleteOpen(false);
    try {
      await deleteVm.mutateAsync({
        node: instance.node,
        vmid: instance.vmid,
      });
      router.push("/instances");
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "삭제 실패",
      );
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href="/instances"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--zm-color-text-muted,#94a3b8)] hover:text-[var(--zm-color-text-primary,#0f172a)]"
        >
          <ArrowLeftIcon size={16} />
          인스턴스 목록으로 돌아가기
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Heading level="1" size="xl">
                {instance.name}
              </Heading>
              <StatusBadge status={instance.status} />
              {isProvisioning && (
                <Badge variant="weak" color="yellow" size="small">
                  설정 중
                </Badge>
              )}
              {isGracePeriod && (
                <Badge variant="weak" color="red" size="small">
                  삭제 대기 · {daysUntilPurge}일 후 완전 삭제
                </Badge>
              )}
            </div>
            <Paragraph size="sm" tone="muted">
              VMID: {instance.vmid} · {instance.node} · {instance.os}
            </Paragraph>
            {isGracePeriod && (
              <Text size="sm" tone="danger">
                만료되어 정지되었습니다. 연장하면 삭제가 취소됩니다.
              </Text>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {expiresAt && (
              <Button
                variant="secondary"
                size="small"
                disabled={anyActionRunning || !canExtend || isProvisioning}
                loading={actionLoading === "extend"}
                onClick={handleExtend}
              >
                연장
              </Button>
            )}
            {instance.status === "stopped" ? (
              <Button
                variant="secondary"
                size="small"
                disabled={anyActionRunning || isProvisioning}
                loading={actionLoading === "start"}
                onClick={() => handleAction("start")}
              >
                시작
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="small"
                disabled={anyActionRunning || isProvisioning}
                loading={actionLoading === "shutdown"}
                onClick={() => handleAction("shutdown")}
              >
                중지
              </Button>
            )}
            <Button
              variant="secondary"
              size="small"
              disabled={anyActionRunning || isProvisioning}
              loading={actionLoading === "reboot"}
              onClick={() => handleAction("reboot")}
            >
              재시작
            </Button>
            <Button
              variant="danger"
              size="small"
              disabled={anyActionRunning || isProvisioning}
              loading={actionLoading === "delete"}
              onClick={() => {
                setDeleteOpen(true);
                setDeleteConfirmName("");
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={deleteOpen}
        kind="confirm"
        title="인스턴스 삭제"
        description={`${instance.name} (VMID ${instance.vmid})을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구 삭제됩니다.`}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteConfirmName("");
        }}
        onConfirm={handleDelete}
      >
        <div className="flex flex-col gap-2 px-2 pb-2">
          <Paragraph size="sm">
            삭제하려면 인스턴스 이름을 입력해주세요.
          </Paragraph>
          <TextField
            placeholder={instance.name}
            value={deleteConfirmName}
            onInput={(value) => setDeleteConfirmName(value)}
          />
        </div>
      </Dialog>
    </>
  );
}
