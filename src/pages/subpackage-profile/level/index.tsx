import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';

import levelIcon from '@/assets/placeholder.jpg'; // Placeholder for level icon
import checkIcon from '@/assets/check-square.svg';
import thumbsUpIcon from '@/assets/thumbs-up.svg';
import messageCircleIcon from '@/assets/message-circle.svg';

const levelData = [
  { level: 'Lv0', exp: '0 经验值', active: false },
  { level: 'Lv1', exp: '1-50 经验值', active: true },
  { level: 'Lv2', exp: '51-200 经验值', active: false },
  { level: 'Lv3', exp: '201-450 经验值', active: false },
  { level: 'Lv4', exp: '451-900 经验值', active: false },
  { level: 'Lv5', exp: '901-1500 经验值', active: false },
  { level: 'Lv6', exp: '1501-3000 经验值', active: false },
  { level: 'Lv7', exp: '大于3000 经验值', active: false },
];

const experienceTasks = [
  { icon: checkIcon, name: '每日登录', status: '未完成', statusClass: 'incomplete' },
  { icon: thumbsUpIcon, name: '帖子被点赞', status: '今日已获得 +2', statusClass: 'complete' },
  { icon: messageCircleIcon, name: '评论他人帖子', status: '已完成', statusClass: 'incomplete' },
];

export default function MyLevelPage() {
  const currentExp = 2;
  const maxExp = 50;
  const progress = (currentExp / maxExp) * 100;

  return (
    <View className={styles.levelPage}>
      <CustomHeader title="我的等级" />
      
      <View className={styles.content}>
        {/* Current Level Info */}
        <View className={styles.currentLevelCard}>
          <View className={styles.levelInfo}>
            <Image src={levelIcon} className={styles.levelIcon} />
            <Text className={styles.levelName}>小黄鱼</Text>
          </View>
          <Text className={styles.levelDetail}>Lv1 : {currentExp}</Text>
          <View className={styles.expRow}>
            <Text>当前经验值</Text>
            <Text>{currentExp}</Text>
          </View>
          <View className={styles.expRow}>
            <Text>当前等级</Text>
            <Text>Lv1</Text>
          </View>
          <View className={styles.progressContainer}>
            <View className={styles.progressBar} style={{ width: `${progress}%` }} />
          </View>
          <Text className={styles.expRatio}>{currentExp}/{maxExp}</Text>
        </View>

        {/* Level Descriptions */}
        <View className={styles.levelsGrid}>
          {levelData.map((item, index) => (
            <View key={index} className={`${styles.levelDescriptionCard} ${item.active ? styles.activeLevel : ''}`}>
              <Text className={styles.levelDescriptionTitle}>{item.level}</Text>
              <Text className={styles.levelDescriptionExp}>{item.exp}</Text>
            </View>
          ))}
        </View>

        {/* Gain Experience Section */}
        <View className={styles.tasksCard}>
          <Text className={styles.tasksTitle}>获取经验值</Text>
          {experienceTasks.map((task, index) => (
            <View key={index} className={styles.taskItem}>
              <View className={styles.taskInfo}>
                <Image src={task.icon} className={styles.taskIcon} />
                <Text className={styles.taskName}>{task.name}</Text>
              </View>
              <Text className={`${styles.taskStatus} ${styles[task.statusClass]}`}>{task.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
