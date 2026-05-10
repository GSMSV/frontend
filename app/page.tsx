"use client";

import { Button, Heading, Paragraph } from "@zaemoru/react";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "24px",
      }}
    >
      <Heading size="2xl">GSMSV</Heading>
      <Paragraph size="md">zaemoru 기반 프론트엔드 스캐폴딩이 동작합니다.</Paragraph>
      <Button size="large">시작하기</Button>
    </main>
  );
}
