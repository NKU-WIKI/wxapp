import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import actionApi from '@/services/api/action';
import postApi from '@/services/api/post';
import { CollectionItem, GetCollectionParams } from '@/types/api/collection.d';
import styles from './index.module.scss';

type FilterType = 'all' | 'post' | 'material' | 'activity';

interface FilterOption {
  key: FilterType;
  label: string;
}

const filterOptions: FilterOption[] = [
  { key: 'all', label: '全部' },
  { key: 'post', label: '帖子' },
  { key: 'material', label: '资料' },
  { key: 'activity', label: '活动' }
];

export default function CollectionPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [postStats, setPostStats] = useState<Record<number, { view_count: number; comment_count: number; like_count: number }>>({});

  // 获取单个帖子的统计信息
  const fetchPostStats = useCallback(async (postId: number) => {
    try {
      const response = await postApi.getPostById(postId);
      if (response && response.data) {
        setPostStats(prev => ({
          ...prev,
          [postId]: {
            view_count: response.data.view_count || 0,
            comment_count: response.data.comment_count || 0,
            like_count: response.data.like_count || 0
          }
        }));
      }
    } catch (err) {
      console.error('获取帖子统计失败:', err);
    }
  }, []);

  // 获取收藏列表
  const fetchCollections = useCallback(async (params: GetCollectionParams = {}, isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page: params.page || 1,
        page_size: params.page_size || 10,
        search: params.search || searchKeyword || undefined
        // 不传递category参数，始终获取用户所有收藏
      };

      const response = await userApi.getUserFavorites(requestParams);
      
      if (response && response.data) {
        // 处理响应数据，response.data 可能直接是帖子数组
        let items: CollectionItem[] = [];
        
        if (Array.isArray(response.data)) {
          // 如果返回的是帖子数组，转换为收藏项格式
          items = response.data.map((post: any, index: number) => ({
            id: post.id || index,
            post: {
              id: post.id,
              user_id: post.user_id || 0,
              title: post.title || '',
              content: post.content || '',
              image_urls: post.image ? JSON.parse(post.image || '[]') : [],
              tag: post.tag || null,
              location: post.location || null,
              view_count: post.view_count || 0,
              like_count: post.like_count || 0,
              comment_count: post.comment_count || 0,
              favorite_count: post.favorite_count || 0,
              create_time: post.create_time || new Date().toISOString(),
              author_info: {
                id: post.author_id || 0,
                level: post.author_level || '',
                nickname: post.author_nickname || '匿名用户',
                avatar: post.author_avatar || '/assets/profile.png',
                gender: post.author_gender || 0,
                bio: post.author_bio || '',
                wechatId: post.author_wechat_id || '',
                qqId: post.author_qq_id || '',
                phone: post.author_phone || '',
                post_count: post.author_post_count || 0,
                follower_count: post.author_follower_count || 0,
                following_count: post.author_following_count || 0,
                create_time: post.author_created_at || new Date().toISOString(),
                role: post.author_role || ''
              },
              is_liked: post.is_liked || false,
              is_favorited: post.is_favorited || false,
              is_following_author: post.is_following_author || false
            },
            created_at: post.create_time || new Date().toISOString()
          }));
        } else if (response.data && typeof response.data === 'object' && (response.data as any).items) {
          // 如果返回的是带有items的对象
          items = (response.data as any).items;
        }
        
        if (isRefresh || requestParams.page === 1) {
          setCollections(items);
          // 获取所有帖子的最新统计信息
          items.forEach(item => {
            fetchPostStats(item.post.id);
          });
        } else {
          setCollections(prev => [...prev, ...items]);
          // 获取新加载帖子的统计信息
          items.forEach(item => {
            fetchPostStats(item.post.id);
          });
        }
      }
    } catch (err) {
      console.error('获取收藏列表失败:', err);
      setError('获取收藏列表失败，请重试');
      Taro.showToast({
        title: '获取收藏列表失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, fetchPostStats]);

  // 初始化数据
  useEffect(() => {
    fetchCollections({ page: 1 }, true);
  }, [fetchCollections]);

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value);
  }, []);

  // 处理搜索按钮点击或回车搜索
  const handleSearchClick = useCallback(() => {
    if (searchKeyword.trim()) {
      fetchCollections({ page: 1, search: searchKeyword.trim() }, true);
    } else {
      // 如果搜索词为空，显示所有收藏
      fetchCollections({ page: 1 }, true);
    }
  }, [fetchCollections, searchKeyword]);

  // 处理分类筛选
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    // 对于收藏页面，所有筛选都显示用户的收藏帖子，不传递category参数
    fetchCollections({ page: 1 }, true);
  }, [fetchCollections]);

  // 处理移除收藏
  const handleRemoveFromCollection = useCallback(async (postId: number) => {
    try {
      Taro.showModal({
        title: '确认取消收藏',
        content: '确定要取消收藏这个内容吗？',
        success: async (res) => {
          if (res.confirm) {
            await actionApi.toggleAction({ 
              target_type: 'post', 
              target_id: postId, 
              action_type: 'favorite' 
            });
            
            // 从列表中移除
            setCollections(prev => prev.filter(item => item.post.id !== postId));
            
            Taro.showToast({
              title: '已取消收藏',
              icon: 'success'
            });
          }
        }
      });
    } catch (err) {
      console.error('取消收藏失败:', err);
      Taro.showToast({
        title: '取消收藏失败',
        icon: 'none'
      });
    }
  }, []);

  // 处理帖子点击
  const handlePostClick = useCallback((postId: number) => {
    // 点击时获取该帖子的最新统计信息
    fetchPostStats(postId);
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/post-detail/index?id=${postId}`
    });
  }, [fetchPostStats]);

  // 返回上一页
  const handleBack = useCallback(() => {
    Taro.navigateBack();
  }, []);

  // 重试
  const handleRetry = useCallback(() => {
    fetchCollections({ page: 1 }, true);
  }, [fetchCollections]);

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // 根据当前筛选类型过滤收藏列表
  const filteredCollections = collections.filter(item => {
    if (activeFilter === 'all') {
      return true;
    }
    if (activeFilter === 'post') {
      return item.post.title || item.post.content; // 有标题或内容的视为帖子
    }
    if (activeFilter === 'material') {
      // 根据标签或其他特征判断是否为资料
      return item.post.tag && (
        typeof item.post.tag === 'string' 
          ? item.post.tag.includes('资料') || item.post.tag.includes('教程') || item.post.tag.includes('文档')
          : Array.isArray(item.post.tag) && item.post.tag.some(tag => 
              tag.includes('资料') || tag.includes('教程') || tag.includes('文档')
            )
      );
    }
    if (activeFilter === 'activity') {
      // 根据标签或其他特征判断是否为活动
      return item.post.tag && (
        typeof item.post.tag === 'string' 
          ? item.post.tag.includes('活动') || item.post.tag.includes('讲座') || item.post.tag.includes('会议')
          : Array.isArray(item.post.tag) && item.post.tag.some(tag => 
              tag.includes('活动') || tag.includes('讲座') || tag.includes('会议')
            )
      );
    }
    return true;
  });

  return (
    <View className={styles.container}>
      {/* 固定头部 */}
      <View className={styles.header}>
        <View className={styles.headerTitle}>
          <Button className={styles.backButton} onClick={handleBack}>
            <Text>←</Text>
          </Button>
          <Text className={styles.titleText}>我的收藏</Text>
        </View>
        
        {/* 搜索区域 */}
        <View className={styles.searchSection}>
          <View className={styles.searchBox}>
            <Input
              className={styles.searchInput}
              placeholder='搜索我的收藏'
              value={searchKeyword}
              onInput={(e) => handleSearch(e.detail.value)}
              onConfirm={handleSearchClick}
            />
            <Text className={styles.searchIcon}>🔍</Text>
            <Button className={styles.searchButton} onClick={handleSearchClick}>
              搜索
            </Button>
          </View>
        </View>

        {/* 筛选标签 */}
        <View className={styles.filterSection}>
          <View className={styles.filterTabs}>
            {filterOptions.map((option) => (
              <Button
                key={option.key}
                className={`${styles.filterTab} ${activeFilter === option.key ? styles.active : ''}`}
                onClick={() => handleFilterChange(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </View>
        </View>
      </View>

      {/* 主要内容 */}
      <View className={styles.main}>
        {error ? (
          <View className={styles.error}>
            <Text className={styles.errorIcon}>⚠️</Text>
            <Text className={styles.errorTitle}>加载失败</Text>
            <Text className={styles.errorDescription}>{error}</Text>
            <Button className={styles.retryButton} onClick={handleRetry}>
              重试
            </Button>
          </View>
        ) : filteredCollections.length === 0 && !loading ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyTitle}>暂无收藏内容</Text>
            <Text className={styles.emptyDescription}>
              {searchKeyword ? '没有找到相关的收藏内容' : '快去收藏一些有趣的内容吧'}
            </Text>
          </View>
        ) : (
          <View className={styles.collectionList}>
            {filteredCollections.map((item) => (
              <View key={item.id} className={styles.collectionItem}>
                {/* 作者信息 */}
                <View className={styles.authorInfo}>
                  <View className={styles.authorAvatar}>
                    <Image
                      src={item.post.author_info?.avatar || '/assets/profile.png'}
                      mode='aspectFill'
                    />
                  </View>
                  <Text className={styles.authorName}>
                    {item.post.author_info?.nickname || '匿名用户'}
                  </Text>
                </View>

                {/* 封面图片 */}
                {item.post.image_urls && item.post.image_urls.length > 0 && (
                  <View className={styles.coverImage} onClick={() => handlePostClick(item.post.id)}>
                    <Image
                      src={item.post.image_urls[0]}
                      mode='aspectFill'
                    />
                  </View>
                )}

                {/* 内容区域 */}
                <View className={styles.content} onClick={() => handlePostClick(item.post.id)}>
                  <Text className={styles.title}>{item.post.title}</Text>
                  <Text className={styles.description}>{item.post.content}</Text>
                  
                  {/* 操作栏 */}
                  <View className={styles.actionBar}>
                    <View className={styles.stats}>
                      <View className={styles.statItem}>
                        <Text className={styles.icon}>👁</Text>
                        <Text>{formatNumber(postStats[item.post.id]?.view_count ?? item.post.view_count)}</Text>
                      </View>
                      <View className={styles.statItem}>
                        <Text className={styles.icon}>💬</Text>
                        <Text>{formatNumber(postStats[item.post.id]?.comment_count ?? item.post.comment_count)}</Text>
                      </View>
                    </View>
                    
                    <View className={styles.actions}>
                      <Button
                        className={styles.removeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCollection(item.post.id);
                        }}
                      >
                        取消收藏
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {loading && (
          <View className={styles.loading}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>

      {/* 底部占位 */}
      <View className={styles.bottomSpacer} />
    </View>
  );
}
