"use client";

import { useEffect, useState } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { useNotifications } from "@/lib/notification-context";

function SessionNotificationHandler() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (sessionStorage.getItem("notif:login")) {
      sessionStorage.removeItem("notif:login");
      addNotification("info", "로그인되었습니다. 환영합니다!");
    }
    if (sessionStorage.getItem("notif:signup")) {
      sessionStorage.removeItem("notif:signup");
      addNotification("info", "회원가입이 완료되었습니다.");
    }
  }, [addNotification]);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SessionNotificationHandler />
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="md:pl-56">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
