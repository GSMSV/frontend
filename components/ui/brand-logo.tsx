import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/GSMSVLOGO.jpg"
      alt="GSMSV"
      width={size}
      height={size}
      priority
      className={cn("shrink-0 rounded-lg object-cover", className)}
    />
  );
}
