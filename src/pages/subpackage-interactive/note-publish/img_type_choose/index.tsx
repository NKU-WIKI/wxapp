import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomHeader from '@/components/custom-header'
import styles from './index.module.scss'

// 颜色选项配置
interface ColorOption {
  id: string
  name: string
  bgColor: string
  value: string
}

const colorOptions: ColorOption[] = [
  { id: '1', name: '米色', bgColor: '#FFFDF7', value: '#FFFDF7' },
  { id: '2', name: '白色', bgColor: '#FFFFFF', value: '#FFFFFF' },
  { id: '3', name: '浅灰', bgColor: '#F5F5F5', value: '#F5F5F5' },
  { id: '4', name: '浅蓝', bgColor: '#EFF6FF', value: '#EFF6FF' },
  { id: '5', name: '浅粉', bgColor: '#FDF2F8', value: '#FDF2F8' },
  { id: '6', name: '浅绿', bgColor: '#F0FDF4', value: '#F0FDF4' },
  { id: '7', name: '浅黄', bgColor: '#FEFCE8', value: '#FEFCE8' }
]

const ImgTypeChoose: React.FC = () => {
  const [selectedColorId, setSelectedColorId] = useState('1') // 默认选择米色
  const [cardContent, setCardContent] = useState('') // 卡片内容

  useEffect(() => {
    // 获取页面参数
    const instance = Taro.getCurrentInstance()
    const { text } = instance.router?.params || {}
    if (text) {
      setCardContent(decodeURIComponent(text))
    }
  }, [])

  // 获取当前选中的颜色
  const selectedColor = colorOptions.find(color => color.id === selectedColorId)

  // 绘制预览卡片
  const drawPreviewCard = () => {
    const ctx = Taro.createCanvasContext('previewCanvas')
    
    // 设置画布尺寸 (4:5 比例，预览尺寸)
    const canvasWidth = 280
    const canvasHeight = 350
    
    // 绘制背景
    ctx.setFillStyle(selectedColor?.bgColor || '#FFFFFF')
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 绘制圆角矩形背景
    const radius = 28
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(canvasWidth - radius, 0)
    ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius)
    ctx.lineTo(canvasWidth, canvasHeight - radius)
    ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight)
    ctx.lineTo(radius, canvasHeight)
    ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.setFillStyle(selectedColor?.bgColor || '#FFFFFF')
    ctx.fill()
    
    // 绘制引号
    ctx.setFillStyle('#eeeeee')
    ctx.setFontSize(52)
    ctx.fillText('"', 42, 88)
    
    // 绘制文字内容
    ctx.setFillStyle('#333333')
    ctx.setFontSize(21)
    
    // 文字换行处理
    const maxWidth = canvasWidth - 84 // 左右各42px边距
    const lineHeight = 33
    const words = cardContent.split('')
    let line = ''
    let y = 130
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 42, y)
        line = words[i]
        y += lineHeight
      } else {
        line = testLine
      }
    }
    
    if (line !== '') {
      ctx.fillText(line, 42, y)
    }
    
    ctx.draw()
  }

  // 当内容或颜色改变时重新绘制预览
  useEffect(() => {
    if (cardContent) {
      setTimeout(() => {
        drawPreviewCard()
      }, 100)
    }
  }, [cardContent, selectedColorId])

  // 处理返回按钮点击
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 处理颜色选择
  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId)
  }

  // 将卡片转换为图片
  const generateCardImage = async (): Promise<string | null> => {
    try {
      // 先重新绘制一次确保Canvas内容是最新的
      const ctx = Taro.createCanvasContext('previewCanvas')
      
      // 设置画布尺寸 (4:5 比例，预览尺寸)
      const canvasWidth = 280
      const canvasHeight = 350
      
      // 绘制背景
      ctx.setFillStyle(selectedColor?.bgColor || '#FFFFFF')
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      // 绘制圆角矩形背景
      const radius = 28
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(canvasWidth - radius, 0)
      ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius)
      ctx.lineTo(canvasWidth, canvasHeight - radius)
      ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight)
      ctx.lineTo(radius, canvasHeight)
      ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.setFillStyle(selectedColor?.bgColor || '#FFFFFF')
      ctx.fill()
      
      // 绘制引号
      ctx.setFillStyle('#eeeeee')
      ctx.setFontSize(52)
      ctx.fillText('"', 42, 88)
      
      // 绘制文字内容
      ctx.setFillStyle('#333333')
      ctx.setFontSize(21)
      
      // 文字换行处理
      const maxWidth = canvasWidth - 84 // 左右各42px边距
      const lineHeight = 33
      const words = cardContent.split('')
      let line = ''
      let y = 130
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 42, y)
          line = words[i]
          y += lineHeight
        } else {
          line = testLine
        }
      }
      
      if (line !== '') {
        ctx.fillText(line, 42, y)
      }
      
      // 等待绘制完成后再导出图片
      return new Promise((resolve, reject) => {
        ctx.draw(false, () => {
          // 绘制完成后导出图片
          setTimeout(() => {
            Taro.canvasToTempFilePath({
              canvasId: 'previewCanvas',
              success: (res) => {
                console.log('1.1图片生成成功:', res.tempFilePath)
                
                // 修正临时文件路径格式
                let correctedPath = res.tempFilePath
                if (correctedPath.startsWith('http://tmp/')) {
                  correctedPath = correctedPath.replace('http://tmp/', 'http://127.0.0.1:32968/__tmp__/')
                }
                
                console.log('1.2修正后的图片路径:', correctedPath)
                
                // 跳转到发布页面并传递图片路径
                Taro.navigateTo({
                  url: `/pages/subpackage-interactive/note-publish/note_publish/index?cardImage=${encodeURIComponent(correctedPath)}&cardText=${encodeURIComponent(cardContent)}`
                })
                resolve(correctedPath)
              },
              fail: (err) => {
                console.error('图片生成失败:', err)
                Taro.showToast({
                  title: '图片生成失败',
                  icon: 'none'
                })
                reject(err)
              }
            })
          }, 100) // 等待100ms确保绘制完成
        })
      })
    } catch (error) {
      console.error('生成图片时出错:', error)
      Taro.showToast({
        title: '生成图片失败',
        icon: 'none'
      })
      return null
    }
  }

  // 处理下一步按钮点击
  const handleNext = async () => {
    if (!cardContent.trim()) {
      Taro.showToast({
        title: '请输入卡片内容',
        icon: 'none'
      })
      return
    }
    
    console.log('选中的颜色:', selectedColor)
    await generateCardImage()
  }

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 自定义导航栏 */}
      <CustomHeader
        title="预览"
        hideBack={false}
      />
      
      {/* 页面主体内容 */}
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }}>
          {/* 卡片预览区域 */}
          <View className={styles.previewContainer}>
            <Canvas 
              canvasId="previewCanvas"
              className={styles.cardPreview}
              style={{ 
                width: '280px', 
                height: '350px',
                backgroundColor: selectedColor?.bgColor || '#FFFFFF'
              }}
            />
          </View>

          {/* 底部颜色选择区域 */}
          <View className={styles.bottomSection}>
            <View className={styles.bottomHeader}>
              <Text className={styles.colorLabel}>选择卡片颜色</Text>
              <View 
                className={styles.nextButton}
                onClick={handleNext}
              >
                <Text className={styles.nextButtonText}>下一步</Text>
              </View>
            </View>

            {/* 颜色选择器 */}
            <ScrollView 
              scrollX 
              className={styles.colorScrollView}
              showScrollbar={false}
            >
              <View className={styles.colorContainer}>
                {colorOptions.map((color) => (
                  <View 
                    key={color.id}
                    className={styles.colorOptionWrapper}
                    onClick={() => handleColorSelect(color.id)}
                  >
                    <View 
                      className={`${styles.colorOption} ${
                        selectedColorId === color.id ? styles.selectedColor : ''
                      }`}
                      style={{ backgroundColor: color.bgColor }}
                    >
                      {selectedColorId === color.id && (
                        <Text className={styles.checkIcon}>✓</Text>
                      )}
                    </View>
                    <Text className={styles.colorName}>{color.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      
    </View>
  )
}

export default ImgTypeChoose