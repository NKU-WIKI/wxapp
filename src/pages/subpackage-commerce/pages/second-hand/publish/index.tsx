import { View, ScrollView, Text, Input, Textarea, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import React, { useState, useCallback, useEffect, FC } from 'react'

import CustomHeader from '@/components/custom-header'
import ImageUploader from '@/components/image-uploader'
import * as marketplaceSlice from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingType, ListingCondition, CategoryRead } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'

import styles from './index.module.scss'

// #region Sub-components

interface ActionTabsProps {
  listingType: ListingType
  onTabClick: (_type: ListingType) => void
}
const ActionTabs: FC<ActionTabsProps> = React.memo(({ listingType, onTabClick }) => {
  // 使用参数以避免lint警告
  void listingType
  void onTabClick

  return (
    <View className={styles.actionTabs}>
      <Text
        className={`${styles.tab} ${listingType === ListingType.SELL ? styles.active : ''}`}
        onClick={() => onTabClick(ListingType.SELL)}
      >
        出闲置
      </Text>
      <Text
        className={`${styles.tab} ${listingType === ListingType.BUY ? styles.active : ''}`}
        onClick={() => onTabClick(ListingType.BUY)}
      >
        收二手
      </Text>
    </View>
  )
})



interface FormInputProps {
  placeholder: string
  value: string
  onChange: (_value: string) => void
  isTextarea?: boolean
  type?: string
}
const FormInput: FC<FormInputProps> = React.memo(({ placeholder: _placeholder, value: _value, onChange, isTextarea = false, type: _type = 'text' }) => {
  // 使用参数以避免lint警告
  void _placeholder
  void _value
  void onChange
  void isTextarea
  void _type

  const handleInput = (e: any) => {
    onChange(e.detail.value)
  }

  return (
    <View className={styles.formInput}>
      <View className={styles.formInputWrapper}>
        {isTextarea ? (
          <Textarea
            placeholder={_placeholder}
            value={_value}
            onInput={handleInput}
            adjustPosition={false}
            holdKeyboard
          />
        ) : (
          <Input
            type={_type as any}
            placeholder={_placeholder}
            value={_value}
            onInput={handleInput}
            adjustPosition={false}
            holdKeyboard
          />
        )}
      </View>
    </View>
  )
})

interface FormRowProps {
  label: string
  children: React.ReactNode
  onClick?: () => void
}
const FormRow: FC<FormRowProps> = React.memo(({ label, children, onClick }) => (
  <View className={`${styles.formRow} ${onClick ? styles.clickable : ''}`} onClick={onClick}>
    <Text className={styles.label}>{label}</Text>
    <View className={styles.content}>{children}</View>
  </View>
))

interface TagListProps {
  tags: string[]
  tagInput: string
  onTagInputChange: (_value: string) => void
  onAddTag: () => void
  onRemoveTag: (_tag: string) => void
}
const TagList: FC<TagListProps> = React.memo(({ tags: _tags, tagInput: _tagInput, onTagInputChange, onAddTag, onRemoveTag }) => {
  // 使用参数以避免lint警告
  void _tags
  void _tagInput
  void onTagInputChange
  void onAddTag
  void onRemoveTag

  const handleInput = (e: any) => onTagInputChange(e.detail.value)

  return (
    <View className={styles.tagList}>
      {_tags.map((tag, index) => (
        <View key={index} className={styles.tag}>
          <Text className={styles.tagText}>{tag}</Text>
          <Text className={styles.tagRemove} onClick={() => onRemoveTag(tag)}>
            ×
          </Text>
        </View>
      ))}
      {_tags.length < 5 && (
        <View className={styles.tagInput}>
          <Input
            placeholder='添加标签'
            value={_tagInput}
            onInput={handleInput}
            onConfirm={onAddTag}
            adjustPosition={false}
            holdKeyboard
          />
        </View>
      )}
    </View>
  )
})

interface ContactInputsProps {
  wechatId: string
  qqNumber: string
  phoneNumber: string
  onWechatChange: (_value: string) => void
  onQqChange: (_value: string) => void
  onPhoneChange: (_value: string) => void
}
const ContactInputs: FC<ContactInputsProps> = React.memo(({
  wechatId: _wechatId,
  qqNumber: _qqNumber,
  phoneNumber: _phoneNumber,
  onWechatChange,
  onQqChange,
  onPhoneChange
}) => {
  // 使用参数以避免lint警告
  void _wechatId
  void _qqNumber
  void _phoneNumber
  void onWechatChange
  void onQqChange
  void onPhoneChange

  return (
    <View className={styles.contactInputs}>
      <FormRow label='微信号' onClick={() => {}}>
        <View className={styles.contactInputWrapper}>
          <Input
            type='text'
            placeholder='请输入微信号 (选填)'
            value={_wechatId}
            onInput={(e) => onWechatChange(e.detail.value)}
            adjustPosition={false}
            holdKeyboard
          />
        </View>
      </FormRow>
      <FormRow label='QQ号' onClick={() => {}}>
        <View className={styles.contactInputWrapper}>
          <Input
            type='number'
            placeholder='请输入QQ号 (选填)'
            value={_qqNumber}
            onInput={(e) => onQqChange(e.detail.value)}
            adjustPosition={false}
            holdKeyboard
          />
        </View>
      </FormRow>
      <FormRow label='手机号' onClick={() => {}}>
        <View className={styles.contactInputWrapper}>
          <Input
            type='number'
            placeholder='请输入手机号 (选填)'
            value={_phoneNumber}
            onInput={(e) => onPhoneChange(e.detail.value)}
            adjustPosition={false}
            holdKeyboard
          />
        </View>
      </FormRow>
    </View>
  )
})

