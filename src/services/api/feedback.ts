import http from '../request';
import { 
  Feedback, 
  CreateFeedbackParams, 
  CreateFeedbackResponse,
  GetFeedbackListParams,
  GetFeedbackListResponse 
} from '@/types/api/feedback.d';

const feedbackApi = {
  /**
   * 提交反馈
   */
   createFeedback: (data: CreateFeedbackParams) => {
     return http.post<CreateFeedbackResponse>('/wxapp/feedback/create', data);
   },

  /**
   * 获取反馈列表
   */
  getFeedbackList: (params: GetFeedbackListParams) => {
    // 新 OpenAPI: /api/wxapp/feedback/my/list
    return http.get<GetFeedbackListResponse>('/wxapp/feedback/my/list', params);
  },

  // 后端已不再提供 /feedback/detail 端点，如需详情请在列表中选取或后续补充
};

export default feedbackApi; 