import React from 'react';
import { View, Image } from '@tarojs/components';
import styles from './index.module.scss';

interface IconProps {
  type: 'globe' | 'email' | 'github' | 'arrow-right';
  size?: number;
  color?: string;
}

const AboutIcon: React.FC<IconProps> = ({ type, size = 20, color = '#000000' }) => {
  const getIconSrc = () => {
    switch (type) {
      case 'globe':
        return require('../../assets/globe.svg');
      case 'email':
        return require('../../assets/message.svg');
      case 'github':
        return require('../../assets/github.svg');
      case 'arrow-right':
        return require('../../assets/arrow-right.svg');
      default:
        return '';
    }
  };

  return (
    <View 
      className={styles.icon}
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <Image
        src={getIconSrc()}
        style={{
          width: '100%',
          height: '100%',
          filter: color === '#5743dd' ? 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(1352%) hue-rotate(235deg) brightness(91%) contrast(101%)' : 'none'
        }}
        mode="aspectFit"
      />
    </View>
  );
};

export default AboutIcon; 