import { GetCollectionParams, RemoveFromCollectionParams, CollectionResponse } from "@/types/api/collection.d";
import { getMyFavorites } from "@/services/api/user";
import http from "../request";

/**
 * 获取收藏列表
 * @param params
 * @returns
 */
export const getCollections = (params: GetCollectionParams) => {
  return http.get<CollectionResponse>("/users/me/favorites", params);
};

/**
 * 切换收藏状态
 * @param params
 * @returns
 */
export const toggleCollection = (params: { post_id: number }) => {
  return http.post("/actions/toggle", {
    target_id: params.post_id,
    target_type: "post",
    action_type: "favorite"
  });
};

/**
 * 从收藏中移除
 * @param params
 * @returns
 */
export const removeFromCollection = (params: RemoveFromCollectionParams) => {
  return http.post("/actions/collection/remove", params);
};

/**
 * 获取用户收藏的帖子数量
 * @returns 收藏的帖子数量
 */
export const getCollectionCount = async () => {
  try {
    // 使用正确的API获取收藏列表
    const response = await getMyFavorites({ skip: 0, limit: 100 });
    
    if (response.code === 0 && response.data) {
      // 过滤出收藏动作（action_type为'favorite'）
      const favoriteActions = response.data.filter((action: any) => 
        action.action_type === 'favorite'
      );
      return favoriteActions.length;
    }
    
    return 0;
  } catch (error) {
    console.error('获取收藏数量失败:', error);
    throw error;
  }
};
