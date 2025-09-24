import Taro from '@tarojs/taro'

import http from '../request'

import {
  PostActivityCreateRequest,
  PostActivityCreateResponse,
  GetActivityListResponse,
  GetActivityListRequest,
  PostJoinActivityRequest,
  PostJoinActivityResponse,
  GetMyActivityRequest,
  GetMyActivityResponse,
  DeleteCancelRegistrationsRequest,
  DeleteCancelRegistrationsResponse,
} from '@/types/api/activity.d'

/**
 * 获取活动列表
 * @param params 查询参数
 * @returns
 */
export const getActivityList = (params: GetActivityListRequest) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.get<GetActivityListResponse>('/activities', params, {
    header: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
/** * 创建新活动
 * @param data 活动数据
 * @returns
 */
export const createActivity = (data: PostActivityCreateRequest) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.post<PostActivityCreateResponse>('/activities', data, {
    header: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const joinActivity = (params: PostJoinActivityRequest) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.post<PostJoinActivityResponse>(
    `/activities/${params.activity_id}/registrations`,
    params,
    {
      header: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
}

/**
 * 获取活动详情
 * @param activityId 活动ID
 * @returns
 */
export const getActivityDetail = (activityId: string) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.get<PostActivityCreateResponse>(
    `/activities/${activityId}`,
    {},
    {
      header: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
}

export const myActivity = (params: GetMyActivityRequest) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.get<GetMyActivityResponse>(`/activities/me/registered`, params, {
    header: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

/**
 * 获取我组织的活动
 * @param params 查询参数
 * @returns
 */
export const myOrganizedActivity = (params: GetMyActivityRequest) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.get<GetMyActivityResponse>(`/activities/me/organized`, params, {
    header: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

/**
 * 取消活动报名
 * @param activityId 活动ID
 * @returns
 */
export const cancelActivityRegistration = (params: DeleteCancelRegistrationsRequest) => {
  const raw = Taro.getStorageSync('token')
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : ''
  return http.delete<DeleteCancelRegistrationsResponse>(
    `/activities/${params.activity_id}/registrations`,
    {},
    {
      header: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
}

const activityApi = {
  getActivityList,
  getActivityDetail,
  createActivity,
  joinActivity,
  myActivity,
  myOrganizedActivity,
  cancelActivityRegistration,
}

export default activityApi
