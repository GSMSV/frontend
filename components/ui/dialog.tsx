"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";

type DialogKind = "alert" | "confirm";

type DialogProps = {
  open?: boolean;
  kind?: DialogKind;
  title?: string;
  description?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  className?: string;
  children?: ReactNode;
};

/**
 * zm-dialog 직접 래퍼. React 19 가 @zaemoru/react 의 Dialog 가 넘기는
 * `open=""` 문자열 prop 을 Lit 의 Boolean property setter 로 흘려보내면
 * 속성이 반사되지 않아 다이얼로그가 열리지 않는다. 여기서는 ref 로
 * 직접 attribute 를 토글해 우회한다.
 */
export function Dialog({
  open,
  kind = "alert",
  title,
  description,
  onClose,
  onCancel,
  onConfirm,
  className,
  children,
}: DialogProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.setAttribute("open", "");
    else el.removeAttribute("open");
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const closeHandler = () => onClose?.();
    const cancelHandler = () => onCancel?.();
    const confirmHandler = () => onConfirm?.();
    el.addEventListener("zm-close", closeHandler);
    el.addEventListener("zm-cancel", cancelHandler);
    el.addEventListener("zm-confirm", confirmHandler);
    return () => {
      el.removeEventListener("zm-close", closeHandler);
      el.removeEventListener("zm-cancel", cancelHandler);
      el.removeEventListener("zm-confirm", confirmHandler);
    };
  }, [onClose, onCancel, onConfirm]);

  return createElement(
    "zm-dialog",
    {
      ref,
      kind,
      "dialog-title": title,
      description,
      class: className,
    },
    children,
  );
}

type ModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  closeOnBackdrop?: boolean;
  actions?: ReactNode;
  onClose?: () => void;
  className?: string;
  children?: ReactNode;
};

export function Modal({
  open,
  title,
  description,
  closeOnBackdrop = true,
  actions,
  onClose,
  className,
  children,
}: ModalProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.setAttribute("open", "");
    else el.removeAttribute("open");
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (closeOnBackdrop) el.setAttribute("close-on-backdrop", "");
    else el.removeAttribute("close-on-backdrop");
  }, [closeOnBackdrop]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const closeHandler = () => onClose?.();
    el.addEventListener("zm-close", closeHandler);
    return () => {
      el.removeEventListener("zm-close", closeHandler);
    };
  }, [onClose]);

  return createElement(
    "zm-modal",
    {
      ref,
      "modal-title": title,
      description,
      class: className,
    },
    children,
    actions !== undefined
      ? createElement("span", { slot: "actions", key: "__actions" }, actions)
      : null,
  );
}
