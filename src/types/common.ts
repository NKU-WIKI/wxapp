/**
 * 通用事件类型定义
 */
export interface BaseEvent {
  type: string;
  target?: unknown;
  currentTarget?: unknown;
}

/**
 * 表单事件类型
 */
export interface FormEvent<T = unknown> extends BaseEvent {
  detail: {
    value: T;
  };
}

/**
 * 点击事件类型
 */
export interface ClickEvent extends BaseEvent {
  detail?: unknown;
  stopPropagation?: () => void;
}

/**
 * 输入事件类型
 */
export interface InputEvent extends BaseEvent {
  detail: {
    value: string;
    cursor?: number;
  };
}

/**
 * 通用回调函数类型
 */
export type CallbackFunction<T = void> = (data?: T) => void;

/**
 * 异步回调函数类型
 */
export type AsyncCallbackFunction<T = void> = (data?: T) => Promise<void>;

/**
 * API 响应数据类型
 */
export interface ApiResponseData {
  [key: string]: unknown;
}

/**
 * 组件基础 Props 类型
 */
export interface BaseComponentProps {
  className?: string;
  style?: Record<string, string | number>;
  children?: React.ReactNode;
}

/**
 * 表单字段基础类型
 */
export type FormFieldValue = string | number | boolean | null | undefined;

/**
 * 选择器选项类型
 */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * 图片资源类型
 */
export interface ImageResource {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * 分页参数类型
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  skip?: number;
  limit?: number;
}

/**
 * 排序参数类型
 */
export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 搜索参数类型
 */
export interface SearchQuery {
  keyword?: string;
  filters?: Record<string, unknown>;
}

/**
 * 通用列表查询参数
 */
export interface ListQuery extends PaginationQuery, SortQuery, SearchQuery {}

/**
 * 错误信息类型
 */
export interface ErrorInfo {
  code: string | number;
  message: string;
  details?: unknown;
}

/**
 * 加载状态类型
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 通用状态类型
 */
export interface BaseState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: ErrorInfo | null;
}

/**
 * 文件上传结果类型
 */
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
