import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { Suspense } from "react";
import type { ServerlessFunction } from "../lib/serverless-api";

const { getFunction, getTriggers, createTrigger } = vi.hoisted(() => ({
  getFunction: vi.fn(), getTriggers: vi.fn(), createTrigger: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/serverless-api", () => ({ getFunction, getTriggers, createTrigger, deleteTrigger: vi.fn(), deleteFunction: vi.fn() }));
vi.mock("@zaemoru/react", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  BottomInfo: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  Button: ({ children, onClick, disabled }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  Dialog: () => null,
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  IconButton: () => null,
  Modal: ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => open ? <div role="dialog">{children}<button onClick={onClose}>모달 닫기</button></div> : null,
  SegmentedControl: () => null,
  Tab: ({ items, onChange }: { items: { value: string; label: string }[]; onChange: (value: string) => void }) => <nav>{items.map((item) => <button key={item.value} onClick={() => onChange(item.value)}>{item.label}</button>)}</nav>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  TextField: () => null,
}));
vi.mock("@/components/serverless/tabs/code-tab", () => ({ CodeTab: () => <div>코드 화면</div> }));
vi.mock("@/components/serverless/tabs/env-tab", () => ({ EnvTab: () => null }));
vi.mock("@/components/serverless/tabs/logs-tab", () => ({ LogsTab: () => null }));
vi.mock("@/components/serverless/tabs/test-tab", () => ({ TestTab: () => null }));

import ServerlessFunctionPage from "../app/(dashboard)/serverless/[id]/page";

const func: ServerlessFunction = {
  id: "func-1", name: "my-function", code: "", runtime: "javascript",
  timeout: 10, memoryLimit: 128, envVars: {}, status: "active", ownerId: 7,
  createdAt: "2026-09-29T00:00:00Z", updatedAt: "2026-09-29T00:00:00Z",
};

beforeEach(() => { vi.resetAllMocks(); getFunction.mockResolvedValue(func); getTriggers.mockResolvedValue([]); });
afterEach(cleanup);

it("preserves the pending one-time token across parent tab switches and reveals it on return", async () => {
  let completeCreate!: (result: object) => void;
  createTrigger.mockReturnValueOnce(new Promise((resolve) => { completeCreate = resolve; }));
  await act(async () => { render(<Suspense fallback={null}><ServerlessFunctionPage params={Promise.resolve({ id: "func-1" })} /></Suspense>); });
  fireEvent.click(await screen.findByRole("button", { name: "트리거" }));
  fireEvent.click(screen.getByRole("button", { name: "트리거 추가" }));
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await waitFor(() => expect(createTrigger).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole("button", { name: "코드" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  await act(async () => { completeCreate({ id: "trigger-1", functionId: "func-1", type: "http", httpMethod: "POST", enabled: true, createdAt: "2026-09-29T00:00:00Z", secretToken: "pending-secret" }); });
  const hiddenToken = screen.getByText("pending-secret");
  expect(hiddenToken.closest("[hidden]")?.getAttribute("aria-hidden")).toBe("true");
  expect(screen.queryByRole("region", { name: "새 HTTP 트리거 토큰" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "트리거" }));
  const token = await screen.findByText("pending-secret");
  expect(token.closest("[hidden]")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("region", { name: "새 HTTP 트리거 토큰" }));
  expect(getTriggers).toHaveBeenCalledOnce();
});
