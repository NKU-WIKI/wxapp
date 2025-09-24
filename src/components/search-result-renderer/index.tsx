import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card'
import { SearchResultItem as ApiSearchResultItem } from '@/types/api/search'
import AuthorInfo from '@/components/author-info'
import Post from '@/components/post'
import { Post as PostData } from '@/types/api/post.d'

// 图片资源使用字符串路径引用

import styles from './index.module.scss'

// 导出组件使用的类型（与API类型保持一致）
export type SearchResultItem = ApiSearchResultItem

interface SearchResultRendererProps {
  result: SearchResultItem
  onThumbUp?: (_result: SearchResultItem) => void
  onThumbDown?: (_result: SearchResultItem) => void
  feedbackState?: 'up' | 'down' | null
}

/**
 * 商品搜索结果组件
 */
const ListingResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  const getConditionText = (condition?: string) => {
    const conditionMap: Record<string, string> = {
      new: '全新',
      like_new: '九成新',
      good: '良好',
      acceptable: '可接受',
    }
    return conditionMap[condition || ''] || condition || ''
  }

  const getListingTypeText = (listingType?: string) => {
    const typeMap: Record<string, string> = {
      buy: '求购',
      sell: '出售',
      service: '服务',
      rent: '出租',
    }
    return typeMap[listingType || ''] || listingType || ''
  }

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src="/assets/market.png" className={styles.typeIcon} />
          <Text className={styles.typeText}>商品</Text>
        </View>
        <View className={styles.listingBadges}>
          {result.listing_type && (
            <View className={`${styles.badge} ${styles.listingTypeBadge}`}>
              <Text className={styles.badgeText}>{getListingTypeText(result.listing_type)}</Text>
            </View>
          )}
          {result.condition && (
            <View className={`${styles.badge} ${styles.conditionBadge}`}>
              <Text className={styles.badgeText}>{getConditionText(result.condition)}</Text>
            </View>
          )}
        </View>
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>{result.title || '无标题'}</CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无描述'}
        </CardDescription>

        <View className={styles.listingDetails}>
          {result.category && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>分类：</Text>
              <Text className={styles.detailValue}>{result.category}</Text>
            </View>
          )}

          {result.price !== null && result.price !== undefined && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>价格：</Text>
              <Text className={`${styles.detailValue} ${styles.priceText}`}>¥{result.price}</Text>
            </View>
          )}

          {result.location && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>位置：</Text>
              <Text className={styles.detailValue}>{result.location}</Text>
            </View>
          )}
        </View>

        <View className={styles.resultMeta}>
          <Text className={styles.metaText}>
            {result.created_at ? new Date(result.created_at).toLocaleDateString('zh-CN') : ''}
          </Text>
        </View>

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 用户搜索结果组件
 */
const UserResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  // 获取用户ID
  const userId = result.user_id || result.resource_id

  if (!userId) {
    return (
      <Card className={styles.resultCard}>
        <CardContent className={styles.resultContent}>
          <Text className={styles.errorText}>用户信息不完整</Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={styles.resultCard}>
      <CardContent className={styles.resultContent}>
        {/* 使用AuthorInfo组件渲染用户信息 */}
        <AuthorInfo
          userId={userId}
          mode="expanded"
          showBio
          showFollowButton
          showStats
          showLevel
          showLocation
          showTime={false}
        />

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 笔记搜索结果组件
 */
const NoteResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src="/assets/book-open.svg" className={styles.typeIcon} />
          <Text className={styles.typeText}>笔记</Text>
        </View>
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>{result.title || '无标题'}</CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无内容'}
        </CardDescription>

        {result.tags && result.tags.length > 0 && (
          <View className={styles.tagsContainer}>
            {result.tags.slice(0, 3).map((tag, index) => (
              <View key={index} className={styles.tag}>
                <Text className={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.resultMeta}>
          <Text className={styles.metaText}>
            {result.created_at ? new Date(result.created_at).toLocaleDateString('zh-CN') : ''}
          </Text>
        </View>

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 帖子搜索结果组件
 */
const PostResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  // 将SearchResultItem转换为Post组件期望的格式
  const convertToPostData = (searchResult: SearchResultItem): PostData => {
    return {
      id: searchResult.resource_id || searchResult.id || '',
      title: searchResult.title || '无标题',
      content: searchResult.content || '',
      status: 'published',
      user_id: searchResult.user_id || '',
      user: {
        id: searchResult.user_id || '',
        nickname: searchResult.nickname || '匿名用户',
        avatar: undefined, // 搜索结果中可能没有头像信息
        bio: searchResult.bio || '',
        status: 'active',
        tenant_id: searchResult.tenant_id || '',
        created_at: searchResult.created_at || new Date().toISOString(),
        updated_at: searchResult.created_at || new Date().toISOString(),
      },
      created_at: searchResult.created_at,
      view_count: 0,
      like_count: 0,
      favorite_count: 0,
      comment_count: 0,
      share_count: 0,
      images: [], // 搜索结果中可能没有图片信息
      tags: Array.isArray(searchResult.tags) ? searchResult.tags : [],
      is_public: true,
      allow_comments: true,
    }
  }

  const postData = convertToPostData(result)

  return (
    <View className={styles.postResultWrapper}>
      {/* 使用Post组件渲染帖子 */}
      <Post post={postData} mode="list" enableNavigation className={styles.searchPost} />

      {/* 添加反馈按钮 */}
      <View className={styles.feedbackButtons}>
        <Text
          className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
          onClick={() => onThumbUp?.(result)}
        >
          👍 有用
        </Text>
        <Text
          className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
          onClick={() => onThumbDown?.(result)}
        >
          👎 不相关
        </Text>
      </View>
    </View>
  )
}

/**
 * Web搜索结果组件
 */
const WebResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('zh-CN')
    } catch {
      return dateString
    }
  }

  const getPlatformText = (platform?: string) => {
    const platformMap: Record<string, string> = {
      wechat: '微信公众号',
      weibo: '微博',
      zhihu: '知乎',
      bilibili: '哔哩哔哩',
      douyin: '抖音',
      website: '网站',
    }
    return platformMap[platform || ''] || platform || '网页'
  }

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src="/assets/globe.svg" className={styles.typeIcon} />
          <Text className={styles.typeText}>网页</Text>
        </View>
        {result.platform && (
          <View className={`${styles.badge} ${styles.platformBadge}`}>
            <Text className={styles.badgeText}>{getPlatformText(result.platform)}</Text>
          </View>
        )}
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>{result.title || '无标题'}</CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无内容'}
        </CardDescription>

        <View className={styles.webDetails}>
          {result.author && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>作者：</Text>
              <Text className={styles.detailValue}>{result.author}</Text>
            </View>
          )}

          {result.publish_time && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>发布时间：</Text>
              <Text className={styles.detailValue}>{formatDate(result.publish_time)}</Text>
            </View>
          )}

          {result.url && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>来源：</Text>
              <Text className={`${styles.detailValue} ${styles.urlText}`}>
                {result.url.length > 50 ? `${result.url.substring(0, 50)}...` : result.url}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.resultMeta}>
          <Text className={styles.metaText}>
            {result.created_at ? new Date(result.created_at).toLocaleDateString('zh-CN') : ''}
          </Text>
        </View>

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 默认搜索结果组件（用于其他类型）
 */
const DefaultResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src="/assets/robot.svg" className={styles.typeIcon} />
          <Text className={styles.typeText}>{result.resource_type || '未知'}</Text>
        </View>
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>{result.title || '无标题'}</CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无内容'}
        </CardDescription>

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 活动搜索结果组件
 */
const ActivityResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleString('zh-CN')
    } catch {
      return dateString
    }
  }

  const getParticipantStatus = (current?: number, max?: number) => {
    if (!current || !max) return ''
    if (current >= max) return '已满员'
    return `${current}/${max}人`
  }

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src="/assets/calendar.svg" className={styles.typeIcon} />
          <Text className={styles.typeText}>活动</Text>
        </View>
        {result.participant_count && result.max_participants && (
          <View className={`${styles.badge} ${styles.participantBadge}`}>
            <Text className={styles.badgeText}>
              {getParticipantStatus(result.participant_count, result.max_participants)}
            </Text>
          </View>
        )}
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>{result.title || '无标题'}</CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无活动详情'}
        </CardDescription>

        <View className={styles.activityDetails}>
          {result.start_time && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>开始时间：</Text>
              <Text className={styles.detailValue}>{formatDateTime(result.start_time)}</Text>
            </View>
          )}

          {result.end_time && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>结束时间：</Text>
              <Text className={styles.detailValue}>{formatDateTime(result.end_time)}</Text>
            </View>
          )}

          {result.location && (
            <View className={styles.detailItem}>
              <Image src="/assets/map-pin.svg" className={styles.detailIcon} />
              <Text className={styles.detailValue}>{result.location}</Text>
            </View>
          )}
        </View>

        <View className={styles.resultMeta}>
          <Text className={styles.metaText}>
            {result.created_at ? new Date(result.created_at).toLocaleDateString('zh-CN') : ''}
          </Text>
        </View>

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 跑腿搜索结果组件
 */
