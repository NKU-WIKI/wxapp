/**
 * 搜索相关类型定义
 */

/**
 * 搜索类型枚举
 */
export type SearchType = 'post' | 'user' | 'note' | 'web';

/**
 * 搜索模式枚举（用于UI展示）
 */
export type SearchMode = 'wiki' | 'user' | 'post' | 'note' | null;

/**
 * 排序字段枚举
 */
export type SortField = 'relevance' | 'time' | 'like_count' | 'view_count' | 'follower_count';

/**
 * 排序顺序枚举
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 搜索请求参数接口
 */
export interface SearchRequest {
  /** 搜索关键词 */
  q: string;
  /** 搜索类型：post 或 user */
  type?: SearchType;
  /** 返回结果数量 */
  size?: number;
  /** 结果偏移量（0-1000） */
  offset?: number;
  /** 排序字段 */
  sort_field?: SortField;
  /** 排序顺序 */
  sort_order?: SortOrder;
  /** 开始时间 */
  date_from?: any;
  /** 结束时间 */
  date_to?: any;
  /** 分类ID */
  category_id?: any;
  /** 标签列表 */
  tags?: any;
  /** 学校（用户搜索） */
  school?: any;
  /** 学院（用户搜索） */
  college?: any;
  /** 位置（用户搜索） */
  location?: any;
}

/**
 * 搜索结果项（通用类型，匹配实际API返回数据结构）
 */
export interface SearchResultItem {
  /** 结果ID */
  id?: string | null;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 作者 */
  author?: string;
  /** 平台 */
  platform?: string;
  /** 标签 */
  tag?: string | string[];
  /** 创建时间 */
  create_time?: string;
  /** 更新时间 */
  update_time?: string;
  /** 创建时间（实际API返回字段） */
  created_at?: string;
  /** 相关度 */
  relevance?: number;
  /** 搜索得分（实际API返回字段） */
  score?: number;
  /** 是否截断 */
  is_truncated?: boolean;
  /** 是否官方 */
  is_official?: boolean;
  /** 查看次数 */
  view_count?: number;
  /** 点赞次数 */
  like_count?: number;
  /** 评论次数 */
  comment_count?: number;
  /** 用户昵称（用户搜索时使用） */
  nickname?: string;
  /** 用户简介（用户搜索时使用） */
  bio?: string;
  /** 用户ID（实际API返回字段） */
  user_id?: string | null;
  /** 分类ID（实际API返回字段） */
  category_id?: string | null;
  /** 搜索类型（实际API返回字段） */
  _search_type?: string;
  /** 其他扩展字段 */
  [key: string]: any;
}

/**
 * 搜索结果响应接口
 */
export interface SearchBundleRead {
  /** 搜索结果列表 */
  items: SearchResultItem[];
  /** 热门搜索词 */
  hot_queries: string[];
  /** 搜索结果总数 */
  total: number;
  /** 搜索耗时（秒） */
  search_time: number;
}

/**
 * 热门搜索词响应接口
 */
export interface HotQueriesResponse {
  /** 热门搜索词列表 */
  data: string[];
}

/**
 * 搜索历史项接口
 */
export interface SearchHistoryItem {
  /** 历史记录ID */
  id: number;
  /** 搜索查询 */
  query: string;
  /** 搜索时间 */
  search_time: string;
}

/**
 * 搜索历史响应接口
 */
export interface SearchHistoryResponse {
  /** 搜索历史列表 */
  data: SearchHistoryItem[];
}

/**
 * 清空搜索历史响应接口
 */
export interface ClearHistoryResponse {
  /** 响应消息 */
  message: string;
}
