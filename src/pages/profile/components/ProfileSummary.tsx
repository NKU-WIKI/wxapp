import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './ProfileSummary.module.scss'
import { UserInfo } from '@/types/api/user' // Assuming UserInfo is defined in user types
import awardIcon from '@/assets/award.svg'

interface ProfileSummaryProps {
  userInfo: UserInfo;
}

const ProfileSummary = ({ userInfo }: ProfileSummaryProps) => {

  const handleEditProfile = () => {
    Taro.navigateTo({ url: '/pages/edit-profile/index' });
  };

  const handleNavigateToLevel = () => {
    Taro.navigateTo({ url: '/pages/level/index' });
  }

  const statistics = [
    { label: '帖子', value: userInfo.postsCount || 0 },
    { label: '获赞', value: userInfo.likesCount || 0 },
    { label: '关注', value: userInfo.followingCount || 0 },
    { label: '粉丝', value: userInfo.followersCount || 0 },
    { label: '收藏', value: userInfo.favoritesCount || 0 },
    { label: '积分', value: userInfo.points || 0 },
  ];

  return (
    <View className={styles.profileSummary}>
      <View className={styles.userInfoRow}>
        <Image src={userInfo.avatar} className={styles.avatar} />
        <View className={styles.userDetails}>
          <View className={styles.nameRow}>
            <Text className={styles.nickname}>{userInfo.nickname}</Text>
            {userInfo.level && (
              <View className={styles.levelBadge}>
                <Text>Lv.{userInfo.level}</Text>
              </View>
            )}
            <View className={styles.levelLink} onClick={handleNavigateToLevel}>
              <Image src={awardIcon} className={styles.levelIcon} />
              <Text>我的等级</Text>
            </View>
          </View>
          <Text className={styles.signature}>{userInfo.signature}</Text>
          <Text className={styles.school}>{userInfo.school}</Text>
        </View>
        <View className={styles.editButton} onClick={handleEditProfile}>
          <Text>编辑资料</Text>
        </View>
      </View>

      <View className={styles.statsGrid}>
        {statistics.map(stat => (
          <View key={stat.label} className={styles.statItem}>
            <Text className={styles.statValue}>{stat.value}</Text>
            <Text className={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default ProfileSummary 