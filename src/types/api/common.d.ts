/**
 * API 响应的基础结构
 */
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页数据结构
 */
export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
} 