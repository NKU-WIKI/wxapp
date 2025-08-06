import { useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, Button } from "@tarojs/components";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { logout, fetchUserProfile } from "@/store/slices/userSlice";
import styles from "./index.module.scss";

// 导入图标
const defaultAvatar = "/assets/profile.png";
import heartIcon from "@/assets/heart-outline.svg";
import messageIcon from "@/assets/message-square.svg";
const draftIcon = "/assets/draft.png";
import shareIcon from "@/assets/share.svg";
import CustomHeader from "@/components/custom-header";
import PostItemSkeleton from "@/components/post-item-skeleton";

const loginPromptIllustration = "/assets/logo.png";

const LoginPrompt = () => {
  const handleLogin = () => {
    Taro.navigateTo({ url: "/pages/subpackage-profile/login/index" });
  };

  return (
    <View className={styles.loginPromptContainer}>
      <View className={styles.promptCard}>
        <Image
          src={loginPromptIllustration}
          className={styles.logo}
          mode="aspectFit"
        />
        <Text className={styles.mainText}>登录 nkuwiki，开启全新校园交流体验</Text>
        <Text className={styles.subText}>
          发帖、评论、点赞、收藏，与数万校友分享你的见解
        </Text>

        <View className={styles.actions}>
          <View className={styles.actionItem}>
            <Image src={heartIcon} className={styles.actionIcon} style={{ width: '18px', height: '18px' }} />
            <Text>获赞</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={messageIcon} className={styles.actionIcon} style={{ width: '18px', height: '18px' }} />
            <Text>评论</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={draftIcon} className={styles.actionIcon} style={{ width: '18px', height: '18px' }} />
            <Text>发帖</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={shareIcon} className={styles.actionIcon} style={{ width: '18px', height: '18px' }} />
            <Text>分享</Text>
          </View>
        </View>

        <Button className={styles.loginButton} onClick={handleLogin}>
          立即登录/注册
        </Button>
      </View>
    </View>
  );
};

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, isLoggedIn, status } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // 如果已登录，则在页面加载时获取最新的用户信息
    // 这能确保数据是最新的，即使用户在其他设备上修改了信息
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [isLoggedIn, dispatch]);

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

  // 渲染骨架屏
  const renderSkeleton = () => (
    <View className={styles.pageContainer}>
      <CustomHeader title="我的" hideBack={true} showWikiButton={true} showNotificationIcon={true} />
      <View style={{ padding: '20px' }}>
        <PostItemSkeleton />
      </View>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="我的" hideBack={true} showWikiButton={true} showNotificationIcon={true} />
        <LoginPrompt />
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
      
      <View className={styles.userCard}>
        <View className={styles.userInfoRow}>
          <View className={styles.avatarContainer}>
            <View className={styles.avatarWrapper}>
              <Image src={userInfo?.avatar || defaultAvatar} className={styles.avatar} />
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
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{userInfo?.post_count ?? 0}</Text>
              <View className={styles.statLabelRow}>
                <Text className={styles.statIcon}>📝</Text>
                <Text className={styles.statLabel}>帖子</Text>
              </View>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{userInfo?.total_likes ?? 0}</Text>
              <View className={styles.statLabelRow}>
                <Text className={styles.statIcon}>❤️</Text>
                <Text className={styles.statLabel}>获赞</Text>
              </View>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{userInfo?.following_count ?? 0}</Text>
              <View className={styles.statLabelRow}>
                <Text className={styles.statIcon}>👥</Text>
                <Text className={styles.statLabel}>关注</Text>
              </View>
            </View>
          </View>
          
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{userInfo?.follower_count ?? 0}</Text>
              <View className={styles.statLabelRow}>
                <Text className={styles.statIcon}>👥</Text>
                <Text className={styles.statLabel}>粉丝</Text>
              </View>
            </View>
            <View className={styles.statItem}>
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
    </View>
  );
};

export default Profile;
