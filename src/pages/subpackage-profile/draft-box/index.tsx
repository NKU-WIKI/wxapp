import { useEffect, useState, useCallback } from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { DraftPost } from '@/types/draft'
import { Post } from '@/types/api/post.d'
import { getDrafts, clearDrafts } from '@/utils/draft'
import { fetchDrafts } from '@/store/slices/postSlice'
import {
  deleteDraft as apiDeleteDraft,
  clearAllDrafts as apiClearAllDrafts,
} from '@/services/api/post'
import Button from '@/components/button'

// Relative imports
import DraftItem from './components/DraftItem'
import styles from './index.module.scss'

const DraftBox = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { list: serverDrafts, draftsLoading } = useSelector((state: RootState) => state.post)
  const [localDrafts, setLocalDrafts] = useState<DraftPost[]>([])

  // 封装刷新本地草稿逻辑
  const refreshLocalDrafts = () => {
    const list = getDrafts()
    setLocalDrafts(list)
  }

  // 封装刷新服务端草稿逻辑
  const refreshServerDrafts = useCallback(() => {
    dispatch(fetchDrafts())
  }, [dispatch])

  useEffect(() => {
    refreshLocalDrafts()
    refreshServerDrafts()
  }, [dispatch, refreshServerDrafts])

  usePullDownRefresh(() => {
    refreshLocalDrafts()
    refreshServerDrafts()
    Taro.stopPullDownRefresh()
  })

  // 处理本地草稿编辑
  const handleLocalEdit = async (draft: DraftPost) => {
    try {
      const { removeDraft } = await import('@/utils/draft')
      removeDraft(draft.id)
      setLocalDrafts(getDrafts())
    } catch {}
    Taro.navigateTo({ url: `/pages/subpackage-interactive/publish/index?draftId=${draft.id}` })
  }

  // 处理服务端草稿编辑
  const handleServerEdit = async (draft: Post) => {
    try {
      // 不再提前删除，避免发布页 GET 404；仅缓存以便发布页兜底使用
      Taro.setStorageSync('tmp_server_draft', draft)
    } catch {}
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/publish/index?postId=${draft.id}&isEdit=true`,
    })
  }

  // 处理本地草稿删除
  const handleLocalDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该本地草稿吗？',
      success: (res) => {
        if (res.confirm) {
          import('@/utils/draft').then(({ removeDraft }) => {
            removeDraft(id)
            setLocalDrafts(getDrafts())
          })
        }
      },
    })
  }

  // 处理服务端草稿删除（需要调用API）
  const handleServerDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该服务端草稿吗？',
      success: (res) => {
        if (res.confirm) {
          apiDeleteDraft(id)
            .then(() => {
              Taro.showToast({ title: '已删除', icon: 'success' })
              dispatch(fetchDrafts())
            })
            .catch(() => Taro.showToast({ title: '删除失败', icon: 'none' }))
        }
      },
    })
  }

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除所有草稿（本地+服务端）吗？',
      success: (res) => {
        if (res.confirm) {
          // 本地
          clearDrafts()
          setLocalDrafts([])
          // 服务端
          apiClearAllDrafts()
            .then(() => dispatch(fetchDrafts()))
            .catch(() => {})
        }
      },
    })
  }

  // 合并并排序所有草稿
  const mapServerPostToUnified = (post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content || '',
    avatar: post.user?.avatar || '',
    updatedAt:
      new Date(post.updated_at || post.created_at || post.create_time || '').getTime() ||
      Date.now(),
    likeCount: post.like_count ?? 0,
    favoriteCount: post.favorite_count ?? 0,
    commentCount: post.comment_count ?? 0,
    viewCount: post.view_count ?? 0,
    status: post.status,
    // tags 可能为字符串数组或对象数组（TagRead），统一映射为字符串数组
    tags: Array.isArray(post.tags)
      ? post.tags
          .map((t: any) => (typeof t === 'string' ? t : t?.name || ''))
          .filter((t: string) => !!t)
      : [],
    images: Array.isArray(post.images)
      ? post.images
      : Array.isArray((post as any).image_urls)
        ? (post as any).image_urls
        : [],
    categoryId: post.category_id || '',
    isPublic: post.is_public ?? true,
    allowComments: post.allow_comments ?? true,
    source: 'server' as const,
  })

  const allDrafts = [
    ...localDrafts.map((draft) => ({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      avatar: draft.avatar,
      updatedAt: draft.updatedAt,
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      categoryId: draft.category_id || '',
      likeCount: 0,
      favoriteCount: 0,
      commentCount: 0,
      viewCount: 0,
      status: 'draft' as const,
      images: [],
      isPublic: true,
      allowComments: true,
      source: 'local' as const,
    })),
    ...serverDrafts.map(mapServerPostToUnified),
  ]
    // 去重：以 id 优先服务端覆盖本地
    .reduce((acc: any[], item) => {
      const idx = acc.findIndex((d) => d.id === item.id)
      if (idx >= 0) {
        // 服务端覆盖本地
        if (item.source === 'server') acc[idx] = item
      } else {
        acc.push(item)
      }
      return acc
    }, [])
    .sort((a, b) => b.updatedAt - a.updatedAt)

  useEffect(() => {}, [allDrafts.length, serverDrafts.length, localDrafts.length, draftsLoading])

  return (
    <View className={styles.container}>
      <ScrollView scrollY className={styles.scroll}>
        {draftsLoading === 'pending' && localDrafts.length === 0 ? (
          <View className={styles.loading}>加载中...</View>
        ) : allDrafts.length === 0 ? (
          <View className={styles.empty}>暂无草稿</View>
        ) : (
          <>
            {/* 合并后的草稿列表 */}
            <View className={styles.section}>
              {allDrafts.map((draft) => (
                <DraftItem
                  key={draft.id}
                  draft={draft}
                  onEdit={() => {
                    if (draft.source === 'server') {
                      handleServerEdit(serverDrafts.find((p) => p.id === draft.id)!)
                    } else {
                      handleLocalEdit(draft)
                    }
                  }}
                  onDelete={() => {
                    if (draft.source === 'local') handleLocalDelete(draft.id)
                    else handleServerDelete(draft.id)
                  }}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View className={styles.bottomBar}>
        <Button className={styles.clearBtn} type="primary" onClick={handleClearAll}>
          放弃所有草稿
        </Button>
      </View>
    </View>
  )
}

export default DraftBox
