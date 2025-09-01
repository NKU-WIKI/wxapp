import { View, ScrollView, Text, Image, Input, Textarea, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useCallback, useEffect } from 'react'

import CustomHeader from '@/components/custom-header'
import { createListing, fetchCategories, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingType, ListingCondition, CategoryRead } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'

import styles from './index.module.scss'

const SecondHandPublishPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()
  const { createLoading, error, categories } = useSelector((state: RootState) => state.marketplace)

  // 表单状态
  const [listingType, setListingType] = useState<ListingType>(ListingType.SELL)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState<ListingCondition>(ListingCondition.NEW)
  const [location, setLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryRead | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState('')
  const [isPublicContact, setIsPublicContact] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // 表单验证
  const validateForm = useCallback(() => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入商品标题', icon: 'none' })
      return false
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入商品描述', icon: 'none' })
      return false
    }
    if (!selectedCategory) {
      Taro.showToast({ title: '请选择商品分类', icon: 'none' })
      return false
    }
    if (listingType === ListingType.SELL && !price.trim()) {
      Taro.showToast({ title: '请输入商品价格', icon: 'none' })
      return false
    }
    return true
  }, [title, content, selectedCategory, listingType, price])

  // 处理图片上传
  const handleImageUpload = useCallback(async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths.length > 0) {
        // 这里应该上传图片到服务器并获取URL
        // 暂时模拟上传成功
        const newImages = [...images, ...res.tempFilePaths]
        setImages(newImages)
        Taro.showToast({ title: '图片上传成功', icon: 'success' })
      }
    } catch (uploadError) {
      // 
      Taro.showToast({ title: '上传图片失败', icon: 'none' })
    }
  }, [images])

  // 处理标签添加
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }, [tagInput, tags])

  // 处理标签删除
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  // 处理分类选择
  const handleCategorySelect = useCallback(() => {
    if (categories.length === 0) {
      Taro.showToast({ title: '暂无可选分类', icon: 'none' })
      return
    }

    const categoryOptions = categories.map(cat => cat.name)
    Taro.showActionSheet({
      itemList: categoryOptions,
      success: (res) => {
        setSelectedCategory(categories[res.tapIndex])
      }
    })
  }, [categories])

  // 处理商品成色选择
  const handleConditionSelect = useCallback(() => {
    const conditions = [
      { label: '全新', value: ListingCondition.NEW },
      { label: '九成新', value: ListingCondition.LIKE_NEW },
      { label: '八成新', value: ListingCondition.GOOD },
      { label: '七成新', value: ListingCondition.ACCEPTABLE },
      { label: '其他', value: ListingCondition.DAMAGED },
    ]

    const conditionLabels = conditions.map(c => c.label)
    Taro.showActionSheet({
      itemList: conditionLabels,
      success: (res) => {
        setCondition(conditions[res.tapIndex].value)
      }
    })
  }, [])

  // 处理发布
  const handlePublish = useCallback(async () => {
    if (!checkAuth()) return

    if (!validateForm()) return

    try {
      const listingData = {
        title: title.trim(),
        content: content.trim(),
        category_id: selectedCategory!.id,
        listing_type: listingType,
        price: listingType === ListingType.SELL ? parseFloat(price) : undefined,
        condition,
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        images: images.length > 0 ? images : undefined,
      }

      await dispatch(createListing(listingData)).unwrap()

      Taro.showToast({ title: '发布成功', icon: 'success' })
      // 返回上一页
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (publishError) {
      // 
      // 错误已经在slice中处理了，这里不需要额外处理
    }
  }, [checkAuth, validateForm, title, content, selectedCategory, listingType, price, condition, location, tags, images, dispatch])

  // 初始化数据
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 类型标签组件
  const ActionTabs = () => (
    <View className={styles.actionTabs}>
      <Text
        className={`${styles.tab} ${listingType === ListingType.SELL ? styles.active : ''}`}
        onClick={() => setListingType(ListingType.SELL)}
      >
        出闲置
      </Text>
      <Text
        className={`${styles.tab} ${listingType === ListingType.BUY ? styles.active : ''}`}
        onClick={() => setListingType(ListingType.BUY)}
      >
        收二手
      </Text>
    </View>
  )

  // 图片上传组件
  const ImageUploader = () => (
    <View className={styles.imageUploader}>
      {images.map((image, index) => (
        <View key={index} className={styles.imageWrapper}>
          <Image src={image} className={styles.uploadedImage} mode='aspectFill' />
          <View
            className={styles.removeImage}
            onClick={() => setImages(images.filter((_, i) => i !== index))}
          >
            <Text className={styles.removeIcon}>×</Text>
      </View>
        </View>
      ))}
      {images.length < 9 && (
        <View className={styles.uploadBox} onClick={handleImageUpload}>
          <Image src='/assets/camera.svg' className={styles.cameraIcon} />
          <Text className={styles.uploadText}>上传图片 ({images.length}/9)</Text>
        </View>
      )}
    </View>
  )

  // 表单输入组件
  // eslint-disable-next-line no-unused-vars
  const FormInput = ({ placeholder, value, onChange, isTextarea = false, type = "text" }: { placeholder: string; value: string; onChange: (value: string) => void; isTextarea?: boolean; type?: any }) => {
    // 重命名参数以避免未使用变量警告
    return (
      <View className={styles.formInput}>
        {isTextarea ? (
          <Textarea
            placeholder={placeholder}
            value={value}
            onInput={(e) => onChange(e.detail.value)}
          />
        ) : (
          <Input
            type={type}
            placeholder={placeholder}
            value={value}
            onInput={(e) => onChange(e.detail.value)}
          />
        )}
      </View>
    )
  }

  // 表单行组件
  const FormRow = ({ label, children, onClick }) => (
    <View className={`${styles.formRow} ${onClick ? styles.clickable : ''}`} onClick={onClick}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.content}>{children}</View>
    </View>
  )

  // 标签组件
  const TagList = () => (
    <View className={styles.tagList}>
      {tags.map((tag, index) => (
        <View key={index} className={styles.tag}>
          <Text className={styles.tagText}>{tag}</Text>
          <Text
            className={styles.tagRemove}
            onClick={() => handleRemoveTag(tag)}
          >
            ×
          </Text>
        </View>
      ))}
      {tags.length < 5 && (
        <View className={styles.tagInput}>
          <Input
            placeholder='添加标签'
            value={tagInput}
            onInput={(e) => setTagInput(e.detail.value)}
            onConfirm={handleAddTag}
          />
        </View>
      )}
    </View>
  )

  // 温馨提示组件
  const WarmTips = () => (
    <View className={styles.warmTips}>
      <Text className={styles.tipTitle}>温馨提示：</Text>
      <Text>1. 请确保发布的商品信息真实有效</Text>
      <Text>2. 严禁发布违禁物品</Text>
      <Text>3. 如有违规将被平台处理</Text>
      <Text>4. 建议上传清晰的商品照片</Text>
    </View>
  )

  // 发布按钮组件
  const PublishButton = () => (
    <View className={styles.publishButton}>
      <Text
        className={`${styles.publishBtn} ${createLoading === "pending" ? styles.disabled : ""}`}
        onClick={createLoading !== "pending" ? handlePublish : undefined}
      >
        {createLoading === "pending" ? "发布中..." : "发布商品"}
      </Text>
    </View>
  )

  return (
    <View style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CustomHeader title='发布商品' />
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ScrollView scrollY style={{ height: "100%" }}>
          <ActionTabs />
          <View className={styles.formContainer}>
            <ImageUploader />

            <FormInput
              placeholder='请输入商品标题 (必填)'
              value={title}
              onChange={setTitle}
            />

            <FormInput
              placeholder='请详细描述一下商品的成色、规格等信息... (必填)'
              value={content}
              onChange={setContent}
              isTextarea
            />

            {listingType === ListingType.SELL && (
            <FormRow label='¥' onClick={() => {}}>
                <Input
                  type='number'
                  placeholder='设置价格'
                  value={price}
                  onInput={(e) => setPrice(e.detail.value)}
                  className={styles.priceInput}
                />
              </FormRow>
            )}

            <FormRow label='商品分类' onClick={handleCategorySelect}>
              <Text className={styles.pickerText}>
                {selectedCategory ? selectedCategory.name : "请选择分类"}
              </Text>
              <Text className={styles.arrow}> &gt;</Text>
            </FormRow>

            <FormRow label='商品成色' onClick={handleConditionSelect}>
              <Text className={styles.pickerText}>
                {condition === ListingCondition.NEW && "全新"}
                {condition === ListingCondition.LIKE_NEW && "九成新"}
                {condition === ListingCondition.GOOD && "八成新"}
                {condition === ListingCondition.ACCEPTABLE && "七成新"}
                {condition === ListingCondition.DAMAGED && "其他"}
              </Text>
              <Text className={styles.arrow}> &gt;</Text>
            </FormRow>

            <FormInput
              placeholder='交易地点 (选填)'
              value={location}
              onChange={setLocation}
            />

            <FormRow label='标签' onClick={() => {}}>
              <TagList />
            </FormRow>

            <FormInput
              placeholder='联系方式 (选填，如微信号、手机号)'
              value={contactInfo}
              onChange={setContactInfo}
            />

            <FormRow label='公开联系方式' onClick={() => {}}>
              <Switch
                color='#4F46E5'
                checked={isPublicContact}
                onChange={(e) => setIsPublicContact(e.detail.value)}
              />
            </FormRow>
          </View>
          <WarmTips />
          <PublishButton />
        </ScrollView>
      </View>
    </View>
  )
}

export default SecondHandPublishPage
