import {
  Comment,
  CreateCommentRequest,
  CommentUpdate,
} from "@/types/api/comment.d";
import http from "../request";

export const createComment = (data: CreateCommentRequest) => {
  return http.post<Comment>("/forums/comments", data);
};

export const updateComment = (commentId: number, data: CommentUpdate) => {
  return http.put<Comment>(`/forums/comments/${commentId}`, data);
};

export const deleteComment = (commentId: number) => {
  return http.delete<any>(`/forums/comments/${commentId}`);
};

export const getComments = (params: { resource_id: string; resource_type: string }) => {
  return http.get<Comment[]>("/forums/comments", params);
};

export const getMyComments = (params?: { skip?: number; limit?: number }) => {
  return http.get<Comment[]>("/forums/comments/me", params);
};

const commentApi = {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getMyComments,
};

export default commentApi;