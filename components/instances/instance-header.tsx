"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Badge,
  Button,
  Dialog,
  Heading,
  Paragraph,
  TextField,
} from "@zaemoru/react";

import { useNotifications } from "@/lib/notification-context";
import { useControlVm, useDeleteVm, useExtendVm } from "@/lib/queries";
import type { Instance } from "@/lib/types";
import { ArrowLeftIcon } from "@/components/ui/icons";

import { StatusBadge } from "./status-badge";

export function InstanceHeader({
  instance,
  onRefresh,
}: {
  instance: Instance;
  onRefresh?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const controlVm = useControlVm();
  const deleteVm = useDeleteVm();
  const extendVm = useExtendVm();
  type ActionKey = "extend" | "start" | "shutdown" | "reboot" | "delete";
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [now] = useState(() => Date.now());

  const isProvisioning = !!instance.provisioning;
  const anyActionRunning = actionLoading !== null;

  const expiresAt = instance.expires_at ? new Date(instance.expires_at) : null;
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24))
    : null;
  const canExtend = daysUntilExpiry !== null && daysUntilExpiry <= 15;

  // 액션 직후 백엔드 상태가 반영되도록 즉시·짧은 간격 추적 폴링
  const triggerFollowUpRefresh = (action: ActionKey) => {
    if (!onRefresh) return;
    const delays =
      action === "reboot"
        ? [500, 3000, 8000, 15000, 25000]
        : [500, 2000, 5000, 10000];
    delays.forEach((ms) => setTimeout(() => onRefresh(), ms));
  };

  const handleExtend = async () => {
    setActionLoading("extend");
    try {
      const res = await extendVm.mutateAsync({
        node: instance.node,
        vmid: instance.vmid,
      });
      addNotification("success", res.message);
      await onRefresh?.();
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "연장 실패",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (action: "start" | "shutdown" | "reboot") => {
    if (anyActionRunning) return;
    setActionLoading(action);
    try {
      await controlVm.mutateAsync({
        node: instance.node,
        vmid: instance.vmid,
        action,
      });
      await onRefresh?.();
      triggerFollowUpRefresh(action);
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
            </div>
            <Paragraph size="sm" tone="muted">
              VMID: {instance.vmid} · {instance.node} · {instance.os}
            </Paragraph>
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
            onChange={(value) => setDeleteConfirmName(value)}
          />
        </div>
      </Dialog>
    </>
  );
}
