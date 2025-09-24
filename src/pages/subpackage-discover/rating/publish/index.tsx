
import { useState } from 'react'

import { View, Text, Image, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useDispatch, useSelector } from 'react-redux'


import cameraIcon from '@/assets/camera.svg'
import starFilledIcon from '@/assets/star-filled.svg'
import starOutlineIcon from '@/assets/star-outline.svg'
import CustomHeader from '@/components/custom-header'
import { uploadApi } from '@/services/api/upload'
import { RootState, AppDispatch } from '@/store'
import { createUserRating } from '@/store/slices/ratingSlice'
import { RatingCategory } from '@/types/api/rating.d'

import styles from './index.module.scss'
// 引入图标


// 评分类别数据
const categories = [
  { value: RatingCategory.Course, label: '学习', description: '课程、教材、学习资源' },
  { value: RatingCategory.Food, label: '美食', description: '餐厅、菜品、美食推荐' },
  { value: RatingCategory.Game, label: '游戏', description: '游戏、游戏攻略、游戏设备' },
  { value: RatingCategory.Entertainment, label: '娱乐', description: '影视、音乐、娱乐活动' },
  { value: RatingCategory.Life, label: '生活', description: '生活服务、日用品、生活技巧' },
  { value: RatingCategory.Sport, label: '运动', description: '运动场所、体育用品、健身课程' },
  { value: RatingCategory.Other, label: '其他', description: '不属于以上分类的内容' },
]

// 星级数据
const stars = [1, 2, 3, 4, 5]

const RatingPublishPage = () => {
  const dispatch = useDispatch<AppDispatch>()

  // 表单状态 - 简化为核心字段
  const [formData, setFormData] = useState({
    resourceName: '',
    score: 5, // 默认5星
    comment: '',
    resourceType: RatingCategory.Other,
    image: '',
  })

  // UI 状态
  const [commentLength, setCommentLength] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // 获取用户状态和评分相关状态
  const { createRatingLoading } = useSelector((state: RootState) => state.rating)

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
            imageUrl =
              (uploadResult as any).url ||
              (uploadResult as any).data?.url ||
              (uploadResult as any).data ||
              ''
          }

          if (imageUrl) {
            setFormData((prev) => ({ ...prev, image: imageUrl }))
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
      fail: (err) => {
        // 用户取消选择是正常行为，不需要显示错误提示
        if (err.errMsg && err.errMsg.includes('cancel')) {
          return
        }
        // 只有真正的错误才显示提示
        Taro.showToast({ title: '选择图片失败', icon: 'none' })
      },
    })
  }

  // 预览图片
  const handlePreviewImage = () => {
    if (formData.image) {
      Taro.previewImage({
        urls: [formData.image],
        current: formData.image,
      })
    }
  }

  // 删除图片
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }))
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'comment') {
      setCommentLength((value as string).length)
    }
  }

  // 选择分类
  const handleCategorySelect = (category: RatingCategory) => {
    setFormData((prev) => ({ ...prev, resourceType: category }))
  }

  // 提交表单
  const handleSubmit = async () => {
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
      resource_image: formData.image || undefined,
      score: formData.score,
      comment: formData.comment.trim(),
      is_anonymous: false,
      tags: [],
      evidence_urls: formData.image ? [formData.image] : [],
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
        },
      })
    } else {
      Taro.navigateBack()
    }
  }

  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="发布评分" onLeftClick={handleBack} />

      <View className={styles.contentWrapper}>
        <ScrollView scrollY className={styles.scrollView}>
          {/* 主要信息卡片 */}
          <View className={styles.publishCard}>
            {/* 图片上传区域 */}
            <View className={styles.imageUploadSection}>
              {formData.image ? (
                <View className={styles.imagePreview}>
                  <Image
                    src={formData.image}
                    className={styles.previewImage}
                    mode="aspectFill"
                    onClick={handlePreviewImage}
                  />
                  <View className={styles.removeButton} onClick={handleRemoveImage}>
                    <Text className={styles.removeText}>×</Text>
                  </View>
                </View>
              ) : (
                <View className={styles.imageUpload} onClick={handleChooseImage}>
                  <Image
                    src={cameraIcon}
                    className={styles.cameraIcon}
                    style={{ width: '24px', height: '24px' }}
                  />
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
                placeholder="请输入资源名称"
                value={formData.resourceName}
                onInput={(e) => handleInputChange('resourceName', e.detail.value)}
                maxlength={50}
              />
            </View>

            {/* 评分星级 */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>评分 *</Text>
              <View className={styles.starContainer}>
                {stars.map((star) => (
                  <Image
                    key={star}
                    src={star <= formData.score ? starFilledIcon : starOutlineIcon}
                    className={styles.starIcon}
                    style={{ width: '24px', height: '24px' }}
                    onClick={() => setFormData((prev) => ({ ...prev, score: star }))}
                  />
                ))}
                <Text className={styles.scoreText}>{formData.score} 星</Text>
              </View>
            </View>

            {/* 评价内容 */}
            <View className={styles.formGroup}>
              <Text className={styles.label}>评价内容 *</Text>
              <Textarea
                className={styles.textarea}
                placeholder="分享你的使用感受..."
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
                    formData.resourceType === category.value ? styles.selected : ''
                  }`}
                  onClick={() => handleCategorySelect(category.value)}
                >
                  <Text className={styles.categoryName}>{category.label}</Text>
                  <Text className={styles.categoryDesc}>{category.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 提交按钮 */}
      <View className={styles.submitContainer}>
        <View
          className={`${styles.submitButton} ${
            !formData.resourceName.trim() || !formData.comment.trim() || createRatingLoading
              ? styles.disabled
              : ''
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
