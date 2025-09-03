import { View, Text, Button, Image, Input } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useDispatch } from 'react-redux'

import { AppDispatch } from '@/store'

// Type imports
import { GetFollowersParams, FollowActionParams, FollowRelation } from '@/types/api/followers'

// Store imports
import { fetchUserProfile } from '@/store/slices/userSlice'

// API imports
import { getFollowers, followAction } from '@/services/api/followers'

// Utils imports
import { BBSNotificationHelper } from '@/utils/notificationHelper'
import { normalizeImageUrl } from '@/utils/image'

// Component imports
import AuthorInfo from '@/components/author-info'

// Relative imports
import styles from './index.module.scss'

type TabType = 'following' | 'followers';

const FollowersPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  
  // 从URL参数获取目标用户ID和初始标签页
  const [targetUserId] = useState<string>(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    return options.userId || '';
  })
  
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    return (options.tab as TabType) || 'following';
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([]) // 存储所有用户数据用于搜索

  // 获取用户列表的核心函数（不使用useCallback避免循环依赖）
  const fetchUsers = async (isRefresh = false) => {
    if (loading && !isRefresh) return
    
    setLoading(true)
    setError(null)
    
    try {
      const params: GetFollowersParams = {
        type: activeTab,
        page: isRefresh ? 1 : currentPage,
        page_size: 20,
        target_user_id: targetUserId
      }
      
      const response = await getFollowers(params)
      
      // 根据OpenAPI文档，标准响应格式为 ApiResponse<User[]>
      if (response.code === 0 && response.data !== undefined) {
        // 处理API响应格式 - data是用户对象数组
        let newUsers: any[] = [];
        const responseData = response.data as any[];
        
        if (Array.isArray(responseData)) {
          // 为每个用户添加关注状态
          newUsers = responseData.map((user: any) => ({
            ...user,
            // 关注列表中的用户都是已关注状态，粉丝列表中需要根据实际情况判断（默认为未关注）
            relation: activeTab === 'following' ? 'following' : 'none'
          }));
        } else {
          
          newUsers = [];
        }
        
        if (isRefresh) {
          setUsers(newUsers)
          setAllUsers(newUsers) // 保存所有用户数据用于搜索
          setCurrentPage(2)
        } else {
          setUsers(prev => [...prev, ...newUsers])
          setAllUsers(prev => [...prev, ...newUsers]) // 也保存到allUsers
          setCurrentPage(prev => prev + 1)
        }
        
        setHasMore(newUsers.length >= 20)
      } else {
        
        throw new Error((response as any).msg || (response as any).message || '获取用户列表失败')
      }
    } catch (err) {
      
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }

  // 处理关注/取消关注
  const handleFollowAction = useCallback(async (userId: string, relation: FollowRelation) => {
    try {
      const params: FollowActionParams = {
        target_user_id: userId,
        action: relation === 'none' ? 'follow' : 'unfollow'
      }
      
      const response = await followAction(params)
      
      // 根据OpenAPI文档，标准响应格式为 ApiResponse
      if (response.code === 0) {
        const responseData = response.data as any;
        const isActive = responseData?.is_active;
        
        
        
        // 更新本地状态 - 不论在哪个tab都只更新关注状态，不删除用户
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, relation: isActive ? 'following' : 'none' as FollowRelation }
            : user
        ))
        setAllUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, relation: isActive ? 'following' : 'none' as FollowRelation }
            : user
        )) // 同时更新allUsers
        
        // 如果操作成功且状态变为激活（关注），创建通知
        if (isActive) {
          
          
          // 获取当前用户信息
          const currentUser = (window as any).g_app?.$app?.globalData?.userInfo || 
                             JSON.parse(Taro.getStorageSync('userInfo') || '{}');
          
          BBSNotificationHelper.handleFollowNotification({
            targetUserId: userId,
            currentUserId: currentUser?.id || '',
            currentUserNickname: currentUser?.nickname || currentUser?.name || '用户',
            isFollowing: isActive
          }).then(() => {
            
          }).catch((_error) => {
            
          });
        } else {
          
        }
        
        // 更新Redux store中的用户信息，确保主页的粉丝数量实时更新
        dispatch(fetchUserProfile())
      } else {
        throw new Error(response.message || '操作失败')
      }
    } catch (err) {
      
      Taro.showToast({
        title: err instanceof Error ? err.message : '操作失败',
        icon: 'error'
      })
    }
  }, [dispatch])



  // 切换标签页
  const handleTabSwitch = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab)
      setUsers([])
      setAllUsers([]) // 重置allUsers
      setCurrentPage(1)
      setHasMore(true)
      setError(null)
      setSearchKeyword('') // 重置搜索关键词
    }
  }

  // 搜索处理
  const handleSearch = () => {
    if (searchKeyword.trim() === '') {
      setUsers(allUsers)
    } else {
      const filteredUsers = allUsers.filter(user => 
        user.nickname && user.nickname.toLowerCase().includes(searchKeyword.toLowerCase())
      )
      setUsers(filteredUsers)
    }
  }

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('')
    setUsers(allUsers)
  }

  // 获取关注按钮文本和样式
  const getFollowButtonInfo = (relation: FollowRelation) => {
    switch (relation) {
      case 'following':
        return { text: '已关注', className: styles.following }
      default:
        return { text: '+关注', className: styles.followBack }
    }
  }

  // 页面初始化和依赖更新
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      setError(null)
      setUsers([])
      setAllUsers([]) // 重置allUsers
      setCurrentPage(1)
      setHasMore(true)
      setSearchKeyword('') // 重置搜索关键词
      
      try {
        const params: GetFollowersParams = {
          type: activeTab,
          page: 1,
          page_size: 20,
          target_user_id: targetUserId
        }
        
        const response = await getFollowers(params)
        
        // 修复：API返回code为0表示成功，不是200
        if ((response.code === 200 || response.code === 0) && response.data !== undefined) {
          let newUsers: any[] = [];
          const responseData = response.data as any;
          
          if (Array.isArray(responseData)) {
            newUsers = responseData.map((user: any) => ({
              ...user,
              relation: activeTab === 'following' ? 'following' : 'none'
            }));
          }
          
          setUsers(newUsers)
          setAllUsers(newUsers) // 保存所有用户数据
          setCurrentPage(2)
          setHasMore(newUsers.length >= 20)
        } else {
          throw new Error((response as any).msg || (response as any).message || '获取用户列表失败')
        }
      } catch (err) {
        
        setError(err instanceof Error ? err.message : '网络错误')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [activeTab, targetUserId]) // 只依赖activeTab，fetchUsers在组件内部定义

  return (
    <View className={styles.container}>

      {/* 标签页导航 */}
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

      {/* 固定搜索和统计区域 */}
      <View className={styles.fixedSearchArea}>
        {/* 搜索区域 */}
        <View className={styles.searchSection}>
          <View className={styles.searchBox}>
            <View className={styles.searchInputContainer}>
              <Text className={styles.searchIcon}>🔍</Text>
              <Input
                className={styles.searchInput}
                value={searchKeyword}
                onInput={(e) => setSearchKeyword(e.detail.value)}
                placeholder={`搜索${activeTab === 'following' ? '关注' : '粉丝'}`}
                confirmType='search'
                onConfirm={handleSearch}
              />
              {searchKeyword && (
                <Button className={styles.clearButton} onClick={handleClearSearch}>
                  ×
                </Button>
              )}
            </View>
            <Button className={styles.searchButton} onClick={handleSearch}>
              搜索
            </Button>
          </View>
        </View>

        {/* 统计信息 */}
        {!loading && !error && (
          <Text className={styles.countInfo}>
            共 {users.length} 位{activeTab === 'following' ? '关注' : '粉丝'}
          </Text>
        )}
      </View>

      {/* 主要内容区域 - 只包含可滚动的用户列表 */}
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
                  : '分享精彩内容，吸引更多粉丝'
                }
              </Text>
            </View>
          )
        ) : (
          <View className={styles.userList}>
            {users.map((user, index) => {
              return (
                <View key={user.id || index} className={styles.userItem}>
                  <AuthorInfo
                    userId={user.id}
                    mode='compact'
                    showBio={true}
                    showFollowButton={activeTab === 'following' || user.relation === 'none'}
                    showStats={false}
                    showLevel={true}
                  />
                </View>
              )
            })}
          </View>
        )}

        {/* 加载状态 */}
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
  )
}

export default FollowersPage
