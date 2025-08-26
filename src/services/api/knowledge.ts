import {
  KnowledgeSearchResponse,
  RagSearchRequest,
  KnowledgeSearchItem,
  KnowledgeSuggestionResponse,
  WxappSearchResponse,
  SearchHistoryResponse,
  SnapshotResponse,
} from "@/types/api/knowledge";
import http from "../request";

/**
 * 使用Elasticsearch进行知识库搜索
 * 注意：这个API不在官方文档中，可能需要后端支持
 */
export const search = (params: any) => {
  return http.get<KnowledgeSearchResponse>("/knowledge/search-general", params);
};

/**
 * 使用RAG管道进行高级搜索
 * 注意：这个API不在官方文档中，可能需要后端支持
 */
export const searchByRag = (params: RagSearchRequest) => {
  return http.get<KnowledgeSearchItem[]>(
    "/knowledge/search-advanced",
    params
  );
};

/** 
 * 获取搜索建议 
 * 注意：这个API不在官方文档中，可能需要后端支持
 */
export const getSuggestions = (query: string, page_size: number = 5) => {
  return http.get<KnowledgeSuggestionResponse>("/knowledge/suggestion", {
    query,
    page_size,
  });
};

/** 
 * 获取热门搜索 
 * 注意：这个API不在官方文档中，返回模拟数据
 */
export const getHotSearches = (page_size: number = 10, days: number = 7) => {
  console.log("getHotSearches called with:", { page_size, days });
  // 返回模拟数据，避免502错误
  return Promise.resolve({
    code: 0,
    message: "success",
    data: []
  });
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
/** 获取搜索历史 */
export const getSearchHistory = (page_size: number = 10) => {
  return http.get<SearchHistoryResponse>("/knowledge/history", { page_size });
};

/** 清空当前用户搜索历史 */
export const clearSearchHistory = () => {
  return http.post<any>("/knowledge/history/clear", {});
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