import http from "../request";
import { AboutInfo } from "@/types/about";

/**
 * 获取关于信息
 * @returns
 */
export const getAboutInfo = () => {
  return http.get<AboutInfo>("/about");
}; 