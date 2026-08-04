"use client";

import { useState } from "react";

import { Tab } from "@zaemoru/react";

import type { PortInfo } from "@/lib/api";
import type { Instance } from "@/lib/types";

import { FirewallTab } from "./tabs/firewall-tab";
import { HttpsTab } from "./tabs/https-tab";
import { MetricsTab } from "./tabs/metrics-tab";
import { OverviewTab } from "./tabs/overview-tab";
import { SettingsTab } from "./tabs/settings-tab";

const tabs = [
  { value: "overview", label: "개요" },
  { value: "metrics", label: "모니터링" },
  { value: "firewall", label: "방화벽" },
  { value: "https", label: "HTTPS" },
  { value: "settings", label: "설정" },
];

export function InstanceTabs({
  instance,
  ports = [],
}: {
  instance: Instance;
  ports?: PortInfo[];
}) {
  const [active, setActive] = useState("overview");

  return (
    <div className="flex flex-col gap-4">
      <Tab
        items={tabs}
        value={active}
        onChange={(value) => setActive(value)}
      />

      {active === "overview" && (
        <OverviewTab instance={instance} ports={ports} />
      )}
      {active === "metrics" && <MetricsTab instance={instance} />}
      {active === "firewall" && (
        <FirewallTab instance={instance} ports={ports} />
      )}
      {active === "https" && <HttpsTab instance={instance} />}
      {active === "settings" && <SettingsTab instance={instance} />}
    </div>
  );
}
