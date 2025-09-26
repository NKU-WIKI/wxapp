import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';

/**
 * 自定义导航栏高度计算 Hook
 * @param defaultHeight 默认高度
 * @returns 计算出的导航栏高度
 */
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
          statusBarHeight + navBarContentHeight + (navBarContentTop - statusBarHeight) * 2;

        if (navBarHeight > 0 && navBarHeight < 300) {
          // 合理范围检查
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
