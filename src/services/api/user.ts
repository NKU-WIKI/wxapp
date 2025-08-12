import http from '../request';
import { User } from '@/types/api/user';
import { BackendPaginatedResponse } from '@/types/api/common';

interface LoginParams {
  code: string;
}

interface LoginResponse {
  token: string;
  user_info: User;
}

// 用户统计数据接口
interface UserStats {
  post_count: number;
  follower_count: number;
  following_count: number;
  total_likes: number;
  total_favorites: number;
  points: number;
}

export const userApi = {
  login: (data: LoginParams) => {
    return http.post<LoginResponse>('/wxapp/auth/login', data);
  },
  
  getMyProfile: () => {
    return http.get<User>('/wxapp/user/my/profile');
  },
  
  updateUserProfile: (data: Partial<User>) => {
    return http.post<User>('/wxapp/user/update', data);
  },
  
  // 获取用户统计数据
  getUserStats: () => {
    console.log('[API] 获取用户统计数据请求');
    return http.get<UserStats>('/wxapp/user/my/stats')
      .then(response => {
        console.log('[API] 获取用户统计数据响应:', JSON.stringify(response));
        return response;
      })
      .catch(error => {
        console.error('[API] 获取用户统计数据失败:', error);
        throw error;
      });
  },
  
  getUserFavorites: (params: { page?: number; page_size?: number }) => {
    console.log('[API] 获取用户收藏列表请求:', params);
    return http.get('/wxapp/user/favorite', params)
      .then(response => {
        console.log('[API] 获取用户收藏列表响应:', JSON.stringify(response));
        return response;
      })
      .catch(error => {
        console.error('[API] 获取用户收藏列表失败:', error);
        throw error;
      });
  },
  
  getUserLikes: (params: { page?: number; page_size?: number }) => {
    console.log('[API] 获取用户点赞列表请求:', params);
    return http.get('/wxapp/user/like', params)
      .then(response => {
        console.log('[API] 获取用户点赞列表响应:', JSON.stringify(response));
        return response;
      })
      .catch(error => {
        console.error('[API] 获取用户点赞列表失败:', error);
        throw error;
      });
  },
  
  getUserComments: (params: { page?: number; page_size?: number }) => {
    console.log('[API] 获取用户评论列表请求:', params);
    return http.get('/wxapp/user/comment', params)
      .then(response => {
        console.log('[API] 获取用户评论列表响应:', JSON.stringify(response));
        return response;
      })
      .catch(error => {
        console.error('[API] 获取用户评论列表失败:', error);
        throw error;
      });
  }
}; 