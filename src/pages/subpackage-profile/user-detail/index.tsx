import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUserProfile } from '../../../store/slices/userSlice';
import actionApi from '../../../services/api/action';
import CustomHeader from '../../../components/custom-header';
import styles from './index.module.scss';

const UserDetail: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector(state => state.user);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = router.params.userId ? parseInt(router.params.userId) : null;

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      // TODO: 调用获取用户详情的API
      // const response = await getUserDetail(userId);
      // setTargetUser(response.data);
      // setIsFollowing(response.data.is_following);
      
      // 临时模拟数据
      setTargetUser({
        id: userId,
        nickname: '用户昵称',
        avatar: '',
        bio: '这是用户的个人简介',
        level: 5,
        followers_count: 128,
        following_count: 256,
        posts_count: 42
      });
      setIsFollowing(false);
    } catch (error) {
      console.error('获取用户详情失败:', error);
      Taro.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!userInfo || !userId) {
      Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
      return;
    }

    try {
      // 调用真实的关注API
      const response = await actionApi.toggleAction({
        target_type: 'user',
        target_id: userId,
        action_type: 'follow'
      });
      
      if (response.code === 200 && response.data) {
        const { is_active } = response.data;
        setIsFollowing(is_active);
        
        // 更新用户信息以确保主页的粉丝数量实时更新
        dispatch(fetchUserProfile());
      }
    } catch (error) {
      console.error('关注操作失败', error);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  };

  if (loading) {
    return (
      <View className={styles.container}>
        <CustomHeader title="用户资料" />
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!targetUser) {
    return (
      <View className={styles.container}>
        <CustomHeader title="用户资料" />
        <View className={styles.error}>
          <Text>用户不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <CustomHeader title="用户资料" />
      
      <View className={styles.content}>
        <View className={styles.userInfo}>
          <Image 
            src={targetUser.avatar || '/assets/placeholder.jpg'} 
            className={styles.avatar}
          />
          <View className={styles.userDetails}>
            <Text className={styles.nickname}>{targetUser.nickname}</Text>
            <View className={styles.levelBadge}>
              <Text>Lv.{targetUser.level}</Text>
            </View>
            {targetUser.bio && (
              <Text className={styles.bio}>{targetUser.bio}</Text>
            )}
          </View>
        </View>

        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{targetUser.posts_count}</Text>
            <Text className={styles.statLabel}>帖子</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{targetUser.followers_count}</Text>
            <Text className={styles.statLabel}>粉丝</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{targetUser.following_count}</Text>
            <Text className={styles.statLabel}>关注</Text>
          </View>
        </View>

        <View className={styles.actions}>
          <Button 
            className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
            onClick={handleFollow}
          >
            {isFollowing ? '已关注' : '关注'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default UserDetail;