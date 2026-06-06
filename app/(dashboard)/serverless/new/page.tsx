"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import {
  BottomInfo,
  Button,
  Heading,
  SegmentedControl,
  Text,
  TextField,
} from "@zaemoru/react";

import { createFunction } from "@/lib/serverless-api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const JS_TEMPLATE = `// HTTP 트리거 설정 시: fn.gsmsv.site/{userId}/{funcName} 으로 요청이 오면 이 함수가 호출됩니다.
// request 객체:
//   request.method  - "GET" | "POST" 등 HTTP 메서드
//   request.url     - 호출된 전체 URL
//   request.headers - 요청 헤더 객체
//   request.body    - 요청 바디 (문자열)
//   request.json()  - 바디를 JSON으로 파싱
//   request.text()  - 바디를 문자열로 반환
// 반환: new Response(body, { status, headers })
export default async function handler(request) {
  return new Response(JSON.stringify({ message: "Hello, World!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}`;

const TS_TEMPLATE = `// HTTP 트리거 설정 시: fn.gsmsv.site/{userId}/{funcName} 으로 요청이 오면 이 함수가 호출됩니다.
// request 객체:
//   request.method  - "GET" | "POST" 등 HTTP 메서드
//   request.url     - 호출된 전체 URL
//   request.headers - 요청 헤더 객체
//   request.body    - 요청 바디 (문자열)
//   request.json()  - 바디를 JSON으로 파싱
//   request.text()  - 바디를 문자열로 반환
// 반환: new Response(body, { status, headers })
interface FunctionRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  json(): unknown;
  text(): string;
}

export default async function handler(request: FunctionRequest): Promise<Response> {
  return new Response(JSON.stringify({ message: "Hello, World!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}`;

export default function NewServerlessPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [runtime, setRuntime] = useState<"javascript" | "typescript">(
    "javascript",
  );
  const [code, setCode] = useState(JS_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRuntimeChange = (val: string) => {
    const r = val as "javascript" | "typescript";
    setRuntime(r);
    setCode(r === "typescript" ? TS_TEMPLATE : JS_TEMPLATE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("이름과 코드는 필수입니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const func = await createFunction({
        name: name.trim(),
        description: description.trim() || undefined,
        code,
        runtime,
      });
      router.push(`/serverless/${func.id}`);
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setError(e.detail || e.message || "함수 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level="2" size="lg">
          새 함수 만들기
        </Heading>
        <Text size="sm" tone="muted">
          JS/TS 코드를 작성하고 배포하세요
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            label="함수 이름 *"
            value={name}
            placeholder="my-function"
            onChange={(v) => setName(v)}
          />
          <div className="flex flex-col gap-2">
            <Text size="sm" weight="medium">
              런타임
            </Text>
            <SegmentedControl
              value={runtime}
              options={[
                { value: "javascript", label: "JavaScript" },
                { value: "typescript", label: "TypeScript" },
              ]}
              onChange={handleRuntimeChange}
            />
          </div>
        </div>

        <TextField
          label="설명 (선택)"
          value={description}
          placeholder="함수에 대한 간단한 설명"
          onChange={(v) => setDescription(v)}
        />

        <div className="flex flex-col gap-2">
          <Text size="sm" weight="medium">
            코드
          </Text>
          <div className="h-80 overflow-hidden rounded-md border border-[var(--zm-color-border-subtle,#e5e7eb)]">
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

        {error && <BottomInfo tone="danger">{error}</BottomInfo>}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            함수 생성
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
