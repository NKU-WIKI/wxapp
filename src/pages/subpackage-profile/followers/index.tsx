import { View, Text, Button } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '@/store';

// Type imports
import {
  GetFollowersParams,
  FollowActionParams,
  FollowRelation,
  FollowItem,
} from '@/types/api/followers';
import { User } from '@/types/api/user';

// Store imports
import { fetchUserProfile } from '@/store/slices/userSlice';

// API imports
import { getFollowers, followAction } from '@/services/api/followers';

// Utils imports
import { BBSNotificationHelper } from '@/utils/notificationHelper';

// Component imports
import AuthorInfo from '@/components/author-info';
import SearchBar from '@/components/search-bar';
import HighlightText from '@/components/highlight-text';

// Relative imports
import styles from './index.module.scss';

type TabType = 'following' | 'followers';

const FollowersPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 从URL参数获取目标用户ID和初始标签页
  const [targetUserId] = useState<string>(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    return options.userId || '';
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    return (options.tab as TabType) || 'following';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<FollowItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]); // 用于高亮的关键词列表
  const [allUsers, setAllUsers] = useState<FollowItem[]>([]); // 存储所有用户数据用于
  // 获取用户列表的核心函数（不使用useCallback避免循环依赖
  const fetchUsers = async (isRefresh = false) => {
    if (loading && !isRefresh) return;

    setLoading(true);
    setError(null);

    try {
      const params: GetFollowersParams = {
        type: activeTab,
        page: isRefresh ? 1 : currentPage,
        page_size: 20,
        target_user_id: targetUserId,
      };

      const response = await getFollowers(params);

      // 根据OpenAPI文档，标准响应格式为 ApiResponse<User[]>
      if (response.code === 0 && response.data !== undefined) {
        // 处理API响应格式 - data是用户对象数组
        const responseData = response.data as User[];

        if (Array.isArray(responseData)) {
          // 为每个用户添加关注状态
          const newUsers: FollowItem[] = responseData.map((user: User, index: number) => ({
            id: index + 1, // 使用索引作为临时ID，避免parseInt可能的问题
            user,
            // 关注列表中的用户都是已关注状态，粉丝列表中需要根据实际情况判断（默认为未关注）
            relation: activeTab === 'following' ? 'following' : 'none',
            followed_at: new Date().toISOString(), // 简化处理
          }));

          if (isRefresh) {
            setUsers(newUsers);
            setAllUsers(newUsers);
            setCurrentPage(2);
          } else {
            setUsers((prev) => [...prev, ...newUsers]);
            setAllUsers((prev) => [...prev, ...newUsers]);
            setCurrentPage((prev) => prev + 1);
          }

          setHasMore(newUsers.length >= 20);
        } else {
          if (isRefresh) {
            setUsers([]);
            setAllUsers([]);
            setCurrentPage(1);
          }
          setHasMore(false);
        }
      } else {
        throw new Error(
          (response as { msg?: string; message?: string }).msg ||
            (response as { msg?: string; message?: string }).message ||
            '获取用户列表失败',
        );
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 关注/取关操作
  const handleFollowToggle = useCallback(
    async (userId: User['id'], relation: FollowRelation) => {
      try {
        const params: FollowActionParams = {
          target_user_id: userId,
          action: relation === 'none' ? 'follow' : 'unfollow',
        };

        const response = await followAction(params);

        // 根据OpenAPI文档，标准响应格式为 ApiResponse
        if (response.code === 0) {
          const responseData = response.data as { is_active?: boolean };
          const isActive = responseData?.is_active;
          // 更新本地状?- 不论在哪个tab都只更新关注状态，不删除用?
          setUsers((prev) =>
            prev.map((user) =>
              user.user.id === userId
                ? { ...user, relation: isActive ? 'following' : ('none' as FollowRelation) }
                : user,
            ),
          );
          setAllUsers((prev) =>
            prev.map((user) =>
              user.user.id === userId
                ? { ...user, relation: isActive ? 'following' : ('none' as FollowRelation) }
                : user,
            ),
          ); // 同时更新allUsers

          // 如果操作成功且状态变为激活（关注），创建通知
          if (isActive) {
            // 获取当前用户信息
            const currentUser =
              (window as { g_app?: { $app?: { globalData?: { userInfo?: User } } } }).g_app?.$app
                ?.globalData?.userInfo || JSON.parse(Taro.getStorageSync('userInfo') || '{}');

            BBSNotificationHelper.handleFollowNotification({
              targetUserId: userId,
              currentUserId: currentUser?.id || '',
              currentUserNickname: currentUser?.nickname || currentUser?.name || '用户',
              isFollowing: isActive,
            })
              .then(() => {})
              .catch((_error) => {});
          } else {
            // 暂无其他处理逻辑
          }

          // 更新Redux store中的用户信息，确保主页的粉丝数量实时更新
          dispatch(fetchUserProfile(targetUserId));
        } else {
          throw new Error(response.message || '操作失败');
        }
      } catch (error: unknown) {
        Taro.showToast({
          title: error instanceof Error ? error.message : '操作失败',
          icon: 'error',
        });
      }
    },
    [dispatch, targetUserId],
  );

  // 切换标签
  const handleTabSwitch = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setUsers([]);
      setAllUsers([]); // 重置allUsers
      setCurrentPage(1);
      setHasMore(true);
      setError(null);
      setSearchKeyword(''); // 重置搜索关键字
    }
  };

  // 处理搜索输入
  const handleSearchInput = useCallback(
    (e: { detail: { value: string } }) => {
      const value = e.detail.value;
      setSearchKeyword(value);

      // 实时搜索
      if (value.trim() === '') {
        setUsers(allUsers);
        setSearchKeywords([]);
      } else {
        const filteredUsers = allUsers.filter(
          (user) =>
            user.user.nickname && user.user.nickname.toLowerCase().includes(value.toLowerCase()),
        );
        setUsers(filteredUsers);

        // 设置关键词用于高亮
        const keywords = value
          .trim()
          .split(/\s+/)
          .filter((k) => k.length > 0);
        setSearchKeywords(keywords);
      }
    },
    [allUsers],
  );

  // 处理搜索确认
  const handleSearchConfirm = useCallback(() => {
    if (!searchKeyword.trim()) return;

    // 这里可以添加更复杂的搜索逻辑
    const keywords = searchKeyword
      .trim()
      .split(/\s+/)
      .filter((k) => k.length > 0);
    setSearchKeywords(keywords);
  }, [searchKeyword]);

  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchKeyword('');
    setSearchKeywords([]);
    setUsers(allUsers);
  }, [allUsers]);

  // 页面初始化和依赖更新
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      setUsers([]);
      setAllUsers([]); // 重置allUsers
      setCurrentPage(1);
      setHasMore(true);
      setSearchKeyword(''); // 重置搜索关键字
      try {
        const params: GetFollowersParams = {
          type: activeTab,
          page: 1,
          page_size: 20,
          target_user_id: targetUserId,
        };

        const response = await getFollowers(params);

        // 修复：API返回code表示成功，不等于00
        if ((response.code === 200 || response.code === 0) && response.data !== undefined) {
          const responseData = response.data as User[];

          if (Array.isArray(responseData)) {
            const newUsers: FollowItem[] = responseData.map((user: User, index: number) => ({
              id: index + 1, // 临时ID，实际应该从API获取
              user,
              relation: activeTab === 'following' ? 'following' : 'none',
              followed_at: new Date().toISOString(),
            }));

            setUsers(newUsers);
            setAllUsers(newUsers); // 保存所有用户数据
            setCurrentPage(2);
            setHasMore(newUsers.length >= 20);
          } else {
            setUsers([]);
            setAllUsers([]);
            setCurrentPage(1);
            setHasMore(false);
          }
        } else {
          throw new Error(
            (response as { msg?: string; message?: string }).msg ||
              (response as { msg?: string; message?: string }).message ||
              '获取用户列表失败',
          );
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '网络错误');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [activeTab, targetUserId]); // 只依赖activeTab，fetchUsers在组件内部定义
  return (
    <View className={styles.container}>
      {/* 标签页导出*/}
      <View className={styles.tabsContainer}>
        <Button
          className={`${styles.tabButton} ${activeTab === 'following' ? styles.active : ''}`}
          onClick={() => handleTabSwitch('following')}
        >
          关注
        </Button>
        <Button
          className={`${styles.tabButton} ${activeTab === 'followers' ? styles.active : ''}`}
          onClick={() => handleTabSwitch('followers')}
        >
          粉丝
        </Button>
      </View>

      {/* 固定搜索和统计区*/}
      <View className={styles.fixedSearchArea}>
        {/* 搜索区域 */}
        <View className={styles.searchSection}>
          <SearchBar
            key={`followers-search-${activeTab}`}
            keyword={searchKeyword}
            placeholder={`搜索${activeTab === 'following' ? '关注' : '粉丝'}`}
            onInput={handleSearchInput}
            onSearch={handleSearchConfirm}
            onClear={handleClearSearch}
          />
        </View>

        {/* 统计信息 */}
        {!loading && !error && (
          <Text className={styles.countInfo}>
            {users.length} 位{activeTab === 'following' ? '关注' : '粉丝'}
          </Text>
        )}
      </View>

      {/* 主要内容区域 - 只包含可滚动的用户列表*/}
      <View className={styles.main}>
        {/* 用户列表 */}
        {error ? (
          <View className={styles.error}>
            <Text className={styles.errorIcon}>⚠️</Text>
            <Text className={styles.errorTitle}>加载失败</Text>
            <Text className={styles.errorDescription}>{error}</Text>
            <Button className={styles.retryButton} onClick={() => fetchUsers(true)}>
              重试
            </Button>
          </View>
        ) : users.length === 0 ? (
          !loading && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>👥</Text>
              <Text className={styles.emptyTitle}>
                暂无{activeTab === 'following' ? '关注' : '粉丝'}
              </Text>
              <Text className={styles.emptyDescription}>
                {activeTab === 'following'
                  ? '快去关注一些有趣的用户吧'
                  : '分享精彩内容，吸引更多粉丝'}
              </Text>
            </View>
          )
        ) : (
          <View className={styles.userList}>
            {users.map((user, index) => {
              return (
                <View key={user.user.id || index} className={styles.userItem}>
                  <AuthorInfo
                    userId={user.user.id}
                    mode='compact'
                    showBio
                    showFollowButton={activeTab === 'following' || user.relation === 'none'}
                    showStats={false}
                    showLevel
                    onFollowToggle={handleFollowToggle}
                    relation={user.relation}
                  />
                  {/* 搜索关键词高亮提示*/}
                  {searchKeywords.length > 0 && user.user.nickname && (
                    <View className={styles.searchHighlight}>
                      <Text className={styles.highlightText}>
                        匹配: <HighlightText text={user.user.nickname} keywords={searchKeywords} />
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* 加载状态*/}
        {loading && (
          <View className={styles.loading}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        )}

        {/* 加载更多 */}
        {!loading && !error && users.length > 0 && hasMore && (
          <Button className={styles.loadMoreButton} onClick={() => fetchUsers(false)}>
            加载更多
          </Button>
        )}
      </View>
    </View>
  );
};

export default FollowersPage;
