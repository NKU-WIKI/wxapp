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
    return http.get<GetFeedbackListResponse>('/wxapp/feedback/list', params);
  },

  /**
   * 获取反馈详情
   */
  getFeedbackById: (feedbackId: number) => {
    return http.get<Feedback>('/wxapp/feedback/detail', { id: feedbackId });
  },
};

export default feedbackApi; 