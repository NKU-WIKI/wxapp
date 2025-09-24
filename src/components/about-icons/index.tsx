import React from 'react'

import { View, Image } from '@tarojs/components'


import styles from './index.module.scss'

interface IconProps {
  type: 'globe' | 'email' | 'github' | 'arrow-right' | 'pen-tool' | 'x'
  size?: number
  color?: string
  onClick?: () => void
  className?: string
  e?: any // Keep for compatibility if needed
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
        return require('../../assets/globe.svg')
      case 'email':
        return require('../../assets/message.svg')
      case 'github':
        return require('../../assets/github.svg')
      case 'arrow-right':
        return require('../../assets/arrow-right.svg')
      case 'pen-tool':
        return require('../../assets/pen-tool.svg')
      case 'x':
        return require('../../assets/x.png')
      default:
        return ''
    }
  }

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
        mode="aspectFit"
      />
    </View>
  )
}

export default AboutIcon
