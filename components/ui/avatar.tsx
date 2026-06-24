"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type AvatarSize = "small" | "medium" | "large";

type AvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  small: "h-8 w-8 text-sm",
  medium: "h-11 w-11 text-base",
  large: "h-16 w-16 text-xl",
};

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "medium",
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  const label =
    fallback ||
    alt.slice(0, 2).toUpperCase() ||
    "";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-[var(--zm-color-primary-subtle,#e0e7ff)] font-bold text-[var(--zm-color-primary,#4f46e5)]",
        sizeClasses[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{label}</span>
      )}
    </span>
  );
}
