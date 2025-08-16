import http from "../request";
import {
  Feedback,
  CreateFeedbackRequest,
  FeedbackListRequest,
} from "@/types/api/feedback.d";
import { PaginatedData, ResponseMessage } from "@/types/api/common";

/**
 * 创建反馈
 * @param data
 * @returns
 */
export const createFeedback = (data: CreateFeedbackRequest) => {
  return http.post<Feedback>("/feedbacks", data);
};

/**
 * 获取当前用户创建的反馈列表
 * @param params
 * @returns
 */
export const getMyFeedbacks = (params: FeedbackListRequest) => {
  return http.get<PaginatedData<Feedback>>("/feedbacks/my", params);
};

/**
 * 获取指定ID的反馈详情
 * @param feedbackId
 * @returns
 */
export const getFeedback = (feedbackId: number) => {
  return http.get<Feedback>(`/feedbacks/${feedbackId}`);
};

/**
 * 删除指定ID的反馈
 * @param feedbackId
 * @returns
 */
export const deleteFeedback = (feedbackId: number) => {
  return http.delete<ResponseMessage>(`/feedbacks/${feedbackId}`);
};

const feedbackApi = {
  createFeedback,
  getMyFeedbacks,
  // 兼容旧调用：简单上报一个反馈记录
  sendThumbFeedback: (data: { scope: string; action: 'up' | 'down'; title?: string; extra?: any }) =>
    createFeedback({
      content: `[thumb-${data.action}] ${data.title || ''}`.trim(),
      type: 'suggest',
    } as any),
};

export default feedbackApi; 