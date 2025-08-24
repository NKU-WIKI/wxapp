import {
  RagRequest,
  ChatCompletionsRequest,
  ChatCompletionsResponse,
  TextPolishRequest,
  TextPolishResponse,
  TextSummarizeRequest,
  TextSummarizeResponse,
  RagSourcesRequest,
  RAGResponse,
  DocSource,
} from "@/types/api/agent.d";
import { TENANT_ID } from "@/constants";
import http from "../request";

export const rag = (data: RagRequest) => {
  return http.get<RAGResponse>("/agent/rag-answer", { ...data, tenant_id: TENANT_ID });
};

export const ragSources = (data: RagSourcesRequest) => {
  return http.get<any>("/agent/rag-sources", { ...data, tenant_id: TENANT_ID });
};

// 根据API文档，应该使用 /api/v1/agent/chat
export const chatCompletions = (data: ChatCompletionsRequest) => {
  return http.post<ChatCompletionsResponse>(
    "/agent/chat",
    data
  );
};

// 根据API文档，文本摘要使用 /api/v1/agent/summarize
export const textSummarize = (data: TextSummarizeRequest) => {
  return http.post<TextSummarizeResponse>("/agent/summarize", data);
};

// textPolish API不在文档中，保留但添加注释
export const textPolish = (data: TextPolishRequest) => {
  // 注意：这个API不在官方文档中，可能需要后端支持
  return http.post<TextPolishResponse>("/agent/text/polish", data);
};

// ragSearch API不在文档中，暂时返回空数组
export const ragSearch = (_params: any) => {
  // 注意：这个API不在官方文档中
  return Promise.resolve({ code: 200, data: [] });
};

const agentApi = {
  rag,
  ragSources,
  chatCompletions,
  textSummarize,
  textPolish,
  ragSearch,
};

export default agentApi;


