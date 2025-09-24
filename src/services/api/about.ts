import http from '../request'

import { AboutInfo } from '@/types/about'

/**
 * 获取应用信息（包含租户信息）
 * @returns
 */
export const getAboutInfo = () => {
  return http.get<AboutInfo>('/health/about')
}
