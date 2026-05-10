"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  Heading,
  Result,
  SegmentedControl,
  Text,
} from "@zaemoru/react";

import { type VmMetricPoint, getVmMetrics } from "@/lib/api";
import { useNotifications } from "@/lib/notification-context";
import type { Instance } from "@/lib/types";

const POLL_INTERVAL = 10000;

const TIMEFRAME_MAP: Record<string, string> = {
  "1h": "hour",
  "6h": "day",
  "24h": "day",
};

const TIMERANGE_SECONDS: Record<string, number> = {
  "1h": 3600,
  "6h": 21600,
  "24h": 86400,
};

function formatTime(timestamp: number, range: string): string {
  const date = new Date(timestamp * 1000);
  if (range === "1h") {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleTimeString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ChartDataPoint {
  label: string;
  value: number;
}

function MetricChart({
  data,
  color,
  unit,
  label,
}: {
  data: ChartDataPoint[];
  color: string;
  unit: string;
  label: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Text size="sm" tone="muted">
          데이터를 불러오는 중...
        </Text>
      </div>
    );
  }

  const gradId = `g-${label.replace(/\s+/g, "-")}`;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          formatter={(value) => [`${value}${unit}`, label]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MetricsTab({ instance }: { instance: Instance }) {
  const isRunning = instance.status === "running";
  const [range, setRange] = useState("1h");
  const [metrics, setMetrics] = useState<VmMetricPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const [alertSent, setAlertSent] = useState({ cpu: false, mem: false });

  const fetchMetrics = useCallback(async () => {
    if (!instance.node || !instance.vmid) return;
    try {
      const timeframe = TIMEFRAME_MAP[range] || "hour";
      const res = await getVmMetrics(instance.node, instance.vmid, timeframe);
      const now = Math.floor(Date.now() / 1000);
      const cutoff = now - TIMERANGE_SECONDS[range];
      const filtered = res.data.filter((p) => p.time >= cutoff);
      setMetrics(filtered);
      setError(null);

      const latest = filtered.at(-1);
      if (latest) {
        if (latest.cpu > 90 && !alertSent.cpu) {
          addNotification(
            "error",
            `${instance.name}: CPU 사용량이 ${latest.cpu}%에 도달했습니다.`,
          );
          setAlertSent((prev) => ({ ...prev, cpu: true }));
        } else if (latest.cpu <= 90) {
          setAlertSent((prev) => ({ ...prev, cpu: false }));
        }
        if (latest.mem_percent > 90 && !alertSent.mem) {
          addNotification(
            "error",
            `${instance.name}: 메모리 사용량이 ${latest.mem_percent}%에 도달했습니다.`,
          );
          setAlertSent((prev) => ({ ...prev, mem: true }));
        } else if (latest.mem_percent <= 90) {
          setAlertSent((prev) => ({ ...prev, mem: false }));
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "메트릭 조회 실패");
    }
  }, [
    instance.node,
    instance.vmid,
    instance.name,
    range,
    alertSent,
    addNotification,
  ]);

  useEffect(() => {
    if (!isRunning) return;
    fetchMetrics();
    const interval = setInterval(fetchMetrics, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isRunning, fetchMetrics]);

  if (!isRunning) {
    return (
      <Result
        tone="warning"
        title="모니터링 사용 불가"
        description="모니터링은 실행 중인 인스턴스에서만 사용할 수 있습니다."
      />
    );
  }

  const cpuData: ChartDataPoint[] = metrics.map((p) => ({
    label: formatTime(p.time, range),
    value: p.cpu,
  }));
  const memData: ChartDataPoint[] = metrics.map((p) => ({
    label: formatTime(p.time, range),
    value: p.mem_percent,
  }));
  const netData: ChartDataPoint[] = metrics.map((p) => ({
    label: formatTime(p.time, range),
    value: Math.round((p.netin + p.netout) * 10) / 10,
  }));
  const diskData: ChartDataPoint[] = metrics.map((p) => ({
    label: formatTime(p.time, range),
    value: Math.round((p.diskread + p.diskwrite) * 10) / 10,
  }));

  const latest = metrics.at(-1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {latest && (
          <div className="flex gap-4">
            <Text size="sm">
              CPU{" "}
              <Text size="sm" weight="semibold">
                {latest.cpu}%
              </Text>
            </Text>
            <Text size="sm">
              메모리{" "}
              <Text size="sm" weight="semibold">
                {latest.mem_percent}%
              </Text>
            </Text>
          </div>
        )}
        <SegmentedControl
          value={range}
          options={[
            { value: "1h", label: "1시간" },
            { value: "6h", label: "6시간" },
            { value: "24h", label: "24시간" },
          ]}
          onChange={(v) => setRange(v)}
        />
      </div>

      {error && (
        <Card padding="medium">
          <Text size="sm" tone="danger">
            {error}
          </Text>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            CPU 사용률
          </Heading>
          <div className="mt-3">
            <MetricChart
              data={cpuData}
              color="#3b82f6"
              unit="%"
              label="CPU"
            />
          </div>
        </Card>
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            메모리 사용률
          </Heading>
          <div className="mt-3">
            <MetricChart
              data={memData}
              color="#10b981"
              unit="%"
              label="메모리"
            />
          </div>
        </Card>
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            네트워크 I/O
          </Heading>
          <div className="mt-3">
            <MetricChart
              data={netData}
              color="#f59e0b"
              unit=" KB/s"
              label="네트워크"
            />
          </div>
        </Card>
        <Card elevation="low" padding="medium">
          <Heading level="3" size="md">
            디스크 I/O
          </Heading>
          <div className="mt-3">
            <MetricChart
              data={diskData}
              color="#8b5cf6"
              unit=" KB/s"
              label="디스크"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

