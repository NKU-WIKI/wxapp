import { View, ScrollView, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useCallback } from 'react'

import CustomHeader from '@/components/custom-header'
import { fetchListingDetail, addFavorite, removeFavorite, createBooking, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingRead } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'

import styles from './index.module.scss'

const SecondHandDetailPage = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()

  const { currentListing, detailLoading, error } = useSelector((state: RootState) => state.marketplace)

  // 获取商品详情
  const loadListingDetail = useCallback(async (id: string) => {
    try {
      await dispatch(fetchListingDetail(id)).unwrap()
    } catch (detailError) {
      // 
      Taro.showToast({ title: '获取商品详情失败', icon: 'none' })
    }
  }, [dispatch])

  // 处理收藏
  const handleFavorite = useCallback(async () => {
    if (!checkAuth()) return
    if (!currentListing) return

    try {
      if (currentListing.favorite_count && currentListing.favorite_count > 0) {
        await dispatch(removeFavorite(currentListing.id)).unwrap()
        Taro.showToast({ title: '已取消收藏', icon: 'success' })
      } else {
        await dispatch(addFavorite(currentListing.id)).unwrap()
        Taro.showToast({ title: '已收藏', icon: 'success' })
      }
    } catch (favoriteError) {
      // 
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

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 商品信息组件
  const ProductInfo = ({ listing }: { listing: ListingRead }) => (
    <View className={styles.productInfo}>
      <View className={styles.productHeader}>
        <Text className={styles.productTitle}>{listing.title}</Text>
        <Text className={styles.productPrice}>
          ¥{typeof listing.price === 'string' ? listing.price : listing.price || '面议'}
        </Text>
      </View>

      <View className={styles.productMeta}>
        <Text className={styles.productTime}>
          发布时间: {listing.created_at ? new Date(listing.created_at).toLocaleString() : ''}
        </Text>
        <Text className={styles.productCondition}>
          成色: {
            listing.condition === 'new' ? '全新' :
            listing.condition === 'like_new' ? '九成新' :
            listing.condition === 'good' ? '八成新' :
            listing.condition === 'acceptable' ? '七成新' : '其他'
          }
        </Text>
      </View>

      {listing.location && (
        <View className={styles.productLocation}>
          <Image src='/assets/map-pin.svg' className={styles.locationIcon} />
          <Text className={styles.locationText}>{listing.location}</Text>
        </View>
      )}
    </View>
  )

  // 商品图片组件
  const ProductImages = ({ images }: { images?: string[] }) => (
    <View className={styles.productImages}>
      {images && images.length > 0 ? (
        images.map((image, index) => (
          <Image
            key={index}
            src={image}
            className={styles.productImage}
            mode='aspectFit'
            onClick={() => {
              Taro.previewImage({
                current: image,
                urls: images
              })
            }}
          />
        ))
      ) : (
        <Image
          src='/assets/placeholder.jpg'
          className={styles.productImage}
          mode='aspectFit'
        />
      )}
    </View>
  )

  // 商品描述组件
  const ProductDescription = ({ content }: { content?: string }) => (
    <View className={styles.productDescription}>
      <Text className={styles.descriptionTitle}>商品描述</Text>
      <Text className={styles.descriptionContent}>
        {content || '暂无描述'}
      </Text>
    </View>
  )

  // 卖家信息组件
  const SellerInfo = ({ user }: { user?: any }) => (
    <View className={styles.sellerInfo}>
      <View className={styles.sellerHeader}>
        <Image
          src={user?.avatar || '/assets/avatar1.png'}
          className={styles.sellerAvatar}
          mode='aspectFill'
        />
        <View className={styles.sellerDetails}>
          <Text className={styles.sellerName}>{user?.nickname || '未知用户'}</Text>
          <Text className={styles.sellerBio}>
            {user?.school && `${user.school}`}
            {user?.college && ` ${user.college}`}
          </Text>
        </View>
      </View>
      {user?.bio && (
        <Text className={styles.sellerDescription}>{user.bio}</Text>
      )}
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

  // 操作按钮组件
  const ActionButtons = ({ listing }: { listing: ListingRead }) => (
    <View className={styles.actionButtons}>
      <Button
        className={`${styles.actionButton} ${styles.favoriteButton}`}
        onClick={handleFavorite}
      >
        <Image
          src={listing.favorite_count && listing.favorite_count > 0 ? '/assets/heart-bold.svg' : '/assets/heart-outline.svg'}
          className={styles.buttonIcon}
        />
        <Text>收藏</Text>
      </Button>

      <Button
        className={`${styles.actionButton} ${styles.contactButton}`}
        onClick={handleContact}
      >
        <Image src='/assets/message-circle.svg' className={styles.buttonIcon} />
        <Text>联系卖家</Text>
      </Button>

      <Button
        className={`${styles.actionButton} ${styles.bookingButton}`}
        onClick={handleBooking}
      >
        <Text>立即预约</Text>
      </Button>
    </View>
  )

  if (detailLoading === 'pending') {
    return (
      <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CustomHeader title='商品详情' />
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!currentListing) {
    return (
      <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CustomHeader title='商品详情' />
        <View className={styles.emptyContainer}>
          <Text className={styles.emptyText}>商品不存在或已下架</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title='商品详情' />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }}>
          <ProductImages images={currentListing.images} />
          <ProductInfo listing={currentListing} />
          <ProductTags tags={currentListing.tags} />
          <ProductDescription content={currentListing.content} />
          <SellerInfo user={currentListing.user} />
        </ScrollView>
      </View>
      <ActionButtons listing={currentListing} />
    </View>
  )
}

export default SecondHandDetailPage
