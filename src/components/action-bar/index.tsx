import React from 'react';
import { View } from "@tarojs/components";
import ActionButton, { ActionButtonProps } from '@/components/action-button';
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
}

/**
 * 通用操作栏组件，用于水平排列一组操作按钮
 * @param {ActionBarProps} props
 * @returns {React.ReactNode}
 */
const ActionBar: React.FC<ActionBarProps> = ({ buttons, className }) => {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <View className={classnames(styles.actionBar, className)}>
      {buttons.map((buttonProps, index) => (
        <ActionButton key={index} {...buttonProps} />
      ))}
    </View>
  );
};

export default ActionBar;
