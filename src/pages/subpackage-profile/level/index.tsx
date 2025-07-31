import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSelector } from 'react-redux';
import styles from './index.module.scss';
import settingsIcon from '@/assets/settings.svg';
import backIcon from '@/assets/arrow-left.svg';
import checkinIcon from '@/assets/clock.svg';
import likeIcon from '@/assets/thumbs-up.svg';
import commentIcon from '@/assets/message-circle.svg';
import defaultAvatar from '@/assets/profile.png';

const LEVELS = [
  { lv: 0, label: 'Lv0', range: '0经验值' },
  { lv: 1, label: 'Lv1', range: '1-50经验值' },
  { lv: 2, label: 'Lv2', range: '51-200经验值' },
  { lv: 3, label: 'Lv3', range: '201-450经验值' },
  { lv: 4, label: 'Lv4', range: '451-900经验值' },
  { lv: 5, label: 'Lv5', range: '901-1500经验值' },
  { lv: 6, label: 'Lv6', range: '1501-3000经验值' },
  { lv: 7, label: 'Lv7', range: '大于3000经验值' },
];

const EXP_RULES = [
  { icon: checkinIcon, text: '每日登录', status: '未完成', value: '+2', statusColor: styles.statusBlue },
  { icon: likeIcon, text: '帖子被点赞', status: '今日已获得 +2', value: '+1', statusColor: styles.statusBlue },
  { icon: commentIcon, text: '评论他人帖子', status: '已完成', value: '+3', statusColor: styles.statusGray },
];

export default function LevelPage() {
  // 获取当前用户信息
  const userInfo = useSelector((state: any) => state.user?.userInfo) || {};
  const userLevel = userInfo.level || 1;
  const userExp = userInfo.exp || 2;
  const nickname = userInfo.nickname || '未设置昵称';
  const avatar = userInfo.avatar || defaultAvatar;

  const nextLevelExp = userLevel < LEVELS.length - 1 ? LEVELS[userLevel + 1].range.match(/\d+/g)?.[0] : '3000';
  const maxExp = userLevel === 0 ? 50 : userLevel === 7 ? 3000 : parseInt(nextLevelExp || '50', 10);
  const minExp = userLevel === 0 ? 0 : parseInt(LEVELS[userLevel].range.match(/\d+/g)?.[0] || '0', 10);
  const progress = Math.min(1, (userExp - minExp) / (maxExp - minExp));

  return (
    <View className={styles.page}>
      {/* 用户信息卡片 */}
      <View className={styles.card} style={{ marginTop: 16 }}>
        <View className={styles.userInfoRow}>
          <Image src={avatar} className={styles.avatar} />
          <View className={styles.userMeta}>
            <Text className={styles.nickname}>{nickname}</Text>
            <Text className={styles.levelBlue}>Lv{userLevel}: {userExp}</Text>
          </View>
        </View>
      </View>
      {/* 经验值信息 */}
      <View className={styles.card}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>当前经验值</Text>
          <Text className={styles.infoValue}>{userExp}</Text>
          </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>当前等级</Text>
          <Text className={styles.infoValue}>Lv{userLevel}</Text>
          </View>
        {/* 等级进度条 */}
        <View className={styles.progressBarWrap}>
          <View className={styles.progressBarBg}>
            <View className={styles.progressBar} style={{ width: `${progress * 100}%` }} />
          </View>
          <Text className={styles.progressText}>{userExp}/{maxExp}</Text>
        </View>
      </View>
      {/* 等级说明列表 */}
      <View className={styles.card}>
        <View className={styles.levelGrid}>
          <View className={styles.levelCol}>
            {LEVELS.filter((_, i) => i % 2 === 0).map(lv => (
              <View key={lv.lv} className={styles.levelItem}>
                <View style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <Text className={styles.levelTitle}>{lv.label}</Text>
                  <Text style={{ margin: '0 4px', color: '#9CA3AF', fontSize: 15 }}>:</Text>
                </View>
                <Text className={styles.levelRange}>{lv.range}</Text>
            </View>
          ))}
        </View>
          <View className={styles.levelCol}>
            {LEVELS.filter((_, i) => i % 2 === 1).map(lv => (
              <View key={lv.lv} className={styles.levelItem + ' ' + (lv.lv === userLevel ? styles.levelActive : '')}>
                <View style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <Text className={styles.levelTitle}>{lv.label}</Text>
                  <Text style={{ margin: '0 4px', color: '#9CA3AF', fontSize: 15 }}>:</Text>
                </View>
                <Text className={styles.levelRange}>{lv.range}</Text>
              </View>
            ))}
            </View>
        </View>
      </View>
      {/* 获取经验值说明 */}
      <View className={styles.card}>
        <Text className={styles.expTitle}>获取经验值</Text>
        {EXP_RULES.map((item, idx) => (
          <View key={item.text} className={styles.expRow}>
            <View className={styles.expIconWrap}>
              <Image src={item.icon} className={styles.expIcon} />
            </View>
            <Text className={styles.expText}>{item.text}</Text>
            <Text className={styles.expStatus + ' ' + item.statusColor}>{item.status}</Text>
            {idx < EXP_RULES.length - 1 && <View className={styles.expDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}
