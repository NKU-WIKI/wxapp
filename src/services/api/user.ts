import http from '../request';
import { LoginParams, LoginResponse, User } from '@/types/api/user';
import { PaginatedData } from '@/types/api/common';

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

  getUserProfile: (userId: number) => {
    return http.get<User>(`/wxapp/user/profile?user_id=${userId}`);
  },

  getFollowers: (userId: number, page: number = 1, pageSize: number = 10) => {
    return http.get<PaginatedData<User>>(`/wxapp/user/followers?user_id=${userId}&page=${page}&page_size=${pageSize}`);
  },

  getFollowing: (userId: number, page: number = 1, pageSize: number = 10) => {
    return http.get<PaginatedData<User>>(`/wxapp/user/following?user_id=${userId}&page=${page}&page_size=${pageSize}`);
  }
}; 