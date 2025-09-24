import {
  Comment,
  CreateCommentRequest,
  CommentUpdate,
  CommentRead,
} from "@/types/api/comment.d";
import { PaginationParams } from "@/types/api/common";
import http from "../request";

export const createComment = (data: CreateCommentRequest) => {
  return http.post<Comment>("/comments", data);
};

/**
 * 更新评论
 * @param commentId 评论ID
 * @param data 要更新的内容
 * @returns
 */
export const updateComment = (commentId: string, data: CommentUpdate) => {
  return http.put<Comment>(`/comments/${commentId}`, data);
};

/**
 * 删除评论
 * @param commentId 评论ID
 * @returns
 */
export const deleteComment = (commentId: string) => {
  return http.delete<unknown>(`/comments/${commentId}`);
};

/**
 * 获取评论列表
 * @param params 包含资源ID、资源类型、分页和排序等参数
 * @returns
 */
export const getComments = (params: {
  resource_id: string;
  resource_type: string;
  parent_id?: string;
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_desc?: boolean;
  max_depth?: number;
  limit_per_level?: number;
}) => {
  const { resource_id, resource_type, ...queryParams } = params;
  return http.get<Comment[]>(
    `/comments/resource/${resource_type}/${resource_id}/trees`,
    queryParams,
  );
};

/**
 * 获取当前用户的评论列表
 * @param params 分页参数
 * @returns
 */
export const getMyComments = (params?: PaginationParams) => {
  // 按 OpenAPI 使用 /comments/me；同时保留对可能出现的分页对象返回的兼容解析
  return http.get<
    CommentRead[] | { items: CommentRead[]; total?: number; has_more?: boolean }
  >("/comments/me", params);
};

const commentApi = {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getMyComments,
};

export default commentApi;
