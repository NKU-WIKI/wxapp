import { LevelInfo, ExperienceRecordPage } from "@/types/api/level";

// Relative imports
import http from "../request";

/**
 * 获取当前用户的等级信息
 */
export const getMyLevel = () => {
  return http.get<LevelInfo>("/persona/me/level");
};

/**
 * 获取当前用户的经验记录（默认今日）
 */
export const getMyExperienceRecords = () => {
  return http.get<ExperienceRecordPage>("/persona/me/experience-records");
};

const levelApi = {
  getMyLevel,
  getMyExperienceRecords,
};

export default levelApi; 
