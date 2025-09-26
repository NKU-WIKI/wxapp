import React from 'react';
import { View, Image } from '@tarojs/components';
import styles from './index.module.scss';
import globeIcon from '../../assets/globe.svg';
import messageIcon from '../../assets/message.svg';
import githubIcon from '../../assets/github.svg';
import arrowRightIcon from '../../assets/arrow-right.svg';
import penToolIcon from '../../assets/pen-tool.svg';
import xIcon from '../../assets/x.png';

interface IconProps {
  type: 'globe' | 'email' | 'github' | 'arrow-right' | 'pen-tool' | 'x';
  size?: number;
  color?: string;
  onClick?: () => void;
  className?: string;
}

const AboutIcon: React.FC<IconProps> = ({
  type,
  size = 20,
  color = '#000000',
  onClick,
  className,
}) => {
  const getIconSrc = () => {
    switch (type) {
      case 'globe':
        return globeIcon;
      case 'email':
        return messageIcon;
      case 'github':
        return githubIcon;
      case 'arrow-right':
        return arrowRightIcon;
      case 'pen-tool':
        return penToolIcon;
      case 'x':
        return xIcon;
      default:
        return '';
    }
  };

  return (
    <View
      className={`${styles.icon} ${className || ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={onClick}
    >
      <Image
        src={getIconSrc()}
        style={{
          width: '100%',
          height: '100%',
          filter:
            color === '#5743dd'
              ? 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(1352%) hue-rotate(235deg) brightness(91%) contrast(101%)'
              : 'none',
        }}
        mode='aspectFit'
      />
    </View>
  );
};

export default AboutIcon;
