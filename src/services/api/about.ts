import { AboutInfo } from "@/types/about";
import http from "../request";

/**
 * 获取应用信息（包含租户信息）
 * @returns
 */
export const getAboutInfo = () => {
  return http.get<AboutInfo>("/health/about");
}; 