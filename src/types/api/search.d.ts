/**
 * 搜索相关类型定义
 */

/**
 * 搜索类型枚举
 */
export type SearchType = 'all' | 'post' | 'user' | 'note' | 'web' | 'listing' | 'errand' | 'activity';

/**
 * 搜索模式枚举（用于UI展示）
 */
export type SearchMode = 'wiki' | 'user' | 'post' | 'note' | null;

/**
 * 排序字段枚举
 */
export type SortField = 'relevance' | 'time' | 'price' | 'like_count' | 'view_count' | 'follower_count';

/**
 * 排序顺序枚举
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 搜索过滤器接口
 */
export interface SearchFilter {
  /** 开始时间 */
  date_from?: string;
  /** 结束时间 */
  date_to?: string;
  /** 分类ID */
  category_id?: string;
  /** 标签列表 */
  tags?: string[];
  /** 商品类型 (buy, sell, service, rent) */
  listing_type?: string;
  /** 商品成色 (new, like_new, etc.) */
  condition?: string;
  /** 最低价格 */
  price_min?: number;
  /** 最高价格 */
  price_max?: number;
  /** 跑腿订单状态 (PENDING, ACCEPTED, etc.) */
  errand_status?: string;
  /** 最低悬赏金额 */
  reward_min?: number;
  /** 最高悬赏金额 */
  reward_max?: number;
  /** 学校（用户搜索） */
  school?: string;
  /** 学院（用户搜索） */
  college?: string;
  /** 位置 */
  location?: string;
}

/**
 * 搜索请求参数接口
 */
export interface SearchRequest {
  /** 搜索关键词 */
  q: string;
  /** 搜索类型 */
  type?: SearchType;
  /** 返回结果数量 */
  size?: number;
  /** 结果偏移量 */
  offset?: number;
  /** 排序字段 */
  sort_field?: SortField;
  /** 排序顺序 */
  sort_order?: SortOrder;
  /** 搜索过滤器 */
  filters?: SearchFilter;
}

/**
 * 搜索结果项（通用类型，匹配实际API返回数据结构）
 */
export interface SearchResultItem {
  /** 结果ID */
  id?: string | null;
  /** 租户ID */
  tenant_id?: string;
  /** 资源类型 */
  resource_type?: string;
  /** 资源ID */
  resource_id?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 作者 */
  author?: string;
  /** 平台 */
  platform?: string;
  /** 标签 */
  tags?: string[];
  /** 可见性 */
  visibility?: string;
  /** 状态 */
  status?: string;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
  /** 相关度 */
  relevance?: number;
  /** 搜索得分 */
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
  /** 用户ID */
  user_id?: string;
  /** 分类 */
  category?: string;
  /** 价格 */
  price?: number | null;
  /** 位置 */
  location?: string;
  /** 商品类型 (buy, sell, service, rent) */
  listing_type?: string;
  /** 商品成色 (new, like_new, etc.) */
  condition?: string;
  /** 跑腿订单状态 (PENDING, ACCEPTED, etc.) */
  errand_status?: string;
  /** 悬赏金额 */
  reward_min?: number;
  /** 最高悬赏金额 */
  reward_max?: number;
  /** 活动开始时间 */
  start_time?: string;
  /** 活动结束时间 */
  end_time?: string;
  /** 活动参与人数 */
  participant_count?: number;
  /** 活动最大参与人数 */
  max_participants?: number;
  /** 头像URL */
  avatar?: string;
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
