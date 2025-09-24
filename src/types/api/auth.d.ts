// src/types/api/auth.d.ts

/**
 * 登录请求体 - 根据API文档
 */
export interface LoginRequest {
  username: string
  password: string
  tenant_id: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  access_token: string
  token_type: string
}

/**
 * 注册请求体 - 根据API文档
 */
export interface RegisterRequest {
  nickname: string
  avatar?: string
  bio?: string
  birthday?: string // "2019-08-24" format
  school?: string
  college?: string
  location?: string
  wechat_id?: string
  qq_id?: string
  tel?: string
  username: string
  password: string
}

// 保留原有的微信小程序登录相关类型（可能未来会用到）
interface WeappLoginRequest {
  code: string
  tenant_id: string
}

interface LocalLoginRequest {
  username: string
  password: string
  tenant_id: string
}

/**
 * 统一登录请求体（扩展版本）
 */
export interface UnifiedLoginRequest {
  mode: 'local' | 'weapp'
  weapp?: WeappLoginRequest
  local?: LocalLoginRequest
}
