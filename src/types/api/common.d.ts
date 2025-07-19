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

// 新增：描述后端实际返回的分页响应结构
export interface BackendPaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: Pagination;
} 