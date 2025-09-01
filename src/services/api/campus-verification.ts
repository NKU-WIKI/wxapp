import {
  CampusVerificationRequest,
  CampusVerificationResponse,
  CampusVerificationApplicationsResponse
} from "@/types/api/campus-verification";

// Relative imports
import http from "../request";

/**
 * 上传文件
 */
export const uploadFile = (filePath: string) => {
  return http.uploadFile("/tools/uploads/file", filePath);
};

/**
 * 提交校园认证申请
 */
export const submitCampusVerification = (data: CampusVerificationRequest) => {
  return http.post<CampusVerificationResponse>("/identity-verification/apply", data);
};

/**
 * 获取当前用户的校园认证申请记录
 */
export const getCampusVerificationInfo = () => {
  return http.get<CampusVerificationApplicationsResponse>("/identity-verification/my-applications");
};

/**
 * 获取校园认证申请详情
 */
export const getCampusVerificationDetail = (id: string) => {
  return http.get<CampusVerificationResponse>(`/identity-verification/${id}`);
};

const campusVerificationApi = {
  uploadFile,
  submitCampusVerification,
  getCampusVerificationInfo,
  getCampusVerificationDetail,
};

export default campusVerificationApi; 
