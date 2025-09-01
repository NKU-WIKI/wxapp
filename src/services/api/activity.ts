import Taro from "@tarojs/taro";
import {
  ActivityCreateRequest,
  ActivityCreateResponse,
  GetActivityListResponse,
  GetActivityListRequest,
  PostJoinActivityRequest,
  PostJoinActivityResponse,
  GetMyActivityRequest,
  GetMyActivityResponse
} from "@/types/api/activity.d";
import http from "../request";

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

export const joinActivity = (params: PostJoinActivityRequest) =>{
  const raw = Taro.getStorageSync('token');
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : '';
  return http.post<PostJoinActivityResponse>(`/activities/${params.activity_id}/registrations`, params, {
    header: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export const myActivity = (params: GetMyActivityRequest) =>{
  const raw = Taro.getStorageSync('token');
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : '';
  return http.get<GetMyActivityResponse>(`/activities/me/registered`, params, {
    header: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

const activityApi = {
  getActivityList,
  createActivity,
  joinActivity,
  myActivity
}

export default activityApi;
