import { View, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { FC, useEffect, useState, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { useTabBarSync, tabBarSyncManager, TAB_BAR_PAGES } from "../utils/tabBarSync";

// 引入本地图标 - 使用字符串路径
const homeIcon = "/assets/home.png";
const homeActiveIcon = "/assets/home-active.png";
const exploreIcon = "/assets/explore.png";
const exploreActiveIcon = "/assets/explore-active.png";
const discoverIcon = "/assets/discover.png";
const discoverActiveIcon = "/assets/discover-active.png";
const profileIcon = "/assets/profile.png";
const profileActiveIcon = "/assets/profile-active.png";
const plusIcon = "/assets/x.png"; // 发布图标，使用同一图标作为选中和未选中状态

const CustomTabBar: FC = () => {
  const [selected, setSelected] = useState(0);

  const list = useMemo(() => [
    { pagePath: "/pages/home/index", text: "首页", iconPath: homeIcon, selectedIconPath: homeActiveIcon },
    { pagePath: "/pages/explore/index", text: "探索", iconPath: exploreIcon, selectedIconPath: exploreActiveIcon },
    { pagePath: "/pages/subpackage-interactive/publish/index", text: "发布", iconPath: plusIcon, selectedIconPath: plusIcon, isPublish: true },
    { pagePath: "/pages/discover/index", text: "发现", iconPath: discoverIcon, selectedIconPath: discoverActiveIcon },
    { pagePath: "/pages/profile/index", text: "我的", iconPath: profileIcon, selectedIconPath: profileActiveIcon },
  ], []);

  const handleSync = useCallback((syncIndex: number) => {
    const pagePath = TAB_BAR_PAGES[syncIndex];
    if (pagePath) {
      const uiIndex = list.findIndex(item => item.pagePath === pagePath);
      if (uiIndex > -1) {
        setSelected(uiIndex);
      }
    }
  }, [list]);

  const tabBarSync = useMemo(() => useTabBarSync(handleSync), [handleSync]);

  const switchTab = (uiIndex: number, url: string) => {
    const item = list[uiIndex];
    if (item.isPublish) {
      Taro.navigateTo({ url });
    } else {
      const syncIndex = TAB_BAR_PAGES.indexOf(item.pagePath);
      if (syncIndex > -1) {
        tabBarSyncManager.setSelectedIndex(syncIndex);
      }
      Taro.switchTab({ url });
    }
  };

  useEffect(() => {
    tabBarSync.subscribe();
    return () => {
      tabBarSync.unsubscribe();
    };
  }, [tabBarSync]);

  return (
    <View className={styles.tabBar}>
      {list.map((item, index) => (
        <View
          key={index}
          className={styles.tabBarItem}
          onClick={() => switchTab(index, item.pagePath)}
        >
          {item.isPublish ? (
            <View className={styles.publishButton}>
              <Image src={item.iconPath} className={styles.publishIcon} />
            </View>
          ) : (
            <>
              <Image
                src={selected === index ? item.selectedIconPath : item.iconPath}
                className={styles.icon}
              />
              <View
                className={`${styles.text} ${
                  selected === index ? styles.selected : ""
                }`}
              >
                {item.text}
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
};

export default CustomTabBar;
