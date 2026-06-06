"use client";

import { createElement, useEffect, useRef } from "react";

type ToggleSwitchProps = {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
};

/**
 * zm-toggle-switch 직접 래퍼. @zaemoru/react 의 ToggleSwitch 는
 * `toZaemoruAttributes` 만 사용해 attribute 만 흘려보내고 `on*` prop 은
 * 전부 버리므로 `onChange`(zm-change) 가 연결되지 않아 토글이 동작하지 않는다.
 * 여기서는 ref 로 직접 zm-change 를 구독하고 boolean attribute 를 토글한다.
 */
export function ToggleSwitch({
  checked,
  disabled,
  label,
  description,
  onChange,
  className,
}: ToggleSwitchProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (checked) el.setAttribute("checked", "");
    else el.removeAttribute("checked");
  }, [checked]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) el.setAttribute("disabled", "");
    else el.removeAttribute("disabled");
  }, [disabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ checked: boolean }>).detail;
      onChange?.(detail?.checked ?? !checked);
    };
    el.addEventListener("zm-change", handler);
    return () => el.removeEventListener("zm-change", handler);
  }, [onChange, checked]);

  return createElement("zm-toggle-switch", {
    ref,
    label,
    description,
    class: className,
  });
}
