import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";
import { mockUser } from "./mock";
import settingsIcon from "../../assets/settings.png";
import arrowRightIcon from "../../assets/arrow-right.png";

export default function Profile() {
  const handleNavigateToEdit = () => {
    Taro.navigateTo({
      url: "/pages/edit-profile/index",
    });
  };

  const handleSettingClick = (settingName: string) => {
    if (settingName === "消息通知") {
      Taro.navigateTo({
        url: "/pages/notifications/index",
      });
    }
  };

  return (
    <View className={styles.profilePage}>
      <CustomHeader showNotificationIcon />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY className={styles.content}>
          {/* --- User Info --- */}
          <View className={styles.userInfoCard}>
            <Image src={mockUser.avatar} className={styles.avatar} />
            <View className={styles.userInfo}>
              <Text className={styles.nickname}>{mockUser.nickname}</Text>
              <Text className={styles.university}>{mockUser.university}</Text>
              <Text className={styles.bio}>{mockUser.bio}</Text>
            </View>
            <View className={styles.editButton} onClick={handleNavigateToEdit}>
              <Text className={styles.editButtonText}>编辑资料</Text>
            </View>
          </View>

          {/* --- Stats --- */}
          <View className={styles.statsCard}>
            {mockUser.stats.map((stat) => (
              <View key={stat.label} className={styles.statItem}>
                <Text className={styles.statValue}>{stat.value}</Text>
                <Text className={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* --- Actions --- */}
          <View className={styles.actionsCard}>
            {mockUser.actions.map((action) => (
              <View key={action.name} className={styles.actionItem}>
                <View className={styles.actionIconWrapper}>
                  <Image src={action.icon} className={styles.actionIcon} />
                </View>
                <Text className={styles.actionName}>{action.name}</Text>
              </View>
            ))}
          </View>

          {/* --- Settings List --- */}
          <View className={styles.settingsCard}>
            {mockUser.settings.map((setting) => (
              <View
                key={setting.name}
                className={styles.settingItem}
                onClick={() => handleSettingClick(setting.name)}
              >
                <Image src={setting.icon} className={styles.settingIcon} />
                <Text className={styles.settingName}>{setting.name}</Text>
                <Image src={arrowRightIcon} className={styles.arrowIcon} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
