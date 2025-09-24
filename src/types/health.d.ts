export interface HealthInfo {
  tenants: Record<string, string>
  version: string
  description: string
}

export interface TenantInfo {
  name: string
  id: string
}
