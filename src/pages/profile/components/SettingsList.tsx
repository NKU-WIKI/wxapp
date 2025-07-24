import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './SettingsList.module.scss'

// Import icons
import heartIcon from '@/assets/heart-outline.svg';
import messageSquareIcon from '@/assets/message-square.svg';
import starIcon from '@/assets/star-filled.svg';
import draftIcon from '@/assets/draft.png';
import userIcon from '@/assets/user.svg';
import settingsIcon from '@/assets/settings.svg';
import historyIcon from '@/assets/history.svg';
import feedbackIcon from '@/assets/feedback.svg';
import aboutIcon from '@/assets/about.svg';
import logoutIcon from '@/assets/logout.svg';
import arrowRightIcon from '@/assets/arrow-right.svg';

const SettingsList = () => {
  const menuItems = [
    { icon: heartIcon, text: '我的点赞', link: '/pages/likes/index' },
    { icon: starIcon, text: '我的收藏', link: '/pages/subpackage-profile/favorites/index' },
    { icon: messageSquareIcon, text: '我的评论', link: '/pages/comments/index' },
    { icon: draftIcon, text: '草稿箱', link: '/pages/drafts/index' },
    { icon: userIcon, text: '关于我们', link: '/pages/about/index' },
    { icon: settingsIcon, text: '设置', link: '/pages/subpackage-profile/settings/index' },
    { icon: historyIcon, text: '浏览历史', link: '/pages/subpackage-profile/history/index' },
    { icon: feedbackIcon, text: '意见反馈', link: '/pages/feedback/index' },
    { icon: aboutIcon, text: '关于我们', link: '/pages/about/index', extra: '版本 0.1.0' },
    { icon: logoutIcon, text: '退出登录', action: 'logout' },
  ];

  const handleItemClick = (item) => {
    if (item.action === 'logout') {
      Taro.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // Dispatch logout action here
            console.log('User confirmed logout');
          }
        }
      });
    } else if (item.link) {
      Taro.navigateTo({ url: item.link });
    }
  };

  return (
    <View className={styles.settingsSection}>
      <Text className={styles.sectionTitle}>应用设置</Text>
      <View className={styles.settingsList}>
        {menuItems.map((item, index) => (
          <View key={index} className={styles.settingsItem} onClick={() => handleItemClick(item)}>
            <View className={styles.itemLeft}>
              <Image src={item.icon} className={styles.itemIcon} />
              <Text className={styles.itemText}>{item.text}</Text>
            </View>
            <View className={styles.itemRight}>
              {item.extra && <Text className={styles.itemExtra}>{item.extra}</Text>}
              <Image src={arrowRightIcon} className={styles.arrowIcon} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default SettingsList 