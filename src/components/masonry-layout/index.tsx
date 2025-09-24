import { useState, useEffect, useCallback } from 'react'

import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'


import NoteCard from '@/components/note-card'
import { NoteListItem } from '@/services/api/note'

import styles from './index.module.scss'


interface MasonryLayoutProps {
  notes: NoteListItem[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onRefresh: () => void
  refreshing: boolean
}

const MasonryLayout = ({
  notes,
  loading,
  hasMore,
  onLoadMore,
  onRefresh,
  refreshing,
}: MasonryLayoutProps) => {
  const [columns, setColumns] = useState<NoteListItem[][]>([[], []])
  const [scrollViewHeight, setScrollViewHeight] = useState(0)

  // 调试信息
  useEffect(() => {
    // 调试信息已移除
  }, [notes, loading, hasMore, refreshing])

  // 获取屏幕信息
  useEffect(() => {
    Taro.getSystemInfo({
      success: (res) => {
        // 减去顶部导航栏和底部tabbar的高度
        const availableHeight = res.windowHeight - 100 // 100px为大概的导航栏高度
        setScrollViewHeight(availableHeight)
      },
    })
  }, [])

  // 简单的轮换分配策略 - 让真实的图片高度决定瀑布流效果
  const redistributeNotes = useCallback((noteList: NoteListItem[]) => {
    const newColumns: NoteListItem[][] = [[], []]

    // 使用简单的轮换分配，而不是基于预估高度
    // 这样可以让图片的真实高度产生自然的瀑布流效果
    noteList.forEach((note, index) => {
      const columnIndex = index % 2 // 简单轮换：奇数索引放右列，偶数索引放左列
      newColumns[columnIndex].push(note)
    })

    setColumns(newColumns)
  }, [])

  // 由于使用 widthFix 模式，图片高度由实际图片决定
  // 不再需要预估高度，让真实的图片渲染产生瀑布流效果

  // 当notes变化时重新分布
  useEffect(() => {
    redistributeNotes(notes)
  }, [notes, redistributeNotes])

  // 处理滚动到底部
  const handleScrollToLower = useCallback(() => {
    if (!loading && hasMore) {
      onLoadMore()
    }
  }, [loading, hasMore, onLoadMore])

  // 处理下拉刷新
  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      onRefresh()
    }
  }, [refreshing, onRefresh])

  return (
    <View className={styles.masonryContainer}>
      <ScrollView
        className={styles.scrollView}
        style={{ height: scrollViewHeight }}
        scrollY
        onScrollToLower={handleScrollToLower}
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        lowerThreshold={100}
        refresherThreshold={80}
      >
        <View className={styles.masonryContent}>
          {/* 左列 */}
          <View className={styles.column}>
            {columns[0].map((note, index) => (
              <NoteCard
                key={`left-${note.id}-${index}`}
                note={note}
                style={{ marginBottom: '12px' }}
              />
            ))}
          </View>

          {/* 右列 */}
          <View className={styles.column}>
            {columns[1].map((note, index) => (
              <NoteCard
                key={`right-${note.id}-${index}`}
                note={note}
                style={{ marginBottom: '12px' }}
              />
            ))}
          </View>
        </View>

        {/* 加载状态 */}
        {loading && (
          <View className={styles.loadingContainer}>
            <View className={styles.loadingDot}></View>
            <View className={styles.loadingDot}></View>
            <View className={styles.loadingDot}></View>
          </View>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && notes.length > 0 && (
          <View className={styles.noMoreContainer}>
            <View className={styles.noMoreText}>没有更多内容了</View>
          </View>
        )}

        {/* 底部安全区域 */}
        <View className={styles.bottomSafeArea}></View>
      </ScrollView>
    </View>
  )
}

export default MasonryLayout
