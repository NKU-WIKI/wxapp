import { View, Text, Image, Input, Textarea, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { createUserRating } from '@/store/slices/ratingSlice'
import { RatingCategory } from '@/types/api/rating.d'
import { uploadApi } from '@/services/api/upload'
import CustomHeader from '@/components/custom-header'
import styles from './index.module.scss'

// 评分类别数据
const categories = [
  { value: RatingCategory.Course, label: '学习', description: '课程、教材、学习资源' },
  { value: RatingCategory.Food, label: '美食', description: '餐厅、菜品、美食推荐' },
  { value: RatingCategory.Game, label: '游戏', description: '游戏、游戏攻略、游戏设备' },
  { value: RatingCategory.Entertainment, label: '娱乐', description: '影视、音乐、娱乐活动' },
  { value: RatingCategory.Life, label: '生活', description: '生活服务、日用品、生活技巧' },
  { value: RatingCategory.Sport, label: '运动', description: '运动场所、体育用品、健身课程' },
  { value: RatingCategory.Other, label: '其他', description: '不属于以上分类的内容' }
]

// 星级数据
const stars = [1, 2, 3, 4, 5]

const RatingPublishPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  
  // 表单状态
  const [formData, setFormData] = useState({
    resourceName: '',
    resourceTitle: '',
    resourceDescription: '',
    score: 5, // 默认5星
    comment: '',
    resourceType: RatingCategory.Other,
    image: '',
    isAnonymous: false,
    tags: [] as string[]
  })
  
  // UI 状态
  const [commentLength, setCommentLength] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  // const [activeMenu, setActiveMenu] = useState<'category' | 'tags' | 'settings' | null>(null) // 未使用
  const [showStarSelector, setShowStarSelector] = useState(false)
  
  // 获取用户状态和评分相关状态
  const userState = useSelector((state: RootState) => state.user)
  const { createRatingLoading } = useSelector((state: RootState) => state.rating)
  
  const isLoggedIn = userState.isLoggedIn

  // 选择图片
  const handleChooseImage = () => {
    if (isUploading) return
    
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        setIsUploading(true)
        Taro.showLoading({ title: '上传中...', mask: true })
        
        try {
          const uploadResult = await uploadApi.uploadImage(tempFilePath)
          
          
          // 处理上传结果，参考主发布页面的处理方式
          let imageUrl = ''
          if (typeof uploadResult === 'string') {
            imageUrl = uploadResult
          } else if (uploadResult && typeof uploadResult === 'object') {
            // 处理各种可能的响应格式
            imageUrl = uploadResult.url || uploadResult.data?.url || uploadResult.data || ''
          }
          
          if (imageUrl) {
            setFormData(prev => ({ ...prev, image: imageUrl }))
            Taro.showToast({ title: '上传成功', icon: 'success' })
          } else {
            throw new Error('上传结果格式错误: ' + JSON.stringify(uploadResult))
          }
        } catch (error) {
          
          Taro.showToast({ title: '上传失败，请重试', icon: 'none' })
        } finally {
          setIsUploading(false)
          Taro.hideLoading()
        }
      },
      fail: (_err) => {
        
        Taro.showToast({ title: '选择图片失败', icon: 'none' })
      }
    })
  }

  // 预览图片
  const handlePreviewImage = () => {
    if (formData.image) {
      Taro.previewImage({
        urls: [formData.image],
        current: formData.image
      })
    }
  }

  // 删除图片
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'comment') {
      setCommentLength((value as string).length)
    }
  }

  // 选择分类
  const handleCategorySelect = (category: RatingCategory) => {
    setFormData(prev => ({ ...prev, resourceType: category }))
    setActiveMenu(null)
  }

  // 选择星级
  const handleStarSelect = (star: number) => {
    setFormData(prev => ({ ...prev, score: star }))
    setShowStarSelector(false)
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后发布评分',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' })
          }
        }
      })
      return
    }

    // 表单验证
    if (!formData.resourceName.trim()) {
      Taro.showToast({ title: '请输入资源名称', icon: 'none' })
      return
    }

    if (!formData.comment.trim()) {
      Taro.showToast({ title: '请输入评价内容', icon: 'none' })
      return
    }

    // 构建提交数据（使用新版 API 格式）
    const submitData = {
      resource_type: formData.resourceType,
      resource_name: formData.resourceName.trim(),
      resource_title: formData.resourceTitle.trim() || undefined,
      resource_description: formData.resourceDescription.trim() || undefined,
      resource_image: formData.image || undefined,
      score: formData.score,
      comment: formData.comment.trim(),
      is_anonymous: formData.isAnonymous,
      tags: formData.tags,
      evidence_urls: formData.image ? [formData.image] : []
    }

    
    
    try {
      const result = await dispatch(createUserRating(submitData))
      
      if (createUserRating.fulfilled.match(result)) {
        Taro.showToast({ title: '发布成功', icon: 'success' })
        
        // 返回上一页
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        throw new Error('发布失败')
      }
    } catch (error) {
      
      Taro.showToast({ title: '发布失败', icon: 'none' })
    }
  }

  // 处理返回
  const handleBack = () => {
    if (formData.resourceName.trim() || formData.comment.trim()) {
      Taro.showModal({
        title: '确认离开',
        content: '你有未保存的内容，确定要离开吗？',
        confirmText: '离开',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack()
          }
        }
      })
    } else {
      Taro.navigateBack()
    }
  }

  return (
    <View 
      className={styles.pageContainer}
      onClick={() => {
        setActiveMenu(null)
        setShowStarSelector(false)
      }}
    >
      <CustomHeader title='发布评分' onLeftClick={handleBack} />
      
      <View className={styles.contentWrapper}>
        <ScrollView 
          scrollY 
          className={styles.scrollView}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 主要信息卡片 */}
          <View className={styles.publishCard}>
            {/* 图片上传区域 */}
            <View className={styles.imageUploadSection}>
              {formData.image ? (
                <View className={styles.imagePreview}>
                  <Image 
                    src={formData.image} 
                    className={styles.previewImage}
                    mode='aspectFill'
                    onClick={handlePreviewImage}
                  />
                  <View className={styles.removeButton} onClick={handleRemoveImage}>
                    <Text className={styles.removeText}>×</Text>
                  </View>
                </View>
              ) : (
                <View className={styles.imageUpload} onClick={handleChooseImage}>
                  <View className={styles.cameraIcon}>
                    <Text className={styles.iconText}>📷</Text>
                  </View>
                  <Text className={styles.uploadText}>
                    {isUploading ? '上传中...' : '点击添加图片（可选）'}
                  </Text>
                </View>
              )}
            </View>

            {/* 资源名称 */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>资源名称 *</Text>
              <Input
                className={styles.input}
                placeholder='请输入资源名称'
                value={formData.resourceName}
                onInput={(e) => handleInputChange('resourceName', e.detail.value)}
                maxlength={50}
              />
              <Text className={styles.hint}>作为资源的唯一标识，相同名称将归为同一资源</Text>
            </View>

            {/* 资源标题（可选） */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>显示标题</Text>
              <Input
                className={styles.input}
                placeholder='显示标题（可选，用于更好的展示）'
                value={formData.resourceTitle}
                onInput={(e) => handleInputChange('resourceTitle', e.detail.value)}
                maxlength={100}
              />
            </View>

            {/* 评分星级 */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>评分 *</Text>
              <View 
                className={styles.starContainer} 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStarSelector(!showStarSelector)
                }}
              >
                {stars.map(star => (
                  <Text 
                    key={star}
                    className={`${styles.star} ${star <= formData.score ? styles.starActive : ''}`}
                  >
                    ⭐
                  </Text>
                ))}
                <Text className={styles.scoreText}>{formData.score} 星</Text>
              </View>
              
              {/* 星级选择器 */}
              {showStarSelector && (
                <View className={styles.starSelector}>
                  {stars.map(star => (
                    <View 
                      key={star}
                      className={`${styles.starOption} ${star === formData.score ? styles.selected : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStarSelect(star)
                      }}
                    >
                      <Text className={styles.starText}>{'⭐'.repeat(star)}</Text>
                      <Text className={styles.starLabel}>{star} 星</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 评价内容 */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>评价内容 *</Text>
              <Textarea
                className={styles.textarea}
                placeholder='分享你的使用感受...'
                value={formData.comment}
                onInput={(e) => handleInputChange('comment', e.detail.value)}
                maxlength={500}
                autoHeight
                showConfirmBar={false}
              />
              <Text className={styles.charCount}>{commentLength}/500</Text>
            </View>
          </View>

          {/* 分类选择卡片 */}
          <View className={styles.publishCard}>
            <Text className={styles.sectionTitle}>选择分类 *</Text>
            <View className={styles.categoriesContainer}>
              {categories.map((category) => (
                <View
                  key={category.value}
                  className={`${styles.categoryItem} ${
                    formData.resourceType === category.value ? styles.selected : ""
                  }`}
                  onClick={() => handleCategorySelect(category.value)}
                >
                  <Text className={styles.categoryName}>{category.label}</Text>
                  <Text className={styles.categoryDesc}>{category.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 可选设置卡片 */}
          <View className={styles.publishCard}>
            <Text className={styles.sectionTitle}>其他设置</Text>
            
            {/* 资源描述 */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>资源描述</Text>
              <Textarea
                className={styles.textarea}
                placeholder='简要描述这个资源（可选）'
                value={formData.resourceDescription}
                onInput={(e) => handleInputChange('resourceDescription', e.detail.value)}
                maxlength={200}
                autoHeight
                showConfirmBar={false}
              />
            </View>

            {/* 匿名选项 */}
            <View className={styles.settingItem}>
              <Text className={styles.settingLabel}>匿名评分</Text>
              <View 
                className={`${styles.switch} ${formData.isAnonymous ? styles.switchOn : ''}`}
                onClick={() => handleInputChange('isAnonymous', !formData.isAnonymous)}
              >
                <View className={styles.switchSlider}></View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 提交按钮 */}
      <View className={styles.submitContainer}>
        <View 
          className={`${styles.submitButton} ${
            (!formData.resourceName.trim() || !formData.comment.trim() || createRatingLoading) 
              ? styles.disabled : ''
          }`} 
          onClick={handleSubmit}
        >
          <Text className={styles.submitText}>
            {createRatingLoading ? '发布中...' : '发布评分'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default RatingPublishPage
