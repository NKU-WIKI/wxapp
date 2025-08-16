import {
  Post,
  GetForumPostsParams,
  CreateForumPostRequest,
  GetFeedParams,
} from "@/types/api/post.d";
import http from "../request";

/**
 * 获取论坛帖子列表
 * @param params 包含分类ID和分页参数
 * @returns
 */
export const getForumPosts = (params: GetForumPostsParams) => {
  return http.get<Post[]>("/forums/posts", params);
};

/**
 * 获取帖子列表（别名函数，为了兼容现有代码）
 * @param params 包含分页参数
 * @returns
 */
export const getPosts = (params: any) => {
  return http.get<Post[]>("/forums/posts", params);
};

/**
 * 根据ID获取单个帖子详情
 */
export const getPostById = (postId: number) => {
  return http.get<Post>(`/forums/posts/${postId}`);
};

/**
 * 获取帖子详情（别名）
 */
export const getPostDetail = (postId: number) => {
  return getPostById(postId);
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
  // 使用相同的forums/posts端点获取信息流
  return http.get<Post[]>("/forums/posts", params);
};

// 默认导出对象，包含所有API函数
const postApi = {
  getForumPosts,
  getPosts,
  getPostById,
  createForumPost,
  updatePost,
  deletePost,
  getMyDrafts,
  getFeed,
};

export default postApi;
