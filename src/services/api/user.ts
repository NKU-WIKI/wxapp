import {
  UserProfile,
  UpdateUserProfileRequest,
  CreateViewHistoryRequest,
  HistoryList,
  GetHistoryParams,
  User,
} from "@/types/api/user";
import { Post } from "@/types/api/post.d";
import { PaginatedData, PaginationParams } from "@/types/api/common";
import { ActionRead } from "@/store/slices/favoriteSlice";
import http from "../request";

/**
 * 获取当前登录用户的基本信息
 * @returns
 */
export const getMe = () => {
  return http.get<User>("/users/me");
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
  return http.get<any>("/persona/me/stats").then(response => {
    return response;
  }).catch(error => {
    
    throw error;
  });
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
 * 获取当前用户点赞的帖子列表
 * @param params 分页参数
 * @returns 用户点赞的帖子列表
 */
export const getUserLikedPosts = (params?: PaginationParams) => {
  return http.get<PaginatedData<Post>>("/users/me/liked-posts", params);
};

/**
 * 获取当前用户点赞的笔记列表
 * @param params 分页参数
 * @returns 用户点赞的笔记列表
 */
export const getUserLikedNotes = (params?: PaginationParams) => {
  return http.get<PaginatedData<any>>("/users/me/liked-notes", params);
};

/**
 * 获取当前用户评论列表（旧版本API - 保持向后兼容）
 * OpenAPI 指定为 /comments/me
 */
export const getUserComments = (params?: { skip?: number; limit?: number }) => {
  return http.get<any>("/comments/me", params);
};

/**
 * 获取我的评论列表（新版本API）
 * OpenAPI 指定为 /users/me/comments
 */
export const getMyComments = (params?: PaginationParams) => {
  return http.get<any>("/users/me/comments", params);
};

/**
 * 根据用户ID获取用户信息
 * @param userId 用户ID
 * @returns 用户信息
 */
export const getUserById = (userId: string) => {
  return http.get<User>(`/users/${userId}/detail`);
};

/**
 * 获取用户发布的帖子列表
 * @param userId 用户ID
 * @param params 分页参数
 * @returns
 */
export const getUserPosts = (userId: string, params?: PaginationParams) => {
  // 确保参数在合理范围内
  const safeParams = {
    skip: Math.max(0, params?.skip || 0),
    limit: Math.min(100, Math.max(1, params?.limit || 20))
  };
  
  return http.get<Post[]>(`/users/${userId}/posts`, safeParams).then(response => {
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取当前用户发布的帖子列表
 * @param params 分页参数
 * @returns
 */
export const getMyPosts = (params?: PaginationParams) => {
  // 确保参数在合理范围内
  const safeParams = {
    skip: Math.max(0, params?.skip || 0),
    limit: Math.min(100, Math.max(1, params?.limit || 20))
  };
  
  return http.get<Post[]>("/users/me/posts", safeParams).then(response => {
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取当前用户的帖子数量
 * 通过获取所有帖子并计算数量
 * @returns 帖子数量
 */
export const getMyPostCount = async () => {
  try {
    // 获取所有帖子，设置较大的limit来获取所有帖子
    const response = await http.get<Post[]>("/forums/posts", { limit: 1000 });
    if (response.code === 0 && response.data) {
      // 过滤出当前用户的帖子
      const myPosts = response.data.filter((post: any) => {
        // 检查帖子是否属于当前用户
        return post.user_id || post.author_info?.id;
      });
      return myPosts.length;
    }
    return 0;
  } catch (error) {
    
    return 0;
  }
};

/**
 * 获取我的收藏列表
 * @param params 分页参数
 * @returns
 */
export const getMyFavorites = (params?: PaginationParams) => {
  return http.get<ActionRead[]>("/users/me/favorites", params);
};

/**
 * 获取我的点赞列表
 * @param params 分页参数
 * @returns
 */
export const getMyLikes = (params?: PaginationParams) => {
  return http.get<ActionRead[]>("/users/me/likes", params);
};

/**
 * 获取指定用户的帖子数量
 * @param userId 用户ID
 * @returns 帖子数量
 */
export const getUserPostCount = async (userId: string) => {
  try {
    const response = await http.get<Post[]>(`/users/${userId}/posts`, { skip: 0, limit: 100 });
    if (response.code === 0 && response.data) {
      return response.data.length;
    }
    return 0;
  } catch (error) {
    
    return 0;
  }
};

/**
 * 获取指定用户的粉丝数量
 * @param userId 用户ID
 * @returns 粉丝数量
 */
export const getUserFollowersCount = async (userId: string) => {
  try {
    const response = await http.get<any>(`/users/${userId}/followers`, { skip: 0, limit: 100 });
    if (response.code === 0 && response.data) {
      return response.data.length;
    }
    return 0;
  } catch (error) {
    
    return 0;
  }
};

/**
 * 获取指定用户的关注数量
 * @param userId 用户ID
 * @returns 关注数量
 */
export const getUserFollowingCount = async (userId: string) => {
  try {
    const response = await http.get<any>(`/users/${userId}/following`, { skip: 0, limit: 100 });
    if (response.code === 0 && response.data) {
      return response.data.length;
    }
    return 0;
  } catch (error) {
    
    return 0;
  }
};

// 用户API对象，包含所有用户相关的API函数

const userApi = {
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
  getUserLikedPosts,
  getUserLikedNotes,
  getUserPosts,
  getMyFavorites,
  getMyLikes,
  getUserPostCount,
  getUserFollowersCount,
  getUserFollowingCount,
};

export default userApi;
