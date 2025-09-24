import Taro from '@tarojs/taro'

import request from '../request'

import type { BaseResponse } from '@/types/api/common.d'
import type { PostPinRequest } from '@/types/api/pin.d'
import type { Post as PostData } from '@/types/api/post.d'

/**
 * 置顶帖子
 * @param postId 帖子ID
 * @param isGlobal 是否全局置顶，默认false为分类置顶
 */
export const pinPost = async (
  postId: string,
  isGlobal: boolean = false,
  opts?: { duration_hours?: number; tokens?: number }
): Promise<BaseResponse<any>> => {
  // 构造请求体，保留兼容性
  const data: PostPinRequest = {
    post_id: postId,
    is_global: isGlobal,
    ...(opts?.duration_hours ? { duration_hours: opts.duration_hours } : {}),
    ...(opts?.tokens ? { tokens: opts.tokens } : {}),
  }

  // 前端调试信息（保持 confirmText 短以避免小程序限制）
  await Taro.showModal({
    title: '调试信息',
    content: `帖子ID: ${postId}\n请求体: ${JSON.stringify(data)}`,
    showCancel: false,
    confirmText: '确定',
  })

  return request.post<any>(`/forums/posts/${postId}/pin`, data)
}

/**
 * 取消置顶帖子
 * @param postId 帖子ID
 */
export const unpinPost = async (postId: string): Promise<BaseResponse<any>> => {
  return request.post<any>(`/forums/posts/${postId}/unpin`)
}

/**
 * 获取置顶帖子列表
 */
export const getPinnedPosts = async (): Promise<BaseResponse<PostData[]>> => {
  return request.get<PostData[]>('/forums/pinned-posts')
}
