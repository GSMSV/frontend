export type InstanceStatus = "running" | "stopped" | "pending" | "error";

export type VmAction = "start" | "shutdown" | "reboot";

export interface VmStatusResponse {
  name?: string;
  status?: InstanceStatus;
  cpus?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime?: number;
  cpu?: number;
  mem?: number;
  internal_ip?: string;
  vm_password?: string;
  public_ip?: string;
  created_at?: string;
  expires_at?: string;
  provisioning?: boolean;
}

export interface Instance {
  vmid: number;
  name: string;
  status: InstanceStatus;
  node: string;
  cpu: string;
  ram: string;
  disk: string;
  ip: string;
  uptime: string;
  os: string;
  created: string;
  internal_ip?: string;
  vm_password?: string;
  public_ip?: string;
  cpu_usage?: number;
  mem_usage?: number;
  maxmem?: number;
  maxdisk?: number;
  uptime_seconds?: number;
  expires_at?: string;
  provisioning?: boolean;
}
