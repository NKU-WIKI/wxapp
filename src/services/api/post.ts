import http from '../request';
import { PaginatedData } from '@/types/api/common';
import { GetPostsParams, Post } from '@/types/api/post';

const postApi = {
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
    return http.get<PaginatedData<Post>>('/wxapp/post/list', finalParams);
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
  createPost: (data: Partial<Post>) => {
    return http.post<Post>('/wxapp/post/create', data);
  },
};

export default postApi; 