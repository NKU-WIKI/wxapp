import { PaginationParams } from "@/types/api/common";
import http from "../request";
import { FollowerList } from "@/types/api/user";

/**
 * 获取指定用户的粉丝列表
 * @param userId 用户ID
 * @param params 分页参数
 * @returns
 */
export const getFollowers = (
  userId: number,
  params: PaginationParams
) => {
  return http.get<FollowerList>(
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
export const getFollowing = (
  userId: number,
  params: PaginationParams
) => {
  return http.get<FollowerList>(
    `/users/${userId}/following`,
    params
  );
};
