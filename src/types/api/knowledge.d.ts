/**
 * RAG (Retrieval-Augmented Generation) 搜索的请求参数接口
 */
export interface RagSearchRequest {
  query: string;
  // openid 在新的 OpenAPI 中不是必填
  openid?: string;
  top_k_retrieve?: number;
  top_k_rerank?: number;
  retrieval_strategy?: 'auto' | 'hybrid' | 'vector_only' | 'bm25_only' | 'es_only';
  rerank_strategy?: 'no_rerank' | 'bge_reranker' | 'st_reranker' | 'personalized';
}

/**
 * RAG 搜索结果中单个条目的元数据
 */
export interface RagResultMetadata {
  title: string;
  author: string;
  platform: string;
  // 可以根据后端实际返回添加更多字段
}

/**
 * RAG 搜索返回的单个知识条目接口
 */
export interface KnowledgeSearchItem {
  id: string;
  text: string;
  metadata: RagResultMetadata;
  score: number;
}

/**
 * ES 通用搜索返回的单条结果项（/api/knowledge/search-general）
 */
export interface KnowledgeEsSearchItem {
  title: string;
  content: string;
  original_url?: string | null;
  author?: string | null;
  platform?: string | null;
  tag?: string | string[] | null;
  create_time?: string;
  update_time?: string;
  relevance?: number;
  is_truncated?: boolean;
  is_official?: boolean;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
}

export type KnowledgeSearchResponse = KnowledgeEsSearchItem[];

// 搜索建议
export type KnowledgeSuggestionResponse = string[];

// 热门搜索词
export interface HotSearchItem {
  search_query: string;
  search_count: number;
}
// 新接口 `/api/v1/search/hot-queries` 返回 string[]
export type HotSearchResponse = string[];

// 小程序综合搜索
export interface WxappSearchPosts {
  data: any[];
  pagination: {
    page: number;
    page_size: number;
    has_more: boolean;
    total?: number;
  };
}
export interface WxappSearchUsers {
  data: any[];
  pagination: {
    page: number;
    page_size: number;
    has_more: boolean;
    total?: number;
  };
}
export interface WxappSearchResponse {
  posts: WxappSearchPosts;
  users: WxappSearchUsers;
}

// 搜索历史
export interface SearchHistoryItem {
  id: number;
  query: string;
  search_time: string;
}
export type SearchHistoryResponse = SearchHistoryItem[];

// 网页快照
export interface SnapshotResponse {
  content: string;
  snapshot_time: string;
}
