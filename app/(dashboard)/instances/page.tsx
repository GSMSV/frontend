"use client";

import Link from "next/link";

import { Button, Heading, Paragraph } from "@zaemoru/react";

import { InstancesTable } from "@/components/instances/instances-table";

export default function InstancesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Heading level="1" size="xl">
            인스턴스
          </Heading>
          <Paragraph size="sm" tone="muted">
            가상 머신 및 클라우드 리소스를 관리합니다.
          </Paragraph>
        </div>
        <Link href="/deploy">
          <Button variant="primary">+ 인스턴스 생성</Button>
        </Link>
      </div>

      <InstancesTable />
    </div>
  );
}
