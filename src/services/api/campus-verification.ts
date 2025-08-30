import http from "../request";
import { 
  CampusVerificationRequest, 
  CampusVerificationResponse, 
  CampusVerificationInfo 
} from "@/types/api/campus-verification";

/**
 * 提交校园认证申请
 */
export const submitCampusVerification = (data: CampusVerificationRequest) => {
  return http.post<CampusVerificationResponse>("/campus-verification/submit", data);
};

/**
 * 获取当前用户的校园认证信息
 */
export const getCampusVerificationInfo = () => {
  return http.get<CampusVerificationInfo>("/campus-verification/info");
};

/**
 * 获取校园认证申请详情
 */
export const getCampusVerificationDetail = (id: string) => {
  return http.get<CampusVerificationResponse>(`/campus-verification/${id}`);
};

const campusVerificationApi = {
  submitCampusVerification,
  getCampusVerificationInfo,
  getCampusVerificationDetail,
};

export default campusVerificationApi; 