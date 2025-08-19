import {
  UserProfile,
  UpdateUserProfileRequest,
  CreateViewHistoryRequest,
  HistoryList,
  GetHistoryParams,
  CurrentUser,
} from "@/types/api/user";
import http from "../request";

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
  return http.post<any>("/actions/view", data);
};

/**
 * 获取当前用户的浏览历史
 * @param params
 * @returns
 */
export const getMyHistory = (params: GetHistoryParams) => {
  return http.get<HistoryList>("/users/me/history", params);
}; 

/**
 * 获取用户收藏列表
 * 注意：这个API在文档中缺失，可能需要通过其他方式实现
 */
export const getUserFavorites = (_params: any) => {
  // 由于API文档中没有获取用户收藏的端点，暂时返回空数组
  return Promise.resolve({ code: 200, data: [] });
};

/**
 * 获取用户评论列表
 * @param params 分页参数
 * @returns 用户评论列表
 */
export const getUserComments = (params?: { skip?: number; limit?: number }) => {
  return http.get<any>("/forums/comments/me", params);
};

// 用户API对象，包含所有用户相关的API函数
export const userApi = {
  getMe,
  getMeProfile,
  updateMeProfile,
  createViewHistory,
  getMyHistory,
  getUserFavorites,
  getUserComments,
};

export default userApi;