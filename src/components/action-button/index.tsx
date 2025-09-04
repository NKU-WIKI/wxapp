import React from 'react';
import { View, Text, Image, ITouchEvent } from "@tarojs/components";
import classnames from "classnames";
import styles from './index.module.scss';

export interface ActionButtonProps {
  icon: string;
  activeIcon?: string;
  text?: string | number;
  onClick?: (_e: ITouchEvent) => void;
  isActive?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  /**
   * 操作类型（用于自动处理action/toggle）
   */
  actionType?: 'like' | 'favorite' | 'follow';
  /**
   * 自定义点击处理函数（优先级高于自动处理）
   */
  onActionClick?: (actionType: string, targetId: string, currentActive: boolean) => Promise<{ isActive: boolean; count?: number }>;
}

/**
 * 通用操作按钮组件 (如图标+文字)
 * @param {ActionButtonProps} props
 * @returns {React.ReactNode}
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  activeIcon,
  text,
  onClick,
  isActive = false,
  className = '',
  iconClassName = '',
  textClassName = ''
}) => {
  const iconSrc = isActive && activeIcon ? activeIcon : icon;
  
  return (
    <View className={classnames(styles.actionButton, className)} onClick={onClick}>
      <Image src={iconSrc} className={classnames(styles.icon, iconClassName)} />
      {/* 只有在 text prop 被提供时才渲染 Text 组件 */}
      {text !== undefined && text !== null && (
        <Text className={classnames(styles.text, textClassName)}>{text}</Text>
      )}
    </View>
  );
};

export default ActionButton;
