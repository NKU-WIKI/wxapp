import http from '../request';
import { BaseResponse } from '@/types/api/common';
import { Post, GetPostsParams, CreatePostParams, CreatePostResponse } from '@/types/api/post';

export const postApi = {
  getPosts: (params: GetPostsParams) => {
    return http.get<Post[]>('/wxapp/post/list', params);
  },
  createPost: (params: CreatePostParams) => {
    return http.post<CreatePostResponse>('/wxapp/post/create', params);
  }
}; 