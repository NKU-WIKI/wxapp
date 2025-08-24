import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUserProfile } from '../../../store/slices/userSlice';
import { getActionStatus, getUserPostCount, getUserFollowersCount, getUserFollowingCount } from '../../../services/api/user';
import { followAction } from '../../../services/api/followers';
import CustomHeader from '../../../components/custom-header';
import { normalizeImageUrl } from '../../../utils/image';
import styles from './index.module.scss';

const UserDetail: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector(state => state.user);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const userId = router.params.userId || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // 从路由参数中获取用户信息
        const userInfoFromParams = router.params;
        console.log('用户信息参数:', userInfoFromParams);
        
        // 使用路由参数构建用户信息
        const tempUser = {
          id: userId,
          nickname: decodeURIComponent(userInfoFromParams.nickname || '未知用户'),
          avatar: userInfoFromParams.avatar || '',
          bio: decodeURIComponent(userInfoFromParams.bio || ''),
          level: parseInt(userInfoFromParams.level || '1'),
          follower_count: 0, // 初始化为0，稍后通过API获取
          following_count: 0, // 初始化为0，稍后通过API获取
          post_count: 0, // 初始化为0，稍后通过API获取
        };
        
        setTargetUser(tempUser);
        
        // 并行获取用户的统计数据
        try {
          const [postCount, followersCount, followingCount] = await Promise.all([
            getUserPostCount(userId),
            getUserFollowersCount(userId),
            getUserFollowingCount(userId)
          ]);
          
          // 更新用户信息 with 真实数据
          setTargetUser(prev => ({
            ...prev,
            post_count: postCount,
            follower_count: followersCount,
            following_count: followingCount
          }));
        } catch (error) {
          console.error('获取用户统计数据失败:', error);
          // 如果API调用失败，保持默认值0
        }
        
        // 获取关注状态
        if (isLoggedIn && userId) {
          try {
            const statusResponse = await getActionStatus(userId, 'user', 'follow');
            setIsFollowing(statusResponse.data.is_active);
          } catch (error: any) {
            console.log('获取关注状态失败，使用默认值:', error);
            
            // 特别处理422错误（OpenAPI文档target_id类型定义错误）
            if (error?.statusCode === 422) {
              console.warn('422错误：后端API文档中target_id定义为integer类型，但实际需要UUID字符串');
              // 暂时使用默认值，等待后端修复OpenAPI文档
            }
            
            setIsFollowing(false);
          }
        }
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
    
    fetchData();
  }, [userId, router.params, isLoggedIn]);

  const handleFollow = async () => {
    if (!isLoggedIn || !userId) {
      Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
      return;
    }

    try {
      setFollowLoading(true);
      // 调用关注API
      const response = await followAction({
        target_user_id: userId,
      });
      
      if (response.code === 0 && response.data) {
        const { is_active } = response.data;
        setIsFollowing(is_active);
        
        // 重新获取真实的粉丝数量
        try {
          const newFollowersCount = await getUserFollowersCount(userId);
          setTargetUser(prev => ({
            ...prev,
            follower_count: newFollowersCount
          }));
        } catch (error) {
          console.error('更新粉丝数量失败:', error);
          // 如果获取失败，使用简单的加减逻辑作为备选
          if (targetUser) {
            setTargetUser({
              ...targetUser,
              follower_count: is_active 
                ? (targetUser.follower_count || 0) + 1 
                : Math.max((targetUser.follower_count || 0) - 1, 0)
            });
          }
        }
        
        // 更新用户信息以确保主页的粉丝数量实时更新
        dispatch(fetchUserProfile());
      }
    } catch (error) {
      console.error('关注操作失败', error);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    } finally {
      setFollowLoading(false);
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
            src={normalizeImageUrl(targetUser.avatar) || '/assets/placeholder.jpg'} 
            className={styles.avatar}
          />
          <View className={styles.userDetails}>
            <Text className={styles.nickname}>{targetUser.nickname}</Text>
            <View className={styles.levelBadge}>
              <Text>Lv.{targetUser.level || 1}</Text>
            </View>
            {targetUser.bio && (
              <Text className={styles.bio}>{targetUser.bio}</Text>
            )}
          </View>
        </View>

        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{targetUser.post_count || 0}</Text>
            <Text className={styles.statLabel}>帖子</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{targetUser.follower_count || 0}</Text>
            <Text className={styles.statLabel}>粉丝</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{targetUser.following_count || 0}</Text>
            <Text className={styles.statLabel}>关注</Text>
          </View>
        </View>

        <View className={styles.actions}>
          <Button 
            className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
            onClick={handleFollow}
            loading={followLoading}
            disabled={followLoading}
          >
            {isFollowing ? '已关注' : '关注'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default UserDetail;