const ErrandResult: React.FC<
  { result: SearchResultItem } & Pick<
    SearchResultRendererProps,
    'onThumbUp' | 'onThumbDown' | 'feedbackState'
  >
> = ({ result, onThumbUp, onThumbDown, feedbackState }) => {
  const getErrandStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '待接单',
      ACCEPTED: '已接单',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
    }
    return statusMap[status || ''] || status || ''
  }

  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      PENDING: styles.statusPending,
      ACCEPTED: styles.statusAccepted,
      COMPLETED: styles.statusCompleted,
      CANCELLED: styles.statusCancelled,
    }
    return colorMap[status || ''] || ''
  }

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src="/assets/map-pin.svg" className={styles.typeIcon} />
          <Text className={styles.typeText}>跑腿</Text>
        </View>
        {result.errand_status && (
          <View className={`${styles.badge} ${getStatusColor(result.errand_status)}`}>
            <Text className={styles.badgeText}>{getErrandStatusText(result.errand_status)}</Text>
          </View>
        )}
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>{result.title || '无标题'}</CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无跑腿详情'}
        </CardDescription>

        <View className={styles.errandDetails}>
          {result.location && (
            <View className={styles.detailItem}>
              <Image src="/assets/map-pin.svg" className={styles.detailIcon} />
              <Text className={styles.detailValue}>{result.location}</Text>
            </View>
          )}

          {(result.reward_min || result.reward_max) && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>悬赏：</Text>
              <Text className={`${styles.detailValue} ${styles.rewardText}`}>
                ¥{result.reward_min || 0}
                {result.reward_max && result.reward_max !== result.reward_min
                  ? ` - ¥${result.reward_max}`
                  : ''}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.resultMeta}>
          <Text className={styles.metaText}>
            {result.created_at ? new Date(result.created_at).toLocaleDateString('zh-CN') : ''}
          </Text>
        </View>

        <View className={styles.feedbackButtons}>
          <Text
            className={`${styles.thumbUp} ${feedbackState === 'up' ? styles.active : ''}`}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={`${styles.thumbDown} ${feedbackState === 'down' ? styles.active : ''}`}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  )
}

/**
 * 搜索结果渲染器
 * 根据 resource_type 渲染不同类型的搜索结果
 */
const SearchResultRenderer: React.FC<SearchResultRendererProps> = ({
  result,
  onThumbUp,
  onThumbDown,
  feedbackState,
}) => {
  const renderResult = () => {
    switch (result.resource_type) {
      case 'listing':
        return (
          <ListingResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      case 'user':
        return (
          <UserResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      case 'note':
        return (
          <NoteResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      case 'post':
        return (
          <PostResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      case 'web':
        return (
          <WebResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      case 'activity':
        return (
          <ActivityResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      case 'errand':
        return (
          <ErrandResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )

      default:
        return (
          <DefaultResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
            feedbackState={feedbackState}
          />
        )
    }
  }

  return <View className={styles.resultWrapper}>{renderResult()}</View>
}

export default SearchResultRenderer
