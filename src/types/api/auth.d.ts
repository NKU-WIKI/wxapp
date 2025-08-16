// src/types/api/auth.d.ts

interface WeappLoginRequest {
  code: string;
  tenant_id: string;
}

interface LocalLoginRequest {
  username: string;
  password: string;
  tenant_id: string;
}

/**
 * 统一登录请求体
 */
export interface LoginRequest {
  mode: 'local' | 'weapp';
  weapp?: WeappLoginRequest;
  local?: LocalLoginRequest;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * 注册请求体
 */
export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
  avatar?: string;
  bio?: string;
}
