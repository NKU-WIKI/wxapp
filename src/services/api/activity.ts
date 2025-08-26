import {
  ActivityCreateRequest,
  ActivityCreateResponse,
  GetActivityListResponse,
  GetActivityListRequest
} from "@/types/api/activity.d";
import http from "../request";
import Taro from "@tarojs/taro"; // 新增

/**
 * 获取活动列表
 * @param params 查询参数
 * @returns
 */
export const getActivityList = (params: GetActivityListRequest) => {
  const raw = Taro.getStorageSync('token');
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : '';
  return http.get<GetActivityListResponse>("/activities", params, {
    header: token ? { Authorization: `Bearer ${token}` } : {}
  });
}
/** * 创建新活动
 * @param data 活动数据
 * @returns
 */
export const createActivity = (data: ActivityCreateRequest) => {
  const raw = Taro.getStorageSync('token');
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : '';
  return http.post<ActivityCreateResponse>("/activities", data, {
    header: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

const activityApi = {
  getActivityList,
  createActivity
}

export default activityApi;
