import {
  UserProfile,
  UpdateUserProfileRequest,
  CreateViewHistoryRequest,
  HistoryList,
  GetHistoryParams,
  CurrentUser,
  User,
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
 * 获取用户对特定目标的操作状态
 * @param targetId 目标ID  
 * @param targetType 目标类型
 * @param actionType 操作类型
 * @returns
 */
export const getActionStatus = (targetId: string, targetType: 'user' | 'post' | 'comment' | 'knowledge', actionType: 'like' | 'favorite' | 'follow') => {
  return http.get<{ is_active: boolean; count: number }>("/actions/status", {
    target_id: targetId,
    target_type: targetType,
    action_type: actionType
  });
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
  return http.post<void>("/users/views", data);
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
 * 获取当前用户的标签列表
 * @returns
 */
export const getMyTags = () => {
  return http.get<any>("/persona/me/tags");
}; 

/**
 * 获取当前用户统计画像
 * @returns
 */
export const getMyStats = () => {
  return http.get<any>("/persona/me/stats");
};

/**
 * 获取当前用户的等级信息
 * @returns
 */
export const getMyLevel = () => {
  return http.get<any>("/persona/me/level");
};

/**
 * 获取当前用户经验明细
 * @param params 分页参数
 * @returns
 */
export const getMyExperienceRecords = (params?: { page?: number; size?: number }) => {
  return http.get<any>("/persona/me/experience-records", params);
};

/**
 * 获取经验值规则说明
 * @returns
 */
export const getExpRules = () => {
  return http.get<any>("/persona/exp-rules");
};

/**
 * 新增或更新当前用户标签
 * @param data 标签数据
 * @returns
 */
export const upsertMyTag = (data: { tag: string; weight?: number }) => {
  return http.post<any>("/persona/me/tags", data);
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
  return http.get<any>("/comments/me", params);
};

/**
 * 根据用户ID获取用户信息
 * @param userId 用户ID
 * @returns 用户信息
 */
export const getUserById = (userId: string) => {
  return http.get<User>(`/users/${userId}`);
};

// 用户API对象，包含所有用户相关的API函数
export const userApi = {
  getMe,
  getActionStatus,
  getMeProfile,
  updateMeProfile,
  createViewHistory,
  getMyHistory,
  getMyTags,
  getMyStats,
  getMyLevel,
  getMyExperienceRecords,
  getExpRules,
  upsertMyTag,
  getUserFavorites,
  getUserComments,
  getUserById,
};

export default userApi;