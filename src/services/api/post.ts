import http from '../request';
import { BaseResponse, PaginatedData } from '@/types/api/common';
import { Post, GetPostsParams, CreatePostParams, CreatePostResponse } from '@/types/api/post';

export const postApi = {
  /**
   * 获取帖子列表
   * @param params
   */
  getPosts: (params: GetPostsParams) => {
    // 将驼峰参数转换为下划线
    const finalParams = {
      page: params.page,
      page_size: params.pageSize,
      sort_by: params.tab === 'hot' ? 'popular' : 'latest',
    };
    // 注意：这里假设响应体直接是 PaginatedData<Post>，如果不是，需要根据实际情况调整
    return http.get<PaginatedData<Post>>('/wxapp/post/list', params);
  },

  /**
   * 获取帖子详情
   * @param postId
   */
  getPostDetail: (postId: number) => {
    return http.get<Post>('/wxapp/post/detail', { post_id: postId });
  },

  /**
   * 创建一个新帖子
   * @param data
   */
  createPost: (params: CreatePostParams) => {
    return http.post<CreatePostResponse>('/wxapp/post/create', params);
  },
};

export default postApi; 