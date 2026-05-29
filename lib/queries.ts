"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import {
  addCustomPort,
  addFirewallRule,
  answerFaqQuestion,
  approveProjectOwner,
  changePassword,
  controlVm,
  createSnapshot,
  createVm,
  deleteAvatar,
  deleteCustomPort,
  deleteFaqQuestion,
  deleteFirewallRule,
  deleteNotification,
  deleteSnapshot,
  deleteVm,
  extendVm,
  getAllVms,
  getAutoSnapshot,
  getCustomPorts,
  getFaqQuestions,
  getFirewallRules,
  getMe,
  getMyVms,
  getNodesResources,
  getNotifications,
  getPendingApprovals,
  getSnapshots,
  getVmMetrics,
  getVmPorts,
  getVmStatus,
  markAllNotificationsRead,
  rejectProjectOwner,
  resizeVm,
  restoreDefaultPorts,
  rollbackSnapshot,
  submitFaqQuestion,
  toggleAutoSnapshot,
  uploadAvatar,
  type AdminNodeVms,
  type FaqQuestionItem,
  type FirewallRule,
  type NotificationItem,
  type PendingApproval,
  type PortInfo,
  type SnapshotInfo,
  type VmCreateRequest,
  type VmInfo,
  type VmPort,
} from "@/lib/api";
import type { InstanceStatus, VmAction, VmStatusResponse } from "@/lib/types";

export const queryKeys = {
  me: ["me"] as const,
  notifications: ["notifications"] as const,
  myVms: ["vms", "mine"] as const,
  allVms: ["vms", "all"] as const,
  nodesResources: ["nodes", "resources"] as const,
  vmStatus: (node: string, vmid: number) =>
    ["vm", node, vmid, "status"] as const,
  vmPorts: (node: string, vmid: number) =>
    ["vm", node, vmid, "ports"] as const,
  vmMetrics: (node: string, vmid: number, timeframe: string) =>
    ["vm", node, vmid, "metrics", timeframe] as const,
  customPorts: (node: string, vmid: number) =>
    ["firewall", node, vmid, "custom-ports"] as const,
  firewallRules: (vmid: number) => ["firewall", vmid, "rules"] as const,
  snapshots: (node: string, vmid: number) =>
    ["vm", node, vmid, "snapshots"] as const,
  autoSnapshot: (node: string, vmid: number) =>
    ["vm", node, vmid, "auto-snapshot"] as const,
  pendingApprovals: ["admin", "pending-approvals"] as const,
  faqQuestions: ["faq"] as const,
};

function optimisticRemove<T, V>(
  qc: QueryClient,
  key: QueryKey,
  predicate: (item: T, variables: V) => boolean,
) {
  return {
    onMutate: async (variables: V) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<T[]>(key);
      qc.setQueryData<T[]>(key, (old) =>
        old ? old.filter((item) => !predicate(item, variables)) : old,
      );
      return { previous };
    },
    onError: (_err: unknown, _vars: V, ctx: { previous?: T[] } | undefined) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  };
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled,
    staleTime: 60_000,
  });
}

export function useNotificationsQuery(enabled = true) {
  return useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 25_000,
  });
}

