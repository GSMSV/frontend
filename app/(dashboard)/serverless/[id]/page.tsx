"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge, Button, Dialog, Heading, Tab, Text } from "@zaemoru/react";

import {
  deleteFunction,
  getFunction,
  type ServerlessFunction,
} from "@/lib/serverless-api";

import { CodeTab } from "@/components/serverless/tabs/code-tab";
import { EnvTab } from "@/components/serverless/tabs/env-tab";
import { LogsTab } from "@/components/serverless/tabs/logs-tab";
import { TestTab } from "@/components/serverless/tabs/test-tab";
import { TriggersTab } from "@/components/serverless/tabs/triggers-tab";

const tabs = [
  { value: "code", label: "코드" },
  { value: "triggers", label: "트리거" },
  { value: "env", label: "환경변수" },
  { value: "logs", label: "로그" },
  { value: "test", label: "테스트" },
];

export default function ServerlessFunctionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [func, setFunc] = useState<ServerlessFunction | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("code");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    getFunction(id)
      .then(setFunc)
      .catch(() => router.push("/serverless"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!func) return;
    try {
      await deleteFunction(func.id);
    } finally {
      router.push("/serverless");
    }
  };

  if (loading || !func) {
    return (
      <Text size="sm" tone="muted">
        로딩 중...
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading level="2" size="lg">
            {func.name}
          </Heading>
          <Badge
            variant="weak"
            color={func.status === "active" ? "green" : "elephant"}
            size="small"
          >
            {func.status === "active" ? "활성" : "비활성"}
          </Badge>
          <Badge variant="weak" color="blue" size="small">
            {func.runtime}
          </Badge>
        </div>
        <Button variant="secondary" size="small" onClick={() => setDeleteOpen(true)}>
          삭제
        </Button>
      </div>

      <Dialog
        open={deleteOpen}
        kind="confirm"
        title="함수 삭제"
        description={`"${func.name}"을 삭제하면 모든 트리거와 로그가 함께 삭제됩니다.`}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <div className="flex flex-col gap-4">
        <Tab
          items={tabs.map((t) => ({ value: t.value, label: t.label }))}
          value={active}
          onChange={(v) => setActive(v)}
        />

        {active === "code" && (
          <CodeTab func={func} onUpdate={setFunc} />
        )}
        {active === "triggers" && (
          <TriggersTab
            funcId={func.id}
            ownerId={func.ownerId}
            funcName={func.name}
          />
        )}
        {active === "env" && <EnvTab func={func} onUpdate={setFunc} />}
        {active === "logs" && <LogsTab funcId={func.id} />}
        {active === "test" && <TestTab funcId={func.id} />}
      </div>
    </div>
  );
}
