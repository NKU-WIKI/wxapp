import http from "../request";
import {
  Post,
  GetForumPostsParams,
  CreateForumPostRequest,
  GetFeedParams,
} from "@/types/api/post.d";
import { PaginatedData } from "@/types/api/common.d";

/**
 * 获取论坛帖子列表
 * @param params 包含分类ID和分页参数
 * @returns
 */
export const getForumPosts = (params: GetForumPostsParams) => {
  return http.get<PaginatedData<Post>>("/forums/posts", params);
};

/**
 * 创建论坛帖子
 * @param data 包含标题、内容和状态
 * @returns
 */
export const createForumPost = (data: CreateForumPostRequest) => {
  return http.post<Post>("/forums/posts", data);
};

/**
 * 更新帖子
 * @param postId 帖子ID
 * @param data 要更新的数据
 * @returns
 */
export const updatePost = (postId: number, data: any) => { // Using 'any' for PostUpdate type temporarily
  return http.put<Post>(`/forums/posts/${postId}`, data);
};

/**
 * 删除帖子
 * @param postId 帖子ID
 * @returns
 */
export const deletePost = (postId: number) => {
  return http.delete<any>(`/forums/posts/${postId}`); // Assuming standard success response
};

/**
 * 获取我的草稿箱列表
 * @returns
 */
export const getMyDrafts = () => {
  return http.get<Post[]>("/forums/me/drafts");
};

/**
 * 获取社区动态信息流
 * @param params 分页参数
 * @returns
 */
export const getFeed = (params: GetFeedParams) => {
  return http.get<PaginatedData<Post>>("/posts/feed", params);
};
