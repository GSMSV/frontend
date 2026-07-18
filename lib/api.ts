/**
 * API 클라이언트 — httpOnly 쿠키 기반 인증
 *
 * - 모든 요청에 credentials: "include" (쿠키 자동 전송)
 * - 401 응답 시 /auth/refresh로 자동 갱신 후 재시도 (1회)
 * - 갱신 실패 시 로그인 페이지로 리다이렉트
 */

const API_BASE = "/api/v1";

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      return res.ok;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  const doFetch = () =>
    fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      throw new ApiError(401, "인증이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "서버 오류" }));
    throw new ApiError(res.status, error.detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface UserInfo {
  id: number;
  email: string;
  role: "admin" | "user" | "project_owner";
  is_active: boolean;
  name?: string | null;
  grade?: number | null;
  class_num?: number | null;
  number?: number | null;
  major?: string | null;
  avatar_url?: string | null;
}

export async function login(
  email: string,
  password: string,
  loginRole: "user" | "project_owner" = "user",
) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login?login_role=${loginRole}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "로그인 실패" }));
    throw new ApiError(res.status, error.detail);
  }

  return res.json();
}

export interface SignupResponse {
  message: string;
  email: string;
  expires_in_minutes: number;
}

export async function signup(
  email: string,
  password: string,
): Promise<SignupResponse> {
  return api<SignupResponse>("/auth/signup", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export interface ProjectInfo {
  name: string;
  club: string | null;
  taken: boolean;
}

export interface ProjectCheckResponse {
  email: string;
  student: {
    name: string;
    grade: number;
    class_num: number;
    number: number;
    major: string;
  };
  projects: ProjectInfo[];
}

export async function checkProjectEligibility(
  email: string,
): Promise<ProjectCheckResponse> {
  return api<ProjectCheckResponse>("/auth/signup/project/check", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export interface ProjectSignupResponse {
  message: string;
  email: string;
  project_name: string;
  expires_in_minutes: number;
}

export async function signupProject(
  email: string,
  password: string,
  project_name: string,
  reason: string,
): Promise<ProjectSignupResponse> {
  return api<ProjectSignupResponse>("/auth/signup/project", {
    method: "POST",
    body: { email, password, project_name, reason },
    skipAuth: true,
  });
}

export interface VerifyResponse {
  status: "active" | "pending_approval";
  message?: string;
}

export async function verifyEmail(
  email: string,
  code: string,
): Promise<VerifyResponse> {
  return api<VerifyResponse>("/auth/verify", {
    method: "POST",
    body: { email, code },
    skipAuth: true,
  });
}

export async function resendCode(email: string): Promise<{ message: string }> {
  return api<{ message: string }>("/auth/resend-code", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export type ResetRole = "user" | "project_owner";

export async function requestPasswordReset(
  email: string,
  login_role: ResetRole = "user",
): Promise<{ message: string; email: string }> {
  return api<{ message: string; email: string }>(
    "/auth/password-reset/request",
    {
      method: "POST",
      body: { email, login_role },
      skipAuth: true,
    },
  );
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  new_password: string,
  login_role: ResetRole = "user",
): Promise<{ message: string }> {
  return api<{ message: string }>("/auth/password-reset/confirm", {
    method: "POST",
    body: { email, code, new_password, login_role },
    skipAuth: true,
  });
}

export async function getMe(): Promise<UserInfo> {
  return api<UserInfo>("/auth/me");
}

export async function logout() {
  await api("/auth/logout", { method: "POST" }).catch(() => {});
}

export interface PendingApproval {
  id: number;
  email: string;
  name?: string;
  grade?: number;
  class_num?: number;
  number?: number;
  major?: string;
  project_name?: string;
  project_reason?: string;
}

export async function getPendingApprovals(): Promise<PendingApproval[]> {
  return api<PendingApproval[]>("/auth/pending-approvals");
}

export async function approveProjectOwner(
  userId: number,
): Promise<{ message: string }> {
  return api<{ message: string }>(`/auth/approve/${userId}`, {
    method: "POST",
  });
}

export async function rejectProjectOwner(
  userId: number,
): Promise<{ message: string }> {
  return api<{ message: string }>(`/auth/reject/${userId}`, { method: "POST" });
}

export interface VmInfo {
  vmid: number;
  name: string;
  status: string;
  node: string;
  cpu_usage?: number;
  mem_usage?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime?: number;
  internal_ip?: string;
  vm_password?: string;
  expires_at?: string;
  purpose?: string;
  provisioning?: boolean;
}

export interface VmCreateRequest {
  tier: "basic" | "standard" | "project_custom";
  os: "ubuntu2204";
  node_name?: string;
  name?: string;
  purpose: string;
  custom_cores?: number;
  custom_memory?: number;
  custom_disk?: number;
}

export interface VmCreateResponse {
  success: boolean;
  message: string;
  assigned_node: string;
  vmid: number;
  name: string;
  tier: string;
  internal_ip: string;
  ssh_user: string;
  ssh_password: string;
}

export async function getMyVms(): Promise<VmInfo[]> {
  return api<VmInfo[]>("/vm/my-vms");
}

export interface AdminNodeVms {
  name: string;
  vms: (VmInfo & { owner_email?: string })[];
}

export async function getAllVms(): Promise<AdminNodeVms[]> {
  const res = await api<{ nodes: AdminNodeVms[] }>("/vm/admin/all-vms");
  return res.nodes;
}

export async function getVmStatus(
  node: string,
  vmid: number,
): Promise<import("./types").VmStatusResponse> {
  return api<import("./types").VmStatusResponse>(
    `/vm/${node}/vms/${vmid}/status`,
  );
}

export async function controlVm(node: string, vmid: number, action: string) {
  return api(`/vm/${node}/vms/${vmid}/action`, {
    method: "POST",
    body: { action },
  });
}

export async function createVm(
  data: VmCreateRequest,
): Promise<VmCreateResponse> {
  return api<VmCreateResponse>("/vm/create", {
    method: "POST",
    body: data,
  });
}

export async function deleteVm(node: string, vmid: number) {
  return api(`/vm/${node}/vms/${vmid}`, { method: "DELETE" });
}

export async function updateVmPurpose(
  node: string,
  vmid: number,
  purpose: string,
) {
  return api<{ success: boolean; purpose: string }>(
    `/vm/${node}/vms/${vmid}/purpose`,
    { method: "PATCH", body: { purpose } },
  );
}

export interface PortInfo {
  service: string;
  public_port: number;
  protocol: string;
}

interface VmPortsResponse {
  vmid: number;
  node: string;
  public_ip: string;
  message: string;
  ports: PortInfo[];
}

export async function getVmPorts(
  node: string,
  vmid: number,
): Promise<PortInfo[]> {
  const res = await api<VmPortsResponse>(
    `/network/${encodeURIComponent(node)}/${vmid}/ports`,
  );
  return res.ports ?? [];
}

export interface FirewallRule {
  pos: number;
  action: string;
  type: string;
  proto: string;
  dport?: string;
  source?: string;
  enable: number;
  comment?: string;
}

export async function getFirewallRules(
  node: string,
  vmid: number,
): Promise<FirewallRule[]> {
  const res = await api<{
    vmid: number;
    node: string;
    rules: FirewallRule[];
  }>(`/firewall/${encodeURIComponent(node)}/${vmid}/rules`);
  return res.rules ?? [];
}

export async function addFirewallRule(
  node: string,
  vmid: number,
  rule: Omit<FirewallRule, "pos">,
) {
  return api(`/firewall/${encodeURIComponent(node)}/${vmid}/rules`, {
    method: "POST",
    body: rule,
  });
}

export async function deleteFirewallRule(node: string, vmid: number, pos: number) {
  return api(`/firewall/${encodeURIComponent(node)}/${vmid}/rules/${pos}`, {
    method: "DELETE",
  });
}

export interface VmPort {
  id: number;
  internal_port: number;
  external_port: number;
  protocol: string;
  source?: string;
  description?: string;
  is_default?: boolean;
}

export async function getCustomPorts(
  node: string,
  vmid: number,
): Promise<VmPort[]> {
  const res = await api<{ vmid: number; ports: VmPort[] }>(
    `/firewall/${encodeURIComponent(node)}/${vmid}/ports`,
  );
  return res.ports ?? [];
}

export async function addCustomPort(
  node: string,
  vmid: number,
  body: {
    internal_port: number;
    protocol: string;
    source?: string;
    description?: string;
  },
): Promise<VmPort> {
  return api<VmPort>(
    `/firewall/${encodeURIComponent(node)}/${vmid}/ports`,
    { method: "POST", body },
  );
}

export async function deleteCustomPort(
  node: string,
  vmid: number,
  portId: number,
) {
  return api(
    `/firewall/${encodeURIComponent(node)}/${vmid}/ports/${portId}`,
    { method: "DELETE" },
  );
}

export async function restoreDefaultPorts(
  node: string,
  vmid: number,
): Promise<{ restored: number }> {
  return api<{ restored: number }>(
    `/firewall/${encodeURIComponent(node)}/${vmid}/ports/defaults/restore`,
    { method: "POST" },
  );
}

export async function extendVm(node: string, vmid: number) {
  return api<{ success: boolean; message: string; expires_at: string }>(
    `/vm/${node}/vms/${vmid}/extend`,
    { method: "POST" },
  );
}

export async function resizeVm(
  node: string,
  vmid: number,
  params: { cores?: number; memory?: number },
) {
  return api<{
    success: boolean;
    message: string;
    cores: number;
    memory: number;
  }>(`/vm/${node}/vms/${vmid}/resize`, {
    method: "PUT",
    body: params as unknown as BodyInit,
  });
}

export interface SnapshotInfo {
  name: string;
  description?: string;
  snaptime?: number;
  parent?: string;
  is_auto?: boolean;
}

export async function getSnapshots(
  node: string,
  vmid: number,
): Promise<SnapshotInfo[]> {
  return api<SnapshotInfo[]>(`/vm/${node}/vms/${vmid}/snapshots`);
}

export async function createSnapshot(
  node: string,
  vmid: number,
  name: string,
  description?: string,
) {
  return api<{ success: boolean; message: string }>(
    `/vm/${node}/vms/${vmid}/snapshots`,
    {
      method: "POST",
      body: { name, description },
    },
  );
}

export async function rollbackSnapshot(
  node: string,
  vmid: number,
  snapname: string,
) {
  return api<{ success: boolean; message: string }>(
    `/vm/${node}/vms/${vmid}/snapshots/${snapname}/rollback`,
    { method: "POST" },
  );
}

export async function deleteSnapshot(
  node: string,
  vmid: number,
  snapname: string,
) {
  return api<{ success: boolean; message: string }>(
    `/vm/${node}/vms/${vmid}/snapshots/${snapname}`,
    { method: "DELETE" },
  );
}

export async function getAutoSnapshot(
  node: string,
  vmid: number,
): Promise<{ enabled: boolean }> {
  return api<{ enabled: boolean }>(`/vm/${node}/vms/${vmid}/auto-snapshot`);
}

export async function toggleAutoSnapshot(
  node: string,
  vmid: number,
): Promise<{ enabled: boolean }> {
  return api<{ enabled: boolean }>(`/vm/${node}/vms/${vmid}/auto-snapshot`, {
    method: "PUT",
  });
}

export interface VmMetricPoint {
  time: number;
  cpu: number;
  mem_used: number;
  mem_total: number;
  mem_percent: number;
  netin: number;
  netout: number;
  diskread: number;
  diskwrite: number;
}

export interface VmMetricsResponse {
  vmid: number;
  timeframe: string;
  data: VmMetricPoint[];
}

export async function getVmMetrics(
  node: string,
  vmid: number,
  timeframe: string = "hour",
): Promise<VmMetricsResponse> {
  return api<VmMetricsResponse>(
    `/vm/${node}/vms/${vmid}/metrics?timeframe=${timeframe}`,
  );
}

export interface NodeResources {
  online: boolean;
  cpu_percent?: number;
  mem_used_gb?: number;
  mem_total_gb?: number;
  disk_used_gb?: number;
  disk_total_gb?: number;
}

export async function getNodesResources(): Promise<
  Record<string, NodeResources>
> {
  return api<Record<string, NodeResources>>("/vm/nodes/resources");
}

export async function getMonitoringNodes() {
  return api("/monitoring/nodes");
}

export interface NotificationItem {
  id: number;
  type: "info" | "success" | "error";
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return api<NotificationItem[]>("/notifications");
}

export async function markNotificationRead(id: number) {
  return api(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return api("/notifications/read-all", { method: "POST" });
}

export async function deleteNotification(id: number) {
  return api(`/notifications/${id}`, { method: "DELETE" });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  return api("/auth/change-password", {
    method: "PUT",
    body: {
      current_password: currentPassword,
      new_password: newPassword,
    },
  });
}

export interface FaqQuestionItem {
  id: number;
  user_email: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
}

export async function getFaqQuestions(): Promise<FaqQuestionItem[]> {
  return api<FaqQuestionItem[]>("/faq");
}

export async function submitFaqQuestion(question: string) {
  return api("/faq", {
    method: "POST",
    body: { question },
  });
}

export async function answerFaqQuestion(id: number, answer: string) {
  return api(`/faq/${id}/answer`, {
    method: "PUT",
    body: { answer },
  });
}

export async function deleteFaqQuestion(id: number) {
  return api(`/faq/${id}`, { method: "DELETE" });
}

export async function uploadAvatar(
  file: File,
): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/auth/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      data.detail || "프로필 사진 업로드에 실패했습니다.",
    );
  }

  return res.json();
}

export async function deleteAvatar() {
  return api("/auth/avatar", { method: "DELETE" });
}
