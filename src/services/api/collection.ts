import { GetCollectionParams, RemoveFromCollectionParams, CollectionResponse } from "@/types/api/collection.d";
import http from "../request";

/**
 * 获取收藏列表
 * @param params
 * @returns
 */
export const getCollections = (params: GetCollectionParams) => {
  return http.get<CollectionResponse>("/users/me/collections", params);
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
