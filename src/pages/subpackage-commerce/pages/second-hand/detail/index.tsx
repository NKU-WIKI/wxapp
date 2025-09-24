// Third-party imports
import { View, ScrollView, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Relative imports
import styles from './index.module.scss'

import locationIcon from '@/assets/map-pin.svg'
import messageIcon from '@/assets/message-square.svg'
import moreIcon from '@/assets/more-horizontal.svg'
import placeholderImage from '@/assets/placeholder.jpg'
import shareIcon from '@/assets/share.svg'
import favoriteActiveIcon from '@/assets/star-filled.svg'
import favoriteIcon from '@/assets/star-outline.svg'
import ActionBar from '@/components/action-bar'
import AuthorInfo from '@/components/author-info'
import CustomHeader from '@/components/custom-header'
import {
  fetchListingDetail,
  deleteListing,
  clearError,
  updateListingState,
} from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingRead } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useRelativeTime } from '@/hooks/useRelativeTime'
import { useSharing } from '@/hooks/useSharing'
import CommentSection from '@/components/comment-section'
import { fetchCurrentUser } from '@/store/slices/userSlice'
import { fetchComments } from '@/store/slices/commentSlice'

// Assets imports


const SecondHandDetailPage = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()

  const { currentListing, detailLoading, error } = useSelector(
    (state: RootState) => state.marketplace
  )
  const { comments } = useSelector((state: RootState) => state.comment)
  const userState = useSelector((state: RootState) => state.user)
  const currentUserId = useSelector((state: RootState) => state.user.user?.id)

  // 使用分享 Hook
  useSharing({
    title: currentListing?.title || '分享商品',
    path: `/pages/subpackage-commerce/pages/second-hand/detail/index?id=${router.params?.id || ''}`,
    imageUrl: currentListing?.images?.[0],
  })

  // 获取商品详情和评论
  const loadListingDetail = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchListingDetail(id)).unwrap()

        // 获取评论
        await dispatch(
          fetchComments({
            resource_id: id,
            resource_type: 'listing',
            skip: 0,
            limit: 20,
            max_depth: 3,
            limit_per_level: 5,
          })
        ).unwrap()
      } catch (detailError) {
        //
        Taro.showToast({ title: '获取商品详情失败', icon: 'none' })
      }
    },
    [dispatch]
  )

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
      },
    })
  }, [checkAuth, currentListing, dispatch])

  // 处理编辑商品
  const handleEdit = useCallback(() => {
    if (!checkAuth()) return
    if (!currentListing) return

    // 导航到商品编辑页面
    Taro.navigateTo({
      url: `/pages/subpackage-commerce/pages/second-hand/publish/index?id=${currentListing.id}`,
    }).catch(() => {
      Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
    })
  }, [checkAuth, currentListing])

  // 初始化
  useEffect(() => {
    const id = router.params?.id
    if (id && typeof id === 'string') {
      loadListingDetail(id)
    }
  }, [router.params, loadListingDetail])

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

  // 商品信息组件
  const ProductInfo = ({ listing }: { listing: ListingRead }) => {
    const { formattedTime } = useRelativeTime(listing.created_at, {
      autoUpdate: true,
      updateInterval: 60000, // 每分钟更新一次
    })

    const listingOwnerId = listing.user_id || (listing as any).user?.id
    const isOwner = !!currentUserId && !!listingOwnerId && currentUserId === listingOwnerId

    const handleMore = () => {
      if (!isOwner) return
      Taro.showActionSheet({
        itemList: ['编辑商品', '删除商品'],
      })
        .then((res) => {
          if (res.tapIndex === 0) {
            handleEdit()
          } else if (res.tapIndex === 1) {
            handleDelete()
          }
        })
        .catch(() => {})
    }

    const getConditionText = (condition: string | undefined) => {
      switch (condition) {
        case 'new':
          return '全新'
        case 'like_new':
          return '九成新'
        case 'good':
          return '八成新'
        case 'acceptable':
          return '七成新'
        case 'damaged':
          return '其他'
        default:
          return '其他'
      }
    }

    return (
      <View className={styles.productInfo}>
        <View className={styles.productHeader}>
          <View className={styles.productHeaderMain}>
            <View className={styles.titleRow}>
              <Text className={styles.productTitle}>{listing.title}</Text>
              {/* 状态标签 - 出/收 */}
              <View className={`${styles.statusBadge} ${styles[`status_${listing.listing_type}`]}`}>
                <Text className={styles.statusBadgeText}>
                  {listing.listing_type === 'sell' ? '出' : '收'}
                </Text>
              </View>
            </View>
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
          <Text className={styles.productTime}>发布时间: {formattedTime}</Text>
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
            <Text className={styles.categoryText}>分类: {listing.category.name}</Text>
          </View>
        )}
      </View>
    )
  }

  // 商品图片组件
  const ProductImages = ({ images }: { images?: string[] }) => {
    const handleImagePreview = useCallback(
      (currentIndex: number) => {
        if (!images || images.length === 0) return

        Taro.previewImage({
          current: images[currentIndex],
          urls: images,
        })
      },
      [images]
    )

    const validImages = images?.filter((img) => img && img.trim()) || []

    return (
      <View className={styles.productImages}>
        {validImages.length > 0 ? (
          validImages.map((image, index) => (
            <Image
              key={`image-${index}-${image}`}
              src={image}
              className={styles.productImage}
              mode="aspectFill"
              onClick={() => handleImagePreview(index)}
            />
          ))
        ) : (
          <Image src={placeholderImage} className={styles.productImage} mode="aspectFill" />
        )}
      </View>
    )
  }

  // 商品描述组件
  const ProductDescription = ({ content }: { content?: string }) => (
    <View className={styles.productDescription}>
      <Text className={styles.descriptionTitle}>商品描述</Text>
      <Text className={styles.descriptionContent}>{content || '暂无描述'}</Text>
    </View>
  )

  // 标签组件
  const ProductTags = ({ tags }: { tags?: string[] }) => {
    // 如果没有标签或标签数组为空，不渲染任何内容
    if (!tags || tags.length === 0) {
      return null
    }

    return (
      <View className={styles.productTags}>
        {tags.map((tag, index) => (
          <Text key={index} className={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
    )
  }

  // 加载状态
  if (detailLoading === 'pending') {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="商品详情" />
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
        <CustomHeader title="商品详情" />
        <View className={styles.emptyContainer}>
          <Text className={styles.emptyText}>商品不存在或已下架</Text>
        </View>
      </View>
    )
  }

  // 主页面内容
  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="商品详情" />
      <View className={styles.contentContainer}>
        <ScrollView scrollY className={styles.scrollView} enableFlex scrollWithAnimation>
          <ProductImages images={currentListing.images} />
          <ProductInfo listing={currentListing} />
          <ProductTags tags={currentListing.tags} />
          <ProductDescription content={currentListing.content} />
          <AuthorInfo
            userId={currentListing.user_id}
            mode="expanded"
            showBio
            showFollowButton
            showStats
            showLevel
            showLocation
          />

          {/* 评论系统 */}
          <CommentSection
            postId={currentListing.id}
            postTitle={currentListing.title}
            postAuthorId={currentListing.user_id}
            comments={comments}
            allowComments // 默认允许
            autoHandle // 启用自动处理模式，内部自动处理所有评论操作
            showFollowButton
          />
        </ScrollView>
      </View>
      <View className={styles.bottomActionBarContainer}>
        <ActionBar
          targetId={currentListing.id}
          targetType="listing"
          initialStates={{
            'favorite-0': {
              isActive: currentListing.is_favorited || false,
              count: currentListing.favorite_count || 0,
            },
            'comment-1': {
              isActive: false,
              count: currentListing.comment_count || 0, // 使用商品的评论计数
            },
            'share-2': {
              isActive: false,
              count: currentListing.share_count || 0,
            },
          }}
          buttons={[
            {
              type: 'favorite',
              icon: favoriteIcon,
              activeIcon: favoriteActiveIcon,
            },
            {
              type: 'comment',
              icon: messageIcon,
            },
            {
              type: 'share',
              icon: shareIcon,
            },
          ]}
          onStateChange={(type, isActive, count) => {
            // ActionBar 已经完全处理了操作，这里可以添加额外的业务逻辑
            if (type === 'favorite') {
              // 同步更新 Redux store 中的状态
              dispatch(
                updateListingState({
                  id: currentListing.id,
                  data: {
                    is_favorited: isActive,
                    favorite_count: count,
                  },
                })
              )
            } else if (type === 'comment') {
              // 评论按钮被点击，聚焦到评论区域
              // 这里可以实现滚动到 CommentSection 的逻辑
            }
            // 分享计数由 ActionBar 内部处理，无需额外逻辑
          }}
        />
      </View>
    </View>
  )
}

export default SecondHandDetailPage
