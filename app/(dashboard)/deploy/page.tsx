"use client";

import { Heading, Paragraph } from "@zaemoru/react";

import { DeployWizard } from "@/components/deploy/deploy-wizard";

export default function DeployPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level="1" size="xl">
          새 인스턴스 생성
        </Heading>
        <Paragraph size="sm" tone="muted">
          새로운 가상 머신을 설정하고 바로 실행할 수 있습니다.
        </Paragraph>
      </div>
      <DeployWizard />
    </div>
  );
}
