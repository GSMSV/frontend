"use client";

import Link from "next/link";

import { Card, Heading, Paragraph, Text } from "@zaemoru/react";

import { ArrowRightIcon } from "@/components/ui/icons";

const sections = [
  {
    title: "시작하기",
    href: "/docs/getting-started",
    description: "GSM SV 소개, 제공 기능, 계정 유형",
    items: ["GSM SV에 대하여", "제공 기능", "계정 유형 (USER / PROJECT_OWNER)"],
  },
  {
    title: "인스턴스",
    href: "/docs/instances",
    description: "VM 생성, 전원 제어, 만료 연장, 삭제",
    items: ["VM 생성 위자드", "티어별 사양", "전원 제어", "만료 및 연장"],
  },
  {
    title: "접속 방법",
    href: "/docs/access",
    description: "SSH 접속, 포트 구조, 웹 서비스 접속",
    items: ["포트 구조", "SSH 접속 가이드", "웹 서비스 활용"],
  },
  {
    title: "SSH Key 등록",
    href: "/docs/ssh-key",
    description: "SSH Key 생성, 등록, VS Code 설정",
    items: ["키 생성", "VM에 공개키 등록", "비밀번호 인증 비활성화"],
  },
  {
    title: "Docker 사용시 주의사항",
    href: "/docs/docker",
    description: "GRE 터널 환경의 MTU 불일치 문제 및 해결 방법",
    items: ["MTU 불일치 원인", "docker-compose 설정", "데몬 전역 설정"],
  },
  {
    title: "프로젝트 오너",
    href: "/docs/project-owner",
    description: "프로젝트 오너 권한, 가입 절차, 핫플러그",
    items: ["일반 사용자와의 차이점", "가입 방법", "핫플러그 리사이징"],
  },
  {
    title: "FAQ",
    href: "/docs/faq",
    description: "자주 묻는 질문과 답변",
    items: ["VM 개수 제한", "SSH 접속 문제", "비밀번호 초기화"],
  },
];

export default function DocsPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level="1" size="xl">
          Documentation
        </Heading>
        <Paragraph size="sm" tone="muted">
          GSM SV Console의 사용 방법을 안내합니다. VM 생성부터 접속, 관리까지
          필요한 모든 정보를 확인하세요.
        </Paragraph>
      </div>

      <Link href="/docs/getting-started">
        <Card elevation="low" padding="medium">
          <div className="flex items-center justify-between">
            <div>
              <Text size="md" weight="semibold">
                GSM SV 시작하기
              </Text>
              <Text size="sm" tone="muted">
                플랫폼 소개, 제공 기능, 계정 유형을 확인하세요.
              </Text>
            </div>
            <ArrowRightIcon
              className="text-[var(--zm-color-text-muted,#94a3b8)]"
              size={20}
            />
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.slice(1).map((section) => (
          <Link key={section.href} href={section.href}>
            <Card elevation="low" padding="medium">
              <Heading level="3" size="md">
                {section.title}
              </Heading>
              <Paragraph size="sm" tone="muted">
                {section.description}
              </Paragraph>
              <ul className="mt-3 flex flex-col gap-1">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-[var(--zm-color-text-muted,#94a3b8)]"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--zm-color-text-muted,#94a3b8)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
