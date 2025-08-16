import http from "../request";
import {
  LoginRequest,
  UnifiedLoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/api/auth";
import { User } from "@/types/api/user";

/**
 * 用户登录（支持传统登录和微信小程序登录）
 * @param data 包含用户名、密码和租户ID，或微信小程序登录信息
 * @returns 登录结果，包含访问令牌
 */
export const login = (data: LoginRequest | UnifiedLoginRequest) => {
  return http.post<LoginResponse>("/auth/login", data);
};

/**
 * 用户注册
 * @param data 包含用户名、密码和昵称等信息
 * @returns 注册成功的用户信息
 */
export const register = (data: RegisterRequest) => {
  return http.post<User>("/auth/register", data);
};
