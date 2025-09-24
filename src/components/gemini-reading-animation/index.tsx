import { useEffect, useState } from 'react'

import { View, Text, Image } from '@tarojs/components'


import { DocSource } from '@/types/api/agent.d'

import styles from './index.module.scss'


interface GeminiReadingAnimationProps {
  sources: DocSource[]
  onComplete?: () => void
  duration?: number // 动画总时长
  shouldStop?: boolean // 外部控制是否停止动画
}

// 思考步骤定义 - 更智能的AI思考过程
const thinkingSteps = [
  '正在深度解析文档语义...',
  '正在构建知识图谱关联...',
  '正在提取核心观点与论据...',
  '正在进行多维度交叉验证...',
  '正在融合多源信息生成洞见...',
  '正在优化回答逻辑结构...',
  '正在润色表达确保准确性...',
]

export default function GeminiReadingAnimation({
  sources,
  onComplete,
  duration = 4000,
  shouldStop = false,
}: GeminiReadingAnimationProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0)
  const [progress, setProgress] = useState(0) // 0-100
  const [isFading, setIsFading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const itemDuration = Math.max(duration / Math.max(sources.length, 1), 1000) // 每篇至少1秒
  const currentSource = sources[currentSourceIndex]

  // 监听外部停止信号
  useEffect(() => {
    if (shouldStop && !isGenerating) {
      setIsGenerating(true)
      onComplete?.()
    }
  }, [shouldStop, isGenerating, onComplete])

  // 动画主循环，用于切换文献
  useEffect(() => {
    if (shouldStop) return // 如果收到停止信号，不启动新循环

    const mainTimer = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setCurrentSourceIndex((prevIndex) => {
          if (prevIndex < sources.length - 1) {
            return prevIndex + 1
          }
          // 如果没有外部停止信号，继续循环播放
          return 0 // 重新从第一个开始
        })
        setIsFading(false)
      }, 500) // 0.5s fade-out
    }, itemDuration)

    return () => clearInterval(mainTimer)
  }, [sources.length, itemDuration, shouldStop])

  // 思考步骤循环
  useEffect(() => {
    const thinkingTimer = setInterval(() => {
      setThinkingStepIndex((prev) => (prev + 1) % thinkingSteps.length)
    }, 1500) // 每1.5秒切换一次
    return () => clearInterval(thinkingTimer)
  }, [])

  // 当前文献阅读进度条
  useEffect(() => {
    setProgress(0) // 新文献开始时重置
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return p + 1
      })
    }, itemDuration / 100)

    return () => clearInterval(progressTimer)
  }, [currentSourceIndex, itemDuration])

  if (!currentSource) return null

  return (
    <View className={styles.container}>
      {/* 主信息卡片 */}
      <View className={styles.headerCard}>
        <View className={styles.aiIcon}>
          <Image src="/assets/wiki.svg" className={styles.avatar} />
        </View>
        <View className={styles.titleSection}>
          <Text className={styles.title}>南开小知 · AI 智能助理</Text>
          <View className={styles.thinkingStep}>
            <Image src="/assets/search.svg" className={styles.thinkingIcon} />
            <Text className={styles.thinkingText}>
              {isGenerating ? '正在生成最终回复...' : thinkingSteps[thinkingStepIndex]}
            </Text>
          </View>
          <Text className={styles.subtitle}>正在深度研读 {sources.length} 个参考文献...</Text>
        </View>
      </View>

      {/* 当前研读的文献卡片 */}
      <View className={`${styles.sourceCard} ${isFading ? styles.fading : ''}`}>
        <Text className={styles.sourceTitle}>{currentSource.title}</Text>
        <View className={styles.sourceMeta}>
          {currentSource.author && (
            <Text className={styles.metaItem}>👤 {currentSource.author}</Text>
          )}
          {currentSource.publish_time && (
            <Text className={styles.metaItem}>
              📅 {new Date(currentSource.publish_time).toLocaleDateString('zh-CN')}
            </Text>
          )}
          {currentSource.platform && (
            <Text className={styles.metaItem}>🌐 {currentSource.platform}</Text>
          )}
        </View>
        <Text className={styles.sourceContent}>{currentSource.content}</Text>
        <View className={styles.progressContainer}>
          <View className={styles.progressBar} style={{ width: `${progress}%` }} />
        </View>
      </View>

      {/* 底部状态 */}
      <View className={styles.footerStatus}>
        <Text>
          {isGenerating
            ? '所有文献研读完毕'
            : `正在研读第 ${currentSourceIndex + 1} 个文献，共 ${sources.length} 个`}
        </Text>
      </View>
    </View>
  )
}
