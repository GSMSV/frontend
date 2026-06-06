"use client";

import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Heading,
  IconButton,
  Modal,
  SegmentedControl,
  Text,
  TextField,
} from "@zaemoru/react";

import { ToggleSwitch } from "@/components/ui/toggle-switch";

import {
  createTrigger,
  deleteTrigger,
  getTriggers,
  updateTrigger,
  type FunctionTrigger,
} from "@/lib/serverless-api";
import { ClockIcon, GlobeIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";

const HTTP_METHODS = ["ANY", "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

interface TriggersTabProps {
  funcId: string;
  ownerId: number;
  funcName: string;
}

export function TriggersTab({ funcId, ownerId, funcName }: TriggersTabProps) {
  const [triggers, setTriggers] = useState<FunctionTrigger[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"http" | "cron">("http");
  const [httpMethod, setHttpMethod] = useState("ANY");
  const [cronExpr, setCronExpr] = useState("*/5 * * * *");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getTriggers(funcId).then(setTriggers);
  }, [funcId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const trigger = await createTrigger(funcId, {
        type,
        httpMethod: type === "http" ? httpMethod : undefined,
        cronExpr: type === "cron" ? cronExpr : undefined,
      });
      setTriggers((prev) => [...prev, trigger]);
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (trigger: FunctionTrigger) => {
    const updated = await updateTrigger(funcId, trigger.id, {
      enabled: !trigger.enabled,
    });
    setTriggers((prev) => prev.map((t) => (t.id === trigger.id ? updated : t)));
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
        <Button variant="primary" size="small" onClick={() => setOpen(true)}>
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

      {triggers.length === 0 ? (
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
                <ToggleSwitch
                  checked={trigger.enabled}
                  onChange={() => handleToggle(trigger)}
                />
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
