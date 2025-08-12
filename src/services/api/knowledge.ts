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
} from "@/types/api/knowledge";
import { BaseResponse } from "@/types/api/common";

export interface KnowledgeSearchParams {
  query: string;
  // openid 不再必填（与新 OpenAPI 对齐）
  openid?: string;
  platform?: string;
  page?: number;
  page_size?: number;
  max_content_length?: number;
}

const knowledgeApi = {
  /**
   * 使用Elasticsearch进行知识库搜索
   */
  search: (
    params: KnowledgeSearchParams
  ): Promise<BaseResponse<KnowledgeSearchResponse>> => {
    return http.get<KnowledgeSearchResponse>("/knowledge/search-general", params);
  },

  /**
   * 使用RAG管道进行高级搜索
   */
  searchByRag: (
    params: RagSearchRequest
  ): Promise<BaseResponse<KnowledgeSearchItem[]>> => {
    return http.get<KnowledgeSearchItem[]>("/knowledge/search-advanced", params);
  },

  /** 获取搜索建议 */
  getSuggestions: (
    query: string,
    page_size: number = 5
  ): Promise<BaseResponse<KnowledgeSuggestionResponse>> => {
    return http.get<KnowledgeSuggestionResponse>("/knowledge/suggestion", {
      query,
      page_size,
    });
  },

  /** 获取热门搜索 */
  getHotSearches: (
    page_size: number = 10,
    days: number = 7
  ): Promise<BaseResponse<HotSearchResponse>> => {
    return http.get<HotSearchResponse>("/knowledge/hot", { page_size, days });
  },

  /** 小程序综合搜索（posts + users） */
  searchWxapp: (
    params: {
      query: string;
      search_type?: "all" | "post" | "user";
      page?: number;
      page_size?: number;
      sort_by?: "time" | "relevance";
    }
  ): Promise<BaseResponse<WxappSearchResponse>> => {
    return http.get<WxappSearchResponse>("/knowledge/search-wxapp", params);
  },

  /** 获取当前用户搜索历史 */
  getSearchHistory: (
    page_size: number = 10
  ): Promise<BaseResponse<SearchHistoryResponse>> => {
    return http.get<SearchHistoryResponse>("/knowledge/history", { page_size });
  },

  /** 清空当前用户搜索历史 */
  clearSearchHistory: (): Promise<BaseResponse<{ message: string }>> => {
    return http.post("/knowledge/history/clear", {});
  },

  /** 获取网页快照 */
  getSnapshot: (url: string): Promise<BaseResponse<SnapshotResponse>> => {
    return http.get<SnapshotResponse>("/knowledge/snapshot", { url });
  },
};

export default knowledgeApi;
