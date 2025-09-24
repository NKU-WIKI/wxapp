// Icon imports

import { View, Text, Image, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useState, useEffect } from 'react'

import styles from './RagResult.module.scss'

import clockIcon from '@/assets/clock.svg'
import fileTextIcon from '@/assets/file-text.svg'
import starIcon from '@/assets/star.svg'
import userIcon from '@/assets/user.svg'
import websiteIcon from '@/assets/website.png'
import wechatIcon from '@/assets/wechat.svg'
import { RAG_CONTENT_COLLAPSE_THRESHOLD, RAG_CONTENT_MAX_HEIGHT } from '@/constants'
import { markdownToHtml } from '@/utils/markdown'

interface RagSourceItem {
  title: string
  content?: string
  platform?: string
  original_url?: string
  url?: string
  publish_time?: string
  author?: string
  pagerank_score?: number
  relevance?: number
}

interface RagData {
  answer: string
  sources?: RagSourceItem[]
}

interface Props {
  data: RagData | null
}

const botAvatar = '/assets/wiki.svg'

// 根据platform返回对应的图标
const getPlatformIcon = (platform?: string): string => {
  switch (platform?.toLowerCase()) {
    case 'wechat':
      return wechatIcon
    case 'website':
      return websiteIcon
    case 'post':
      return fileTextIcon
    default:
      return websiteIcon // 默认使用website图标
  }
}

export default function RagResult({ data }: Props) {
  const [renderedAnswer, setRenderedAnswer] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  // 同步将markdown转换为HTML
  useEffect(() => {
    if (!data?.answer) {
      setRenderedAnswer('')
      setIsExpanded(false)
      return
    }

    try {
      const html = markdownToHtml(data.answer)
      setRenderedAnswer(html)
      // 如果内容较长，默认折叠
      setIsExpanded(data.answer.length <= RAG_CONTENT_COLLAPSE_THRESHOLD)
    } catch (error) {
      setRenderedAnswer(data.answer) // 失败时使用原始文本
      setIsExpanded(data.answer.length <= RAG_CONTENT_COLLAPSE_THRESHOLD)
    }
  }, [data?.answer])

  if (!data) return null
  const { sources = [] } = data

  return (
    <View className={styles.ragContainer}>
      <View className={styles.card}>
        <View className={styles.header}>
          <Image src={botAvatar} className={styles.avatar} />
          <Text className={styles.title}>南开小知 · AI 智能助理</Text>
        </View>
        <View className={styles.responseText}>
          <View
            className={`${styles.contentWrapper} ${!isExpanded ? styles.collapsed : ''}`}
            style={!isExpanded ? ({ '--max-height': `${RAG_CONTENT_MAX_HEIGHT}px` } as any) : {}}
          >
            <RichText nodes={renderedAnswer} />
          </View>
          {renderedAnswer && renderedAnswer.length > RAG_CONTENT_COLLAPSE_THRESHOLD && (
            <View
              className={styles.expandButtonContainer}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <View className={styles.expandButton}>
                <Text className={styles.expandText}>{isExpanded ? '收起内容' : '展开全部'}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {sources.length > 0 && (
        <View className={styles.card}>
          <View className={styles.sourcesHeader}>
            <Text>信息来源</Text>
            <View className={styles.sourcesCount}>{sources.length}</View>
          </View>
          {sources.map((s, idx) => (
            <View key={idx} className={styles.sourceItem}>
              <Image src={getPlatformIcon(s.platform)} className={styles.platformIcon} />
              <View className={styles.sourceContent}>
                <Text className={styles.sourceTitle}>{s.title}</Text>

                {s.content && <Text className={styles.sourceContentText}>{s.content}</Text>}

                <View className={styles.sourceMeta}>
                  {s.author && (
                    <View className={styles.metaItem}>
                      <Image src={userIcon} className={styles.metaIcon} />
                      <Text>{s.author}</Text>
                    </View>
                  )}

                  {s.publish_time && (
                    <View className={styles.metaItem}>
                      <Image src={clockIcon} className={styles.metaIcon} />
                      <Text>{new Date(s.publish_time).toLocaleDateString('zh-CN')}</Text>
                    </View>
                  )}

                  {(s.relevance || s.pagerank_score) && (
                    <View className={styles.metaItem}>
                      <Image src={starIcon} className={styles.metaIcon} />
                      <Text>
                        {s.relevance ? `相关度${Math.round(s.relevance)}%` : ''}
                        {s.relevance && s.pagerank_score ? ' · ' : ''}
                        {s.pagerank_score ? `评分${s.pagerank_score.toFixed(2)}` : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {(s.original_url || s.url) && (
                  <Text
                    className={styles.sourceUrl}
                    onClick={() => {
                      const url = s.original_url || s.url
                      if (url) {
                        Taro.setClipboardData({
                          data: url,
                          success: () => Taro.showToast({ title: '链接已复制', icon: 'success' }),
                        })
                      }
                    }}
                  >
                    🔗 {s.original_url || s.url}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
