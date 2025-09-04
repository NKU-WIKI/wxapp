import React, { useState, useCallback } from 'react';
import { View } from "@tarojs/components";
import ActionButton, { ActionButtonProps } from '@/components/action-button';
import { toggleAction } from '@/services/api/action';
import { marketplaceApi } from '@/services/api/marketplace';
import Taro from '@tarojs/taro';
import classnames from "classnames";
import styles from './index.module.scss';

export interface ActionBarProps {
  /**
   * 按钮配置数组
   */
  buttons: ActionButtonProps[];
  /**
   * 自定义容器样式类名
   */
  className?: string;
  /**
   * 目标对象ID（用于action/toggle操作）
   */
  targetId?: string;
  /**
   * 目标对象类型（用于action/toggle操作）
   */
  targetType?: 'post' | 'comment' | 'user' | 'listing';
  /**
   * 是否启用自动处理（使用action/toggle接口）
   */
  autoHandle?: boolean;
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
  autoHandle = false
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [buttonStates, setButtonStates] = useState<Record<string, { isActive: boolean; count?: number }>>({});

  // 处理自动操作点击
  const handleAutoAction = useCallback(async (
    actionType: string,
    _targetId: string,
    currentActive: boolean,
    buttonIndex: number,
    onActionClick?: (_actionType: string, _targetId: string, _currentActive: boolean) => Promise<{ isActive: boolean; count?: number }>
  ) => {
    if (!targetId || !targetType) {
      Taro.showToast({ title: '操作参数不完整', icon: 'none' });
      return;
    }

    const actionKey = `${actionType}-${buttonIndex}`;
    setLoadingStates(prev => ({ ...prev, [actionKey]: true }));

    try {
      let response;

      // 对于 listing 类型的收藏操作，使用专门的 marketplace API
      if (targetType === 'listing' && actionType === 'favorite') {
        response = await marketplaceApi.toggleFavorite(targetId);
      } else {
        // 其他操作使用通用 action/toggle 接口
        response = await toggleAction({
          target_id: targetId,
          target_type: targetType as any,
          action_type: actionType as any,
          active: !currentActive
        });
      }

      // 显示操作结果
      const actionText = actionType === 'favorite' ? '收藏' : actionType === 'like' ? '点赞' : '关注';
      Taro.showToast({
        title: currentActive ? `取消${actionText}` : `${actionText}成功`,
        icon: 'none'
      });

      // 更新本地状态
      const newState = {
        isActive: response?.is_active ?? !currentActive,
        count: response?.count
      };
      setButtonStates(prev => ({
        ...prev,
        [actionType]: newState
      }));

      // 调用回调函数，传递结果给父组件
      if (onActionClick) {
        return await onActionClick(actionType, targetId, currentActive);
      }

      return newState;
    } catch (_error) {
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' });
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [targetId, targetType]);

  // 处理按钮点击
  const handleButtonClick = useCallback(async (buttonProps: ActionButtonProps, index: number) => {
    if (loadingStates[`${buttonProps.actionType}-${index}`]) {
      return; // 防止重复点击
    }

    if (autoHandle && buttonProps.actionType && targetId && targetType) {
      // 使用自动处理逻辑
      await handleAutoAction(
        buttonProps.actionType,
        targetId,
        buttonProps.isActive || false,
        index,
        buttonProps.onActionClick
      );
    } else if (buttonProps.onClick) {
      // 使用自定义点击处理
      buttonProps.onClick({} as any);
    }
  }, [autoHandle, targetId, targetType, handleAutoAction, loadingStates]);

  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <View className={classnames(styles.actionBar, className)}>
      {buttons.map((buttonProps, index) => {
        const isLoading = loadingStates[`${buttonProps.actionType}-${index}`];
        const buttonState = buttonProps.actionType ? buttonStates[buttonProps.actionType] : null;

        // 使用本地状态或原始状态
        const currentIsActive = buttonState ? buttonState.isActive : buttonProps.isActive;
        const currentText = buttonState?.count !== undefined
          ? buttonState.count.toString()
          : (typeof buttonProps.text === 'number' ? buttonProps.text.toString() : buttonProps.text);

        const enhancedProps = {
          ...buttonProps,
          text: currentText,
          isActive: currentIsActive,
          onClick: () => handleButtonClick(buttonProps, index),
          className: classnames(buttonProps.className, {
            'loading': isLoading
          })
        };

        return (
          <ActionButton key={index} {...enhancedProps} />
        );
      })}
    </View>
  );
};

export default ActionBar;
