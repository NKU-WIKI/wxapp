import http from '../request';
import { 
  CreateCommentParams, 
  CreateCommentResponse,
  CommentDetail,
  GetCommentsParams,
  GetRepliesParams,
  UpdateCommentParams,
  CommentStatusResponse
} from '@/types/api/comment.d';
import { BackendPaginatedResponse } from '@/types/api/common';

const commentApi = {
  // 创建评论
  createComment: (data: CreateCommentParams) => {
    return http.post<CreateCommentResponse>('/wxapp/comment/create', data);
  },

  // 获取评论列表 - 直接使用 URL 查询字符串而不是 params 对象
  getComments: (params: GetCommentsParams) => {
    // 构建查询字符串
    const queryParams = {
      resource_id: params.resource_id,
      resource_type: params.resource_type || 'post',
      page: params.page || 1,
      page_size: params.page_size || 10
    };
    
    // 将参数作为 data 传递给 GET 请求
    return http.get<BackendPaginatedResponse<CommentDetail>>('/wxapp/comment/list', queryParams);
  },

  // 获取评论详情
  getCommentDetail: (commentId: number) => {
    // 直接将参数作为 data 传递给 GET 请求
    return http.get<CommentDetail>('/wxapp/comment/detail', { comment_id: commentId });
  },

  // 获取评论回复
  getCommentReplies: (params: GetRepliesParams) => {
    // 构建查询参数
    const queryParams = {
      comment_id: params.comment_id,
      page: params.page || 1,
      page_size: params.page_size || 5
    };
    
    // 将参数作为 data 传递给 GET 请求
    return http.get<BackendPaginatedResponse<CommentDetail>>('/wxapp/comment/replies', queryParams);
  },

  // 更新评论
  updateComment: (data: UpdateCommentParams) => {
    return http.post('/wxapp/comment/update', data);
  },

  // 删除评论
  deleteComment: (commentId: number) => {
    return http.post('/wxapp/comment/delete', { id: commentId });
  },

  // 获取评论点赞状态
  getCommentStatus: (commentIds: number[]) => {
    // 直接将参数作为 data 传递给 GET 请求
    return http.get<CommentStatusResponse>('/wxapp/comment/status', { 
      comment_id: commentIds.join(',') 
    });
  },
};

export default commentApi; 