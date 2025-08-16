import http from "../request";
import {
  CollectionListRequest,
  ToggleCollectionRequest,
} from "@/types/api/collection.d";
import { Post } from "@/types/api/post.d";
import { PaginatedData } from "@/types/api/common";

/**
 * 获取收藏列表
 * @param params
 * @returns
 */
export const getCollections = (params: CollectionListRequest) => {
  return http.get<PaginatedData<Post>>("/collections", params);
};

/**
 * 切换收藏状态
 * @param params
 * @returns
 */
export const toggleCollection = (params: ToggleCollectionRequest) => {
  return http.post("/collections/toggle", params);
};
