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

  /**
   * 搜索/引用反馈快捷上报（赞/踩）
   * 为了避免后端改动，这里复用 /wxapp/feedback/create，将语义化元数据序列化进 content
   */
  sendThumbFeedback: (payload: {
    scope: 'search_result' | 'rag_source' | 'rag_answer';
    action: 'up' | 'down';
    query?: string;
    title?: string;
    extra?: Record<string, any>;
  }) => {
    const content = `[search_feedback] ${JSON.stringify(payload)}`;
    const data: CreateFeedbackParams = {
      content,
      type: 'suggest',
      device_info: {
        platform: 'weapp',
      },
    } as any;
    return http.post<CreateFeedbackResponse>('/wxapp/feedback/create', data);
  }
};

export default feedbackApi; 