export function useMyVms(enabled = true, refetchInterval?: number) {
  return useQuery<VmInfo[]>({
    queryKey: queryKeys.myVms,
    queryFn: getMyVms,
    enabled,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
}

export function useAllVms(enabled = true, refetchInterval?: number) {
  return useQuery<AdminNodeVms[]>({
    queryKey: queryKeys.allVms,
    queryFn: getAllVms,
    enabled,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
}

export function useNodesResources(enabled = true) {
  return useQuery({
    queryKey: queryKeys.nodesResources,
    queryFn: getNodesResources,
    enabled,
    staleTime: 10_000,
  });
}

type RefetchInterval<T> =
  | number
  | false
  | ((query: Query<T, Error, T, QueryKey>) => number | false | undefined);

export function useVmStatus(
  node: string,
  vmid: number,
  refetchInterval?: RefetchInterval<VmStatusResponse>,
) {
  return useQuery<VmStatusResponse>({
    queryKey: queryKeys.vmStatus(node, vmid),
    queryFn: () => getVmStatus(node, vmid),
    enabled: !!node && !!vmid,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 2_000,
  });
}

export function useVmPorts(node: string, vmid: number) {
  return useQuery<PortInfo[]>({
    queryKey: queryKeys.vmPorts(node, vmid),
    queryFn: () => getVmPorts(node, vmid),
    enabled: !!node && !!vmid,
    staleTime: 30_000,
  });
}

export function useVmMetrics(
  node: string,
  vmid: number,
  timeframe: string,
  options: { enabled?: boolean; refetchInterval?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.vmMetrics(node, vmid, timeframe),
    queryFn: () => getVmMetrics(node, vmid, timeframe),
    enabled: !!node && !!vmid && (options.enabled ?? true),
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
}

export function useCustomPorts(node: string, vmid: number) {
  return useQuery<VmPort[]>({
    queryKey: queryKeys.customPorts(node, vmid),
    queryFn: () => getCustomPorts(node, vmid),
    enabled: !!node && !!vmid,
    staleTime: 30_000,
  });
}

export function useFirewallRules(vmid: number) {
  return useQuery<FirewallRule[]>({
    queryKey: queryKeys.firewallRules(vmid),
    queryFn: () => getFirewallRules(vmid),
    enabled: !!vmid,
    staleTime: 30_000,
  });
}

export function useSnapshots(node: string, vmid: number) {
  return useQuery<SnapshotInfo[]>({
    queryKey: queryKeys.snapshots(node, vmid),
    queryFn: () => getSnapshots(node, vmid),
    enabled: !!node && !!vmid,
    staleTime: 30_000,
  });
}

export function useAutoSnapshot(node: string, vmid: number) {
  return useQuery({
    queryKey: queryKeys.autoSnapshot(node, vmid),
    queryFn: () => getAutoSnapshot(node, vmid),
    enabled: !!node && !!vmid,
    staleTime: 60_000,
  });
}

export function usePendingApprovals(enabled = true) {
  return useQuery<PendingApproval[]>({
    queryKey: queryKeys.pendingApprovals,
    queryFn: getPendingApprovals,
    enabled,
    staleTime: 30_000,
  });
}

export function useFaqQuestions(enabled = true) {
  return useQuery<FaqQuestionItem[]>({
    queryKey: queryKeys.faqQuestions,
    queryFn: getFaqQuestions,
    enabled,
    staleTime: 30_000,
  });
}

function invalidateVm(qc: QueryClient, node: string, vmid: number) {
  qc.invalidateQueries({ queryKey: queryKeys.myVms });
  qc.invalidateQueries({ queryKey: queryKeys.allVms });
  qc.invalidateQueries({ queryKey: queryKeys.vmStatus(node, vmid) });
}

const actionToStatus: Record<VmAction, InstanceStatus> = {
  start: "running",
  shutdown: "stopped",
  reboot: "running",
};

export function useControlVm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      node,
      vmid,
      action,
    }: {
      node: string;
      vmid: number;
      action: VmAction;
    }) => controlVm(node, vmid, action),
    onMutate: async ({ node, vmid, action }) => {
      await qc.cancelQueries({ queryKey: queryKeys.myVms });
      await qc.cancelQueries({ queryKey: queryKeys.vmStatus(node, vmid) });
      const prevMyVms = qc.getQueryData<VmInfo[]>(queryKeys.myVms);
      const prevStatus = qc.getQueryData<VmStatusResponse>(
        queryKeys.vmStatus(node, vmid),
      );
      const nextStatus = actionToStatus[action];
      qc.setQueryData<VmInfo[]>(queryKeys.myVms, (old) =>
        old
          ? old.map((vm) =>
              vm.vmid === vmid ? { ...vm, status: nextStatus } : vm,
            )
          : old,
      );
      qc.setQueryData<VmStatusResponse>(
        queryKeys.vmStatus(node, vmid),
        (old) => (old ? { ...old, status: nextStatus } : old),
      );
      return { prevMyVms, prevStatus };
    },
    onError: (_err, { node, vmid }, ctx) => {
      if (ctx?.prevMyVms) qc.setQueryData(queryKeys.myVms, ctx.prevMyVms);
      if (ctx?.prevStatus)
        qc.setQueryData(queryKeys.vmStatus(node, vmid), ctx.prevStatus);
    },
    onSettled: (_data, _err, { node, vmid }) => invalidateVm(qc, node, vmid),
  });
}

export function useDeleteVm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ node, vmid }: { node: string; vmid: number }) =>
      deleteVm(node, vmid),
    ...optimisticRemove<VmInfo, { node: string; vmid: number }>(
      qc,
      queryKeys.myVms,
      (vm, { vmid }) => vm.vmid === vmid,
    ),
    onSettled: (_data, _err, { node, vmid }) => invalidateVm(qc, node, vmid),
  });
}

