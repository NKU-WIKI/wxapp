/**
 * 置顶帖子相关的API类型定义
 */

// 置顶帖子请求 - 根据真实API Schema定义
export interface PostPinRequest {
  post_id: string;
  is_global?: boolean; // 是否全局置顶，默认false为分类置顶
  // 可选的置顶时长与消耗，用于后端计费或验证（如果后端要求）
  duration_hours?: number;
  tokens?: number;
}

// 取消置顶请求（只需要路径参数post_id）
export interface PostUnpinRequest {
  post_id: string;
}

// API响应基础类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}
