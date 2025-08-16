import http from "../request";
import {
  KnowledgeSearchResponse,
  RagSearchRequest,
  KnowledgeSearchItem,
  KnowledgeSuggestionResponse,
  HotSearchResponse,
  WxappSearchResponse,
  SearchHistoryResponse,
  SnapshotResponse,
  KnowledgeSearchParams,
} from "@/types/api/knowledge";
import { ResponseMessage } from "@/types/api/common";

/**
 * 使用Elasticsearch进行知识库搜索
 */
export const search = (params: KnowledgeSearchParams) => {
  return http.get<KnowledgeSearchResponse>("/knowledge/search-general", params);
};

/**
 * 使用RAG管道进行高级搜索
 */
export const searchByRag = (params: RagSearchRequest) => {
  return http.get<KnowledgeSearchItem[]>("/knowledge/search-advanced", params);
};

/** 获取搜索建议 */
export const getSuggestions = (query: string, page_size: number = 5) => {
  return http.get<KnowledgeSuggestionResponse>("/knowledge/suggestion", {
    query,
    page_size,
  });
};

/** 获取热门搜索 */
export const getHotSearches = (page_size: number = 10, days: number = 7) => {
  return http.get<HotSearchResponse>("/knowledge/hot", { page_size, days });
};

/** 小程序综合搜索（posts + users） */
export const searchWxapp = (params: {
  query: string;
  search_type?: "all" | "post" | "user";
  page?: number;
  page_size?: number;
  sort_by?: "time" | "relevance";
}) => {
  return http.get<WxappSearchResponse>("/knowledge/search-wxapp", params);
};

/** 获取当前用户搜索历史 */
export const getSearchHistory = (page_size: number = 10) => {
  return http.get<SearchHistoryResponse>("/knowledge/history", { page_size });
};

/** 清空当前用户搜索历史 */
export const clearSearchHistory = () => {
  return http.post<ResponseMessage>("/knowledge/history/clear", {});
};

/** 获取网页快照 */
export const getSnapshot = (url: string) => {
  return http.get<SnapshotResponse>("/knowledge/snapshot", { url });
};

const knowledgeApi = {
  search,
  searchByRag,
  getSuggestions,
  getHotSearches,
  searchWxapp,
  getSearchHistory,
  clearSearchHistory,
  getSnapshot,
};

export default knowledgeApi;