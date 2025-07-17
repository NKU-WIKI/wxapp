export interface LoginParams {
  code: string;
}

export interface UserInfo {
  id: number;
  nickname: string;
  avatar: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  language: string;
  role: string;
  create_time: string;
  last_login_time: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user_info: UserInfo;
} 