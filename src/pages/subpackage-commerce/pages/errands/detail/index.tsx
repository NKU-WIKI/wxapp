// Third-party imports
import { View, ScrollView, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Relative imports
import styles from './index.module.scss'

import locationIcon from '@/assets/map-pin.svg'
import moreIcon from '@/assets/more-horizontal.svg'
import ActionBar, { ActionButtonConfig } from '@/components/action-bar'
import AuthorInfo from '@/components/author-info'
import CustomHeader from '@/components/custom-header'
import { useRelativeTime } from '@/hooks/useRelativeTime'
import { RootState, AppDispatch } from '@/store'
import { fetchErrandDetail, clearError } from '@/store/slices/marketplaceSlice'
import { fetchCurrentUser } from '@/store/slices/userSlice'
import { ListingRead, ErrandType } from '@/types/api/marketplace.d'

// Assets imports


const ErrandsDetailPage = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const {
    currentErrand,
    errandDetailLoading: detailLoading,
    error,
  } = useSelector((state: RootState) => state.marketplace)
  const userState = useSelector((state: RootState) => state.user)
  const currentUserId = useSelector((state: RootState) => state.user.user?.id)

  // 获取任务详情
  const loadErrandDetail = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchErrandDetail(id)).unwrap()
      } catch (detailError) {
        //
        Taro.showToast({ title: '获取任务详情失败', icon: 'none' })
      }
    },
    [dispatch]
  )

  // 初始化
  useEffect(() => {
    const id = router.params?.id
    if (id && typeof id === 'string') {
      loadErrandDetail(id)
    }
  }, [router.params, loadErrandDetail])

  // 若已持有 token 但还未初始化 user，则主动获取当前用户信息，避免作者判断失效
  useEffect(() => {
    if (userState?.token && !userState?.user) {
      dispatch(fetchCurrentUser())
    }
  }, [userState?.token, userState?.user, dispatch])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 任务信息组件
  const TaskInfo = ({ errand }: { errand: ListingRead }) => {
    const { formattedTime } = useRelativeTime(errand.created_at, {
      autoUpdate: true,
      updateInterval: 60000, // 每分钟更新一次
    })

    const errandOwnerId = errand.user_id || (errand as any).user?.id
    const isOwner = !!currentUserId && !!errandOwnerId && currentUserId === errandOwnerId

    const handleMore = () => {
      if (!isOwner) return
      Taro.showActionSheet({
        itemList: ['编辑任务', '删除任务'],
      })
        .then((res) => {
          if (res.tapIndex === 0) {
            // 编辑任务
            Taro.navigateTo({
              url: `/pages/subpackage-commerce/pages/errands/publish/index?id=${errand.id}`,
            }).catch(() => {
              Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
            })
          } else if (res.tapIndex === 1) {
            // 删除任务
            Taro.showModal({
              title: '确认删除',
              content: `确定要删除任务"${errand.title}"吗？此操作不可恢复。`,
              success: async (deleteRes) => {
                if (deleteRes.confirm) {
                  try {
                    // TODO: 实现删除任务API
                    Taro.showToast({ title: '删除功能开发中', icon: 'none' })
                  } catch (deleteError) {
                    Taro.showToast({ title: '删除失败', icon: 'none' })
                  }
                }
              },
            })
          }
        })
        .catch(() => {})
    }

    const getTaskTypeText = (errandType?: string) => {
      switch (errandType) {
        case ErrandType.EXPRESS_PICKUP:
          return '快递代取'
        case ErrandType.FOOD_DELIVERY:
          return '食堂打饭'
        case ErrandType.GROCERY_SHOPPING:
          return '超市代购'
        case ErrandType.OTHER:
          return '其他'
        default:
          return '跑腿任务'
      }
    }

    // 从errand数据中提取跑腿任务特有的字段
    const errandData = errand as any
    const errandType = errandData.errand_type || errand.listing_type
    const reward = errandData.reward || errand.price
    const locationFrom = errandData.location_from
    const locationTo = errandData.location_to
    const deadline = errandData.deadline

    return (
      <View className={styles.taskInfo}>
        <View className={styles.taskHeader}>
          <View className={styles.taskHeaderMain}>
            <Text className={styles.taskTitle}>{errand.title}</Text>
            <Text className={styles.taskReward}>
              ¥{typeof reward === 'string' ? reward : reward || '面议'}
            </Text>
          </View>
          {isOwner && (
            <View className={styles.taskHeaderActions} onClick={handleMore}>
              <Image src={moreIcon} className={styles.moreIcon} />
            </View>
          )}
        </View>

        <View className={styles.taskMeta}>
          <Text className={styles.taskTime}>发布时间: {formattedTime}</Text>
          <Text className={styles.taskType}>任务类型: {getTaskTypeText(errandType)}</Text>
        </View>

        {/* 任务路线信息 */}
        {(locationFrom || locationTo) && (
          <View className={styles.taskRoute}>
            <Image
              src={locationIcon}
              className={styles.locationIcon}
              style={{ width: '16px', height: '16px' }}
            />
            <Text className={styles.routeText}>
              {locationFrom || '起始地点'} → {locationTo || '目的地点'}
            </Text>
          </View>
        )}

        {/* 期望送达时间 */}
        {deadline && (
          <View className={styles.taskDeadline}>
            <Text className={styles.deadlineLabel}>期望送达：</Text>
            <Text className={styles.deadlineText}>{new Date(deadline).toLocaleString()}</Text>
          </View>
        )}

        {/* 任务统计信息 */}
        <View className={styles.taskStats}>
          <Text className={styles.statsText}>
            {errand.view_count || 0} 次浏览 · {errand.favorite_count || 0} 人收藏
          </Text>
        </View>
      </View>
    )
  }

  // 任务描述组件
  const TaskDescription = ({ content }: { content?: string }) => (
    <View className={styles.taskDescription}>
      <Text className={styles.descriptionTitle}>任务描述</Text>
      <Text className={styles.descriptionContent}>{content || '暂无描述'}</Text>
    </View>
  )

  // 操作按钮组件
  const ActionButtons = ({ errand }: { errand: ListingRead }) => {
    const errandData = errand as any
    const taskStatus = errandData.status || errand.status

    const actionBarButtons: ActionButtonConfig[] = [
      {
        type: 'favorite',
        icon: '/assets/heart-outline.svg',
        activeIcon: '/assets/heart-bold.svg',
      },
      {
        type: 'custom',
        icon: '/assets/message-circle.svg',
        text: '联系发布者',
        onClick: () => {
          if (!errand?.user) return

          Taro.showActionSheet({
            itemList: ['复制微信号', '复制QQ号', '复制手机号'],
            success: (res) => {
              let content = ''
              switch (res.tapIndex) {
                case 0:
                  content = errand.user.wechat_id || '暂无微信号'
                  break
                case 1:
                  content = errand.user.qq_id || '暂无QQ号'
                  break
                case 2:
                  content = errand.user.tel || '暂无手机号'
                  break
              }

              if (
                content &&
                content !== '暂无微信号' &&
                content !== '暂无QQ号' &&
                content !== '暂无手机号'
              ) {
                Taro.setClipboardData({
                  data: content,
                  success: () => {
                    Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
                  },
                })
              } else {
                Taro.showToast({ title: '暂无联系方式', icon: 'none' })
              }
            },
          })
        },
      },
    ]

    // 统一的底部按钮布局，所有用户都使用相同的按钮
    // 编辑和删除功能通过头部的"更多"按钮提供（仅任务发布者可见）
    return (
      <View className={styles.actionButtons}>
        <View className={styles.leftArea}>
          <ActionBar
            targetId={errand.id}
            targetType="errand"
            buttons={actionBarButtons}
            initialStates={{
              'favorite-0': {
                isActive: (errand.favorite_count || 0) > 0,
                count: errand.favorite_count || 0,
              },
            }}
            onStateChange={(type, isActive, _count) => {
              if (type === 'favorite') {
                // 根据当前收藏状态显示不同的提示信息
                if (isActive) {
                  Taro.showToast({ title: '已收藏', icon: 'success' })
                } else {
                  Taro.showToast({ title: '已取消收藏', icon: 'success' })
                }
              }
            }}
          />
        </View>
        <View className={styles.rightArea}>
          <Button
            className={styles.primaryButton}
            onClick={() => {
              // 根据任务状态显示不同操作
              if (taskStatus === 'pending') {
                // TODO: 实现接受任务功能
                Taro.showToast({ title: '接受任务功能开发中', icon: 'none' })
              } else if (taskStatus === 'accepted') {
                // TODO: 实现完成任务功能
                Taro.showToast({ title: '完成任务功能开发中', icon: 'none' })
              } else {
                Taro.showToast({ title: '任务已完成', icon: 'none' })
              }
            }}
          >
            <Text>
              {taskStatus === 'pending' && '接受任务'}
              {taskStatus === 'accepted' && '完成任务'}
              {taskStatus === 'completed' && '任务已完成'}
              {!taskStatus && '接受任务'}
            </Text>
          </Button>
        </View>
      </View>
    )
  }

  // 加载状态
  if (detailLoading === 'pending') {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="任务详情" />
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    )
  }

  // 无数据状态
  if (!currentErrand) {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="任务详情" />
        <View className={styles.emptyContainer}>
          <Text className={styles.emptyText}>任务不存在或已下架</Text>
        </View>
      </View>
    )
  }

  // 主页面内容
  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="任务详情" />
      <View className={styles.contentContainer}>
        <ScrollView scrollY className={styles.scrollView} enableFlex scrollWithAnimation>
          <TaskInfo errand={currentErrand} />
          <TaskDescription content={currentErrand.content} />

          <AuthorInfo
            userId={currentErrand.user_id}
            mode="expanded"
            showFollowButton
            showStats
            showLevel
            showLocation
          />

          {/* 底部留白，确保内容不会被操作按钮遮挡 */}
          <View className={styles.bottomSpacer} />
        </ScrollView>
      </View>
      <ActionButtons errand={currentErrand} />
    </View>
  )
}

export default ErrandsDetailPage
