"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  BottomInfo,
  Button,
  Card,
  Heading,
  IconButton,
  ListRow,
  Paragraph,
  ProgressStepper,
  Result,
  Slider,
  Text,
  TextField,
} from "@zaemoru/react";

import {
  ApiError,
  type NodeResources,
  type VmCreateResponse,
  createVm,
  getNodesResources,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";

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
    roles: ["user", "admin"],
  },
  {
    id: "gsmgpu2",
    name: "GSM GPU 2",
    desc: "일반 사용자용 서버",
    roles: ["user", "admin"],
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
    id: "micro",
    name: "Micro",
    cpu: "1 vCPU",
    memory: "2 GB",
    disk: "30 GB",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "small",
    name: "Small",
    cpu: "2 vCPU",
    memory: "4 GB",
    disk: "40 GB",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "medium",
    name: "Medium",
    cpu: "2 vCPU",
    memory: "6 GB",
    disk: "50 GB",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "large",
    name: "Large",
    cpu: "4 vCPU",
    memory: "8 GB",
    disk: "50 GB",
    roles: ["user", "admin", "project_owner"],
  },
  {
    id: "project_custom",
    name: "Custom",
    cpu: "최대 8 vCPU",
    memory: "최대 32 GB",
    disk: "최대 70 GB",
    roles: ["project_owner", "admin"],
  },
];

const CUSTOM_LIMITS = {
  cores: { min: 2, max: 8, step: 2 },
  memory: { min: 2, max: 32, step: 2 },
  disk: { min: 30, max: 70, step: 5 },
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
  const [customCores, setCustomCores] = useState(2);
  const [customMemory, setCustomMemory] = useState(2);
  const [customDisk, setCustomDisk] = useState(50);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VmCreateResponse | null>(null);
  const [nodeResources, setNodeResources] = useState<
    Record<string, NodeResources>
  >({});

  useEffect(() => {
    getNodesResources()
      .then(setNodeResources)
      .catch(() => {});
  }, []);

  const userRole = user?.role ?? "user";
  const availableNodes = nodeOptions.filter((n) => n.roles.includes(userRole));
  const availableTiers = tiers.filter((t) => t.roles.includes(userRole));
  const isCustomTier = selectedTier === "project_custom";

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedOs;
      case 2:
        return !!selectedNode;
      case 3:
        return !!selectedTier;
      case 4:
        return true;
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
    setCreating(true);
    setError("");
    try {
      const res = await createVm({
        tier: selectedTier as
          | "micro"
          | "small"
          | "medium"
          | "large"
          | "project_custom",
        os: selectedOs as "ubuntu2204",
        node_name: selectedNode,
        name: hostname || undefined,
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
      setCreating(false);
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

  return (
    <div className="flex flex-col gap-4">
      <ProgressStepper value={step} total={4} />
      <Text size="sm" tone="muted">
        Step {step}/{stepNames.length} · {stepNames[step - 1]}
      </Text>

      {step === 1 && (
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            운영체제 선택
          </Heading>
          <Paragraph size="sm" tone="muted">
            인스턴스에 설치할 운영체제를 선택하세요.
          </Paragraph>
          <div className="mt-3 flex flex-col gap-2">
            {osOptions.map((os) => (
              <ListRow
                key={os.id}
                interactive
                title={os.name}
                description={os.desc}
                trailing={
                  <span className="flex items-center gap-2">
                    {os.tag && (
                      <Badge variant="weak" color="blue" size="small">
                        {os.tag}
                      </Badge>
                    )}
                    {selectedOs === os.id && "✓"}
                  </span>
                }
                onClick={() => setSelectedOs(os.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            노드 선택
          </Heading>
          <Paragraph size="sm" tone="muted">
            인스턴스를 배포할 서버 노드를 선택하세요.
          </Paragraph>
          <div className="mt-3 flex flex-col gap-2">
            {availableNodes.map((node) => {
              const res = nodeResources[node.id];
              const isOnline = res?.online;
              return (
                <ListRow
                  key={node.id}
                  interactive={isOnline !== false}
                  title={node.name}
                  description={
                    isOnline === false
                      ? "오프라인"
                      : res
                        ? `CPU ${res.cpu_percent ?? 0}% · RAM ${res.mem_used_gb}/${res.mem_total_gb} GB`
                        : node.desc
                  }
                  trailing={selectedNode === node.id ? "✓" : undefined}
                  onClick={() => isOnline !== false && setSelectedNode(node.id)}
                />
              );
            })}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            사양 선택
          </Heading>
          <Paragraph size="sm" tone="muted">
            인스턴스의 컴퓨팅 리소스를 선택하세요.
          </Paragraph>
          <div className="mt-3 flex flex-col gap-2">
            {availableTiers.map((tier) => (
              <ListRow
                key={tier.id}
                interactive
                title={tier.name}
                description={`${tier.cpu} · ${tier.memory} · ${tier.disk}`}
                trailing={selectedTier === tier.id ? "✓" : undefined}
                onClick={() => setSelectedTier(tier.id)}
              />
            ))}
          </div>

          {isCustomTier && (
            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-[var(--zm-color-border-subtle,#e5e7eb)] p-4">
              <Text size="sm" weight="semibold">
                커스텀 리소스 설정
              </Text>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Text size="sm">vCPU</Text>
                  <Text size="sm" weight="semibold">
                    {customCores} Core
                  </Text>
                </div>
                <Slider
                  value={customCores}
                  min={CUSTOM_LIMITS.cores.min}
                  max={CUSTOM_LIMITS.cores.max}
                  step={CUSTOM_LIMITS.cores.step}
                  onChange={(v) => setCustomCores(v)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Text size="sm">RAM</Text>
                  <Text size="sm" weight="semibold">
                    {customMemory} GB
                  </Text>
                </div>
                <Slider
                  value={customMemory}
                  min={CUSTOM_LIMITS.memory.min}
                  max={CUSTOM_LIMITS.memory.max}
                  step={CUSTOM_LIMITS.memory.step}
                  onChange={(v) => setCustomMemory(v)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Text size="sm">Storage</Text>
                  <Text size="sm" weight="semibold">
                    {customDisk} GB
                  </Text>
                </div>
                <Slider
                  value={customDisk}
                  min={CUSTOM_LIMITS.disk.min}
                  max={CUSTOM_LIMITS.disk.max}
                  step={CUSTOM_LIMITS.disk.step}
                  onChange={(v) => setCustomDisk(v)}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {step === 4 && (
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            최종 확인 및 생성
          </Heading>
          <Paragraph size="sm" tone="muted">
            설정 내용을 확인하고 인스턴스 이름을 입력하세요.
          </Paragraph>

          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="인스턴스 이름 (선택)"
              value={hostname}
              placeholder="미입력 시 자동 생성"
              helperText="영어, 숫자, 하이픈(-)만 사용 가능합니다."
              onChange={(value) =>
                setHostname(
                  value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""),
                )
              }
            />

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

            {error && <BottomInfo tone="danger">{error}</BottomInfo>}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          disabled={step === 1 || creating}
          onClick={() => setStep(step - 1)}
        >
          이전
        </Button>
        {step < 4 ? (
          <Button
            variant="primary"
            disabled={!canProceed()}
            onClick={() => setStep(step + 1)}
          >
            다음 단계
          </Button>
        ) : (
          <Button
            variant="primary"
            loading={creating}
            disabled={creating}
            onClick={handleCreate}
          >
            인스턴스 생성
          </Button>
        )}
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
            {copied ? "✓" : "⧉"}
          </IconButton>
        )}
      </div>
    </div>
  );
}
