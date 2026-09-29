import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { FunctionTrigger } from "../lib/serverless-api";

const { createTrigger, getTriggers, deleteTrigger } = vi.hoisted(() => ({
  createTrigger: vi.fn(),
  getTriggers: vi.fn(),
  deleteTrigger: vi.fn(),
}));
vi.mock("@/lib/serverless-api", () => ({ createTrigger, getTriggers, deleteTrigger }));
vi.mock("@zaemoru/react", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  BottomInfo: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  Button: ({ children, onClick, disabled }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  Heading: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  IconButton: ({ ariaLabel, onClick }: { ariaLabel: string; onClick: () => void }) => <button aria-label={ariaLabel} onClick={onClick} />,
  Modal: ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => open ? <div role="dialog">{children}<button onClick={onClose}>모달 닫기</button></div> : null,
  SegmentedControl: ({ onChange }: { onChange: (value: string) => void }) => <button onClick={() => onChange("cron")}>Cron 트리거</button>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  TextField: () => <input />,
}));

import { TriggersTab } from "../components/serverless/tabs/triggers-tab";

const newTrigger: FunctionTrigger = {
  id: "trigger-1", functionId: "func-1", type: "http", httpMethod: "POST",
  enabled: true, createdAt: "2026-09-29T00:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  getTriggers.mockResolvedValue([]);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
});
afterEach(cleanup);

async function createHttp(result: object = { ...newTrigger, secretToken: "only-once-token" }) {
  createTrigger.mockResolvedValueOnce(result);
  render(<TriggersTab funcId="func-1" ownerId={7} funcName="my-function" />);
  fireEvent.click(screen.getByRole("button", { name: "트리거 추가" }));
  fireEvent.click(screen.getByRole("button", { name: "추가" }));
  await waitFor(() => expect(createTrigger).toHaveBeenCalledOnce());
}

describe("new HTTP trigger secret", () => {
  it("shows the creation-only token outside the closed creation modal and copies it", async () => {
    await createHttp();
    expect(await screen.findByText("only-once-token")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText(/다시 볼 수 없/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /토큰 복사/ }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("only-once-token"));
    expect(await screen.findByText("복사됨")).toBeTruthy();
  });

  it("keeps the secret visible after the modal closes until explicit dismissal", async () => {
    await createHttp();
    expect(await screen.findByText("only-once-token")).toBeTruthy();
    expect(screen.getByRole("button", { name: "트리거 추가" }).hasAttribute("disabled")).toBe(true);
    expect(getTriggers).toHaveBeenCalledOnce();
    expect(screen.getByText("HTTP (POST)")).toBeTruthy();
    expect(screen.getByText("only-once-token")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /저장했어요/ }));
    expect(screen.queryByText("only-once-token")).toBeNull();
    expect(screen.getByRole("button", { name: "트리거 추가" }).hasAttribute("disabled")).toBe(false);
  });

  it("keeps a created trigger if an earlier list request finishes later", async () => {
    let finishList!: (items: FunctionTrigger[]) => void;
    getTriggers.mockReturnValueOnce(new Promise<FunctionTrigger[]>((resolve) => { finishList = resolve; }));
    await createHttp();
    await screen.findByText("only-once-token");
    finishList([]);
    await waitFor(() => expect(screen.queryByText(/불러오는 중/)).toBeNull());
    expect(screen.getByText("HTTP (POST)")).toBeTruthy();
  });

  it("does not claim copy succeeded when clipboard access is denied", async () => {
    await createHttp();
    await screen.findByText("only-once-token");
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"));
    fireEvent.click(screen.getByRole("button", { name: /토큰 복사/ }));
    expect(await screen.findByText(/복사하지 못했습니다/)).toBeTruthy();
    expect(screen.queryByText("복사됨")).toBeNull();
  });

  it("reports missing secret instead of inventing a recoverable token", async () => {
    await createHttp(newTrigger);
    expect(await screen.findByText(/토큰이 응답에 없습니다/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /토큰 복사/ })).toBeNull();
  });

  it("does not show token instructions for cron triggers", async () => {
    createTrigger.mockResolvedValueOnce({ ...newTrigger, type: "cron", cronExpr: "*/5 * * * *", secretToken: undefined });
    render(<TriggersTab funcId="func-1" ownerId={7} funcName="my-function" />);
    fireEvent.click(screen.getByRole("button", { name: "트리거 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "Cron 트리거" }));
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByText(/시크릿 토큰/)).toBeNull();
  });

  it("does not show the empty state while the trigger list is still loading", () => {
    getTriggers.mockReturnValueOnce(new Promise(() => {}));
    render(<TriggersTab funcId="func-1" ownerId={7} funcName="my-function" />);
    expect(screen.getByText(/불러오는 중/)).toBeTruthy();
    expect(screen.queryByText(/트리거가 없습니다/)).toBeNull();
  });

  it("shows a list error rather than pretending the list is empty", async () => {
    getTriggers.mockRejectedValueOnce(new Error("offline"));
    render(<TriggersTab funcId="func-1" ownerId={7} funcName="my-function" />);
    expect(await screen.findByText(/목록을 불러오지 못했습니다/)).toBeTruthy();
    expect(screen.queryByText(/트리거가 없습니다/)).toBeNull();
  });

  it("does not show a previous function's secret when switching functions", async () => {
    createTrigger.mockResolvedValueOnce({ ...newTrigger, secretToken: "only-once-token" });
    const view = render(<TriggersTab funcId="func-1" ownerId={7} funcName="my-function" />);
    fireEvent.click(screen.getByRole("button", { name: "트리거 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    await screen.findByText("only-once-token");
    view.rerender(<TriggersTab funcId="func-2" ownerId={7} funcName="other-function" />);
    await waitFor(() => expect(screen.queryByText("only-once-token")).toBeNull());
  });

  it("keeps the creation dialog open and offers a retry on failure", async () => {
    createTrigger.mockRejectedValueOnce(new Error("network"));
    render(<TriggersTab funcId="func-1" ownerId={7} funcName="my-function" />);
    fireEvent.click(screen.getByRole("button", { name: "트리거 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("button", { name: "추가" }).hasAttribute("disabled")).toBe(false);
  });
});
