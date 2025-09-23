/**
 * 个性化内容推荐工具
 */

import { RootState } from '@/store/rootReducer';
import store from '@/store';

/**
 * 检查是否启用个性化推荐
 */
export const isPersonalizedRecommendationEnabled = (): boolean => {
  const state = store.getState() as RootState;
  return state.settings.personalizedRecommendation;
};

/**
 * 根据用户设置决定是否使用个性化算法
 * @param defaultContent 默认内容列表
 * @param personalizedContent 个性化推荐内容列表
 * @returns 根据设置返回对应的内容列表
 */
export const getRecommendedContent = <T>(
  defaultContent: T[],
  personalizedContent: T[]
): T[] => {
  if (isPersonalizedRecommendationEnabled()) {
    return personalizedContent;
  }
  return defaultContent;
};

/**
 * 个性化推荐的数据收集（用于分析用户兴趣）
 * 只有在用户开启个性化推荐时才收集数据
 */
export const collectUserInteraction = (
  _actionType: 'view' | 'like' | 'share' | 'comment',
  _contentId: string,
  _contentType: 'post' | 'user' | 'topic'
): void => {
  if (!isPersonalizedRecommendationEnabled()) {
    return; // 用户关闭了个性化推荐，不收集数据
  }

  // 这里可以实现具体的数据收集逻辑
  // 例如发送到后端分析服务
  try {
    // 模拟数据收集 - 实际使用中会发送到分析服务
    // 数据包含：actionType, contentId, contentType, timestamp, userId
    
    // 可以存储到本地或发送到服务器
    // 生产环境中应该发送到分析服务
    
    // TODO: 实际实现时可以调用后端API
    // await api.post('/analytics/user-interaction', _interactionData);
  } catch (error) {
    // 静默处理错误，不影响用户体验
  }
};

/**
 * 获取用户兴趣标签（基于历史行为）
 * 只有开启个性化推荐时才返回标签
 */
export const getUserInterestTags = (): string[] => {
  if (!isPersonalizedRecommendationEnabled()) {
    return []; // 不使用个性化推荐时返回空数组
  }

  // 这里应该从后端获取用户的兴趣标签
  // 现在返回模拟数据
  return ['技术', '生活', '学习', '娱乐'];
};
