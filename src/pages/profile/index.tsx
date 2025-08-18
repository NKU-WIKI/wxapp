import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCurrentUser, fetchUserProfile, logout } from '@/store/slices/userSlice';
import CustomHeader, { useCustomHeaderHeight } from '@/components/custom-header';
import PostItemSkeleton from '@/components/post-item-skeleton';
import styles from './index.module.scss';

// 用户统计数据接口
interface UserStats {
  following_count: number;
  follower_count: number;
  favorites_count: number;
  likes_count: number;
}

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
  const userInfo = userState?.userProfile; // Use userProfile for detailed info
  const isLoggedIn = userState?.isLoggedIn;
  const status = userState?.status;
  const headerHeight = useCustomHeaderHeight();

  console.log('[Profile Page] isLoggedIn status:', isLoggedIn);
  
  // Stats are now part of userProfile or need a new API, remove local state management for now
  /*
  const [stats, setStats] = useState<UserStats>({
    following_count: 0,
    follower_count: 0,
    favorites_count: 0,
    likes_count: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  */

  useEffect(() => {
    // If the user is logged in but profile is not loaded, fetch it.
    // fetchCurrentUser is now handled globally in app.tsx
    if (isLoggedIn && !userInfo) {
      dispatch(fetchUserProfile());
    }
  }, [isLoggedIn, userInfo, dispatch]);

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

  const handleNavigateToFollowers = () => {
    console.log('Navigate to followers triggered'); // 调试日志
    // 导航到关注/粉丝页面
    Taro.navigateTo({
      url: '/pages/subpackage-profile/followers/index'
    }).then(() => {
      console.log('Navigation success');
    }).catch((err) => {
      console.error('Navigation failed:', err);
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
    // 点击暂不处理
  };

  const handleMenuClick = (type: string) => {
    const routes: { [key: string]: string } = {
      likes: '/pages/subpackage-profile/likes/index',
      favorites: '/pages/subpackage-profile/collection/index',
      comments: '/pages/subpackage-profile/comments/index',
      drafts: '/pages/subpackage-profile/draft-box/index',
      history: '/pages/subpackage-profile/history/index',
      feedback: '/pages/subpackage-profile/feedback/index',
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
  if (status === 'loading' || (isLoggedIn && !userInfo)) {
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
                  <Image src={userInfo?.avatar || "/assets/profile.png"} className={styles.avatar} />
                </View>
              </View>
              
              <View className={styles.userDetails}>
                <Text className={styles.nickname}>{userInfo?.nickname || '未设置昵称'}</Text>
                <Text className={styles.userBio}>{userInfo?.bio || '这个人很懒，还没有设置个性签名~'}</Text>
              </View>

              <View className={styles.levelBadge} onClick={() => Taro.navigateTo({ url: '/pages/subpackage-profile/level/index' })} style={{ cursor: 'pointer' }}>
                <Text className={styles.starIcon}>★</Text>
                <Text className={styles.levelText}>LV.{userInfo?.level || '1'}</Text>
              </View>

              <Button className={styles.editButton} onClick={handleEditProfile}>
                <Text className={styles.editIcon}>✎</Text>
                <Text>编辑</Text>
              </Button>
            </View>

            <View className={styles.statsContainer}>
              <View className={styles.statsRow}>
                <View className={styles.statItem} onClick={handleNavigateToPosts}>
                  <Text className={styles.statValue}>{userInfo?.post_count ?? 0}</Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>📝</Text>
                    <Text className={styles.statLabel}>帖子</Text>
                  </View>
                </View>
                <View className={styles.statItem} onClick={handleNavigateToLikes}>
                  <Text className={styles.statValue}>{userInfo?.total_likes ?? 0}</Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>❤️</Text>
                    <Text className={styles.statLabel}>获赞</Text>
                  </View>
                </View>
                <View className={styles.statItem} onClick={handleNavigateToFollowers}>
                  <Text className={styles.statValue}>{userInfo?.following_count ?? 0}</Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>👥</Text>
                    <Text className={styles.statLabel}>关注</Text>
                  </View>
                </View>
              </View>
              
              <View className={styles.statsRow}>
                <View className={styles.statItem} onClick={handleNavigateToFollowers}>
                  <Text className={styles.statValue}>{userInfo?.follower_count ?? 0}</Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>👥</Text>
                    <Text className={styles.statLabel}>粉丝</Text>
                  </View>
                </View>
                <View className={styles.statItem} onClick={handleNavigateToCollection}>
                  <Text className={styles.statValue}>{userInfo?.total_favorites ?? 0}</Text>
                  <View className={styles.statLabelRow}>
                    <Text className={styles.statIcon}>🔖</Text>
                    <Text className={styles.statLabel}>收藏</Text>
                  </View>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{userInfo?.points ?? 0}</Text>
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
