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
  disabled = false
}) => {
  const iconSrc = isActive && activeIcon ? activeIcon : icon;
  
  const handleClick = (e: ITouchEvent) => {
    if (disabled || !onClick) return;
    onClick(e);
  };
  
  return (
    <View 
      className={classnames(
        styles.actionButton, 
        className,
        { [styles.disabled]: disabled }
      )} 
      onClick={handleClick}
    >
      <Image src={iconSrc} className={classnames(styles.icon, iconClassName)} />
      {/* 只有在 text prop 被提供时才渲染 Text 组件 */}
      {text !== undefined && text !== null && (
        <Text className={classnames(styles.text, textClassName)}>{text}</Text>
      )}
    </View>
  );
};

export default ActionButton;
