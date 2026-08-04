"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Heading,
  IconButton,
  Paragraph,
  Spinner,
  Text,
  TextField,
} from "@zaemoru/react";

import { Modal } from "@/components/ui/dialog";

import { type HttpsRoute } from "@/lib/api";
import {
  useAddHttpsRoute,
  useDeleteHttpsRoute,
  useHttpsRoutes,
} from "@/lib/queries";
import type { Instance } from "@/lib/types";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

export function HttpsTab({ instance }: { instance: Instance }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [subdomain, setSubdomain] = useState("");
  const [internalPort, setInternalPort] = useState("");

  const routesQuery = useHttpsRoutes(instance.node, instance.vmid);
  const addRoute = useAddHttpsRoute(instance.node, instance.vmid);
  const deleteRoute = useDeleteHttpsRoute(instance.node, instance.vmid);

  const routes: HttpsRoute[] = routesQuery.data ?? [];
  const loading = routesQuery.isLoading;
  const submitting = addRoute.isPending;
  const atLimit = routes.length >= 2;

  const handleAdd = async () => {
    const port = parseInt(internalPort);
    if (!subdomain || !port || port < 1 || port > 65535) return;
    setAddError(null);
    try {
      await addRoute.mutateAsync({
        subdomain,
        internal_port: port,
      });
      setSubdomain("");
      setInternalPort("");
      setDialogOpen(false);
    } catch (e) {
      setAddError(
        e instanceof Error ? e.message : "라우트 추가에 실패했습니다.",
      );
    }
  };

  const handleDelete = async (routeId: number) => {
    setDeletingId(routeId);
    try {
      await deleteRoute.mutateAsync(routeId);
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card elevation="low" padding="medium">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Heading level="3" size="md">
              HTTPS 도메인
            </Heading>
            <Paragraph size="sm" tone="muted">
              VM당 최대 2개까지 서브도메인을 연결할 수 있습니다. 와일드카드
              인증서가 자동 적용됩니다.
            </Paragraph>
          </div>
          <Button
            variant="primary"
            size="small"
            disabled={atLimit}
            onClick={() => setDialogOpen(true)}
          >
            <span className="inline-flex items-center gap-1.5">
              <PlusIcon size={16} className="text-white" />
              도메인 추가
            </span>
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner size="small" />
            </div>
          ) : routes.length === 0 ? (
            <Text size="sm" tone="muted">
              연결된 도메인이 없습니다.
            </Text>
          ) : (
            routes.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-3"
              >
                <div className="min-w-0">
                  <code className="block font-mono text-sm font-bold">
                    {r.full_domain}
                  </code>
                  <Text size="xs" tone="muted">
                    내부 포트 {r.internal_port}
                    {!r.caddy_synced && " · 동기화 실패"}
                  </Text>
                </div>
                <IconButton
                  variant="ghost"
                  size="small"
                  ariaLabel="삭제"
                  disabled={deletingId === r.id}
                  onClick={() => handleDelete(r.id)}
                >
                  {deletingId === r.id ? (
                    <Spinner size="small" />
                  ) : (
                    <TrashIcon />
                  )}
                </IconButton>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div className="flex flex-col gap-3 p-4">
          <Heading level="3" size="md">
            도메인 추가
          </Heading>
          <TextField
            label="서브도메인"
            value={subdomain}
            placeholder="예: myapp"
            helperText="입력한 값은 .https.gsmsv.site의 하위 도메인으로 연결돼요."
            onChange={(value) => setSubdomain(value.toLowerCase())}
          />
          <Text size="xs" tone="muted">
            영문 소문자, 숫자, 하이픈만 사용할 수 있어요.
          </Text>
          <TextField
            label="내부 포트"
            type="number"
            value={internalPort}
            placeholder="예: 80, 8080"
            onChange={(value) => setInternalPort(value)}
          />
          {addError && (
            <Text size="sm" tone="danger">
              {addError}
            </Text>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              disabled={submitting || !subdomain || !internalPort}
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
