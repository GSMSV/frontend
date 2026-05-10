"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  Dialog,
  Heading,
  Paragraph,
  Slider,
  Tag,
  Text,
  TextField,
  ToggleSwitch,
} from "@zaemoru/react";

import {
  type SnapshotInfo,
  createSnapshot,
  deleteSnapshot,
  getAutoSnapshot,
  getSnapshots,
  resizeVm,
  rollbackSnapshot,
  toggleAutoSnapshot,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import type { Instance } from "@/lib/types";
import { PlusIcon } from "@/components/ui/icons";
import { RowListSkeleton } from "@/components/ui/skeleton";

export function SettingsTab({ instance }: { instance: Instance }) {
  const { user } = useAuth();
  const isPrivileged =
    user?.role === "admin" || user?.role === "project_owner";

  const corePresets = [2, 4, 6, 8];
  const memoryPresets = [
    2048, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768,
  ];

  const currentCores =
    parseInt(instance.cpu?.split("코어")?.[0] || "") ||
    parseInt(instance.cpu) ||
    2;
  const currentMemoryMb = instance.maxmem
    ? Math.round(instance.maxmem / 1024 / 1024)
    : 2048;

  const findClosestIndex = (val: number, presets: number[]) =>
    presets.reduce(
      (best, v, i) =>
        Math.abs(v - val) < Math.abs(presets[best] - val) ? i : best,
      0,
    );

  const [coreIdx, setCoreIdx] = useState(
    findClosestIndex(currentCores, corePresets),
  );
  const [memIdx, setMemIdx] = useState(
    findClosestIndex(currentMemoryMb, memoryPresets),
  );
  const cores = corePresets[coreIdx];
  const memoryMb = memoryPresets[memIdx];
  const [resizing, setResizing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [resizeMessage, setResizeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const hasChanges =
    !applied && (cores !== currentCores || memoryMb !== currentMemoryMb);

  const handleResize = async () => {
    setResizing(true);
    setResizeMessage(null);
    try {
      const params: { cores?: number; memory?: number } = {};
      if (cores !== currentCores) params.cores = cores;
      if (memoryMb !== currentMemoryMb) params.memory = memoryMb;
      await resizeVm(instance.node, instance.vmid, params);
      setApplied(true);
      setResizeMessage({ type: "success", text: "사양이 변경되었습니다." });
    } catch (e) {
      setResizeMessage({
        type: "error",
        text: e instanceof Error ? e.message : "사양 변경에 실패했습니다.",
      });
    } finally {
      setResizing(false);
    }
  };

  const memoryGb = (memoryMb / 1024).toFixed(1);

  const [autoSnapEnabled, setAutoSnapEnabled] = useState(false);
  const [autoSnapLoading, setAutoSnapLoading] = useState(false);

  useEffect(() => {
    getAutoSnapshot(instance.node, instance.vmid)
      .then((res) => setAutoSnapEnabled(res.enabled))
      .catch(() => {});
  }, [instance.node, instance.vmid]);

  const handleAutoSnapToggle = async () => {
    setAutoSnapLoading(true);
    try {
      const res = await toggleAutoSnapshot(instance.node, instance.vmid);
      setAutoSnapEnabled(res.enabled);
    } catch {
      /* ignore */
    } finally {
      setAutoSnapLoading(false);
    }
  };

  const { addNotification } = useNotifications();
  const [snapshots, setSnapshots] = useState<SnapshotInfo[]>([]);
  const [snapLoading, setSnapLoading] = useState(true);
  const [snapActionLoading, setSnapActionLoading] = useState(false);
  const [snapActionTarget, setSnapActionTarget] = useState<{
    name: string;
    type: "rollback" | "delete";
  } | null>(null);
  const [newSnapName, setNewSnapName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);
  const [deleteSnapTarget, setDeleteSnapTarget] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      const data = await getSnapshots(instance.node, instance.vmid);
      setSnapshots(data);
    } catch {
      /* ignore */
    } finally {
      setSnapLoading(false);
    }
  }, [instance.node, instance.vmid]);

  useEffect(() => {
    const initial = setTimeout(fetchSnapshots, 0);
    return () => clearTimeout(initial);
  }, [fetchSnapshots]);

  const handleCreateSnap = async () => {
    if (!newSnapName.trim()) return;
    setSnapActionLoading(true);
    try {
      await createSnapshot(instance.node, instance.vmid, newSnapName.trim());
      addNotification(
        "success",
        `스냅샷 '${newSnapName.trim()}'이(가) 생성되었습니다.`,
      );
      setNewSnapName("");
      setShowCreateInput(false);
      setTimeout(fetchSnapshots, 2000);
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "스냅샷 생성에 실패했습니다.",
      );
    } finally {
      setSnapActionLoading(false);
    }
  };

  const handleRollback = async (snapname: string) => {
    setRollbackTarget(null);
    setSnapActionLoading(true);
    setSnapActionTarget({ name: snapname, type: "rollback" });
    try {
      await rollbackSnapshot(instance.node, instance.vmid, snapname);
      addNotification("success", `스냅샷 '${snapname}'으로 복원되었습니다.`);
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "복원에 실패했습니다.",
      );
    } finally {
      setSnapActionLoading(false);
      setSnapActionTarget(null);
    }
  };

  const handleDeleteSnap = async (snapname: string) => {
    setDeleteSnapTarget(null);
    setSnapActionLoading(true);
    setSnapActionTarget({ name: snapname, type: "delete" });
    try {
      await deleteSnapshot(instance.node, instance.vmid, snapname);
      addNotification(
        "success",
        `스냅샷 '${snapname}'이(가) 삭제되었습니다.`,
      );
      setTimeout(fetchSnapshots, 2000);
    } catch (e) {
      addNotification(
        "error",
        e instanceof Error ? e.message : "스냅샷 삭제에 실패했습니다.",
      );
    } finally {
      setSnapActionLoading(false);
      setSnapActionTarget(null);
    }
  };

  const manualSnaps = snapshots.filter(
    (s) => !s.name.startsWith("auto-daily"),
  );

  return (
    <div className="flex flex-col gap-4">
      <Card elevation="low" padding="medium">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Heading level="3" size="md">
              스냅샷
            </Heading>
            <Paragraph size="sm" tone="muted">
              현재 상태를 저장하고 필요할 때 복원할 수 있습니다. (최대 3개)
            </Paragraph>
          </div>
          <Button
            variant="secondary"
            size="small"
            disabled={snapActionLoading || manualSnaps.length >= 2}
            onClick={() => setShowCreateInput(true)}
          >
            <span className="inline-flex items-center gap-1.5">
              <PlusIcon size={16} />
              생성 ({manualSnaps.length}/2)
            </span>
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-3">
          <div>
            <Text size="sm" weight="medium">
              매일 자동 스냅샷
            </Text>
            <Text size="xs" tone="muted">
              매일 00:10(KST) 자동 생성 · 00:00 이전 자동 스냅샷 삭제
            </Text>
          </div>
          <ToggleSwitch
            checked={autoSnapEnabled}
            disabled={autoSnapLoading}
            onChange={handleAutoSnapToggle}
          />
        </div>

        {showCreateInput && (
          <div className="mt-3 flex items-center gap-2">
            <TextField
              value={newSnapName}
              placeholder="스냅샷 이름 입력..."
              onChange={(value) => setNewSnapName(value)}
            />
            <Button
              variant="primary"
              size="small"
              loading={snapActionLoading}
              disabled={!newSnapName.trim() || snapActionLoading}
              onClick={handleCreateSnap}
            >
              저장
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                setShowCreateInput(false);
                setNewSnapName("");
              }}
            >
              취소
            </Button>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {snapLoading ? (
            <RowListSkeleton count={2} />
          ) : snapshots.length === 0 ? (
            <Text size="sm" tone="muted">
              생성된 스냅샷이 없습니다.
            </Text>
          ) : (
            snapshots.map((snap) => {
              const isAuto = snap.name.startsWith("auto-daily");
              return (
                <div
                  key={snap.name}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Text size="sm" weight="medium">
                        {snap.name}
                      </Text>
                      {isAuto && <Tag>자동</Tag>}
                    </div>
                    <Text size="xs" tone="muted">
                      {snap.snaptime
                        ? new Date(snap.snaptime * 1000).toLocaleString("ko-KR")
                        : "-"}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      disabled={snapActionLoading}
                      loading={
                        snapActionTarget?.name === snap.name &&
                        snapActionTarget?.type === "rollback"
                      }
                      onClick={() => setRollbackTarget(snap.name)}
                    >
                      복원
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      disabled={snapActionLoading}
                      loading={
                        snapActionTarget?.name === snap.name &&
                        snapActionTarget?.type === "delete"
                      }
                      onClick={() => setDeleteSnapTarget(snap.name)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Dialog
        open={!!rollbackTarget}
        kind="confirm"
        title="스냅샷 복원"
        description={`${rollbackTarget} 스냅샷으로 복원하시겠습니까? 현재 상태의 저장되지 않은 데이터가 유실될 수 있습니다.`}
        onCancel={() => setRollbackTarget(null)}
        onConfirm={() => rollbackTarget && handleRollback(rollbackTarget)}
      />

      <Dialog
        open={!!deleteSnapTarget}
        kind="confirm"
        title="스냅샷 삭제"
        description={`${deleteSnapTarget} 스냅샷을 삭제하시겠습니까? 삭제된 스냅샷은 복구할 수 없습니다.`}
        onCancel={() => setDeleteSnapTarget(null)}
        onConfirm={() =>
          deleteSnapTarget && handleDeleteSnap(deleteSnapTarget)
        }
      />

      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          리소스 설정
        </Heading>
        <Paragraph size="sm" tone="muted">
          {isPrivileged
            ? "VM의 CPU와 메모리를 실시간으로 변경합니다. (핫플러그)"
            : "리소스 변경은 프로젝트 오너 또는 관리자만 가능합니다."}
        </Paragraph>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Text size="sm" weight="medium">
                vCPU
              </Text>
              <Text size="sm">{cores}코어</Text>
            </div>
            <Slider
              value={coreIdx}
              min={0}
              max={corePresets.length - 1}
              step={1}
              disabled={!isPrivileged || applied}
              onChange={(v) => setCoreIdx(v)}
            />
            <div className="flex justify-between text-xs text-[var(--zm-color-text-muted,#94a3b8)]">
              {corePresets.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Text size="sm" weight="medium">
                메모리
              </Text>
              <Text size="sm">{memoryGb} GB</Text>
            </div>
            <Slider
              value={memIdx}
              min={0}
              max={memoryPresets.length - 1}
              step={1}
              disabled={!isPrivileged || applied}
              onChange={(v) => setMemIdx(v)}
            />
            <div className="flex justify-between text-xs text-[var(--zm-color-text-muted,#94a3b8)]">
              {memoryPresets.map((v) => {
                const gb = v / 1024;
                const showLabel = [2, 8, 16, 24, 32].includes(gb);
                return showLabel ? <span key={v}>{gb}</span> : <span key={v}>·</span>;
              })}
            </div>
          </div>

          {isPrivileged && (
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                disabled={!hasChanges || resizing}
                loading={resizing}
                onClick={handleResize}
              >
                적용
              </Button>
              {resizeMessage && (
                <Text
                  size="sm"
                  tone={resizeMessage.type === "success" ? "primary" : "danger"}
                >
                  {resizeMessage.text}
                </Text>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
