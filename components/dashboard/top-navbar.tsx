"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  Badge,
  Card,
  IconButton,
  Paragraph,
  SearchField,
  Text,
} from "@zaemoru/react";

import type { VmInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  getNotificationColor,
  useNotifications,
} from "@/lib/notification-context";
import { useAllVms, useMyVms } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { BarsIcon, BellIcon } from "@/components/ui/icons";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    notifications,
    hasUnread,
    removeNotification,
    markAsRead,
    deleteAll,
  } = useNotifications();

  const isAdmin = user?.role === "admin";
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const studentNumber =
    user?.grade != null && user?.class_num != null && user?.number != null
      ? `${user.grade}${user.class_num}${String(user.number).padStart(2, "0")}`
      : null;
  const initials = user?.email?.charAt(0).toUpperCase() || "?";

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const myVmsQuery = useMyVms(!!user && !isAdmin);
  const allVmsQuery = useAllVms(!!user && isAdmin);
  const allVms = useMemo<(VmInfo & { owner_email?: string })[]>(() => {
    if (isAdmin) {
      return (
        allVmsQuery.data?.flatMap((n) =>
          n.vms.map((v) => ({ ...v, node: n.name })),
        ) ?? []
      );
    }
    return myVmsQuery.data ?? [];
  }, [isAdmin, allVmsQuery.data, myVmsQuery.data]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.trim()
    ? allVms.filter(
        (vm) =>
          vm.name.toLowerCase().includes(query.toLowerCase()) ||
          String(vm.vmid).includes(query),
      )
    : allVms;

  const goToVm = (vm: VmInfo) => {
    router.push(`/instances/${vm.vmid}?node=${vm.node}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--zm-color-border-subtle,#e5e7eb)] bg-white/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <IconButton
          variant="ghost"
          size="small"
          ariaLabel="메뉴"
          onClick={onMenuClick}
        >
          <BarsIcon />
        </IconButton>
      </div>

      <div ref={searchRef} className="relative hidden md:block w-[24rem]">
        <SearchField
          placeholder="인스턴스, VM 검색..."
          value={query}
          onInput={(value) => {
            setQuery(value);
            if (!showResults) setShowResults(true);
          }}
          onClear={() => setQuery("")}
        />
        {showResults && (
          <Card
            elevation="medium"
            padding="none"
            className="app-scrollbar absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Text size="sm" tone="muted">
                  검색 결과가 없습니다
                </Text>
              </div>
            ) : (
              filtered.slice(0, 10).map((vm) => (
                <button
                  key={`${vm.node}-${vm.vmid}`}
                  type="button"
                  onClick={() => goToVm(vm)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
                >
                  <span className="text-sm font-medium">{vm.name}</span>
                  <Text size="xs" tone="muted">
                    VMID {vm.vmid}
                  </Text>
                  <span
                    className={cn(
                      "ml-auto h-2 w-2 rounded-full",
                      vm.status === "running"
                        ? "bg-green-500"
                        : vm.status === "stopped"
                          ? "bg-red-400"
                          : "bg-yellow-400",
                    )}
                  />
                </button>
              ))
            )}
          </Card>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div ref={notifRef} className="relative">
          <IconButton
            variant="ghost"
            size="small"
            ariaLabel="알림"
            onClick={() => {
              if (!showNotifications) markAsRead();
              setShowNotifications(!showNotifications);
            }}
          >
            <BellIcon />
          </IconButton>
          {hasUnread && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
          {showNotifications && (
            <Card
              elevation="medium"
              padding="none"
              className="absolute right-0 top-full z-50 mt-2 w-[24rem]"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <Text size="md" weight="semibold">
                  알림
                </Text>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAll}
                    className="text-xs text-[var(--zm-color-text-muted,#94a3b8)] hover:text-[var(--zm-color-text-primary,#0f172a)]"
                  >
                    모두 읽음
                  </button>
                )}
              </div>
              <MenuDivider />
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Paragraph size="sm" tone="muted">
                    새로운 알림이 없습니다
                  </Paragraph>
                </div>
              ) : (
                <div className="app-scrollbar max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 border-b border-[var(--zm-color-border-subtle,#e5e7eb)] px-5 py-3 last:border-0"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                          getNotificationColor(n.type),
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <Text size="sm">{n.message}</Text>
                        <Text size="xs" tone="muted">
                          {formatTimeAgo(n.timestamp)}
                        </Text>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotification(n.id)}
                        className="text-xs text-[var(--zm-color-text-muted,#94a3b8)] hover:text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
          >
            <Avatar
              className="shrink-0"
              size="small"
              src={user?.avatar_url ?? undefined}
              fallback={initials}
              alt="프로필"
            />
            <span className="hidden text-sm font-medium md:inline">
              {displayName}
            </span>
          </button>
          {showUserMenu && (
            <Card
              elevation="medium"
              padding="none"
              className="absolute right-0 top-full z-50 mt-2 w-64"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar
                  className="shrink-0"
                  size="medium"
                  src={user?.avatar_url ?? undefined}
                  fallback={initials}
                  alt="프로필"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Text size="sm" weight="semibold">
                      {displayName}
                    </Text>
                    {studentNumber && (
                      <Badge variant="weak" size="xsmall" color="elephant">
                        {studentNumber}
                      </Badge>
                    )}
                  </div>
                  <Text size="xs" tone="muted">
                    {user?.email}
                  </Text>
                </div>
              </div>
              <MenuDivider />
              <button
                type="button"
                onClick={() => {
                  router.push("/settings");
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
              >
                설정
              </button>
              <MenuDivider />
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
              >
                로그아웃
              </button>
            </Card>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuDivider() {
  return (
    <div
      className="h-px w-full bg-[var(--zm-color-border-subtle,#e5e8eb)]"
      role="separator"
    />
  );
}
