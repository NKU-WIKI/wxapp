export interface AboutInfo {
  appName: string;
  version: string;
  website: string;
  email: string;
  github: string;
  teamName: string;
  companyName: string;
  tenants?: Record<string, string>; // 租户映射，如 {"南开大学": "f6303899-a51a-460a-9cd8-fe35609151eb"}
  description?: string; // 应用描述
}

export interface AboutPageProps {
  // 预留扩展属性
}

export type LinkType = 'website' | 'email' | 'github'; 