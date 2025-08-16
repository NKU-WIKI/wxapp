import http from "../request";
import {
  RagRequest,
  ChatCompletionsRequest,
  ChatCompletionsResponse,
  TextPolishRequest,
  TextPolishResponse,
  TextSummarizeRequest,
  TextSummarizeResponse,
  RagSearchRequest,
  KnowledgeSearchItem,
} from "@/types/api/agent.d";

export const rag = (data: RagRequest) => {
  return http.get<any>("/agent/rag-answer", data);
};

export const chatCompletions = (data: ChatCompletionsRequest) => {
  return http.post<ChatCompletionsResponse>(
    "/agent/chat/completions",
    data
  );
};

export const textPolish = (data: TextPolishRequest) => {
  return http.post<TextPolishResponse>("/agent/text/polish", data);
};

export const textSummarize = (data: TextSummarizeRequest) => {
  return http.post<TextSummarizeResponse>("/agent/text/summarize", data);
};

export const ragSearch = (params: RagSearchRequest) => {
  return http.get<KnowledgeSearchItem[]>("/agent/rag-search", params);
};

const agentApi = {
  chatCompletions,
  rag,
  ragSearch,
};

export default agentApi;


