import http from "../request";
import {
  Comment,
  CreateCommentRequest,
  CommentUpdate,
} from "@/types/api/comment.d";

/**
 * 创建新评论
 * @param data 包含评论内容、资源ID和资源类型等
 * @returns
 */
export const createComment = (data: CreateCommentRequest) => {
  return http.post<Comment>("/comments/", data);
};

/**
 * 更新评论
 * @param commentId 评论ID
 * @param data 要更新的内容
 * @returns
 */
export const updateComment = (commentId: number, data: CommentUpdate) => {
  return http.put<Comment>(`/comments/${commentId}`, data);
};

/**
 * 删除评论
 * @param commentId 评论ID
 * @returns
 */
export const deleteComment = (commentId: number) => {
  return http.delete<any>(`/comments/${commentId}`); // Assuming standard success response
}; 