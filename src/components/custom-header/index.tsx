import { View, Text, Image } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";
import React from 'react';
import backIcon from "../../assets/back.png";
import notificationIcon from '../../assets/notification.png';

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
  background?: string;
}

const CustomHeader = ({ 
  title, 
  hideBack = false, 
  showNotificationIcon = false,
  background = '#FFFFFF' 
}: CustomHeaderProps) => {
  const [navStyle, setNavStyle] = useState<NavStyle>({
    navBarHeight: 88, // 默认总高度
    navBarPaddingTop: 44, // 默认状态栏高度
    navBarContentHeight: 32, // 默认内容区高度
    navBarContentTop: 44, // 默认内容区上边界
    menuButtonRightGap: 10, // 默认右侧间距
  });

  useEffect(() => {
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
        const navBarHeight = statusBarHeight + navBarContentHeight + (navBarContentTop - statusBarHeight) * 2;
        // 右侧安全间距
        const menuButtonRightGap = windowInfo.windowWidth - menuButtonInfo.right;

        setNavStyle({
          navBarHeight,
          navBarPaddingTop: statusBarHeight,
          navBarContentHeight,
          navBarContentTop,
          menuButtonRightGap,
        });
      }
    } catch (e) {
      console.error("Failed to get navigation bar style, using defaults.", e);
    }
  }, []);

  const handleBack = () => {
    if (Taro.getCurrentPages().length > 1) {
      Taro.navigateBack();
    }
  };

  const handleNotificationClick = () => {
    Taro.navigateTo({ url: "/pages/notifications/index" });
  };

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
          <View className={styles.left}>
            {/* 当显示通知图标时，强制隐藏返回按钮 */}
            {!hideBack && !showNotificationIcon && (
              <View onClick={handleBack} style={leftIconStyle} className={styles.iconWrapper}>
                <Image src={backIcon} className={styles.backIcon} />
              </View>
            )}
            {showNotificationIcon && (
              <View onClick={handleNotificationClick} style={leftIconStyle} className={styles.iconWrapper}>
                <Image src={notificationIcon} className={styles.notificationIcon} />
              </View>
            )}
          </View>

          {/* 中间标题 */}
          <View className={styles.center}>
            {title && <Text className={styles.title}>{title}</Text>}
          </View>
          
          {/* 右侧为了平衡，留出与左侧等宽的距离 */}
          <View className={styles.right} style={{marginRight: `${navStyle.menuButtonRightGap}px`}} />
        </View>
      </View>
    </View>
  );
};

export default CustomHeader; 