const WarmTips: FC = React.memo(() => (
  <View className={styles.warmTips}>
    <Text className={styles.tipTitle}>温馨提示：</Text>
    <Text className={styles.tipItem}>请确保发布的商品信息真实有效</Text>
    <Text className={styles.tipItem}>严禁发布违禁物品</Text>
    <Text className={styles.tipItem}>如有违规将被平台处理</Text>
    <Text className={styles.tipItem}>建议上传清晰的商品照片</Text>
  </View>
))

interface PublishButtonProps {
  isLoading: boolean
  onClick: () => void
}
const PublishButton: FC<PublishButtonProps> = React.memo(({ isLoading, onClick }) => (
  <View className={styles.publishButton}>
    <Text
      className={`${styles.publishBtn} ${isLoading ? styles.disabled : ''}`}
      onClick={!isLoading ? onClick : undefined}
    >
      {isLoading ? '发布中...' : '发布商品'}
    </Text>
  </View>
))

// #endregion
/* eslint-enable @typescript-eslint/no-unused-vars */

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
  const [wechatId, setWechatId] = useState('')
  const [qqNumber, setQqNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isPublicContact, setIsPublicContact] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isPublishing, setIsPublishing] = useState(false) // 添加发布状态控制

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
    if (!price.trim()) {
      const message = listingType === ListingType.SELL ? '请输入商品价格' : '请输入您的预算'
      Taro.showToast({ title: message, icon: 'none' })
      return false
    }
    return true
  }, [title, content, selectedCategory, listingType, price])



  // 处理标签添加
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }, [tagInput, tags])

  // 处理标签删除
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags(tags.filter((tag) => tag !== tagToRemove))
    },
    [tags]
  )

  // 处理分类选择
  const handleCategorySelect = useCallback(() => {
    if (categories.length === 0) {
      Taro.showToast({ title: '暂无可选分类', icon: 'none' })
      return
    }

    if (categories.length <= 6) {
      // 分类数量不超过6个，使用 ActionSheet
      const categoryOptions = categories.map((cat) => cat.name)
      Taro.showActionSheet({
        itemList: categoryOptions,
        success: (res) => {
          setSelectedCategory(categories[res.tapIndex])
        },
        fail: (_res) => {
          // 用户取消选择，不做任何操作
        }
      })
    } else {
      // 分类数量超过6个，分批显示
      const totalPages = Math.ceil(categories.length / 6)

      const showCategoryPage = (pageIndex: number) => {
        const startIndex = pageIndex * 6
        const endIndex = Math.min(startIndex + 6, categories.length)
        const pageCategories = categories.slice(startIndex, endIndex)

        const options = pageCategories.map(cat => cat.name)
        if (pageIndex < totalPages - 1) {
          options.push('下一页')
        }
        if (pageIndex > 0) {
          options.unshift('上一页')
        }

        Taro.showActionSheet({
          itemList: options,
          success: (res) => {
            const selectedIndex = res.tapIndex

            if (pageIndex > 0 && selectedIndex === 0) {
              // 点击上一页
              showCategoryPage(pageIndex - 1)
            } else if (pageIndex < totalPages - 1 && selectedIndex === options.length - 1) {
              // 点击下一页
              showCategoryPage(pageIndex + 1)
            } else {
              // 选择分类
              let actualIndex = selectedIndex
              if (pageIndex > 0) {
                actualIndex -= 1 // 减去"上一页"选项
              }
              setSelectedCategory(pageCategories[actualIndex])
            }
          },
          fail: (_res) => {
            // 用户取消选择，不做任何操作
          }
        })
      }

      showCategoryPage(0)
    }
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

    const conditionLabels = conditions.map((c) => c.label)
    Taro.showActionSheet({
      itemList: conditionLabels,
      success: (res) => {
        setCondition(conditions[res.tapIndex].value)
      },
      fail: (_res) => {
        // 用户取消选择，不做任何操作
        // _res.errMsg 可能为 "showActionSheet:fail cancel"
      }
    })
  }, [])

  // 处理发布
  const handlePublish = useCallback(async () => {
    if (!checkAuth() || !validateForm() || isPublishing) return

    setIsPublishing(true) // 设置发布状态，防止重复点击

    try {
      // 合并联系方式信息
      const contactParts: string[] = []
      if (wechatId.trim()) contactParts.push(`微信: ${wechatId.trim()}`)
      if (qqNumber.trim()) contactParts.push(`QQ: ${qqNumber.trim()}`)
      if (phoneNumber.trim()) contactParts.push(`手机: ${phoneNumber.trim()}`)
      const contactInfo = contactParts.length > 0 ? contactParts.join(', ') : undefined

      const listingData = {
        title: title.trim(),
        content: content.trim(),
        category_id: selectedCategory!.id,
        listing_type: listingType,
        price: parseFloat(price) || undefined,
        condition,
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        images: images.length > 0 ? images : undefined,
        contact_info: contactInfo,
      }

      await dispatch(marketplaceSlice.createListing(listingData)).unwrap()

      Taro.showToast({ title: '发布成功', icon: 'success' })

      // 使用更短的延迟时间，避免页面跳转时的DOM冲突
      setTimeout(() => {
        // 在跳转前立即清除发布状态，避免DOM更新冲突
        setIsPublishing(false)

        // 使用更保守的导航方式
        Taro.navigateBack({
          delta: 1,
          success: () => {
            // 导航成功，无需额外处理
          },
          fail: (_navError) => {
            // 导航失败，静默处理
          }
        })
      }, 300)
    } catch (publishError) {
      // 错误已在 slice 中统一处理
      setIsPublishing(false) // 发生错误时恢复状态
    }
  }, [checkAuth, validateForm, isPublishing, title, content, selectedCategory, listingType, price, condition, location, tags, images, wechatId, qqNumber, phoneNumber, dispatch])

  const handleContactSwitch = (e: any) => {
    setIsPublicContact(e.detail.value)
  }

  const handlePriceInput = (e: any) => {
    setPrice(e.detail.value)
  }

  // 初始化数据
  useEffect(() => {
    dispatch(marketplaceSlice.fetchCategories(undefined))
  }, [dispatch])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(marketplaceSlice.clearError())
    }
  }, [error, dispatch])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 组件卸载时清除所有可能的状态更新
      setIsPublishing(false)
    }
  }, [])

  return (
    <View className={styles.pageContainer}>
      <CustomHeader title='发布商品' />
      <View className={styles.scrollWrapper}>
        <ScrollView scrollY className={styles.scrollView}>
          <ActionTabs listingType={listingType} onTabClick={setListingType} />
          <View className={styles.formContainer}>
            <ImageUploader
              initialImages={images}
              maxCount={9}
              onChange={setImages}
              uploadButtonText='上传图片'
            />

            <FormInput placeholder='请输入商品标题 (必填)' value={title} onChange={setTitle} type='text' />

            <FormInput
              placeholder='请详细描述一下商品的成色、规格等信息... (必填)'
              value={content}
              onChange={setContent}
              isTextarea
            />

            <FormRow label='¥' onClick={() => {}}>
              <Input
                type='number'
                placeholder={listingType === ListingType.SELL ? '设置价格' : '设置预算'}
                value={price}
                onInput={handlePriceInput}
                className={styles.priceInput}
                adjustPosition={false}
                holdKeyboard
              />
            </FormRow>

            <FormRow label='商品分类' onClick={handleCategorySelect}>
              <Text className={styles.pickerText}>{selectedCategory ? selectedCategory.name : '请选择分类'}</Text>
              <Text className={styles.arrow}> &gt;</Text>
            </FormRow>

            <FormRow label='商品成色' onClick={handleConditionSelect}>
              <Text className={styles.pickerText}>
                {condition === ListingCondition.NEW && '全新'}
                {condition === ListingCondition.LIKE_NEW && '九成新'}
                {condition === ListingCondition.GOOD && '八成新'}
                {condition === ListingCondition.ACCEPTABLE && '七成新'}
                {condition === ListingCondition.DAMAGED && '其他'}
              </Text>
              <Text className={styles.arrow}> &gt;</Text>
            </FormRow>

            <FormInput placeholder='交易地点 (选填)' value={location} onChange={setLocation} type='text' />

            <FormRow label='标签' onClick={() => {}}>
              <TagList
                tags={tags}
                tagInput={tagInput}
                onTagInputChange={setTagInput}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </FormRow>

            <ContactInputs
              wechatId={wechatId}
              qqNumber={qqNumber}
              phoneNumber={phoneNumber}
              onWechatChange={setWechatId}
              onQqChange={setQqNumber}
              onPhoneChange={setPhoneNumber}
            />

            <FormRow label='公开联系方式' onClick={() => {}}>
              <Switch color='#4F46E5' checked={isPublicContact} onChange={handleContactSwitch} />
            </FormRow>
          </View>
          <WarmTips />
          <View className={styles.safeAreaSpacer} />
        </ScrollView>
      </View>
      <PublishButton isLoading={isPublishing || createLoading === 'pending'} onClick={handlePublish} />
    </View>
  )
}

export default SecondHandPublishPage
