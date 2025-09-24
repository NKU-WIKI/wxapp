import { getRecommendPosts } from './post'

import { API } from '@/types/api/recommend'

// Relative imports

/**
 * 获取推荐内容（帖子、用户等）
 * @param params 推荐参数
 * @returns 推荐内容数据
 */
export const getRecommendations = async (params: API.RecommendParams) => {
  try {
    // 调用新的推荐帖子API
    const response = await getRecommendPosts(params)

    // 构造符合RecommendData结构的返回数据
    return {
      code: 0,
      message: 'success',
      data: {
        hot_posts: response.data || [],
        new_posts: [],
        recommended_posts: response.data || [],
        statistics: {
          total_hot_posts: response.data?.length || 0,
          total_new_posts: 0,
          total_recommended_posts: response.data?.length || 0,
          data_sources: ['forums'],
          time_range: `${params.days || 7}天`,
          hot_weight: params.hot_weight || 0.7,
          new_weight: params.new_weight || 0.3,
        },
      },
    }
  } catch (error) {
    // 发生错误时返回空数据
    return {
      code: 0,
      message: 'success',
      data: {
        hot_posts: [],
        new_posts: [],
        recommended_posts: [],
        statistics: {
          total_hot_posts: 0,
          total_new_posts: 0,
          total_recommended_posts: 0,
          data_sources: [],
          time_range: '',
          hot_weight: 0,
          new_weight: 0,
        },
      },
    }
  }
}

const recommendApi = {
  getRecommendations,
}

export default recommendApi
