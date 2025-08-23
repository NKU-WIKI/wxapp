import {
  Comment,
  CreateCommentRequest,
  CommentUpdate,
} from "@/types/api/comment.d";
import http from "../request";

/**
 * 创建新评论
 * @param data 包含评论内容、资源ID和资源类型等
 * @returns
 */
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
  return http.delete<any>(`/comments/${commentId}`);
};

/**
 * 获取评论列表
 * @param params 包含资源ID和资源类型的参数
 * @returns
 */
export const getComments = (params: { resource_id: string; resource_type: string }) => {
  return http.get<Comment[]>("/comments", params);
};

/**
 * 获取我的评论列表
 * @param params 分页参数
 * @returns
 */
export const getMyComments = (params?: { skip?: number; limit?: number }) => {
  return http.get<Comment[]>("/comments/me", params);
};

/**
 * 获取评论回复（前端需要但API文档中缺失的功能）
 * 注意：这个API可能需要后端添加支持
 */
export const getCommentReplies = (_params: any) => {
  // 由于API文档中没有获取评论回复的端点，暂时返回空数组
  return Promise.resolve({ code: 200, data: [] });
};

// 评论API对象
const commentApi = {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getMyComments,
  getCommentReplies,
};

export default commentApi;