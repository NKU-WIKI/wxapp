import { PaginationParams } from "@/types/api/common";
import { User } from "@/types/api/user";
import { GetFollowersParams, FollowActionParams } from "@/types/api/followers";
import http from "../request";

/**
 * 获取关注/粉丝列表（支持当前用户）
 * @param params 获取参数
 * @returns
 */
export const getFollowers = async (params: GetFollowersParams) => {
  // 首先获取当前用户信息以获得用户ID
  try {
    const userResponse = await http.get<CurrentUser>('/users/me');
    const userId = (userResponse.data as any)?.user_id ?? (userResponse.data as any)?.id;
    
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    
    // 使用用户ID构建正确的端点
    const endpoint = params.type === 'following' 
      ? `/users/${userId}/following`
      : `/users/${userId}/followers`;
      
    const queryParams = {
      skip: ((params.page || 1) - 1) * (params.page_size || 20),
      limit: params.page_size || 20,
      ...(params.search && { search: params.search })
    };
    
    return http.get<User[]>(endpoint, queryParams);
  } catch (error) {
    
    throw error;
  }
};

/**
 * 获取指定用户的粉丝列表
 * @param userId 用户ID
 * @param params 分页参数
 * @returns
 */
export const getUserFollowers = (
  userId: string,
  params: PaginationParams
) => {
  return http.get<User[]>(
    `/users/${userId}/followers`,
    params
  );
};

/**
 * 获取指定用户关注的用户列表
 * @param userId 用户ID
 * @param params 分页参数
 * @returns
 */
export const getUserFollowing = (
  userId: string,
  params: PaginationParams
) => {
  return http.get<User[]>(
    `/users/${userId}/following`,
    params
  );
};

/**
 * 关注/取消关注用户
 * @param params 关注操作参数
 * @returns
 */
export const followAction = (params: FollowActionParams) => {
  // 根据OpenAPI文档，使用 /actions/toggle 接口
  return http.post<{ is_active: boolean }>("/actions/toggle", {
    target_id: params.target_user_id,
    target_type: "user",
    action_type: "follow"
  });
};

/**
 * 获取当前用户的关注和粉丝总数
 * @returns 包含following_count和follower_count的对象
 */
export const getFollowersCount = async () => {
  try {
    // 获取当前用户信息
    const userResponse = await http.get<CurrentUser>('/users/me');
    const userId = (userResponse.data as any)?.user_id ?? (userResponse.data as any)?.id;
    
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    
    // 并行获取关注和粉丝列表的第一页来计算总数
    const [followingResponse, followersResponse] = await Promise.all([
      http.get<User[]>(`/users/${userId}/following`, { skip: 0, limit: 100 }),
      http.get<User[]>(`/users/${userId}/followers`, { skip: 0, limit: 100 })
    ]);
    
    // 计算总数（这里假设API返回的是完整列表，如果API支持总数查询，应该使用API返回的总数）
    const followingCount = Array.isArray(followingResponse.data) ? followingResponse.data.length : 0;
    const followerCount = Array.isArray(followersResponse.data) ? followersResponse.data.length : 0;
    
    return {
      following_count: followingCount,
      follower_count: followerCount
    };
  } catch (error) {
    
    throw error;
  }
};

export default {
  getFollowers,
  getUserFollowers,
  getUserFollowing,
  followAction,
  getFollowersCount,
};
