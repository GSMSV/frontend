"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { NotificationItem } from "@/lib/api";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotificationsQuery,
} from "@/lib/queries";

export type NotificationType = "info" | "success" | "error";

export interface Notification {
  id: number | string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
}

const COLOR_MAP: Record<NotificationType, string> = {
  info: "bg-sky-500",
  success: "bg-emerald-500",
  error: "bg-red-500",
};

interface NotificationContextType {
  notifications: Notification[];
  hasUnread: boolean;
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: number | string) => void;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: remoteData = [] } = useNotificationsQuery();
  const deleteRemote = useDeleteNotification();
  const markAllRead = useMarkAllNotificationsRead();

  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    [],
  );

  const remoteNotifications: Notification[] = useMemo(
    () =>
      remoteData.map((n: NotificationItem) => ({
        id: n.id,
        type: n.type as NotificationType,
        message: n.message,
        timestamp: new Date(n.created_at),
        read: n.is_read,
      })),
    [remoteData],
  );

  const notifications = useMemo(
    () => [...localNotifications, ...remoteNotifications],
    [localNotifications, remoteNotifications],
  );

  const addNotification = useCallback(
    (type: NotificationType, message: string) => {
      setLocalNotifications((prev) => [
        {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type,
          message,
          timestamp: new Date(),
          read: false,
        },
        ...prev,
      ]);
    },
    [],
  );

  const removeNotification = useCallback(
    (id: number | string) => {
      if (typeof id === "number") {
        deleteRemote.mutate(id);
      } else {
        setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    },
    [deleteRemote],
  );

  const markAsRead = useCallback(() => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (remoteNotifications.some((n) => !n.read)) {
      markAllRead.mutate();
    }
  }, [markAllRead, remoteNotifications]);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnread,
        addNotification,
        removeNotification,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

export function getNotificationColor(type: NotificationType) {
  return COLOR_MAP[type];
}
