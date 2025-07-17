/**
 * 分页信息
 */
export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
}

/**
 * 标准 API 响应结构
 */
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
  details?: any;
  timestamp?: string;
  pagination?: Pagination;
}

/**
 * 分页数据通用结构
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
} 