import http from '../request';
import { BaseResponse } from '@/types/api/common';
import {
  RagRequest,
  ChatCompletionsRequest,
  ChatCompletionsResponse,
  TextPolishRequest,
  TextPolishResponse,
  TextSummarizeRequest,
  TextSummarizeResponse,
} from '@/types/api/agent.d';

export const agentApi = {
  rag: (data: RagRequest): Promise<BaseResponse<any>> => {
    return http.post<any>('/agent/rag', data);
  },

  chatCompletions: (
    data: ChatCompletionsRequest
  ): Promise<BaseResponse<ChatCompletionsResponse>> => {
    return http.post<ChatCompletionsResponse>('/agent/chat/completions', data);
  },

  textPolish: (
    data: TextPolishRequest
  ): Promise<BaseResponse<TextPolishResponse>> => {
    return http.post<TextPolishResponse>('/agent/text/polish', data);
  },

  textSummarize: (
    data: TextSummarizeRequest
  ): Promise<BaseResponse<TextSummarizeResponse>> => {
    return http.post<TextSummarizeResponse>('/agent/text/summarize', data);
  },
};

export default agentApi;


