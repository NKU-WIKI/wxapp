export interface BaseResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

// 更新：描述后端实际返回的分页响应结构
// 后端返回的结构是 { code, msg, data: T[], pagination }
export interface BackendPaginatedResponse<T> {
  code: number;
  msg: string;
  data: T[];
  pagination: Pagination;
} 