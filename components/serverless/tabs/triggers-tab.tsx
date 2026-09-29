"use client";

import { useEffect, useState } from "react";

import {
  Badge,
  BottomInfo,
  Button,
  Heading,
  IconButton,
  Modal,
  SegmentedControl,
  Text,
  TextField,
} from "@zaemoru/react";

import {
  createTrigger,
  deleteTrigger,
  getTriggers,
  type FunctionTrigger,
} from "@/lib/serverless-api";
import { ClockIcon, GlobeIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";

const HTTP_METHODS = ["ANY", "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

interface TriggersTabProps {
  funcId: string;
  ownerId: number;
  funcName: string;
}

export function TriggersTab(props: TriggersTabProps) {
  return <TriggersTabContent key={props.funcId} {...props} />;
}

function TriggersTabContent({ funcId, ownerId, funcName }: TriggersTabProps) {
  const [triggers, setTriggers] = useState<FunctionTrigger[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"http" | "cron">("http");
  const [httpMethod, setHttpMethod] = useState("ANY");
  const [cronExpr, setCronExpr] = useState("*/5 * * * *");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [oneTimeToken, setOneTimeToken] = useState<string | null>(null);
  const [tokenNotice, setTokenNotice] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);

  useEffect(() => {
    let active = true;
    getTriggers(funcId)
      .then((items) => {
        if (active) setTriggers((prev) => [
          ...items,
          ...prev.filter((trigger) => !items.some((item) => item.id === trigger.id)),
        ]);
      })
      .catch(() => { if (active) setListError(true); })
      .finally(() => { if (active) setListLoading(false); });
    return () => { active = false; };
  }, [funcId]);

  const handleCreate = async () => {
    if (creating || oneTimeToken) return;
    setCreating(true);
    setCreateError("");
    try {
      const { secretToken, ...trigger } = await createTrigger(funcId, {
        type,
        httpMethod: type === "http" ? httpMethod : undefined,
        cronExpr: type === "cron" ? cronExpr : undefined,
      });
      setTriggers((prev) => [...prev, trigger]);
      setOpen(false);
      if (trigger.type === "http") {
        if (secretToken) {
          setOneTimeToken(secretToken);
          setTokenNotice("");
        } else {
          setTokenNotice("HTTP 트리거가 생성됐지만 토큰이 응답에 없습니다. 서버 버전을 확인하세요. 이 화면에서 토큰을 다시 불러올 수 없습니다.");
        }
      }
    } catch {
      setCreateError("트리거를 생성하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!oneTimeToken) return;
    setCopyStatus("");
    try {
      await navigator.clipboard.writeText(oneTimeToken);
      setCopyStatus("복사됨");
    } catch {
      setCopyStatus("복사하지 못했습니다. 토큰을 직접 선택해 안전한 곳에 저장해주세요.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTrigger(funcId, id);
    } finally {
      setTriggers((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text size="sm" weight="medium">
          트리거 목록
        </Text>
        <Button variant="primary" size="small" disabled={!!oneTimeToken || creating} onClick={() => setOpen(true)}>
          <span className="inline-flex items-center gap-1.5">
            <PlusIcon size={14} />
            트리거 추가
          </span>
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-4 p-4">
          <Heading level="3" size="md">
            트리거 추가
          </Heading>

          <div className="flex flex-col gap-2">
            <Text size="sm" weight="medium">
              트리거 타입
            </Text>
            <SegmentedControl
              value={type}
              options={[
                { value: "http", label: "HTTP 트리거" },
                { value: "cron", label: "Cron 트리거" },
              ]}
              onChange={(v) => setType(v as "http" | "cron")}
            />
          </div>

          {type === "http" ? (
            <div className="flex flex-col gap-2">
              <Text size="sm" weight="medium">
                HTTP 메서드
              </Text>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                className="w-full rounded-md border border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-canvas,#fafafa)] px-3 py-2 text-sm outline-none focus:border-[var(--zm-color-border-emphasis,#94a3b8)]"
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Text size="sm" tone="muted">
                URL: fn.gsmsv.site/{ownerId}/{funcName}
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <TextField
                label="Cron 표현식"
                value={cronExpr}
                placeholder="*/5 * * * *"
                helperText="예: */5 * * * * (5분마다), 0 9 * * * (매일 오전 9시)"
                onChange={(v) => setCronExpr(v)}
              />
            </div>
          )}

          {createError && <div role="alert" className="text-sm text-red-600">{createError}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              loading={creating}
              disabled={creating}
              onClick={handleCreate}
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>

      {oneTimeToken && (
        <section aria-label="새 HTTP 트리거 토큰" className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-4">
          <Text size="sm" weight="medium">새 HTTP 트리거 시크릿 토큰</Text>
          <Text size="sm">이 토큰은 생성 직후 한 번만 표시됩니다. 새로고침하거나 이 탭을 벗어나면 다시 볼 수 없습니다. 안전한 곳에 저장하세요.</Text>
          <code className="block select-all break-all rounded bg-[var(--zm-color-bg-subtle,#f3f4f6)] p-3 text-sm">{oneTimeToken}</code>
          <Text size="sm" tone="muted">호출 시 X-Secret-Token 헤더에 넣으세요. URL에는 넣지 마세요.</Text>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="small" onClick={handleCopy}>토큰 복사</Button>
            <Button variant="secondary" size="small" onClick={() => { setOneTimeToken(null); setCopyStatus(""); }}>저장했어요 · 닫기</Button>
          </div>
          {copyStatus && <div role="status" className="text-sm">{copyStatus}</div>}
        </section>
      )}
      {tokenNotice && <BottomInfo tone="danger">{tokenNotice}</BottomInfo>}

      {listLoading ? (
        <Text size="sm" tone="muted">트리거 목록을 불러오는 중...</Text>
      ) : listError ? (
        <div role="alert"><BottomInfo tone="danger">트리거 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</BottomInfo></div>
      ) : triggers.length === 0 ? (
        <Text size="sm" tone="muted">
          트리거가 없습니다. 트리거를 추가하면 함수가 자동으로 실행됩니다.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          {triggers.map((trigger) => (
            <div
              key={trigger.id}
              className="flex items-center justify-between rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                {trigger.type === "http" ? (
                  <GlobeIcon size={16} className="text-blue-500" />
                ) : (
                  <ClockIcon size={16} className="text-green-500" />
                )}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {trigger.type === "http" ? (
                      <Text size="sm" weight="medium">
                        HTTP ({trigger.httpMethod})
                      </Text>
                    ) : (
                      <Text size="sm" weight="medium">
                        Cron:{" "}
                        <code className="rounded bg-[var(--zm-color-bg-subtle,#f3f4f6)] px-1 text-xs">
                          {trigger.cronExpr}
                        </code>
                      </Text>
                    )}
                    <Badge
                      variant="weak"
                      color={trigger.enabled ? "green" : "elephant"}
                      size="small"
                    >
                      {trigger.enabled ? "활성" : "비활성"}
                    </Badge>
                  </div>
                  {trigger.type === "http" && (
                    <Text size="sm" tone="muted">
                      fn.gsmsv.site/{ownerId}/{funcName}
                    </Text>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  variant="ghost"
                  size="small"
                  ariaLabel="삭제"
                  onClick={() => handleDelete(trigger.id)}
                >
                  <TrashIcon size={14} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
