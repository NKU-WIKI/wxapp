import React, { useState, useCallback, useEffect } from 'react';
import { View } from "@tarojs/components";
import { useSelector } from 'react-redux';
import ActionButton, { ActionButtonProps } from '@/components/action-button';
import { toggleAction } from '@/services/api/action';
import { marketplaceApi } from '@/services/api/marketplace';
import { RootState } from '@/store';
import Taro from '@tarojs/taro';
import classnames from "classnames";
import styles from './index.module.scss';

export interface ActionButtonConfig {
  /**
   * 按钮类型
   */
  type: 'like' | 'favorite' | 'follow' | 'share' | 'comment' | 'custom';
  /**
   * 按钮图标（未激活状态）
   */
  icon: string;
  /**
   * 按钮图标（激活状态）
   */
  activeIcon?: string;
  /**
   * 自定义文本（仅type='custom'时有效）
   */
  text?: string;
  /**
   * 自定义点击处理（仅type='custom'时有效）
   */
  onClick?: () => void;
}

export interface ActionBarProps {
  /**
   * 按钮配置数组
   */
  buttons: ActionButtonConfig[];
  /**
   * 自定义容器样式类名
   */
  className?: string;
  /**
   * 目标对象ID（用于action/toggle操作）
   */
  targetId: string;
  /**
   * 目标对象类型（用于action/toggle操作）
   */
  targetType: 'post' | 'comment' | 'user' | 'listing' | 'note' | 'activity' | 'errand';
  /**
   * 初始状态配置（可选，用于初始化按钮状态）
   */
  initialStates?: Record<string, { isActive: boolean; count: number }>;
  /**
   * 状态变化回调
   */
  onStateChange?: (_type: string, _isActive: boolean, _count: number) => void;
}

/**
 * 通用操作栏组件，用于水平排列一组操作按钮
 * @param {ActionBarProps} props
 * @returns {React.ReactNode}
 */
const ActionBar: React.FC<ActionBarProps> = ({
  buttons,
  className,
  targetId,
  targetType,
  initialStates = {},
  onStateChange
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [localStates, setLocalStates] = useState<Record<string, { isActive: boolean; count: number }>>(initialStates);
  const isLoggedIn = useSelector((state: RootState) => !!(state.user.user && state.user.token));

  // 初始化本地状态（如果还没有初始化）
  useEffect(() => {
    setLocalStates(prev => {
      const newStates = { ...prev };
      buttons.forEach((button, index) => {
        const key = `${button.type}-${index}`;
        if (!newStates[key]) {
          // 使用初始状态，如果没有则默认为未激活状态
          newStates[key] = initialStates[key] || { isActive: false, count: 0 };
        }
      });
      return newStates;
    });
  }, [buttons, initialStates]);

  // 登录检查函数
  const checkLogin = useCallback(async (): Promise<boolean> => {
    if (isLoggedIn) {
      return true;
    }

    return new Promise((resolve) => {
      Taro.showModal({
        title: '提示',
        content: '此功能需要登录后才能使用，是否前往登录？',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            Taro.navigateTo({
              url: '/pages/subpackage-profile/login/index',
              fail: () => {
                // 如果navigateTo失败，尝试使用redirectTo
                Taro.redirectTo({
                  url: '/pages/subpackage-profile/login/index'
                });
              }
            });
          }
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }, [isLoggedIn]);

  // 处理评论功能
  const handleComment = useCallback((buttonIndex: number) => {
    const key = `comment-${buttonIndex}`;

    // 切换评论状态（表示用户正在评论或已评论）
    setLocalStates(prev => {
      const currentState = prev[key] || { isActive: false, count: 0 };
      return {
        ...prev,
        [key]: {
          ...currentState,
          isActive: !currentState.isActive // 切换激活状态
        }
      };
    });

    // 调用外部回调，通知需要聚焦到评论区
    onStateChange?.('comment', true, 0);
  }, [onStateChange]);

  // 处理按钮点击
  const handleButtonClick = useCallback(async (button: ActionButtonConfig, index: number) => {
    const key = `${button.type}-${index}`;

    // 如果正在加载，忽略点击
    if (loadingStates[key]) {
      return;
    }

    if (button.type === 'custom' || button.type === 'share') {
      // 自定义按钮和分享按钮，直接调用外部处理函数（分享按钮通过 openType 实现，此处可用于附加逻辑）
      button.onClick?.();
      return;
    }

    if (button.type === 'comment') {
      // 评论按钮，聚焦到评论区
      handleComment(index);
      return;
    }

    // 对于点赞和收藏，需要先检查登录状态
    if (button.type === 'like' || button.type === 'favorite') {
      const isLogged = await checkLogin();
      if (!isLogged) {
        return; // 未登录，不继续执行
      }
    }

    // 开始加载状态
    setLoadingStates(prev => ({ ...prev, [key]: true }));

    try {
      let response;

      // 根据操作类型调用相应的API
      if (targetType === 'listing' && button.type === 'favorite') {
        response = await marketplaceApi.toggleFavorite(targetId);
      } else {
        response = await toggleAction({
          target_id: targetId,
          target_type: targetType as any,
          action_type: button.type as any,
          active: !localStates[key]?.isActive
        });
      }

      const isActive = response?.data?.is_active ?? !localStates[key]?.isActive;
      const count = response?.data?.count ?? localStates[key]?.count ?? 0;


      setLocalStates(prev => ({
        ...prev,
        [key]: { isActive, count }
      }));

      // 调用外部回调
      onStateChange?.(button.type, isActive, count);

    } catch (error) {
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, [targetId, targetType, localStates, loadingStates, onStateChange, handleComment, checkLogin]);

  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <View className={classnames(styles.actionBar, className)}>
      {buttons.map((button, index) => {
        const key = `${button.type}-${index}`;
        const isLoading = loadingStates[key];
        const localState = localStates[key];

        // 使用本地状态或按钮配置中的文本
        const currentIsActive = button.type === 'custom' || button.type === 'share'
          ? false
          : button.type === 'comment'
          ? (localState?.isActive ?? false)
          : (localState?.isActive ?? false)
         
        const currentText = button.type === 'custom'
          ? (button.text || '')
          : (localState?.count?.toString() ?? '0');

        const actionButtonProps: ActionButtonProps = {
          icon: button.icon,
          activeIcon: button.activeIcon || button.icon,
          text: currentText,
          isActive: currentIsActive,
          onClick: () => handleButtonClick(button, index),
          className: isLoading ? 'loading' : undefined,
          openType: button.type === 'share' ? 'share' : undefined
        };

        return (
          <ActionButton key={key} {...actionButtonProps} />
        );
      })}
    </View>
  );
};

export default ActionBar;
