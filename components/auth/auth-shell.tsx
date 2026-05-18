"use client";

import type { ReactNode } from "react";

import { Card, Heading, Paragraph } from "@zaemoru/react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden px-4 py-10">
      <div className="w-full min-w-0 max-w-[440px]">
        <Card className="w-full max-w-full" elevation="low" padding="large">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <Heading level="1" size="xl">
                {title}
              </Heading>
              {description ? (
                <Paragraph size="sm" tone="muted">
                  {description}
                </Paragraph>
              ) : null}
            </div>
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}
