import http from '../request';
import { Post, GetPostsParams, CreatePostParams, CreatePostResponse } from '@/types/api/post.d';
import { BaseResponse, BackendPaginatedResponse } from '@/types/api/common.d';

const postApi = {
  getPosts: (params: GetPostsParams) => {
    // 由于后端返回的是扁平分页结构，我们需要特殊处理
    return http.get('/wxapp/post/list', { params }) as Promise<BackendPaginatedResponse<Post>>;
  },
  createPost: (data: CreatePostParams) => {
    return http.post<CreatePostResponse>('/wxapp/post/create', data);
  },
  getPostById: (postId: number) => {
    return http.get<Post>('/wxapp/post/detail', { post_id: postId });
  },
  deletePost: (postId: number) => {
    return http.post<null>('/wxapp/post/delete', { id: postId });
  },
};

export default postApi; 