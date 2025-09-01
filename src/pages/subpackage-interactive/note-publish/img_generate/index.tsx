import React, { useState } from 'react'
import { View, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomHeader from '@/components/custom-header'
import styles from './index.module.scss'

const ImgGenerate: React.FC = () => {
  const [inputText, setInputText] = useState('')

  // 关闭页面
  const handleClose = () => {
    Taro.navigateBack()
  }

  // 下一步操作
  const handleNext = () => {
    if (!inputText.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }
    
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/note-publish/img_type_choose/index?text=${encodeURIComponent(inputText)}`
    })
  }

  // 输入内容变化
  const handleInputChange = (e: any) => {
    setInputText(e.detail.value)
  }

  return (
    <View className={styles.container}>
      {/* 自定义导航栏 */}
      <CustomHeader
        title='写笔记'
        onLeftClick={handleClose}
      />
      
      {/* 页面主体内容 */}
      <View className={styles.content}>
        {/* 输入卡片 */}
        <View className={styles.card}>
          <View className={styles.quoteIcon}>&quot;</View>
          {!inputText && <View className={styles.title}>写笔记</View>}
          <Textarea
            className={styles.inputArea}
            placeholder='写点什么或提个问题...'
            value={inputText}
            onInput={handleInputChange}
            maxlength={500}
            autoHeight
          />
        </View>
        {/* 这里应当新增一个从相册选择的按钮 */}

        {/* 底部按钮 */}
        <Button 
          className={styles.bottomBtn}
          onClick={handleNext}
        >
          下一步
        </Button>
      </View>
    </View>
  )
}

export default ImgGenerate
