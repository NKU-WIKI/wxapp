
import { PaginatedData } from '@/types/api/common'
import {
  Feedback,
  CreateFeedbackParams,
  GetFeedbackListParams,
  CreateFeedbackResponse,
} from '@/types/api/feedback.d'

import http from '../request'

// Relative imports

/**
 * 创建反馈
 * - 直接使用 type 字段，符合API文档要求
 */
export const createFeedback = (data: CreateFeedbackParams) => {
  const payload = {
    content: data.content,
    type: data.type,
    contact: data.contact,
    images: data.images, // 直接使用 images 字段
    device_info: data.device_info,
    version: data.version,
  }
  return http.post<CreateFeedbackResponse>('/feedback/', payload)
}

/**
 * 获取当前用户创建的反馈列表
 */
export const getMyFeedbacks = (params: GetFeedbackListParams) => {
  return http.get<PaginatedData<Feedback>>('/feedback/my/list', params)
}

// 兼容旧调用：getFeedbackList -> getMyFeedbacks
export const getFeedbackList = (params: GetFeedbackListParams) => getMyFeedbacks(params)

// 详情与删除（若后端暂未提供，可保留占位或后续根据文档调整）
export const getFeedback = (feedbackId: number) => {
  return http.get<Feedback>(`/feedback/${feedbackId}`)
}

export const deleteFeedback = (feedbackId: number) => {
  return http.delete<void>(`/feedback/${feedbackId}`)
}

const feedbackApi = {
  createFeedback,
  getMyFeedbacks,
  getFeedbackList,
  // 兼容旧调用：简单上报一个反馈记录
  sendThumbFeedback: (data: {
    scope: string
    action: 'up' | 'down'
    title?: string
    extra?: any
  }) =>
    createFeedback({
      content: `[thumb-${data.action}] ${data.title || ''}`.trim(),
      type: 'suggest',
    } as any),
}

export default feedbackApi
