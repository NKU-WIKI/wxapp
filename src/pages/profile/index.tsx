import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserProfile, fetchUserLevel, fetchUserStats, fetchFollowersCount, fetchCollectionCount, logout, resetUserStats, resetUserLevel, resetFollowersCount, resetCollectionCount } from '@/store/slices/userSlice';
import { fetchUserPostCount, fetchUserLikeCount, resetUserPostCount, resetUserLikeCount } from '@/store/slices/userPostsSlice';
import { fetchCampusVerificationInfo } from '@/store/slices/campusVerificationSlice';
import CustomHeader, { useCustomHeaderHeight } from '@/components/custom-header';
import PostItemSkeleton from '@/components/post-item-skeleton';
import { normalizeImageUrl } from '@/utils/image';
import styles from './index.module.scss';

// 登录提示组件
const LoginPrompt = () => {
  const handleLogin = () => {
    Taro.navigateTo({ url: "/pages/subpackage-profile/login/index" });
  };

  return (
    <View className={styles.loginPromptContainer}>
      <View className={styles.promptCard}>
        <Image
          src="/assets/logo.png"
          className={styles.logo}
          mode="aspectFit"
        />
        <Text className={styles.mainText}>登录 nkuwiki，开启全新校园交流体验</Text>
        <Text className={styles.subText}>
          发帖、评论、点赞、收藏，与数万校友分享你的见解
        </Text>

        <Button className={styles.loginButton} onClick={handleLogin}>
          立即登录/注册
        </Button>
      </View>
    </View>
  );
};

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);
  const userPostsState = useSelector((state: RootState) => state.userPosts);
  const campusVerificationState = useSelector((state: RootState) => state.campusVerification);
  const userInfo = userState?.userProfile; // Use userProfile for detailed info
  const userLevel = userState?.userLevel; // 用户等级信息
  const userStats = userState?.userStats; // 用户统计信息
  const followersCount = userState?.followersCount; // 关注/粉丝总数
  const collectionCount = userState?.collectionCount; // 收藏的帖子数量
  const isLoggedIn = userState?.isLoggedIn;
  const status = userState?.status;
  const levelStatus = userState?.levelStatus;
  const statsStatus = userState?.statsStatus;
  const followersCountStatus = userState?.followersCountStatus;
  const collectionCountStatus = userState?.collectionCountStatus;
  const headerHeight = useCustomHeaderHeight();


  
  // 页面显示时刷新数字数据（仅在数据不存在时）
  useDidShow(() => {
    if (isLoggedIn) {
      // 只在数据不存在时才刷新数字相关的数据，避免闪烁
      if (!followersCount) {
        dispatch(fetchFollowersCount());
      }
      if (!collectionCount) {
        dispatch(fetchCollectionCount());
      }
      if (userPostsState?.postCount === null || userPostsState?.postCount === undefined) {
        dispatch(fetchUserPostCount({}));
      }
      if (userPostsState?.likeCount === null || userPostsState?.likeCount === undefined) {
        dispatch(fetchUserLikeCount({}));
      }
      // 获取校园认证信息
      dispatch(fetchCampusVerificationInfo());
    }
  });

  // 下拉刷新
  usePullDownRefresh(async () => {
    if (isLoggedIn) {
      try {
        // 先重置状态，确保显示加载状态
        dispatch(resetUserStats());
        dispatch(resetUserLevel());
        dispatch(resetFollowersCount());
        dispatch(resetCollectionCount());
        dispatch(resetUserPostCount());
        dispatch(resetUserLikeCount());
        
        await Promise.all([
          dispatch(fetchUserProfile()).unwrap(),
          dispatch(fetchUserLevel()).unwrap(),
          dispatch(fetchUserStats()).unwrap(),
          dispatch(fetchFollowersCount()).unwrap(),
          dispatch(fetchCollectionCount()).unwrap(),
          dispatch(fetchUserPostCount({})).unwrap(),
          dispatch(fetchUserLikeCount({})).unwrap()
        ]);
        Taro.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        });
      } catch (error) {
        console.error('[Profile Page] Refresh failed:', error);
        Taro.showToast({
          title: '刷新失败',
          icon: 'error',
          duration: 1000
        });
      }
    }
    Taro.stopPullDownRefresh();
  });

  useEffect(() => {
    // 初始加载时的逻辑
    if (isLoggedIn && !userInfo) {
      dispatch(fetchUserProfile());
    }
    
    if (isLoggedIn && !userLevel && levelStatus !== 'loading') {
      dispatch(fetchUserLevel());
    }
    
    if (isLoggedIn && !userStats && statsStatus !== 'loading') {
      dispatch(fetchUserStats());
    }
  }, [isLoggedIn, userInfo, userLevel, userStats, levelStatus, statsStatus, dispatch]);

  // The rest of fetchUserStats logic is deprecated as the APIs were removed.
  // Stats should be derived from userProfile.

  const handleEditProfile = () => {
    Taro.navigateTo({ url: "/pages/subpackage-profile/edit-profile/index" });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          dispatch(logout());
        }
      }
    });
  };

  const handleNavigateToFollowing = () => {
    // 导航到关注页面
    Taro.navigateTo({
      url: '/pages/subpackage-profile/followers/index?tab=following'
    }).then(() => {
      // Navigation success
    }).catch((err) => {
      console.error('Navigation to following failed:', err);
      Taro.showToast({
        title: '页面跳转失败',
        icon: 'error'
      });
    });
  };

  const handleNavigateToFollowers = () => {
    // 导航到粉丝页面
    Taro.navigateTo({
      url: '/pages/subpackage-profile/followers/index?tab=followers'
    }).then(() => {
      // Navigation success
    }).catch((err) => {
      console.error('Navigation to followers failed:', err);
      Taro.showToast({
        title: '页面跳转失败',
        icon: 'error'
      });
    });
  };

  const handleNavigateToCollection = () => {
    // 导航到收藏页面
    Taro.navigateTo({
      url: '/pages/subpackage-profile/collection/index'
    }).catch((err) => {
      console.error('Navigation to collection failed:', err);
    });
  };

  const handleNavigateToPosts = () => {
    Taro.navigateTo({
      url: '/pages/subpackage-profile/my-posts/index'
    }).catch((err) => {
      console.error('Navigation to my posts failed:', err);
      Taro.showToast({
        title: '页面跳转失败',
        icon: 'error'
      });
    });
  };

  const handleNavigateToLikes = () => {
    // 导航到获赞页面
    Taro.navigateTo({
      url: '/pages/subpackage-profile/received-likes/index'
    }).catch((err) => {
      console.error('Navigation to received likes failed:', err);
      Taro.showToast({
        title: '页面跳转失败',
        icon: 'error'
      });
    });
  };

  const handleMenuClick = (type: string) => {
    const routes: { [key: string]: string } = {
      likes: '/pages/subpackage-profile/likes/index',
      favorites: '/pages/subpackage-profile/collection/index',
      comments: '/pages/subpackage-profile/comments/index',
      drafts: '/pages/subpackage-profile/draft-box/index',
      history: '/pages/subpackage-profile/history/index',
      feedback: '/pages/subpackage-profile/feedback/index',
      'campus-verification': '/pages/subpackage-profile/campus-verification/index',
      about: '/pages/subpackage-profile/about/index',
      settings: '/pages/subpackage-profile/settings/index',
    };

    if (routes[type]) {
      Taro.navigateTo({ url: routes[type] });
    }
  };

  const scrollViewStyle = { height: '100%', paddingTop: `${headerHeight}px` } as any;

  // 渲染骨架屏
  const renderSkeleton = () => (
    <View className={styles.pageContainer}>
      <CustomHeader title="我的" hideBack={true} showWikiButton={true} showNotificationIcon={true} />
      <View className={styles.content}>
        <ScrollView scrollY className={styles.scrollView} style={scrollViewStyle}>
          <View style={{ padding: '20px' }}>
            <PostItemSkeleton />
          </View>
        </ScrollView>
      </View>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="我的" hideBack={true} showWikiButton={true} showNotificationIcon={true} />
        <View className={styles.content}>
          <ScrollView scrollY className={styles.scrollView} style={scrollViewStyle}>
            <LoginPrompt />
          </ScrollView>
        </View>
      </View>
    );
  }

  // 如果正在加载，或者已经登录但还没有用户信息，则显示骨架屏
  if (status === 'loading' || levelStatus === 'loading' || statsStatus === 'loading' || followersCountStatus === 'loading' || collectionCountStatus === 'loading' || userPostsState?.postCountLoading === 'pending' || userPostsState?.likeCountLoading === 'pending' || (isLoggedIn && !userInfo)) {
    return renderSkeleton();
  }

  // 已登录用户视图
  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="我的" hideBack={true} showWikiButton={true} showNotificationIcon={true} />
      <View className={styles.content}>
        <ScrollView scrollY className={styles.scrollView} style={scrollViewStyle}>
          <View className={styles.userCard}>
            <View className={styles.userInfoRow}>
              <View className={styles.avatarContainer}>
                <View className={styles.avatarWrapper}>
                  <Image src={normalizeImageUrl(userInfo?.avatar || '') || "/assets/profile.png"} className={styles.avatar} />
                </View>
              </View>
              
              <View className={styles.userDetails}>
                <Text className={styles.nickname}>{userInfo?.nickname || '未设置昵称'}</Text>
                <Text className={styles.userBio}>{userInfo?.bio || '这个人很懒，还没有设置个性签名~'}</Text>
              </View>

              <View className={styles.levelBadge} onClick={() => Taro.navigateTo({ url: '/pages/subpackage-profile/level/index' })} style={{ cursor: 'pointer' }}>
                <Text className={styles.starIcon}>★</Text>
                <Text className={styles.levelText}>
                  {levelStatus === 'loading' ? '...' : (userLevel ? `LV.${userLevel.level}` : `LV.${userInfo?.level || '0'}`)}
                </Text>
              </View>

              <Button className={styles.editButton} onClick={handleEditProfile}>
                <Text className={styles.editIcon}>✎</Text>
                <Text>编辑</Text>
              </Button>
            </View>

            <View className={styles.statsContainer}>
              <View className={styles.statsRow}>
                <View className={styles.statItem} onClick={handleNavigateToPosts}>
                  <Text className={styles.statValue}>
                    {userPostsState?.postCountLoading === 'pending' ? '...' : (userPostsState?.postCount ?? userStats?.post_count ?? userInfo?.post_count ?? 0)}
                  </Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>📝</Text>
                    <Text className={styles.statLabel}>帖子</Text>
                  </View>
                </View>
                <View className={styles.statItem} onClick={handleNavigateToLikes}>
                  <Text className={styles.statValue}>
                    {userPostsState?.likeCountLoading === 'pending' ? '...' : 
                     (userPostsState?.likeCount !== null && userPostsState?.likeCount !== undefined) ? userPostsState.likeCount :
                     (userStats?.like_count ?? userInfo?.total_likes ?? 0)}
                  </Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>❤️</Text>
                    <Text className={styles.statLabel}>获赞</Text>
                  </View>
                </View>
                <View className={styles.statItem} onClick={handleNavigateToFollowing}>
                  <Text className={styles.statValue}>
                    {followersCountStatus === 'loading' ? '...' : (followersCount?.following_count ?? userInfo?.following_count ?? 0)}
                  </Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>👥</Text>
                    <Text className={styles.statLabel}>关注</Text>
                  </View>
                </View>
              </View>
              
              <View className={styles.statsRow}>
                <View className={styles.statItem} onClick={handleNavigateToFollowers}>
                  <Text className={styles.statValue}>
                    {followersCountStatus === 'loading' ? '...' : (followersCount?.follower_count ?? userInfo?.follower_count ?? 0)}
                  </Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>👥</Text>
                    <Text className={styles.statLabel}>粉丝</Text>
                  </View>
                </View>
                <View className={styles.statItem} onClick={handleNavigateToCollection}>
                  <Text className={styles.statValue}>
                    {collectionCountStatus === 'loading' ? '...' : (collectionCount ?? userStats?.favorite_count ?? userInfo?.total_favorites ?? 0)}
                  </Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>🔖</Text>
                    <Text className={styles.statLabel}>收藏</Text>
                  </View>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>
                    {status === 'loading' ? '...' : (userInfo?.points ?? 0)}
                  </Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>🏆</Text>
                    <Text className={styles.statLabel}>积分</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.menuCard}>
            <View className={styles.menuList}>
              <View className={styles.menuItem} onClick={() => handleMenuClick('likes')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>❤️</Text>
                  <Text className={styles.menuText}>我的点赞</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('favorites')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>⭐</Text>
                  <Text className={styles.menuText}>我的收藏</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('comments')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>💬</Text>
                  <Text className={styles.menuText}>我的评论</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('drafts')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>📁</Text>
                  <Text className={styles.menuText}>草稿箱</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('history')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>🕒</Text>
                  <Text className={styles.menuText}>浏览历史</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('feedback')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>✉️</Text>
                  <Text className={styles.menuText}>意见反馈</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('campus-verification')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>🎓</Text>
                  <Text className={styles.menuText}>校园认证</Text>
                  {campusVerificationState.info?.is_verified && (
                    <Text className={styles.verifiedBadge}>已认证</Text>
                  )}
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>ℹ️</Text>
                  <Text className={styles.menuText}>关于我们</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
              
              <View className={styles.menuItem} onClick={() => handleMenuClick('settings')}>
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>⚙️</Text>
                  <Text className={styles.menuText}>设置</Text>
                </View>
                <Text className={styles.chevron}>›</Text>
              </View>
            </View>

            <View className={styles.logoutSection}>
              <Button className={styles.logoutButton} onClick={handleLogout}>
                <Text className={styles.logoutIcon}>⚡</Text>
                <Text>退出登录</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;
