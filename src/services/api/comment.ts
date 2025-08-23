import {
  Comment,
  CreateCommentRequest,
  CommentUpdate,
} from "@/types/api/comment.d";
import http from "../request";

export const createComment = (data: CreateCommentRequest) => {
  return http.post<Comment>("/comments/", data);
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
  return http.delete<any>(`/comments/${commentId}`);
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
}) => {
  return http.get<{ items: Comment[]; total: number; skip: number; limit: number }>("/comments/", params);
};

export const getMyComments = (params?: { skip?: number; limit?: number }) => {
  return http.get<Comment[]>("/comments/me", params);
};

const commentApi = {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getMyComments,
};

export default commentApi;