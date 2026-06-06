"use client";

import { useState } from "react";

import { Button, IconButton, Text, TextField } from "@zaemoru/react";

import { updateFunction, type ServerlessFunction } from "@/lib/serverless-api";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

interface EnvTabProps {
  func: ServerlessFunction;
  onUpdate: (func: ServerlessFunction) => void;
}

export function EnvTab({ func, onUpdate }: EnvTabProps) {
  const [entries, setEntries] = useState<[string, string][]>(
    Object.entries(func.envVars),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAdd = () => setEntries((prev) => [...prev, ["", ""]]);
  const handleRemove = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  const handleChange = (i: number, k: string, v: string) => {
    setEntries((prev) =>
      prev.map((entry, idx) => (idx === i ? [k, v] : entry)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const envVars = Object.fromEntries(entries.filter(([k]) => k.trim()));
      const updated = await updateFunction(func.id, { envVars });
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Text size="sm" tone="muted">
        함수 내에서{" "}
        <code className="rounded bg-[var(--zm-color-bg-subtle,#f3f4f6)] px-1 text-xs">
          env.KEY
        </code>
        로 접근할 수 있습니다.
      </Text>

      <div className="flex flex-col gap-2">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex gap-2">
            <TextField
              value={k}
              placeholder="KEY"
              onChange={(val) => handleChange(i, val, v)}
            />
            <TextField
              value={v}
              placeholder="VALUE"
              onChange={(val) => handleChange(i, k, val)}
            />
            <IconButton
              variant="ghost"
              size="small"
              ariaLabel="삭제"
              onClick={() => handleRemove(i)}
            >
              <TrashIcon size={14} />
            </IconButton>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="small" onClick={handleAdd}>
          <span className="inline-flex items-center gap-1.5">
            <PlusIcon size={14} />
            추가
          </span>
        </Button>
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
    </div>
  );
}
