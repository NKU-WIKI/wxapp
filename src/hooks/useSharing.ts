import { useShareAppMessage, useShareTimeline } from '@tarojs/taro'

/**
 * 分享功能的自定义 Hook
 * @param options 分享内容配置
 * @param options.title 分享标题
 * @param options.path 分享路径，必须以 / 开头
 * @param options.imageUrl 自定义分享图片 URL
 * @param options.query 分享到朋友圈时的自定义查询参数
 */
export const useSharing = (options: {
  title: string
  path: string
  imageUrl?: string
  query?: string
}) => {
  useShareAppMessage(() => {
    return {
      title: options.title,
      path: options.path,
      imageUrl: options.imageUrl
    }
  })

  useShareTimeline(() => {
    return {
      title: options.title,
      query: options.query || '',
      imageUrl: options.imageUrl
    }
  })
}
