"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Button, SegmentedControl, Text } from "@zaemoru/react";

import { updateFunction, type ServerlessFunction } from "@/lib/serverless-api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeTabProps {
  func: ServerlessFunction;
  onUpdate: (func: ServerlessFunction) => void;
}

export function CodeTab({ func, onUpdate }: CodeTabProps) {
  const [code, setCode] = useState(func.code);
  const [runtime, setRuntime] = useState(func.runtime);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateFunction(func.id, { code, runtime });
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Text size="sm" weight="medium">
            런타임
          </Text>
          <SegmentedControl
            value={runtime}
            options={[
              { value: "javascript", label: "JavaScript" },
              { value: "typescript", label: "TypeScript" },
            ]}
            onChange={(v) => setRuntime(v as "javascript" | "typescript")}
          />
        </div>
        <Button
          variant="primary"
          size="small"
          loading={saving}
          disabled={saving}
          onClick={handleSave}
        >
          {saved ? "저장됨 ✓" : "저장"}
        </Button>
      </div>
      <div className="h-[500px] overflow-hidden rounded-md border border-[var(--zm-color-border-subtle,#e5e7eb)]">
        <MonacoEditor
          height="100%"
          language={runtime === "typescript" ? "typescript" : "javascript"}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 14, tabSize: 2 }}
        />
      </div>
    </div>
  );
}
