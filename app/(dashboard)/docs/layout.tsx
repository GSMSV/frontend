export const dynamic = "force-static";
export const revalidate = 86400;
export const fetchCache = "default-cache";

export default function DocsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
