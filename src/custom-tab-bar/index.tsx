import { View, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
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
const plusIcon = require("@/assets/plus.svg"); // 使用新的白色+号SVG图标

const CustomTabBar: FC = () => {
  const [selected, setSelected] = useState(0);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { checkAuth } = useAuthGuard();

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
      if (checkAuth()) {
        setShowSubMenu(true);
      }
    } else {
      const syncIndex = TAB_BAR_PAGES.indexOf(item.pagePath);
      if (syncIndex > -1) {
        tabBarSyncManager.setSelectedIndex(syncIndex);
      }
      Taro.switchTab({ url });
    }
  };

  const handleSubMenuClick = (type: 'post' | 'note') => {
    setShowSubMenu(false);
    if (type === 'post') {
      Taro.navigateTo({ url: '/pages/subpackage-interactive/publish/index' });
    } else if (type === 'note') {
      // 发布笔记功能
      Taro.navigateTo({ url: '/pages/subpackage-interactive/note-publish/img_generate/index' });
    }
  };

  const handleOverlayClick = () => {
    setShowSubMenu(false);
  };

  useEffect(() => {
    tabBarSync.subscribe();
    return () => {
      tabBarSync.unsubscribe();
    };
  }, [tabBarSync]);

  return (
    <>
      {/* 灰色滤镜遮罩 */}
      {showSubMenu && (
        <View className={styles.overlay} onClick={handleOverlayClick} />
      )}
      
      {/* 子菜单 */}
      {showSubMenu && (
        <View className={styles.subMenuContainer}>
          <View className={`${styles.subMenuItem} ${styles.postItem}`} onClick={() => handleSubMenuClick('post')}>
            <View className={styles.textContent}>
              <View className={styles.text}>发布帖子</View>
              <View className={styles.desc}>分享校园生活</View>
            </View>
            <View className={styles.icon}>🏫</View>
          </View>
          <View className={`${styles.subMenuItem} ${styles.noteItem}`} onClick={() => handleSubMenuClick('note')}>
            <View className={styles.textContent}>
              <View className={styles.text}>发布笔记</View>
              <View className={styles.desc}>共享知识与经验</View>
            </View>
            <View className={styles.icon}>📝</View>
          </View>
        </View>
      )}
      
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
    </>
  );
};

export default CustomTabBar;
