export interface AboutInfo {
  appName: string;
  version: string;
  website: string;
  email: string;
  github: string;
  teamName: string;
  companyName: string;
}

export interface AboutPageProps {
  // 预留扩展属性
}

export type LinkType = 'website' | 'email' | 'github'; 