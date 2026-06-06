"use client";

import Link from "next/link";

import { Badge, Card, Dialog, Heading, IconButton, Text } from "@zaemoru/react";
import { useState } from "react";

import { deleteFunction, type ServerlessFunction } from "@/lib/serverless-api";
import { TrashIcon } from "@/components/ui/icons";

interface FunctionListProps {
  functions: ServerlessFunction[];
  onDeleted: (id: string) => void;
}

export function FunctionList({ functions, onDeleted }: FunctionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ServerlessFunction | null>(
    null,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteFunction(deleteTarget.id);
    onDeleted(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {functions.map((func) => (
          <Card key={func.id} elevation="low" padding="medium">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/serverless/${func.id}`} className="hover:underline">
                  <Heading level="3" size="sm">
                    {func.name}
                  </Heading>
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge
                    variant="weak"
                    color={func.status === "active" ? "green" : "elephant"}
                    size="small"
                  >
                    {func.status === "active" ? "활성" : "비활성"}
                  </Badge>
                  <IconButton
                    variant="ghost"
                    size="small"
                    ariaLabel="삭제"
                    onClick={() => setDeleteTarget(func)}
                  >
                    <TrashIcon size={14} />
                  </IconButton>
                </div>
              </div>

              <Text size="sm" tone="muted">
                {func.description || "설명 없음"}
              </Text>

              <div className="flex items-center gap-2">
                <Badge variant="weak" color="blue" size="small">
                  {func.runtime}
                </Badge>
                <Text size="sm" tone="muted">
                  타임아웃 {func.timeout / 1000}s
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!deleteTarget}
        kind="confirm"
        title="함수 삭제"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" 함수를 삭제하면 모든 트리거와 로그가 함께 삭제됩니다.`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
