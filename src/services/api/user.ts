import http from '../request';
import { LoginParams, LoginResponse, UserInfo } from '@/types/api/user';

export const userApi = {
  login: (params: LoginParams) => {
    return http.post<LoginResponse>('/wxapp/auth/login', params);
  },
  getProfile: () => {
    return http.get<UserInfo>('/wxapp/user/my/profile');
  }
}; 