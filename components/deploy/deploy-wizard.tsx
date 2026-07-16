"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  BottomInfo,
  Button,
  Card,
  Heading,
  IconButton,
  Paragraph,
  ProgressStepper,
  Result,
  Slider,
  Spinner,
  Text,
  TextField,
} from "@zaemoru/react";

import {
  ApiError,
  type NodeResources,
  type VmCreateResponse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import { useCreateVm, useNodesResources } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { CopiedIcon, CopyIcon } from "@/components/ui/icons";

import { SelectableCard } from "./selectable-card";

const stepNames = ["운영체제", "노드", "사양", "확인"];

const osOptions = [
  {
    id: "ubuntu2204",
    name: "Ubuntu 22.04 LTS",
    desc: "안정적인 리눅스 서버 환경",
    tag: "추천",
  },
];

const nodeOptions = [
  {
    id: "gsmgpu1",
    name: "GSM GPU 1",
    desc: "일반 사용자용 서버",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "gsmgpu2",
    name: "GSM GPU 2",
    desc: "일반 사용자용 서버",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "gsmgpu3",
    name: "GSM GPU 3",
    desc: "프로젝트 전용 서버",
    roles: ["project_owner", "admin"],
  },
];

const tiers = [
  {
    id: "basic",
    name: "Basic",
    cpu: "1 vCPU",
    memory: "2 GB",
    disk: "20 GB",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "standard",
    name: "Standard",
    cpu: "2 vCPU",
    memory: "4 GB",
    disk: "20 GB",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "project_custom",
    name: "Custom",
    cpu: "최대 4 vCPU",
    memory: "최대 16 GB",
    disk: "최대 40 GB",
    roles: ["project_owner", "admin"],
  },
];

const CUSTOM_LIMITS = {
  cores: { min: 2, max: 4, step: 2 },
  memory: { min: 2, max: 16, step: 2 },
  disk: { min: 20, max: 40, step: 5 },
};

export function DeployWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState(1);
  const [selectedOs, setSelectedOs] = useState("");
  const [selectedNode, setSelectedNode] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [hostname, setHostname] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customCores, setCustomCores] = useState(2);
  const [customMemory, setCustomMemory] = useState(2);
  const [customDisk, setCustomDisk] = useState(40);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VmCreateResponse | null>(null);

  const nodesResourcesQuery = useNodesResources();
  const createVm = useCreateVm();
  const nodeResources: Record<string, NodeResources> =
    nodesResourcesQuery.data ?? {};
  const creating = createVm.isPending;
  const submittingRef = useRef(false);

  const userRole = user?.role ?? "user";
  const availableNodes = nodeOptions.filter((n) => n.roles.includes(userRole));
  const availableTiers = tiers.filter((t) => t.roles.includes(userRole));
  const isCustomTier = selectedTier === "project_custom";

  const recommendedNodeId = availableNodes.reduce<string | null>(
    (best, node) => {
      const res = nodeResources[node.id];
      if (!res?.online || !res.mem_total_gb || !res.mem_used_gb) return best;
      const percent = res.mem_used_gb / res.mem_total_gb;
      const bestRes = best ? nodeResources[best] : null;
      if (!bestRes?.online || !bestRes.mem_total_gb || !bestRes.mem_used_gb) {
        return node.id;
      }
      const bestPercent = bestRes.mem_used_gb / bestRes.mem_total_gb;
      return percent < bestPercent ? node.id : best;
    },
    null,
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedOs;
      case 2:
        return !!selectedNode;
      case 3:
        return !!selectedTier;
      case 4:
        return !!purpose.trim();
      default:
        return false;
    }
  };

  const selectedTierData = tiers.find((t) => t.id === selectedTier);
  const selectedOsData = osOptions.find((o) => o.id === selectedOs);
  const selectedNodeData = nodeOptions.find((n) => n.id === selectedNode);
  const displaySpecs = isCustomTier
    ? {
        cpu: `${customCores} vCPU`,
        memory: `${customMemory} GB`,
        disk: `${customDisk} GB`,
      }
    : selectedTierData
      ? {
          cpu: selectedTierData.cpu,
          memory: selectedTierData.memory,
          disk: selectedTierData.disk,
        }
      : null;

  const handleCreate = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    try {
      const res = await createVm.mutateAsync({
        tier: selectedTier as "basic" | "standard" | "project_custom",
        os: selectedOs as "ubuntu2204",
        node_name: selectedNode,
        name: hostname || undefined,
        purpose: purpose.trim(),
        ...(isCustomTier && {
          custom_cores: customCores,
          custom_memory: customMemory * 1024,
          custom_disk: customDisk,
        }),
      });
      setResult(res);
      addNotification(
        "success",
        `VM ${res.name || hostname}이(가) 생성되었습니다.`,
      );
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.detail
          : "인스턴스 생성 중 오류가 발생했습니다.";
      setError(msg);
      addNotification("error", `VM 생성 실패: ${msg}`);
    } finally {
      submittingRef.current = false;
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl">
        <Result
          tone="success"
          title="인스턴스 생성 완료!"
          description={result.message}
        />
        <Card elevation="low" padding="medium" className="mt-4">
          <Heading level="3" size="md">
            접속 정보
          </Heading>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="노드" value={result.assigned_node} />
            <Field label="내부 IP" value={result.internal_ip} />
            <Field label="SSH 계정" value={result.ssh_user} />
            <Field
              label="SSH 비밀번호"
              value={result.ssh_password}
              copyable
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/instances")}
            >
              인스턴스 목록
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                router.push(
                  `/instances/${result.vmid}?node=${result.assigned_node}`,
                )
              }
            >
              인스턴스 관리
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const proceedDisabled = !canProceed();
  const prevDisabled = step === 1 || creating;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ProgressStepper value={step} total={4} />
        <Text size="sm" tone="muted">
          Step {step}/{stepNames.length} · {stepNames[step - 1]}
        </Text>
      </div>

      {step === 1 && (
        <Card elevation="low" padding="medium">
          <div className="flex flex-col gap-1">
            <Heading level="3" size="md">
              운영체제
            </Heading>
            <Paragraph size="sm" tone="muted">
              인스턴스에 설치할 운영체제를 선택해주세요.
            </Paragraph>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {osOptions.map((os) => (
              <SelectableCard
                key={os.id}
                selected={selectedOs === os.id}
                onClick={() => setSelectedOs(os.id)}
                badge={
                  os.tag ? (
                    <Badge variant="weak" color="blue" size="small">
                      {os.tag}
                    </Badge>
                  ) : undefined
                }
              >
                <Text size="md" weight="semibold">
                  {os.name}
                </Text>
                <Text size="sm" tone="muted">
                  {os.desc}
                </Text>
              </SelectableCard>
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card elevation="low" padding="medium">
          <div className="flex flex-col gap-1">
            <Heading level="3" size="md">
              노드
            </Heading>
            <Paragraph size="sm" tone="muted">
              인스턴스를 배포할 서버 노드를 선택해주세요.
            </Paragraph>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {availableNodes.map((node) => {
              const res = nodeResources[node.id];
              const isOnline = res?.online;
              const isRecommended = recommendedNodeId === node.id;
              return (
                <SelectableCard
                  key={node.id}
                  selected={selectedNode === node.id}
                  disabled={isOnline === false}
                  onClick={() => setSelectedNode(node.id)}
                  badge={
                    <div className="flex items-center gap-1.5">
                      {isOnline === false && (
                        <Badge variant="weak" color="red" size="small">
                          오프라인
                        </Badge>
                      )}
                      {isRecommended && isOnline !== false && (
                        <Badge variant="weak" color="green" size="small">
                          추천
                        </Badge>
                      )}
                      {node.id === "gsmgpu3" && (
                        <Badge variant="weak" color="elephant" size="small">
                          프로젝트 전용
                        </Badge>
                      )}
                    </div>
                  }
                >
                  <Text size="md" weight="semibold">
                    {node.name}
                  </Text>
                  <Text size="sm" tone="muted">
                    {node.desc}
                  </Text>
                  {res?.online && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <ResourceBar
                        label="CPU"
                        percent={res.cpu_percent ?? 0}
                        value={`${res.cpu_percent ?? 0}%`}
                      />
                      <ResourceBar
                        label="RAM"
                        percent={
                          res.mem_total_gb
                            ? Math.round(
                                ((res.mem_used_gb ?? 0) / res.mem_total_gb) *
                                  100,
                              )
                            : 0
                        }
                        value={`${res.mem_used_gb ?? 0}/${res.mem_total_gb ?? 0} GB`}
                      />
                      <ResourceBar
                        label="SSD"
                        percent={
                          res.disk_total_gb
                            ? Math.round(
                                ((res.disk_used_gb ?? 0) / res.disk_total_gb) *
                                  100,
                              )
                            : 0
                        }
                        value={`${res.disk_used_gb ?? 0}/${res.disk_total_gb ?? 0} GB`}
                      />
                    </div>
                  )}
                </SelectableCard>
              );
            })}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card elevation="low" padding="medium">
          <div className="flex flex-col gap-1">
            <Heading level="3" size="md">
              사양
            </Heading>
            <Paragraph size="sm" tone="muted">
              인스턴스의 컴퓨팅 리소스를 선택해주세요.
            </Paragraph>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {availableTiers.map((tier) => (
              <SelectableCard
                key={tier.id}
                selected={selectedTier === tier.id}
                onClick={() => setSelectedTier(tier.id)}
                badge={
                  tier.id === "project_custom" ? (
                    <Badge variant="weak" color="elephant" size="small">
                      프로젝트 전용
                    </Badge>
                  ) : undefined
                }
              >
                <Text size="md" weight="semibold">
                  {tier.name}
                </Text>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <SpecItem label="CPU" value={tier.cpu} />
                  <SpecItem label="RAM" value={tier.memory} />
                  <SpecItem label="Storage" value={tier.disk} />
                </div>
              </SelectableCard>
            ))}
          </div>

          {isCustomTier && (
            <div className="mt-5 flex flex-col gap-4 rounded-xl border-2 border-dashed border-[var(--zm-color-border-subtle,#e5e7eb)] p-5">
              <Text size="sm" weight="semibold">
                커스텀 리소스 설정
              </Text>

              <SliderRow
                label="vCPU"
                value={customCores}
                displayValue={`${customCores} Core`}
                min={CUSTOM_LIMITS.cores.min}
                max={CUSTOM_LIMITS.cores.max}
                step={CUSTOM_LIMITS.cores.step}
                onChange={setCustomCores}
              />
              <SliderRow
                label="RAM"
                value={customMemory}
                displayValue={`${customMemory} GB`}
                min={CUSTOM_LIMITS.memory.min}
                max={CUSTOM_LIMITS.memory.max}
                step={CUSTOM_LIMITS.memory.step}
                onChange={setCustomMemory}
              />
              <SliderRow
                label="Storage"
                value={customDisk}
                displayValue={`${customDisk} GB`}
                min={CUSTOM_LIMITS.disk.min}
                max={CUSTOM_LIMITS.disk.max}
                step={CUSTOM_LIMITS.disk.step}
                onChange={setCustomDisk}
              />
            </div>
          )}
        </Card>
      )}

      {step === 4 && (
        <Card elevation="low" padding="medium">
          <div className="flex flex-col gap-1">
            <Heading level="3" size="md">
              확인
            </Heading>
            <Paragraph size="sm" tone="muted">
              설정을 확인하고 인스턴스 이름을 알려주세요.
            </Paragraph>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <TextField
              label="인스턴스 이름 (선택)"
              value={hostname}
              placeholder="미입력 시 자동 생성"
              helperText="영어, 숫자, 하이픈(-)만 사용 가능합니다."
              disabled={creating}
              onInput={(value) =>
                setHostname(
                  value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""),
                )
              }
            />

            <TextField
              label="사용 목적 (필수)"
              value={purpose}
              placeholder="예: 웹 서버 실습, 프로젝트 배포 등"
              helperText="사용 목적은 관리자가 모니터링하며, 기준에 벗어나는 경우 삭제될 수 있습니다. (100자 이내)"
              disabled={creating}
              onInput={(value) => setPurpose(value.slice(0, 100))}
            />

            {creating && (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-subtle,#f9fafb)] p-4">
                <Spinner size="small" />
                <Text size="sm" tone="muted">
                  인스턴스를 생성하고 있습니다. 완료까지 몇 분 정도 걸릴 수
                  있어요.
                </Text>
              </div>
            )}

            <div className="rounded-xl border border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-subtle,#f9fafb)] p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="운영체제" value={selectedOsData?.name ?? "-"} />
                <Field label="노드" value={selectedNodeData?.name ?? "-"} />
                <Field label="등급" value={selectedTierData?.name ?? "-"} />
                {displaySpecs && (
                  <>
                    <Field
                      label="CPU / 메모리"
                      value={`${displaySpecs.cpu} / ${displaySpecs.memory}`}
                    />
                    <Field label="디스크" value={displaySpecs.disk} />
                  </>
                )}
              </div>
            </div>

            {error && <BottomInfo tone="danger">{error}</BottomInfo>}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <div
          className={cn(
            "transition-opacity",
            prevDisabled && "pointer-events-none opacity-40",
          )}
        >
          <Button
            variant="secondary"
            size="large"
            disabled={prevDisabled}
            onClick={() => setStep(step - 1)}
          >
            이전
          </Button>
        </div>
        {step < 4 ? (
          <div
            className={cn(
              "transition-opacity",
              proceedDisabled && "pointer-events-none opacity-40",
            )}
          >
            <Button
              variant="primary"
              size="large"
              disabled={proceedDisabled}
              onClick={() => setStep(step + 1)}
            >
              다음
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="large"
            loading={creating}
            disabled={creating || !purpose.trim()}
            onClick={handleCreate}
          >
            {creating ? "생성 중..." : "인스턴스 생성"}
          </Button>
        )}
      </div>
    </div>
  );
}

function ResourceBar({
  label,
  percent,
  value,
}: {
  label: string;
  percent: number;
  value: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color =
    clamped >= 70
      ? "bg-red-500"
      : clamped >= 50
        ? "bg-yellow-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <Text size="xs" tone="muted" className="w-10 shrink-0">
        {label}
      </Text>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--zm-color-bg-subtle,#f3f4f6)]">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <Text size="xs" tone="muted" className="shrink-0 tabular-nums">
        {value}
      </Text>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <Text size="xs" tone="muted">
        {label}
      </Text>
      <Text size="sm" weight="medium">
        {value}
      </Text>
    </span>
  );
}

function SliderRow({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Text size="sm" weight="semibold">
          {displayValue}
        </Text>
      </div>
      <Slider value={value} min={min} max={max} step={step} onChange={onChange} />
      <div className="flex justify-between">
        <Text size="xs" tone="muted">
          {min}
        </Text>
        <Text size="xs" tone="muted">
          {max}
        </Text>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
      <Text size="xs" tone="muted">
        {label}
      </Text>
      <div className="flex items-center gap-1">
        <Text size="sm" weight="medium">
          {value}
        </Text>
        {copyable && (
          <IconButton
            variant="ghost"
            size="small"
            ariaLabel="복사"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <CopiedIcon /> : <CopyIcon />}
          </IconButton>
        )}
      </div>
    </div>
  );
}
