import { View, ScrollView, Text } from '@tarojs/components'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'

import { useEffect, useState, useCallback } from 'react'

import HistoryItem from './components/HistoryItem'
import styles from './index.module.scss'

import Button from '@/components/button'
import CustomHeader from '@/components/custom-header'

// API imports
import searchApi from '@/services/api/search'

// Type imports
import { ViewHistoryRead } from '@/types/history'

// Relative imports

const PAGE_SIZE = 20

const HistoryPage = () => {
  const [history, setHistory] = useState<ViewHistoryRead[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)

  const loadHistory = useCallback(
    async (reset = false) => {
      if (loading) return

      try {
        setLoading(true)
        const currentSkip = reset ? 0 : skip

        const response = await searchApi.getMyViewHistory(currentSkip, PAGE_SIZE)
        const data = response.data || []

        if (reset) {
          setHistory(data)
          setSkip(PAGE_SIZE)
        } else {
          setHistory((prev) => [...prev, ...data])
          setSkip(currentSkip + PAGE_SIZE)
        }

        setHasMore(data.length === PAGE_SIZE)
      } catch (error) {
        Taro.showToast({
          title: '加载失败',
          icon: 'none',
        })
      } finally {
        setLoading(false)
      }
    },
    [skip, loading]
  )

  useEffect(() => {
    loadHistory(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  usePullDownRefresh(async () => {
    await loadHistory(true)
    Taro.stopPullDownRefresh()
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadHistory(false)
    }
  })

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该条浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实现删除API调用
          setHistory((prev) => prev.filter((item) => item.id !== id))
          Taro.showToast({
            title: '删除成功',
            icon: 'success',
          })
        }
      },
    })
  }

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实现清空API调用
          setHistory([])
          setSkip(0)
          setHasMore(false)
          Taro.showToast({
            title: '清空成功',
            icon: 'success',
          })
        }
      },
    })
  }

  return (
    <View className={styles.container}>
      <CustomHeader title="浏览历史" hideBack={false} />
      <ScrollView scrollY className={styles.scroll}>
        {history.length === 0 && !loading ? (
          <View className={styles.empty}>暂无浏览历史</View>
        ) : (
          <>
            {history.map((item) => (
              <HistoryItem key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
            ))}
            {loading && <Text className={styles.loading}>加载中...</Text>}
            {!hasMore && history.length > 0 && <Text className={styles.noMore}>没有更多了</Text>}
          </>
        )}
      </ScrollView>
      <View className={styles.bottomBar}>
        <Button className={styles.clearBtn} type="primary" onClick={handleClearAll}>
          清空所有浏览历史
        </Button>
      </View>
    </View>
  )
}

export default HistoryPage
