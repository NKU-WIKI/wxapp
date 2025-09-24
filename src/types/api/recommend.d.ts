import { Post } from './post'

export namespace API {
  /**
   * @description 获取推荐内容的请求参数
   */
  export interface RecommendParams {
    enable_ai_recommendation?: boolean
    user_id?: string | null
    limit?: number
    hot_weight?: number
    new_weight?: number
    days?: number
  }

  /**
   * @description 推荐内容的数据结构
   */
  export interface RecommendData {
    hot_posts: Post[]
    new_posts: Post[]
    recommended_posts: Post[]
    statistics: {
      total_hot_posts: number
      total_new_posts: number
      total_recommended_posts: number
      data_sources: string[]
      time_range: string
      hot_weight: number
      new_weight: number
    }
  }
}

// 导出类型别名，方便在其他文件中使用
export type recommendParams = API.RecommendParams
