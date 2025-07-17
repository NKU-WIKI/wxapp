import { useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, Button, ScrollView } from "@tarojs/components";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { logout } from "@/store/slices/userSlice";
import styles from "./index.module.scss";
import CustomHeader from "@/components/custom-header";
import ProfileSummary from "./components/ProfileSummary";
import SettingsList from "./components/SettingsList";

// 图标导入
import defaultAvatar from "@/assets/profile.png"; // 默认头像
import likeIcon from "@/assets/heart.svg";
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star.svg";
import shareIcon from "@/assets/share.svg";
import settingsIcon from "@/assets/settings.svg";
import rightArrowIcon from "@/assets/arrow-right.svg";

// 未登录提示组件
const LoginPrompt = () => {
  const handleLogin = () => {
    Taro.navigateTo({ url: "/pages/login/index" });
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
          <View className={styles.actionItem}>
            <Image src={likeIcon} className={styles.actionIcon} />
            <Text>获赞</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={commentIcon} className={styles.actionIcon} />
            <Text>评论</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={starIcon} className={styles.actionIcon} />
            <Text>发帖</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={shareIcon} className={styles.actionIcon} />
            <Text>分享</Text>
          </View>
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
  const { isLoggedIn, userInfo } = useSelector(
    (state: RootState) => state.user
  );

  if (!isLoggedIn || !userInfo) {
    // also check for userInfo
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="我的" />
        <LoginPrompt />
      </View>
    );
  }

  // Logged-in user view
  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="个人中心" />
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ScrollView scrollY className={styles.scrollView}>
          <ProfileSummary userInfo={userInfo} />
          <SettingsList />
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;
