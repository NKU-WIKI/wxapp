import { View, Text, Button, Image, Input } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { fetchUserProfile } from '@/store/slices/userSlice'
import { GetFollowersParams, FollowActionParams, FollowRelation } from '@/types/api/followers'
import { getFollowers, followAction } from '@/services/api/followers'
import styles from './index.module.scss'

type TabType = 'following' | 'followers';

const FollowersPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [activeTab, setActiveTab] = useState<TabType>('following')
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
        page_size: 20
      }
      
      console.log('[COMPONENT] 请求参数:', params);
      
      const response = await getFollowers(params)
      
      console.log('API Response:', response);
      
      // 修复：API返回code为0表示成功，不是200
      if ((response.code === 200 || response.code === 0) && response.data !== undefined) {
        // 处理API响应格式 - 根据后端文档，data直接是用户对象数组
        let newUsers: any[] = [];
        const responseData = response.data as any;
        
        if (Array.isArray(responseData)) {
          // 如果data直接是数组，为每个用户添加关注状态
          newUsers = responseData.map((user: any) => ({
            ...user,
            // 关注列表中的用户都是已关注状态，粉丝列表中需要根据实际情况判断（默认为未关注）
            relation: activeTab === 'following' ? 'following' : 'none'
          }));
        } else {
          console.warn('Unexpected API response format:', responseData);
          newUsers = [];
        }
        
        console.log('Processed users:', newUsers);
        
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
        console.error('API Error:', response);
        throw new Error((response as any).msg || (response as any).message || '获取用户列表失败')
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }

  // 处理关注/取消关注
  const handleFollowAction = useCallback(async (userId: number, relation: FollowRelation) => {
    try {
      const params: FollowActionParams = {
        target_user_id: userId,
        action: relation === 'none' ? 'follow' : 'unfollow'
      }
      
      const response = await followAction(params)
      
      // 修复：API返回code为0表示成功，不是200
      if (response.code === 200 || response.code === 0) {
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
        
        // 更新Redux store中的用户信息，确保主页的粉丝数量实时更新
        dispatch(fetchUserProfile())
        
        Taro.showToast({
          title: isActive ? '关注成功' : '取消关注成功',
          icon: 'success'
        })
      } else {
        throw new Error((response as any).msg || (response as any).message || '操作失败')
      }
    } catch (err) {
      console.error('Follow action failed:', err)
      Taro.showToast({
        title: err instanceof Error ? err.message : '操作失败',
        icon: 'error'
      })
    }
  }, [activeTab, dispatch])

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

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
          page_size: 20
        }
        
        console.log('[COMPONENT] 初始加载请求参数:', params);
        
        const response = await getFollowers(params)
        
        console.log('API Response:', response);
        
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
        console.error('Failed to fetch users:', err)
        setError(err instanceof Error ? err.message : '网络错误')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [activeTab]) // 只依赖activeTab，fetchUsers在组件内部定义

  return (
    <View className={styles.container}>
      {/* 固定头部 */}
      <View className={styles.header}>
        <Button className={styles.backButton} onClick={handleBack}>
          ←
        </Button>
        <Text className={styles.title}>我的好友</Text>
      </View>

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
              const buttonInfo = getFollowButtonInfo(user.relation || 'none')
              return (
                <View key={user.id || index} className={styles.userItem}>
                  <View className={styles.userInfo}>
                    <View className={styles.userAvatar}>
                      <Image src={user.avatar || ''} mode='aspectFill' />
                    </View>
                    <View className={styles.userDetails}>
                      <Text className={styles.userName}>{user.nickname || ''}</Text>
                      <Text className={styles.userBio}>
                        {user.bio || '这个人很懒，什么都没留下'}
                      </Text>
                    </View>
                  </View>
                  {/* 只在关注页面或粉丝页面中未关注的用户显示按钮 */}
                  {(activeTab === 'following' || user.relation === 'none') && (
                    <Button 
                      className={`${styles.followButton} ${buttonInfo.className}`}
                      onClick={() => handleFollowAction(user.id, user.relation || 'none')}
                    >
                      {buttonInfo.text}
                    </Button>
                  )}
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
