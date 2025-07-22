import http from "../request";
import { KnowledgeSearchResponse } from "@/types/api/knowledge";
import { BaseResponse } from "@/types/api/common";

export interface KnowledgeSearchParams {
  query: string;
  openid: string; // 用户openid，必需参数
  platform?: string;
  page?: number;
  page_size?: number;
  max_content_length?: number;
}

const knowledgeApi = {
  /**
   * 使用Elasticsearch进行知识库搜索
   * @param params 搜索参数
   * @returns 搜索结果
   */
  search: (params: KnowledgeSearchParams): Promise<BaseResponse<KnowledgeSearchResponse>> => {
    return http.get<KnowledgeSearchResponse>("/knowledge/es-search", params);
  },
};

export default knowledgeApi;
