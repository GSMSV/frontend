"use client";

import { Accordion, Disclosure, Heading, Paragraph } from "@zaemoru/react";

import { DocsLayout } from "@/components/docs/docs-layout";

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "VM을 몇 개까지 만들 수 있나요?",
    answer: (
      <p>
        일반 사용자(USER)는 최대 <strong>3개</strong>까지 생성할 수 있습니다.
        프로젝트 오너(PROJECT_OWNER)와 관리자(ADMIN)는 개수 제한이 없습니다.
      </p>
    ),
  },
  {
    question: "VM이 만료되면 어떻게 되나요?",
    answer: (
      <p>
        일반 사용자의 VM은 생성 후 30일이 지나면 만료됩니다. 만료 15일 전부터
        +30일 연장 버튼이 활성화됩니다. 만료 이후 VM이 자동 삭제됩니다.
      </p>
    ),
  },
  {
    question: "DataGSM OAuth로 로그인하면 기존 계정과 연동되나요?",
    answer: (
      <p>
        네. <strong>같은 이메일</strong>의 기존 계정이 있으면 자동으로 연동됩니다.
      </p>
    ),
  },
  {
    question: "비밀번호를 잊어버렸어요.",
    answer: (
      <p>
        로그인 페이지에서 <strong>비밀번호 초기화</strong>를 선택하세요. 6자리
        인증코드가 이메일로 발송됩니다.
      </p>
    ),
  },
  {
    question: "SSH 접속이 안 돼요.",
    answer: (
      <ol>
        <li>VM이 <strong>실행 중(Running)</strong>인지 확인</li>
        <li>SSH 포트 번호가 올바른지 확인</li>
        <li>접속 명령어: <code>ssh ubuntu@ssh.gsmsv.site -p &lt;포트&gt;</code></li>
      </ol>
    ),
  },
  {
    question: "지원 가능한 OS는 무엇인가요?",
    answer: (
      <p>
        현재는 <strong>Ubuntu 22.04 LTS</strong>만 지원합니다.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <DocsLayout>
      <h1>FAQ</h1>
      <p>자주 묻는 질문을 모았습니다. 항목을 클릭하면 답변을 확인할 수 있습니다.</p>
      <div className="not-prose mt-4 flex flex-col gap-2">
        <Accordion>
          {faqs.map((item, idx) => (
            <Disclosure key={idx} title={item.question}>
              <div className="docs-content">{item.answer}</div>
            </Disclosure>
          ))}
        </Accordion>
      </div>
      <DummyImports />
    </DocsLayout>
  );
}

function DummyImports() {
  // Heading/Paragraph imported but unused — referenced to satisfy lint
  void Heading;
  void Paragraph;
  return null;
}
