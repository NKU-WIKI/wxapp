import http from "../request";
import { PaginationParams } from "./common";
import {
  User,
  UserProfile,
  UpdateUserProfileRequest,
  CreateViewHistoryRequest,
  HistoryList,
  GetHistoryParams,
  CurrentUser,
} from "@/types/api/user";

/**
 * 获取当前登录用户的基本信息
 * @returns
 */
export const getMe = () => {
  return http.get<CurrentUser>("/users/me");
};

/**
 * 获取当前登录用户的详细资料
 * @returns
 */
export const getMeProfile = () => {
  return http.get<UserProfile>("/users/me/profile");
};

/**
 * 更新当前登录用户的详细资料
 * @param data
 * @returns
 */
export const updateMeProfile = (data: UpdateUserProfileRequest) => {
  return http.put<UserProfile>("/users/me/profile", data);
};

/**
 * 记录一条浏览历史
 * @param data
 * @returns
 */
export const createViewHistory = (data: CreateViewHistoryRequest) => {
  return http.post<any>("/users/views", data);
};

/**
 * 获取当前用户的浏览历史
 * @param params
 * @returns
 */
export const getMyHistory = (params: GetHistoryParams) => {
  return http.get<HistoryList>("/users/me/history", params);
}; 