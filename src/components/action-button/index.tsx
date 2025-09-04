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
  disabled?: boolean;
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
  textClassName = '',
  disabled = false,
  actionType
}) => {
  // 根据激活状态选择图标
  const iconSrc = isActive && activeIcon ? activeIcon : icon;
  
  const handleClick = (e: ITouchEvent) => {
    if (disabled || !onClick) return;
    onClick(e);
  };

  // 根据actionType和isActive状态生成CSS类
  const getActionClass = () => {
    if (!isActive) return '';
    
    switch (actionType) {
      case 'like':
        return styles.liked;
      case 'favorite':
        return styles.favorited;
      case 'follow':
        return styles.active;
      default:
        return styles.active;
    }
  };
  
  return (
    <View 
      className={classnames(
        styles.actionButton, 
        className,
        { [styles.disabled]: disabled },
        getActionClass()
      )} 
      onClick={handleClick}
    >
      <Image 
        src={iconSrc} 
        className={classnames(styles.icon, iconClassName)} 
        style={{ 
          // 如果使用activeIcon，则不需要CSS滤镜
          filter: isActive && activeIcon ? 'none' : undefined 
        }}
      />
      {/* 只有在 text prop 被提供时才渲染 Text 组件 */}
      {text !== undefined && text !== null && (
        <Text className={classnames(styles.text, textClassName)}>{text}</Text>
      )}
    </View>
  );
};

export default ActionButton;
