"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Text } from "@zaemoru/react";

const BOX = 288; // crop viewport size (px)
const OUTPUT = 512; // exported square size (px)

type Offset = { x: number; y: number };

export function AvatarCropper({
  file,
  onCancel,
  onCropped,
  busy,
}: {
  file: File;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  busy?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // base scale so the image always covers the square at zoom = 1
  const baseScale = natural
    ? Math.max(BOX / natural.w, BOX / natural.h)
    : 1;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;

  const clamp = useCallback(
    (o: Offset): Offset => {
      const maxX = Math.max(0, (dispW - BOX) / 2);
      const maxY = Math.max(0, (dispH - BOX) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, o.x)),
        y: Math.min(maxY, Math.max(-maxY, o.y)),
      };
    },
    [dispW, dispH],
  );

  useEffect(() => {
    setOffset((o) => clamp(o));
  }, [clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setOffset(
      clamp({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy }),
    );
  };
  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  const handleConfirm = () => {
    if (!natural || !imgRef.current) return;
    // visible source rectangle (in source pixels)
    const imageLeftInBox = (BOX - dispW) / 2 + offset.x;
    const imageTopInBox = (BOX - dispH) / 2 + offset.y;
    const srcX = -imageLeftInBox / scale;
    const srcY = -imageTopInBox / scale;
    const srcSize = BOX / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // opaque white backdrop so any transparency flattens cleanly
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.drawImage(
      imgRef.current,
      srcX,
      srcY,
      srcSize,
      srcSize,
      0,
      0,
      OUTPUT,
      OUTPUT,
    );
    canvas.toBlob(
      (blob) => {
        if (blob) onCropped(blob);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <Text size="md" weight="semibold">
          프로필 사진 위치 조정
        </Text>
        <Text size="sm" tone="muted">
          드래그해서 위치를 옮기고, 슬라이더로 확대하세요.
        </Text>

        <div
          className="relative mx-auto mt-4 cursor-grab touch-none overflow-hidden rounded-full bg-[var(--zm-color-bg-subtle,#f3f4f6)] active:cursor-grabbing"
          style={{ width: BOX, height: BOX }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={url}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNatural({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              style={{
                position: "absolute",
                width: dispW || undefined,
                height: dispH || undefined,
                left: (BOX - dispW) / 2 + offset.x,
                top: (BOX - dispH) / 2 + offset.y,
                maxWidth: "none",
                userSelect: "none",
              }}
            />
          )}
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="mt-4 w-full accent-[var(--zm-color-primary,#4f46e5)]"
          aria-label="확대"
        />

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="small" onClick={onCancel} disabled={busy}>
            취소
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleConfirm}
            disabled={busy || !natural}
            loading={busy}
          >
            적용
          </Button>
        </div>
      </div>
    </div>
  );
}
