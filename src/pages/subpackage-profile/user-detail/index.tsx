import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUserProfile, fetchCurrentUser } from '../../../store/slices/userSlice';
import { getActionStatus, getUserPostCount, getUserFollowersCount, getUserFollowingCount } from '../../../services/api/user';
import { followAction } from '../../../services/api/followers';
import { BBSNotificationHelper } from '@/utils/notificationHelper';
import { useSharing } from '../../../hooks/useSharing';
import CustomHeader from '../../../components/custom-header';
import AuthorInfo from '../../../components/author-info';
import ActionBar from '../../../components/action-bar';
import styles from './index.module.scss';

const UserDetail: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector(state => state.user);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = router.params.userId || '';
  const currentUserId = useAppSelector(state => state.user.user?.id);

  // 使用分享 Hook
  useSharing({
    title: targetUser?.nickname ? `${targetUser.nickname}的个人主页` : '分享用户',
    path: `/pages/subpackage-profile/user-detail/index?userId=${userId}`,
    imageUrl: targetUser?.avatar,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // 从路由参数中获取用户信息
        const userInfoFromParams = router.params;


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

          // 如果API调用失败，保持默认值0
        }

        // 获取关注状态
        if (isLoggedIn && userId) {
          try {
            const statusResponse = await getActionStatus(userId, 'user', 'follow');
            setIsFollowing(statusResponse.data.is_active);
          } catch (error: any) {


            // 特别处理422错误（OpenAPI文档target_id类型定义错误）
            if (error?.statusCode === 422) {

              // 暂时使用默认值，等待后端修复OpenAPI文档
            }

            setIsFollowing(false);
          }
        }
      } catch (error) {

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

  useEffect(() => {
    if (userId) {
      // 重新获取用户信息
      // console.log('重新获取用户信息', userId)
      if (currentUserId && userId === currentUserId) {
        // 查看自己的资料，使用当前用户信息
        dispatch(fetchCurrentUser());
      } else {
        // 查看其他用户的资料，获取指定用户信息
        dispatch(fetchUserProfile(userId));
      }
    }
  }, [userId, currentUserId, dispatch]);

  const handleFollow = async () => {
    if (!isLoggedIn || !userId) {
      Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
      return;
    }

    try {
      // 调用关注API
      const response = await followAction({
        target_user_id: userId,
      });

      if (response.code === 0 && response.data) {
        const { is_active } = response.data;

        setIsFollowing(is_active);

        // 如果操作成功且状态变为激活（关注），创建通知
        if (is_active) {


          // 获取当前用户信息
          const currentUser = (window as any).g_app?.$app?.globalData?.userInfo ||
            JSON.parse(Taro.getStorageSync('userInfo') || '{}');

          BBSNotificationHelper.handleFollowNotification({
            targetUserId: userId,
            currentUserId: currentUser?.id || '',
            currentUserNickname: currentUser?.nickname || currentUser?.name || '用户',
            isFollowing: is_active
          }).then(() => {

          }).catch((_error) => {

          });
        } else {

        }

        // 重新获取真实的粉丝数量
        try {
          const newFollowersCount = await getUserFollowersCount(userId);
          setTargetUser(prev => ({
            ...prev,
            follower_count: newFollowersCount
          }));
        } catch (error) {

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
        if (userId) {
          dispatch(fetchUserProfile(userId));
        }
      }
    } catch (error) {
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  };

  if (loading) {
    return (
      <View className={styles.container}>
        <CustomHeader title='用户资料' />
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!targetUser) {
    return (
      <View className={styles.container}>
        <CustomHeader title='用户资料' />
        <View className={styles.error}>
          <Text>用户不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <CustomHeader title='用户资料' />

      <View className={styles.content}>
        <AuthorInfo
          userId={targetUser.id}
          mode='expanded'
          showStats
          showFollowButton
          showBio
          showLevel
        />

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

        {/* 保留原有的关注逻辑，但使用 ActionBar 统一样式 */}
        <ActionBar
          targetId={userId}
          targetType='user'
          buttons={[
            {
              type: 'custom',
              icon: isFollowing ? '/assets/check-square.svg' : '/assets/plus.svg',
              text: isFollowing ? '已关注' : '关注',
              onClick: handleFollow,
            },
            {
              type: 'share',
              icon: '/assets/share.svg',
            }
          ]}
          className={styles.actions}
          initialStates={{
            'custom-0': { isActive: isFollowing, count: 0 },
            'share-1': { isActive: false, count: 0 }
          }}
        />
      </View>
    </View>
  );
};

export default UserDetail;