export function useExtendVm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ node, vmid }: { node: string; vmid: number }) =>
      extendVm(node, vmid),
    onSuccess: (_data, { node, vmid }) => invalidateVm(qc, node, vmid),
  });
}

export function useResizeVm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      node,
      vmid,
      params,
    }: {
      node: string;
      vmid: number;
      params: { cores?: number; memory?: number };
    }) => resizeVm(node, vmid, params),
    onSuccess: (_data, { node, vmid }) => invalidateVm(qc, node, vmid),
  });
}

export function useCreateVm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VmCreateRequest) => createVm(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myVms });
      qc.invalidateQueries({ queryKey: queryKeys.allVms });
      qc.invalidateQueries({ queryKey: queryKeys.nodesResources });
    },
  });
}

export function useApproveProjectOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => approveProjectOwner(userId),
    ...optimisticRemove<PendingApproval, number>(
      qc,
      queryKeys.pendingApprovals,
      (r, userId) => r.id === userId,
    ),
  });
}

export function useRejectProjectOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => rejectProjectOwner(userId),
    ...optimisticRemove<PendingApproval, number>(
      qc,
      queryKeys.pendingApprovals,
      (r, userId) => r.id === userId,
    ),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    ...optimisticRemove<NotificationItem, number>(
      qc,
      queryKeys.notifications,
      (n, id) => n.id === id,
    ),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = qc.getQueryData<NotificationItem[]>(
        queryKeys.notifications,
      );
      qc.setQueryData<NotificationItem[]>(queryKeys.notifications, (old) =>
        old ? old.map((n) => (n.is_read ? n : { ...n, is_read: true })) : old,
      );
      return { previous };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(queryKeys.notifications, ctx.previous);
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useAddCustomPort(node: string, vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      internal_port: number;
      protocol: string;
      source?: string;
      description?: string;
    }) => addCustomPort(node, vmid, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.customPorts(node, vmid) }),
  });
}

export function useDeleteCustomPort(node: string, vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (portId: number) => deleteCustomPort(node, vmid, portId),
    ...optimisticRemove<VmPort, number>(
      qc,
      queryKeys.customPorts(node, vmid),
      (p, portId) => p.id === portId,
    ),
  });
}

export function useRestoreDefaultPorts(node: string, vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => restoreDefaultPorts(node, vmid),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.customPorts(node, vmid) }),
  });
}

export function useAddFirewallRule(vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rule: Omit<FirewallRule, "pos">) =>
      addFirewallRule(vmid, rule),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.firewallRules(vmid) }),
  });
}

export function useDeleteFirewallRule(vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pos: number) => deleteFirewallRule(vmid, pos),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.firewallRules(vmid) }),
  });
}

export function useCreateSnapshot(node: string, vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => createSnapshot(node, vmid, name, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.snapshots(node, vmid) });
    },
  });
}

export function useDeleteSnapshot(node: string, vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (snapname: string) => deleteSnapshot(node, vmid, snapname),
    ...optimisticRemove<SnapshotInfo, string>(
      qc,
      queryKeys.snapshots(node, vmid),
      (s, snapname) => s.name === snapname,
    ),
  });
}

export function useRollbackSnapshot(node: string, vmid: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (snapname: string) => rollbackSnapshot(node, vmid, snapname),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.snapshots(node, vmid) });
      qc.invalidateQueries({ queryKey: queryKeys.vmStatus(node, vmid) });
    },
  });
}

export function useToggleAutoSnapshot(node: string, vmid: number) {
  const qc = useQueryClient();
  const key: QueryKey = queryKeys.autoSnapshot(node, vmid);
  return useMutation({
    mutationFn: () => toggleAutoSnapshot(node, vmid),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<{ enabled: boolean }>(key);
      if (previous) {
        qc.setQueryData<{ enabled: boolean }>(key, {
          enabled: !previous.enabled,
        });
      }
      return { previous };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useSubmitFaqQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (question: string) => submitFaqQuestion(question),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.faqQuestions }),
  });
}

export function useAnswerFaqQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answer }: { id: number; answer: string }) =>
      answerFaqQuestion(id, answer),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.faqQuestions }),
  });
}

export function useDeleteFaqQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFaqQuestion(id),
    ...optimisticRemove<FaqQuestionItem, number>(
      qc,
      queryKeys.faqQuestions,
      (q, id) => q.id === id,
    ),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
  });
}
