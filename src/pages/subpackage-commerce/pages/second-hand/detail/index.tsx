// Third-party imports
import { View, ScrollView, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useCallback } from 'react'

// Relative imports
import CustomHeader from '@/components/custom-header'
import { fetchListingDetail, toggleFavorite, createBooking, deleteListing, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingRead } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useRelativeTime } from '@/hooks/useRelativeTime'
import AuthorInfo from '@/components/author-info'
import { fetchCurrentUser } from '@/store/slices/userSlice'
import moreIcon from '@/assets/more-horizontal.svg'

// Assets imports
import favoriteIcon from '@/assets/heart-outline.svg'
import favoriteActiveIcon from '@/assets/heart-bold.svg'
import messageIcon from '@/assets/message-circle.svg'
import locationIcon from '@/assets/map-pin.svg'
import placeholderImage from '@/assets/placeholder.jpg'

import styles from './index.module.scss'

const SecondHandDetailPage = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()

  const { currentListing, detailLoading, error } = useSelector((state: RootState) => state.marketplace)
  const userState = useSelector((state: RootState) => state.user)
  const currentUserId = useSelector((state: RootState) => state.user.currentUser?.user_id || (state.user.userProfile as any)?.id)

  // 获取商品详情
  const loadListingDetail = useCallback(async (id: string) => {
    try {
      await dispatch(fetchListingDetail(id)).unwrap()
    } catch (detailError) {
      // 
      Taro.showToast({ title: '获取商品详情失败', icon: 'none' })
    }
  }, [dispatch])

  // 处理收藏（使用通用收藏接口）
  const handleFavorite = useCallback(async () => {
    if (!checkAuth()) return
    if (!currentListing) return

    try {
      // 使用通用收藏接口，自动处理收藏/取消收藏切换
      await dispatch(toggleFavorite(currentListing.id)).unwrap()

      // 根据当前收藏状态显示不同的提示信息
      const isCurrentlyFavorited = (currentListing.favorite_count || 0) > 0
      if (isCurrentlyFavorited) {
        Taro.showToast({ title: '已取消收藏', icon: 'success' })
      } else {
        Taro.showToast({ title: '已收藏', icon: 'success' })
      }
    } catch (favoriteError) {
      Taro.showToast({ title: '收藏操作失败', icon: 'none' })
    }
  }, [checkAuth, currentListing, dispatch])

  // 处理预约
  const handleBooking = useCallback(async () => {
    if (!checkAuth()) return
    if (!currentListing) return

    try {
      await dispatch(createBooking({
        listingId: currentListing.id,
        data: {
          time_slot: '随时', // 简化处理，后续可以添加时间选择
          message: '我想预约这个商品',
          contact_info: '请通过微信联系'
        }
      })).unwrap()

      Taro.showToast({ title: '预约成功', icon: 'success' })
    } catch (bookingError) {
      // 
    }
  }, [checkAuth, currentListing, dispatch])

  // 处理删除商品
  const handleDelete = useCallback(async () => {
    if (!checkAuth()) return
    if (!currentListing) return

    Taro.showModal({
      title: '确认删除',
      content: `确定要删除商品"${currentListing.title}"吗？此操作不可恢复。`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await dispatch(deleteListing(currentListing.id)).unwrap()
            Taro.showToast({ title: '删除成功', icon: 'success' })
            // 删除成功后返回上一页
            setTimeout(() => {
              Taro.navigateBack()
            }, 1500)
          } catch (deleteError) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }, [checkAuth, currentListing, dispatch])

  // 处理编辑商品
  const handleEdit = useCallback(() => {
    if (!checkAuth()) return
    if (!currentListing) return

    // 导航到商品编辑页面
    Taro.navigateTo({
      url: `/pages/subpackage-commerce/pages/second-hand/publish/index?id=${currentListing.id}`
    }).catch(() => {
      Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
    })
  }, [checkAuth, currentListing])

  // 处理联系卖家
  const handleContact = useCallback(() => {
    if (!currentListing?.user) return

    Taro.showActionSheet({
      itemList: ['复制微信号', '复制QQ号', '复制手机号'],
      success: (res) => {
        let content = ''
        switch (res.tapIndex) {
          case 0:
            content = currentListing.user.wechat_id || '暂无微信号'
            break
          case 1:
            content = currentListing.user.qq_id || '暂无QQ号'
            break
          case 2:
            content = currentListing.user.tel || '暂无手机号'
            break
        }

        if (content && content !== '暂无微信号' && content !== '暂无QQ号' && content !== '暂无手机号') {
          Taro.setClipboardData({
            data: content,
            success: () => {
              Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
            }
          })
        } else {
          Taro.showToast({ title: '暂无联系方式', icon: 'none' })
        }
      }
    })
  }, [currentListing])

  // 初始化
  useEffect(() => {
    const id = router.params?.id
    if (id && typeof id === 'string') {
      loadListingDetail(id)
    }
  }, [router.params, loadListingDetail])

  // 若已持有 token 但还未初始化 currentUser，则主动获取当前用户信息，避免作者判断失效
  useEffect(() => {
    if (userState?.token && !userState?.currentUser) {
      dispatch(fetchCurrentUser())
    }
  }, [userState?.token, userState?.currentUser, dispatch])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 商品信息组件
  const ProductInfo = ({ listing }: { listing: ListingRead }) => {
    const { formattedTime } = useRelativeTime(listing.created_at, {
      autoUpdate: true,
      updateInterval: 60000 // 每分钟更新一次
    })

    const listingOwnerId = listing.user_id || (listing as any).user?.id
    const isOwner = !!currentUserId && !!listingOwnerId && currentUserId === listingOwnerId

    const handleMore = () => {
      if (!isOwner) return
      Taro.showActionSheet({
        itemList: ['编辑商品', '删除商品']
      }).then(res => {
        if (res.tapIndex === 0) {
          handleEdit()
        } else if (res.tapIndex === 1) {
          handleDelete()
        }
      }).catch(() => {})
    }

    const getConditionText = (condition: string | undefined) => {
      switch (condition) {
        case 'new': return '全新'
        case 'like_new': return '九成新'
        case 'good': return '八成新'
        case 'acceptable': return '七成新'
        case 'damaged': return '其他'
        default: return '其他'
      }
    }

    return (
      <View className={styles.productInfo}>
        <View className={styles.productHeader}>
          <View className={styles.productHeaderMain}>
            <Text className={styles.productTitle}>{listing.title}</Text>
            <Text className={styles.productPrice}>
              ¥{typeof listing.price === 'string' ? listing.price : listing.price || '面议'}
            </Text>
          </View>
          {isOwner && (
            <View className={styles.productHeaderActions} onClick={handleMore}>
              <Image src={moreIcon} className={styles.moreIcon} />
            </View>
          )}
        </View>

        <View className={styles.productMeta}>
          <Text className={styles.productTime}>
            发布时间: {formattedTime}
          </Text>
          <Text className={styles.productCondition}>
            成色: {getConditionText(listing.condition)}
          </Text>
        </View>

        {listing.location && (
          <View className={styles.productLocation}>
            <Image
              src={locationIcon}
              className={styles.locationIcon}
              style={{ width: '16px', height: '16px' }}
            />
            <Text className={styles.locationText}>{listing.location}</Text>
          </View>
        )}

        {/* 商品分类信息 */}
        {listing.category && (
          <View className={styles.productCategory}>
            <Text className={styles.categoryText}>
              分类: {listing.category.name}
            </Text>
          </View>
        )}

        {/* 商品统计信息 */}
        <View className={styles.productStats}>
          <Text className={styles.statsText}>
            {listing.view_count || 0} 次浏览 · {listing.favorite_count || 0} 人收藏 · {listing.booking_count || 0} 人预约
          </Text>
        </View>
      </View>
    )
  }

  // 商品图片组件
  const ProductImages = ({ images }: { images?: string[] }) => {
    const handleImagePreview = useCallback((currentIndex: number) => {
      if (!images || images.length === 0) return

      Taro.previewImage({
        current: images[currentIndex],
        urls: images
      })
    }, [images])

    const validImages = images?.filter(img => img && img.trim()) || []

    return (
      <View className={styles.productImages}>
        {validImages.length > 0 ? (
          validImages.map((image, index) => (
            <Image
              key={`image-${index}-${image}`}
              src={image}
              className={styles.productImage}
              mode='aspectFill'
              onClick={() => handleImagePreview(index)}
            />
          ))
        ) : (
          <Image
            src={placeholderImage}
            className={styles.productImage}
            mode='aspectFill'
          />
        )}
      </View>
    )
  }

  // 商品描述组件
  const ProductDescription = ({ content }: { content?: string }) => (
    <View className={styles.productDescription}>
      <Text className={styles.descriptionTitle}>商品描述</Text>
      <Text className={styles.descriptionContent}>
        {content || '暂无描述'}
      </Text>
    </View>
  )



  // 标签组件
  const ProductTags = ({ tags }: { tags?: string[] }) => (
    <View className={styles.productTags}>
      {tags && tags.map((tag, index) => (
        <Text key={index} className={styles.tag}>
          {tag}
        </Text>
      ))}
    </View>
  )

  // 操作按钮组件（底部）
  const ActionButtons = ({ listing }: { listing: ListingRead }) => {
    const isFavorited = (listing.favorite_count || 0) > 0

    return (
      <View className={styles.actionButtons}>
        <View className={styles.leftArea}>
          <Button
            className={`${styles.iconButton} ${isFavorited ? styles.active : ''}`}
            onClick={handleFavorite}
          >
            <Image
              src={isFavorited ? favoriteActiveIcon : favoriteIcon}
              className={styles.icon}
              style={{ width: '22px', height: '22px' }}
            />
          </Button>
        </View>
        <View className={styles.rightArea}>
          <Button
            className={styles.secondaryButton}
            onClick={handleContact}
          >
            <Image
              src={messageIcon}
              className={styles.secondaryIcon}
              style={{ width: '18px', height: '18px' }}
            />
            <Text>联系卖家</Text>
          </Button>
          <Button
            className={styles.primaryButton}
            onClick={handleBooking}
          >
            <Text>立即预约</Text>
          </Button>
        </View>
      </View>
    )
  }

  // 加载状态
  if (detailLoading === 'pending') {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title='商品详情' />
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    )
  }

  // 无数据状态
  if (!currentListing) {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title='商品详情' />
        <View className={styles.emptyContainer}>
          <Text className={styles.emptyText}>商品不存在或已下架</Text>
        </View>
      </View>
    )
  }

  // 主页面内容
  return (
    <View className={styles.pageContainer}>
      <CustomHeader title='商品详情' />
      <View className={styles.contentContainer}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableFlex
          scrollWithAnimation
        >
          <ProductImages images={currentListing.images} />
          <ProductInfo listing={currentListing} />
          <ProductTags tags={currentListing.tags} />
          <ProductDescription content={currentListing.content} />
          <AuthorInfo
            userId={currentListing.user_id}
            mode='expanded'
            showFollowButton
            showStats
            showLevel
            showLocation
          />
          {/* 底部留白，确保内容不会被操作按钮遮挡 */}
          <View className={styles.bottomSpacer} />
        </ScrollView>
      </View>
      <ActionButtons listing={currentListing} />
    </View>
  )
}

export default SecondHandDetailPage
