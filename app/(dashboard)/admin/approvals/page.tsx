"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Button,
  Card,
  Empty,
  Heading,
  Paragraph,
  Spinner,
  Tag,
  Text,
} from "@zaemoru/react";

import {
  type PendingApproval,
  approveProjectOwner,
  getPendingApprovals,
  rejectProjectOwner,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getPendingApprovals();
      setRequests(data);
    } catch {
      router.push("/instances");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/instances");
      return;
    }
    const initial = setTimeout(fetchRequests, 0);
    return () => clearTimeout(initial);
  }, [user, router, fetchRequests]);

  const handleApprove = async (userId: number) => {
    if (actionLoading) return;
    setActionLoading(userId);
    try {
      await approveProjectOwner(userId);
      setRequests((prev) => prev.filter((r) => r.id !== userId));
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (actionLoading) return;
    if (!confirm("정말 거절하시겠습니까? 해당 계정이 삭제됩니다.")) return;
    setActionLoading(userId);
    try {
      await rejectProjectOwner(userId);
      setRequests((prev) => prev.filter((r) => r.id !== userId));
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level="1" size="xl">
          가입 승인 관리
        </Heading>
        <Paragraph size="sm" tone="muted">
          프로젝트 오너 가입 요청을 승인하거나 거절합니다.
        </Paragraph>
      </div>

      {requests.length === 0 ? (
        <Empty
          title="대기 중인 요청이 없습니다"
          description="새로운 프로젝트 오너 가입 요청이 들어오면 여기에 표시됩니다."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((req) => (
            <Card key={req.id} elevation="low" padding="medium">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Text size="sm" weight="semibold">
                    {req.name || req.email}
                  </Text>
                  <Text size="xs" tone="muted">
                    {req.email}
                  </Text>
                </div>
                <Badge variant="weak" color="yellow" size="small">
                  대기 중
                </Badge>
              </div>

              {(req.grade || req.major) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {req.grade && req.class_num && req.number && (
                    <Tag>
                      {req.grade}학년 {req.class_num}반 {req.number}번
                    </Tag>
                  )}
                  {req.major && <Tag>{req.major}</Tag>}
                </div>
              )}

              {req.project_name && (
                <div className="mt-3 flex flex-col gap-1">
                  <Text size="xs" weight="semibold">
                    📁 {req.project_name}
                  </Text>
                  {req.project_reason && (
                    <Text size="xs" tone="muted">
                      {req.project_reason}
                    </Text>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="primary"
                  size="small"
                  fullWidth
                  loading={actionLoading === req.id}
                  disabled={actionLoading === req.id}
                  onClick={() => handleApprove(req.id)}
                >
                  승인
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  fullWidth
                  disabled={actionLoading === req.id}
                  onClick={() => handleReject(req.id)}
                >
                  거절
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
