"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Heading, Spinner, Text } from "@zaemoru/react";

import { useAuth } from "@/lib/auth-context";
import { useAllVms, useMyVms } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ChevronDownIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

type NavItem = { title: string; href: string };

const mainNavItems: NavItem[] = [
  { title: "인스턴스", href: "/instances" },
  { title: "VM 생성", href: "/deploy" },
  { title: "서버리스", href: "/serverless" },
];

const docCategories: { title: string; href: string; children?: NavItem[] }[] = [
  {
    title: "시작하기",
    href: "/docs/getting-started",
    children: [
      { title: "인스턴스", href: "/docs/instances" },
      { title: "접속 방법", href: "/docs/access" },
      { title: "SSH Key 등록", href: "/docs/ssh-key" },
      { title: "Public IP / GPU 안내", href: "/docs/advanced-resources" },
    ],
  },
  { title: "FAQ", href: "/docs/faq" },
  { title: "질문 등록", href: "/docs/questions" },
];

const footerNavItems: { title: string; href: string; external?: boolean }[] = [
  { title: "설정", href: "/settings" },
  {
    title: "지원",
    href: process.env.NEXT_PUBLIC_DISCORD_URL || "#",
    external: true,
  },
];

function StatusDot({ status }: { status: string }) {
  const color =
    status === "running"
      ? "bg-green-500"
      : status === "stopped"
        ? "bg-red-400"
        : "bg-yellow-400";
  return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)} />;
}

function SidebarLink({
  href,
  active,
  children,
  query,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  query?: string;
}) {
  return (
    <Link
      href={query ? `${href}?${query}` : href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--zm-color-bg-emphasis,#1f2937)] text-[var(--zm-color-text-on-emphasis,#fff)]"
          : "text-[var(--zm-color-text-secondary,#475569)] hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]",
      )}
    >
      {children}
    </Link>
  );
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentNode = searchParams.get("node");
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";
  const authReady = !authLoading && !!user;

  const myVmsQuery = useMyVms(authReady && !isAdmin);
  const allVmsQuery = useAllVms(authReady && isAdmin);
  const activeQuery = isAdmin ? allVmsQuery : myVmsQuery;
  const vms = isAdmin ? [] : (myVmsQuery.data ?? []);
  const adminNodes = isAdmin ? (allVmsQuery.data ?? []) : [];
  const vmLoading = !authReady || activeQuery.isLoading;

  const [docsOpen, setDocsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname.startsWith("/docs")) return;
    const initial = setTimeout(() => setDocsOpen(true), 0);
    return () => clearTimeout(initial);
  }, [pathname]);

  const isItemActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/instances") return pathname === "/instances";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleNode = (nodeName: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeName)) next.delete(nodeName);
      else next.add(nodeName);
      return next;
    });
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <BrandLogo size={28} />
        <Heading level="2" size="lg">
          GSM SV
        </Heading>
      </div>

      <nav className="app-scrollbar flex-1 overflow-y-auto px-2 py-4">
        <Section title="Menu">
          {mainNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              active={isItemActive(item.href)}
            >
              {item.title}
            </SidebarLink>
          ))}
        </Section>

        <Section title="Docs">
          <button
            type="button"
            onClick={() => setDocsOpen(!docsOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "text-[var(--zm-color-text-secondary,#475569)] hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]",
            )}
          >
            <span>문서</span>
            {docsOpen ? (
              <ChevronDownIcon className="text-xs" size={16} />
            ) : (
              <ChevronRightIcon className="text-xs" size={16} />
            )}
          </button>
          {docsOpen && (
            <div className="ml-2 mt-1 flex flex-col gap-0.5 border-l border-[var(--zm-color-border-subtle,#e5e7eb)] pl-3">
              {docCategories.map((cat) => {
                const active = isItemActive(cat.href);
                return (
                  <div key={cat.href} className="flex flex-col gap-0.5">
                    <SidebarLink href={cat.href} active={active}>
                      {cat.title}
                    </SidebarLink>
                    {cat.children?.map((child) => (
                      <SidebarLink
                        key={child.href}
                        href={child.href}
                        active={isItemActive(child.href)}
                      >
                        <span className="pl-3 text-xs">{child.title}</span>
                      </SidebarLink>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {isAdmin && (
          <Section title="Admin">
            <SidebarLink
              href="/admin/approvals"
              active={isItemActive("/admin/approvals")}
            >
              가입 승인
            </SidebarLink>
          </Section>
        )}

        <Section title={isAdmin ? "Nodes" : "My VM"}>
          {vmLoading ? (
            <div className="flex justify-center py-3">
              <Spinner size="small" />
            </div>
          ) : isAdmin ? (
            adminNodes.length === 0 ? (
              <Text size="sm" tone="muted">
                노드 없음
              </Text>
            ) : (
              adminNodes.map((node) => {
                const expanded = expandedNodes.has(node.name);
                return (
                  <div key={node.name} className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleNode(node.name)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--zm-color-text-secondary,#475569)] hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
                    >
                      <span>{node.name}</span>
                      <span className="flex items-center gap-1 text-xs">
                        {node.vms.length}
                        {expanded ? (
                          <ChevronDownIcon size={16} />
                        ) : (
                          <ChevronRightIcon size={16} />
                        )}
                      </span>
                    </button>
                    {expanded &&
                      node.vms.map((vm) => {
                        const href = `/instances/${vm.vmid}`;
                        const active =
                          (pathname === href ||
                            pathname.startsWith(href + "/")) &&
                          currentNode === vm.node;
                        return (
                          <SidebarLink
                            key={`${vm.node}-${vm.vmid}`}
                            href={href}
                            query={`node=${vm.node}`}
                            active={active}
                          >
                            <span className="ml-3 flex flex-1 items-center gap-2">
                              <span className="truncate">{vm.name}</span>
                              <StatusDot status={vm.status || "stopped"} />
                            </span>
                          </SidebarLink>
                        );
                      })}
                  </div>
                );
              })
            )
          ) : vms.length === 0 ? (
            <Text size="sm" tone="muted">
              인스턴스 없음
            </Text>
          ) : (
            vms.map((vm) => {
              const href = `/instances/${vm.vmid}`;
              return (
                <SidebarLink
                  key={`${vm.node}-${vm.vmid}`}
                  href={href}
                  query={`node=${vm.node}`}
                  active={isItemActive(href)}
                >
                  <span className="flex flex-1 items-center gap-2">
                    <span className="truncate">{vm.name}</span>
                    <StatusDot status={vm.status || "stopped"} />
                  </span>
                </SidebarLink>
              );
            })
          )}
        </Section>
      </nav>

      <div className="border-t border-[var(--zm-color-border-subtle,#e5e7eb)] px-2 py-3">
        <div className="flex flex-col gap-0.5">
          {footerNavItems.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--zm-color-text-secondary,#475569)] hover:bg-[var(--zm-color-bg-subtle,#f3f4f6)]"
              >
                {item.title}
              </a>
            ) : (
              <SidebarLink
                key={item.href}
                href={item.href}
                active={isItemActive(item.href)}
              >
                {item.title}
              </SidebarLink>
            ),
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 border-r border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-canvas,#fafafa)] md:block">
        {content}
      </aside>
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-56 border-r border-[var(--zm-color-border-subtle,#e5e7eb)] bg-[var(--zm-color-bg-canvas,#fafafa)] md:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--zm-color-text-muted,#94a3b8)]">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
      <div className="mt-2 border-t border-[var(--zm-color-border-subtle,#e5e7eb)]" />
    </div>
  );
}
