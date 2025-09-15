import React, { useEffect, useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import styles from "./index.module.scss";

// 图标路径常量
const backIcon = "/assets/arrow-left.svg";
const logo = "/assets/logo.png";
const notificationIcon = "/assets/bell.svg";

interface NavStyle {
  navBarHeight: number;
  navBarPaddingTop: number;
  navBarContentHeight: number;
  navBarContentTop: number;
  menuButtonRightGap: number;
}

interface CustomHeaderProps {
  title?: string;
  hideBack?: boolean;
  showNotificationIcon?: boolean;
  showWikiButton?: boolean;
  renderRight?: React.ReactNode; // Add rightContent prop
  background?: string;
  leftIcon?: string;
  onLeftClick?: () => void;
}

export function useCustomHeaderHeight(defaultHeight = 88) {
  const [height, setHeight] = useState(defaultHeight);
  useEffect(() => {
    try {
      const windowInfo = Taro.getWindowInfo();
      const menuButtonInfo = Taro.getMenuButtonBoundingClientRect();
      
      // 使用和CustomHeader完全相同的计算逻辑
      if (windowInfo && menuButtonInfo) {
        const statusBarHeight = windowInfo.statusBarHeight || 0;
        const menuButtonTop = menuButtonInfo.top;
        const menuButtonHeight = menuButtonInfo.height;

        // 导航栏内容区高度
        const navBarContentHeight = menuButtonHeight;
        // 导航栏内容区上边界 = 胶囊上边界
        const navBarContentTop = menuButtonTop;
        // 导航栏总高度 = 状态栏高度 + 内容区高度 + (内容区上边界 - 状态栏高度) * 2 (即上下边距)
        const navBarHeight =
          statusBarHeight +
          navBarContentHeight +
          (navBarContentTop - statusBarHeight) * 2;
        
        if (navBarHeight > 0 && navBarHeight < 300) { // 合理范围检查
          setHeight(navBarHeight);
          return;
        }
      }
      
      // 如果数据无效，使用默认值
      setHeight(defaultHeight);
    } catch {
      setHeight(defaultHeight);
    }
  }, [defaultHeight]);
  return height;
}

const CustomHeader = ({
  title,
  hideBack = false,
  showNotificationIcon = false,
  showWikiButton = false,
  renderRight, // Destructure rightContent
  background = "#FFFFFF",
  leftIcon,
  onLeftClick,
}: CustomHeaderProps) => {
  const [navStyle, setNavStyle] = React.useState<NavStyle>({
    navBarHeight: 88, // 默认总高度
    navBarPaddingTop: 44, // 默认状态栏高度
    navBarContentHeight: 32, // 默认内容区高度
    navBarContentTop: 44, // 默认内容区上边界
    menuButtonRightGap: 10, // 默认右侧间距
  });

  React.useEffect(() => {
    try {
      const windowInfo = Taro.getWindowInfo();
      const menuButtonInfo = Taro.getMenuButtonBoundingClientRect();

      if (windowInfo && menuButtonInfo) {
        const statusBarHeight = windowInfo.statusBarHeight || 0;
        const menuButtonTop = menuButtonInfo.top;
        const menuButtonHeight = menuButtonInfo.height;

        // 导航栏内容区高度
        const navBarContentHeight = menuButtonHeight;
        // 导航栏内容区上边界 = 胶囊上边界
        const navBarContentTop = menuButtonTop;
        // 导航栏总高度 = 状态栏高度 + 内容区高度 + (内容区上边界 - 状态栏高度) * 2 (即上下边距)
        const navBarHeight =
          statusBarHeight +
          navBarContentHeight +
          (navBarContentTop - statusBarHeight) * 2;
        // 右侧安全间距
        const menuButtonRightGap =
          windowInfo.windowWidth - menuButtonInfo.right;

        setNavStyle({
          navBarHeight,
          navBarPaddingTop: statusBarHeight,
          navBarContentHeight,
          navBarContentTop,
          menuButtonRightGap,
        });
      }
    } catch {
      // 导航栏初始化失败，使用默认值
    }
  }, []);

  const handleBack = () => {
    if (Taro.getCurrentPages().length > 1) {
      Taro.navigateBack();
    }
  };

  const handleWikiClick = () => {
    Taro.navigateTo({ url: '/pages/subpackage-interactive/chat/index' });
  };

  const handleNotificationClick = () => {
    Taro.navigateTo({ url: "/pages/subpackage-interactive/notification/index" });
  };
  
  // 获取未读消息总数
  const unreadTotal = useSelector((state: RootState) => {
    const total = state.notification.unreadCounts.total || 0;
    console.log('🔔 [CustomHeader调试] 从Redux读取未读数量', {
      total,
      完整的unreadCounts: state.notification.unreadCounts,
      lastUpdated: state.notification.lastUpdated
    });
    return total;
  });

  // 整体容器，负责占位
  const placeholderStyle: React.CSSProperties = {
    height: `${navStyle.navBarHeight}px`,
  };

  // 导航栏本体，固定定位
  const navBarStyle: React.CSSProperties = {
    backgroundColor: background,
    height: `${navStyle.navBarHeight}px`,
    paddingTop: `${navStyle.navBarPaddingTop}px`,
  };

  // 导航栏内容区，真正放按钮和标题的地方
  const contentStyle: React.CSSProperties = {
    height: `${navStyle.navBarContentHeight}px`,
  };

  // 左侧图标容器统一样式
  const leftIconStyle: React.CSSProperties = {
    marginLeft: `${navStyle.menuButtonRightGap}px`,
  };

  return (
    <View className={styles.navBarPlaceholder} style={placeholderStyle}>
      <View className={styles.navBar} style={navBarStyle}>
        <View className={styles.navBarContent} style={contentStyle}>
          {/* 左侧区域 */}
          <View className={styles.left} style={leftIconStyle}>
            {leftIcon && (
              <View onClick={onLeftClick ? onLeftClick : handleBack} className={styles.iconWrapper}>
                <Image src={leftIcon} className={styles.backIcon} />
              </View>
            )}
            {!hideBack && (
              <View onClick={onLeftClick ? onLeftClick : handleBack} className={styles.iconWrapper}>
                <Image src={backIcon} className={styles.backIcon} />
              </View>
            )}
            {showWikiButton && (
              <View onClick={handleWikiClick} className={styles.wikiButton}>
                <Image src={logo} className={styles.wikiIcon} />
                <Text className={styles.wikiText}>Wiki</Text>
              </View>
            )}
            {showNotificationIcon && (
              <View onClick={handleNotificationClick} className={styles.notificationIconWrapper}>
                <Image src={notificationIcon} className={styles.notificationIcon} />
                {unreadTotal > 0 && (
                  <View className={styles.notificationBadge}>
                    <Text className={styles.badgeText}>
                      {unreadTotal > 99 ? '99+' : unreadTotal}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 中间标题 */}
          <View className={styles.center}>
            <Text className={styles.title}>{title || ''}</Text>
          </View>

          {/* 右侧区域 */}
          <View
            className={styles.right}
            style={{ marginRight: `${navStyle.menuButtonRightGap}px` }}
          >
            {renderRight}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CustomHeader;
