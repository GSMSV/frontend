"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sideNav = [
  { title: "시작하기", href: "/docs/getting-started" },
  { title: "인스턴스", href: "/docs/instances" },
  { title: "접속 방법", href: "/docs/access" },
  { title: "SSH Key 등록", href: "/docs/ssh-key" },
  { title: "Public IP / GPU 안내", href: "/docs/advanced-resources" },
  { title: "프로젝트 오너", href: "/docs/project-owner" },
  { title: "FAQ", href: "/docs/faq" },
  { title: "질문 등록", href: "/docs/questions" },
];

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIdx = sideNav.findIndex((n) => n.href === pathname);
  const prev = currentIdx > 0 ? sideNav[currentIdx - 1] : null;
  const next =
    currentIdx >= 0 && currentIdx < sideNav.length - 1
      ? sideNav[currentIdx + 1]
      : null;

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-1.5 text-sm text-[var(--zm-color-text-muted,#94a3b8)]">
        <Link href="/docs" className="hover:text-[var(--zm-color-text-primary,#0f172a)]">
          Docs
        </Link>
        <span>›</span>
        <span className="font-medium text-[var(--zm-color-text-primary,#0f172a)]">
          {sideNav.find((n) => n.href === pathname)?.title ?? "문서"}
        </span>
      </div>

      <div className="docs-content">{children}</div>

      <div className="mt-12 flex items-center justify-between border-t border-[var(--zm-color-border-subtle,#e5e7eb)] pt-6 text-sm">
        {prev ? (
          <Link
            href={prev.href}
            className="text-[var(--zm-color-text-muted,#94a3b8)] hover:text-[var(--zm-color-text-primary,#0f172a)]"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="text-[var(--zm-color-text-muted,#94a3b8)] hover:text-[var(--zm-color-text-primary,#0f172a)]"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
