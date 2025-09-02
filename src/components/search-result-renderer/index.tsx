import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { SearchResultItem as ApiSearchResultItem } from '@/types/api/search';

// 图标导入
import marketIcon from '@/assets/market.png';
import userIcon from '@/assets/user.svg';
import bookOpenIcon from '@/assets/book-open.svg';
import messageCircleIcon from '@/assets/message-circle.svg';
import robotIcon from '@/assets/robot.svg';
import calendarIcon from '@/assets/calendar.svg';
import mapPinIcon from '@/assets/map-pin.svg';

import styles from './index.module.scss';

// 导出组件使用的类型（与API类型保持一致）
export type SearchResultItem = ApiSearchResultItem;

interface SearchResultRendererProps {
  result: SearchResultItem;
  onThumbUp?: (_result: SearchResultItem) => void;
  onThumbDown?: (_result: SearchResultItem) => void;
}

/**
 * 商品搜索结果组件
 */
const ListingResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  const getConditionText = (condition?: string) => {
    const conditionMap: Record<string, string> = {
      'new': '全新',
      'like_new': '九成新',
      'good': '良好',
      'acceptable': '可接受'
    };
    return conditionMap[condition || ''] || condition || '';
  };

  const getListingTypeText = (listingType?: string) => {
    const typeMap: Record<string, string> = {
      'buy': '求购',
      'sell': '出售',
      'service': '服务',
      'rent': '出租'
    };
    return typeMap[listingType || ''] || listingType || '';
  };

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src={marketIcon} className={styles.typeIcon} />
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
        <CardTitle className={styles.resultTitle}>
          {result.title || '无标题'}
        </CardTitle>

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
              <Text className={`${styles.detailValue} ${styles.priceText}`}>
                ¥{result.price}
              </Text>
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
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 用户搜索结果组件
 */
const UserResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  return (
    <Card className={styles.resultCard}>
      <CardContent className={styles.resultContent}>
        <View className={styles.userHeader}>
          <View className={styles.userAvatar}>
            <Image src={userIcon} className={styles.avatarIcon} />
          </View>
          <View className={styles.userInfo}>
            <CardTitle className={styles.resultTitle}>
              {result.nickname || result.title || '匿名用户'}
            </CardTitle>
            <Text className={styles.userId}>ID: {result.user_id || result.resource_id}</Text>
          </View>
        </View>

        {result.bio && (
          <CardDescription className={styles.resultDescription}>
            {result.bio}
          </CardDescription>
        )}

        <View className={styles.feedbackButtons}>
          <Text
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 笔记搜索结果组件
 */
const NoteResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src={bookOpenIcon} className={styles.typeIcon} />
          <Text className={styles.typeText}>笔记</Text>
        </View>
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>
          {result.title || '无标题'}
        </CardTitle>

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
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 帖子搜索结果组件
 */
const PostResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src={messageCircleIcon} className={styles.typeIcon} />
          <Text className={styles.typeText}>帖子</Text>
        </View>
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>
          {result.title || '无标题'}
        </CardTitle>

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
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 默认搜索结果组件（用于其他类型）
 */
const DefaultResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src={robotIcon} className={styles.typeIcon} />
          <Text className={styles.typeText}>{result.resource_type || '未知'}</Text>
        </View>
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>
          {result.title || '无标题'}
        </CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无内容'}
        </CardDescription>

        <View className={styles.feedbackButtons}>
          <Text
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 活动搜索结果组件
 */
const ActivityResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('zh-CN');
    } catch {
      return dateString;
    }
  };

  const getParticipantStatus = (current?: number, max?: number) => {
    if (!current || !max) return '';
    if (current >= max) return '已满员';
    return `${current}/${max}人`;
  };

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src={calendarIcon} className={styles.typeIcon} />
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
        <CardTitle className={styles.resultTitle}>
          {result.title || '无标题'}
        </CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无活动详情'}
        </CardDescription>

        <View className={styles.activityDetails}>
          {result.start_time && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>开始时间：</Text>
              <Text className={styles.detailValue}>
                {formatDateTime(result.start_time)}
              </Text>
            </View>
          )}

          {result.end_time && (
            <View className={styles.detailItem}>
              <Text className={styles.detailLabel}>结束时间：</Text>
              <Text className={styles.detailValue}>
                {formatDateTime(result.end_time)}
              </Text>
            </View>
          )}

          {result.location && (
            <View className={styles.detailItem}>
              <Image src={mapPinIcon} className={styles.detailIcon} />
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
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 跑腿搜索结果组件
 */
const ErrandResult: React.FC<{ result: SearchResultItem } & Pick<SearchResultRendererProps, 'onThumbUp' | 'onThumbDown'>> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  const getErrandStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待接单',
      'ACCEPTED': '已接单',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    };
    return statusMap[status || ''] || status || '';
  };

  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': styles.statusPending,
      'ACCEPTED': styles.statusAccepted,
      'COMPLETED': styles.statusCompleted,
      'CANCELLED': styles.statusCancelled
    };
    return colorMap[status || ''] || '';
  };

  return (
    <Card className={styles.resultCard}>
      <CardHeader className={styles.resultHeader}>
        <View className={styles.resultType}>
          <Image src={mapPinIcon} className={styles.typeIcon} />
          <Text className={styles.typeText}>跑腿</Text>
        </View>
        {result.errand_status && (
          <View className={`${styles.badge} ${getStatusColor(result.errand_status)}`}>
            <Text className={styles.badgeText}>
              {getErrandStatusText(result.errand_status)}
            </Text>
          </View>
        )}
      </CardHeader>

      <CardContent className={styles.resultContent}>
        <CardTitle className={styles.resultTitle}>
          {result.title || '无标题'}
        </CardTitle>

        <CardDescription className={styles.resultDescription}>
          {result.content || '暂无跑腿详情'}
        </CardDescription>

        <View className={styles.errandDetails}>
          {result.location && (
            <View className={styles.detailItem}>
              <Image src={mapPinIcon} className={styles.detailIcon} />
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
            className={styles.thumbUp}
            onClick={() => onThumbUp?.(result)}
          >
            👍 有用
          </Text>
          <Text
            className={styles.thumbDown}
            onClick={() => onThumbDown?.(result)}
          >
            👎 不相关
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

/**
 * 搜索结果渲染器
 * 根据 resource_type 渲染不同类型的搜索结果
 */
const SearchResultRenderer: React.FC<SearchResultRendererProps> = ({
  result,
  onThumbUp,
  onThumbDown
}) => {
  const renderResult = () => {
    switch (result.resource_type) {
      case 'listing':
        return (
          <ListingResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );

      case 'user':
        return (
          <UserResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );

      case 'note':
        return (
          <NoteResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );

      case 'post':
        return (
          <PostResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );

      case 'activity':
        return (
          <ActivityResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );

      case 'errand':
        return (
          <ErrandResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );

      default:
        return (
          <DefaultResult
            result={result}
            onThumbUp={onThumbUp}
            onThumbDown={onThumbDown}
          />
        );
    }
  };

  return (
    <View className={styles.resultWrapper}>
      {renderResult()}
    </View>
  );
};

export default SearchResultRenderer;
