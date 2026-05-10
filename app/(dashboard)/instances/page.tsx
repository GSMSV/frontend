"use client";

import Link from "next/link";

import { Button, Heading, Paragraph } from "@zaemoru/react";

import { InstancesTable } from "@/components/instances/instances-table";
import { PlusIcon } from "@/components/ui/icons";

export default function InstancesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Heading level="1" size="xl">
            인스턴스
          </Heading>
          <Paragraph size="sm" tone="muted">
            가상 머신 및 클라우드 리소스를 관리합니다.
          </Paragraph>
        </div>
        <Link href="/deploy" className="sm:self-start">
          <Button variant="primary">
            <span className="inline-flex items-center gap-1.5">
              <PlusIcon size={18} className="color-white" />
              인스턴스 생성
            </span>
          </Button>
        </Link>
      </div>

      <InstancesTable />
    </div>
  );
}
