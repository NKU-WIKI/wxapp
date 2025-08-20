import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './ProfileSummary.module.scss'
import { UserInfo } from '@/types/api/user' // Assuming UserInfo is defined in user types
import { tabBarSyncManager } from '@/utils/tabBarSync'
import awardIcon from '@/assets/award.svg'
import { normalizeImageUrl } from '@/utils/image'

interface ProfileSummaryProps {
  userInfo: UserInfo;
}

const ProfileSummary = ({ userInfo }: ProfileSummaryProps) => {
  // 添加空值检查，防止 userInfo 为 undefined 时报错
  if (!userInfo) {
    return null;
  }

  const handleEditProfile = () => {
    // 使用全局导航管理器，自动判断是否为tabBar页面
    tabBarSyncManager.navigateToPage('/pages/edit-profile/index');
  };

  const handleNavigateToLevel = () => {
    // 使用全局导航管理器，自动判断是否为tabBar页面
    tabBarSyncManager.navigateToPage('/pages/level/index');
  }

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
    });
  };

  const handleNavigateToPosts = () => {
    Taro.showToast({
      title: '帖子页面还未开发',
      icon: 'none'
    });
  };

  const handleNavigateToLikes = () => {
    Taro.showToast({
      title: '获赞页面还未开发',
      icon: 'none'
    });
  };

  const statistics = [
    { label: '帖子', value: userInfo?.postsCount || 0, clickable: true, onClick: handleNavigateToPosts },
    { label: '获赞', value: userInfo?.likesCount || 0, clickable: true, onClick: handleNavigateToLikes },
    { label: '关注', value: userInfo?.followingCount || 0, clickable: true, onClick: handleNavigateToFollowers },
    { label: '粉丝', value: userInfo?.followersCount || 0, clickable: true, onClick: handleNavigateToFollowers },
    { label: '收藏', value: userInfo?.favoritesCount || 0, clickable: true, onClick: handleNavigateToCollection },
    { label: '积分', value: userInfo?.points || 0, clickable: false, onClick: undefined },
  ];

  return (
    <View className={styles.profileSummary}>
      <View className={styles.userInfoRow}>
        <Image src={normalizeImageUrl(userInfo?.avatar) || ''} className={styles.avatar} />
        <View className={styles.userDetails}>
          <View className={styles.nameRow}>
            <Text className={styles.nickname}>{userInfo?.nickname || ''}</Text>
            {userInfo?.level && (
              <View className={styles.levelBadge}>
                <Text>Lv.{userInfo.level}</Text>
              </View>
            )}
            <View className={styles.levelLink} onClick={handleNavigateToLevel}>
              <Image src={awardIcon} className={styles.levelIcon} />
              <Text>我的等级</Text>
            </View>
          </View>
          <Text className={styles.signature}>{userInfo?.signature || ''}</Text>
          <Text className={styles.school}>{userInfo?.school || ''}</Text>
        </View>
        <View className={styles.editButton} onClick={handleEditProfile}>
          <Text>编辑资料</Text>
        </View>
      </View>

      <View className={styles.statsGrid}>
        {statistics.map((stat) => {
          const handleClick = () => {
            console.log(`Stat item clicked: ${stat.label}, clickable: ${stat.clickable}`);
            if (stat.clickable && stat.onClick) {
              stat.onClick();
            }
          };

          return (
            <View 
              key={stat.label} 
              className={`${styles.statItem} ${stat.clickable ? styles.clickable : ''}`} 
              onClick={handleClick}
            >
              <Text className={styles.statValue}>{stat.value}</Text>
              <Text className={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  )
}

export default ProfileSummary