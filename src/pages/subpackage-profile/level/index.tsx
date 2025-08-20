import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import styles from './index.module.scss';
import checkinIcon from '@/assets/clock.svg';
import likeIcon from '@/assets/thumbs-up.svg';
import commentIcon from '@/assets/message-circle.svg';
import defaultAvatar from '@/assets/profile.png';
import { fetchMyLevel, fetchTodayExperienceRecords } from '@/store/slices/levelSlice';
import { normalizeImageUrl } from '@/utils/image';

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
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.userProfile);
  const levelState = useAppSelector((s) => s.level);

  useEffect(() => {
    dispatch(fetchMyLevel());
    dispatch(fetchTodayExperienceRecords());
  }, [dispatch]);

  const level = levelState.data?.level ?? (user?.level ?? 1);
  const exp = levelState.data?.exp ?? 0;

  const { maxExp, minExp, progressPct } = useMemo(() => {
    const nextLevelExpHint = level < LEVELS.length - 1 ? LEVELS[level + 1].range.match(/\d+/g)?.[0] : '3000';
    const max = level === 0 ? 50 : level === 7 ? 3000 : parseInt(nextLevelExpHint || '50', 10);
    const min = level === 0 ? 0 : parseInt(LEVELS[level].range.match(/\d+/g)?.[0] || '0', 10);
    const prog = Math.max(0, Math.min(1, (exp - min) / (max - min)));
    return { maxExp: max, minExp: min, progressPct: Math.round(prog * 100) };
  }, [level, exp]);

  const nickname = user?.nickname || '未设置昵称';
  const avatarUrl = normalizeImageUrl(user?.avatar) || defaultAvatar;

  return (
    <View className={styles.page}>
      {/* 用户信息卡片 */}
      <View className={styles.card} style={{ marginTop: 16 }}>
        <View className={styles.userInfoRow}>
          <Image src={avatarUrl} className={styles.avatar} />
          <View className={styles.userMeta}>
            <Text className={styles.nickname}>{nickname}</Text>
            <Text className={styles.levelBlue}>Lv{level}: {exp}</Text>
          </View>
        </View>
      </View>
      {/* 经验值信息 */}
      <View className={styles.card}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>当前经验值</Text>
          <Text className={styles.infoValue}>{exp}</Text>
          </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>当前等级</Text>
          <Text className={styles.infoValue}>Lv{level}</Text>
          </View>
        {/* 等级进度条 */}
        <View className={styles.progressBarWrap}>
          <View className={styles.progressBarBg}>
            <View className={styles.progressBar} style={{ width: `${progressPct}%` }} />
          </View>
          <Text className={styles.progressText}>{exp}/{maxExp}</Text>
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
              <View key={lv.lv} className={styles.levelItem + ' ' + (lv.lv === level ? styles.levelActive : '')}>
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
        {(() => {
                               const records = Array.isArray(levelState.records) ? levelState.records : [];
          const hasLogin = records.some(r => r.event_type === 'daily_login');
          const likeCount = records.filter(r => r.event_type === 'post_liked').length;
          const hasComment = records.some(r => r.event_type === 'comment_others');

          const rows = [
            {
              icon: checkinIcon,
              text: '每日登录',
              status: hasLogin ? '今日已完成' : '未完成',
              colorClass: hasLogin ? styles.statusBlue : styles.statusBlue,
            },
            {
              icon: likeIcon,
              text: '帖子被点赞',
              status: likeCount > 0 ? `今日已获得 +${likeCount}` : '今日已获得 +0',
              colorClass: styles.statusBlue,
            },
            {
              icon: commentIcon,
              text: '评论他人帖子',
              status: hasComment ? '已完成' : '未完成',
              colorClass: hasComment ? styles.statusGray : styles.statusBlue,
            },
          ];

          return rows.map((item, idx) => (
            <View key={item.text} className={styles.expRow}>
              <View className={styles.expIconWrap}>
                <Image src={item.icon} className={styles.expIcon} />
              </View>
              <Text className={styles.expText}>{item.text}</Text>
              <Text className={styles.expStatus + ' ' + item.colorClass}>{item.status}</Text>
              {idx < rows.length - 1 && <View className={styles.expDivider} />}
            </View>
          ));
        })()}
      </View>
    </View>
  );
}
