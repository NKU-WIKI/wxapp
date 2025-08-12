import http from '../request';
import { BaseResponse } from '@/types/api/common';
import { RagRequest } from '@/types/api/agent.d';

export const agentApi = {
  rag: (data: RagRequest): Promise<BaseResponse<any>> => {
    return http.post<any>('/agent/rag', data);
  },
};

export default agentApi;


