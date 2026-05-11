"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  Heading,
  IconButton,
  Modal,
  Paragraph,
  SegmentedControl,
  Spinner,
  Text,
  TextField,
} from "@zaemoru/react";

import { RowListSkeleton } from "@/components/ui/skeleton";

import {
  type PortInfo,
  type VmPort,
  addCustomPort,
  deleteCustomPort,
  getCustomPorts,
  restoreDefaultPorts,
} from "@/lib/api";
import type { Instance } from "@/lib/types";
import {
  CopiedIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";

export function FirewallTab({
  instance,
}: {
  instance: Instance;
  ports?: PortInfo[];
}) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [customPorts, setCustomPorts] = useState<VmPort[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);

  const [internalPort, setInternalPort] = useState("");
  const [protocol, setProtocol] = useState("tcp");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");

  const fetchPorts = useCallback(async () => {
    try {
      const data = await getCustomPorts(instance.node, instance.vmid);
      setCustomPorts(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [instance.node, instance.vmid]);

  useEffect(() => {
    const initial = setTimeout(fetchPorts, 0);
    return () => clearTimeout(initial);
  }, [fetchPorts]);

  const handleCopy = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAdd = async () => {
    const port = parseInt(internalPort);
    if (!port || port < 1 || port > 65535) return;
    setSubmitting(true);
    setAddError(null);
    try {
      await addCustomPort(instance.node, instance.vmid, {
        internal_port: port,
        protocol,
        source: source || undefined,
        description: description || undefined,
      });
      setInternalPort("");
      setProtocol("tcp");
      setSource("");
      setDescription("");
      setDialogOpen(false);
      await fetchPorts();
    } catch (e) {
      setAddError(
        e instanceof Error ? e.message : "포트 추가에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setRestoring(true);
    try {
      await restoreDefaultPorts(instance.node, instance.vmid);
      await fetchPorts();
    } catch {
      /* ignore */
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async (portId: number) => {
    setDeletingId(portId);
    try {
      await deleteCustomPort(instance.node, instance.vmid, portId);
      await fetchPorts();
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const defaultCount = customPorts.filter((p) => p.is_default).length;

  return (
    <div className="flex flex-col gap-4">
      <Card elevation="low" padding="medium">
        <Heading level="3" size="md">
          외부 접속 포트
        </Heading>
        <Paragraph size="sm" tone="muted">
          포트포워딩이 설정된 서비스 목록입니다.
        </Paragraph>

        <div className="mt-3 flex flex-col gap-2">
          {loading ? (
            <RowListSkeleton count={3} />
          ) : customPorts.length === 0 ? (
            <Text size="sm" tone="muted">
              포트포워딩 정보가 없습니다.
            </Text>
          ) : (
            customPorts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-3"
              >
                <div className="min-w-0">
                  <Text size="xs" tone="muted">
                    {p.description || `포트 ${p.internal_port}`}
                  </Text>
                  <code className="block font-mono text-sm font-bold">
                    ssh.gsmsv.site:{p.external_port}
                  </code>
                </div>
                <IconButton
                  variant="ghost"
                  size="small"
                  ariaLabel="복사"
                  onClick={() =>
                    handleCopy(`ssh.gsmsv.site:${p.external_port}`, p.id)
                  }
                >
                  {copiedId === p.id ? <CopiedIcon /> : <CopyIcon />}
                </IconButton>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card elevation="low" padding="medium">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Heading level="3" size="md">
              방화벽 규칙
            </Heading>
            <Paragraph size="sm" tone="muted">
              기본 포트는 0.0.0.0/0으로 허용됩니다. 추가 포트는 30000~39999에서
              외부 포트가 랜덤 할당되며, 최대 30개까지 추가할 수 있습니다.
            </Paragraph>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!loading && defaultCount < 3 && (
              <Button
                variant="secondary"
                size="small"
                disabled={restoring}
                loading={restoring}
                onClick={handleRestoreDefaults}
              >
                기본 포트 복원
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              onClick={() => setDialogOpen(true)}
            >
              <span className="inline-flex items-center gap-1.5">
                <PlusIcon size={16} className="text-white" />
                포트 추가
              </span>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {loading ? (
            <RowListSkeleton count={3} />
          ) : customPorts.length === 0 ? (
            <Text size="sm" tone="muted">
              포트 규칙이 없습니다.
            </Text>
          ) : (
            customPorts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Text size="xs" tone="muted">
                    {p.protocol.toUpperCase()}
                  </Text>
                  <Text size="sm" weight="semibold">
                    {p.internal_port}
                  </Text>
                  {p.source && p.source !== "0.0.0.0/0" && (
                    <Text size="xs" tone="muted">
                      {p.source}
                    </Text>
                  )}
                  {p.description && (
                    <Text size="xs" tone="muted">
                      {p.description}
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Text size="xs" tone="muted">
                    :{p.external_port}
                  </Text>
                  <IconButton
                    variant="ghost"
                    size="small"
                    ariaLabel="삭제"
                    disabled={deletingId === p.id}
                    onClick={() => handleDelete(p.id)}
                  >
                    {deletingId === p.id ? (
                      <Spinner size="small" />
                    ) : (
                      <TrashIcon />
                    )}
                  </IconButton>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div className="flex flex-col gap-3 p-4">
          <Heading level="3" size="md">
            포트 추가
          </Heading>
          <TextField
            label="내부 포트"
            type="number"
            value={internalPort}
            placeholder="예: 443, 8080"
            onChange={(value) => setInternalPort(value)}
          />
          <div className="flex flex-col gap-1">
            <Text size="sm" weight="medium">
              프로토콜
            </Text>
            <SegmentedControl
              value={protocol}
              options={[
                { value: "tcp", label: "TCP" },
                { value: "udp", label: "UDP" },
              ]}
              onChange={(v) => setProtocol(v)}
            />
          </div>
          <TextField
            label="출발지 IP"
            value={source}
            placeholder="기본 0.0.0.0/0"
            helperText="선택 사항"
            onChange={(value) => setSource(value)}
          />
          <TextField
            label="설명"
            value={description}
            placeholder="예: HTTPS, API 서버"
            helperText="선택 사항"
            onChange={(value) => setDescription(value)}
          />
          {addError && (
            <Text size="sm" tone="danger">
              {addError}
            </Text>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              disabled={submitting || !internalPort}
              onClick={handleAdd}
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
