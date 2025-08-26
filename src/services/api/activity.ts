import {
  ActivityCreateRequest,
  ActivityCreateResponse,
  GetActivityListResponse,
  GetActivityListRequest
} from "@/types/api/activity.d";
import http from "../request";

/**
 * 获取活动列表
 * @param params 查询参数
 * @returns
 */
export const getActivityList = (params: GetActivityListRequest) => {
  return http.get<GetActivityListResponse>("/activities", params);
}
/** * 创建新活动
 * @param data 活动数据
 * @returns
 */
export const createActivity = (data: ActivityCreateRequest) => {
  return http.post<ActivityCreateResponse>("/activities", data);
}

const activityApi = {
  getActivityList,
  createActivity
}

export default activityApi;
