import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/userSlice';
import styles from './index.module.scss';
import CustomHeader from '@/components/custom-header';

// 图标导入
import defaultAvatar from '@/assets/profile.png'; // 默认头像
import draftIcon from '@/assets/draft.png';
import commentIcon from '@/assets/comment.png';
import starIcon from '@/assets/star.png';
import shareIcon from '@/assets/share.svg';
import settingsIcon from '@/assets/settings.png';
import rightArrowIcon from '@/assets/arrow-right.png';

// 未登录提示组件
const LoginPrompt = () => {
  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  return (
    <View className={styles.loginPromptContainer}>
      <View className={styles.promptCard}>
        <View className={styles.userInfo}>
          <Image src={defaultAvatar} className={styles.avatar} />
          <View className={styles.infoText}>
            <Text className={styles.mainText}>登录后体验更多功能</Text>
            <Text className={styles.subText}>登录后可以发帖、评论、收藏等</Text>
          </View>
        </View>
        <View className={styles.actions}>
          <View className={styles.actionItem}><Image src={draftIcon} className={styles.actionIcon} /><Text>发帖</Text></View>
          <View className={styles.actionItem}><Image src={commentIcon} className={styles.actionIcon} /><Text>评论</Text></View>
          <View className={styles.actionItem}><Image src={starIcon} className={styles.actionIcon} /><Text>收藏</Text></View>
          <View className={styles.actionItem}><Image src={shareIcon} className={styles.actionIcon} /><Text>分享</Text></View>
        </View>
        <Button className={styles.loginButton} onClick={handleLogin}>
          去登陆
        </Button>
      </View>
    </View>
  );
};


const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);

  if (!isLoggedIn) {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="我的" />
        <LoginPrompt />
      </View>
    );
  }

  // 已登录用户显示的内容
  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="我的" />
      <View className={styles.profileCard}>
         {/* ... 这里是已登录用户的个人资料 ... */}
         <Image src={userInfo?.avatar || defaultAvatar} className={styles.loggedInAvatar} />
         <Text>{userInfo?.nickname || '用户'}</Text>
      </View>
      {/* ... 其他已登录后的菜单 ... */}
    </View>
  );
};

export default Profile;
