export interface BaseResponse<T> {
  code: number;
  /**
   * 后端有的返回 msg，有的返回 message，这里做兼容
   */
  msg?: string;
  message?: string;
  data: T;
}

export interface Pagination {
  skip: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface PaginatedData<T> {
  data: T[]; // Changed from items to data
  pagination: Pagination;
}

/**
 * @description 通用分页请求参数
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// 更新：描述后端实际返回的分页响应结构
// 后端返回的结构是 { code, msg, data: T[], pagination }
export interface BackendPaginatedResponse<T> {
  code: number;
  msg?: string;
  message?: string;
  data: T[];
  pagination: Pagination;
}
