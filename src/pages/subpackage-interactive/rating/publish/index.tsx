import { View, Text, Image, Input, Textarea } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import CustomHeader from '@/components/custom-header'
import styles from './index.module.scss'

// 分类选项 - 分为两组，避免ActionSheet限制（第一组最多5个 + "更多" = 6个）
const CATEGORY_OPTIONS_GROUP1 = [
  { id: 'course', name: '课程' },
  { id: 'food', name: '美食' },
  { id: 'game', name: '游戏' },
  { id: 'entertainment', name: '娱乐' },
  { id: 'life', name: '生活' }
]

const CATEGORY_OPTIONS_GROUP2 = [
  { id: 'study', name: '学习' },
  { id: 'sports', name: '运动' },
  { id: 'other', name: '其他' }
]

const ALL_CATEGORY_OPTIONS = [...CATEGORY_OPTIONS_GROUP1, ...CATEGORY_OPTIONS_GROUP2]

const RatingPublishPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: ''
  })
  const [loading, setLoading] = useState(false)
  const [descriptionLength, setDescriptionLength] = useState(0)
  
  // 获取用户状态
  const userState = useSelector((state: RootState) => state.user)
  const isLoggedIn = userState.isLoggedIn

  // 选择图片
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setFormData(prev => ({ ...prev, image: tempFilePath }))
        console.log('选择图片成功:', tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
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
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'description') {
      setDescriptionLength(value.length)
    }
  }

  // 选择分类 - 使用模态框替代ActionSheet
  const handleCategorySelect = () => {
    const categoryNames = ALL_CATEGORY_OPTIONS.map(cat => cat.name)
    
    Taro.showActionSheet({
      itemList: [...CATEGORY_OPTIONS_GROUP1.map(cat => cat.name), '更多分类...'],
      success: (res) => {
        if (res.tapIndex < CATEGORY_OPTIONS_GROUP1.length) {
          // 选择了第一组的分类
          const selectedCategory = CATEGORY_OPTIONS_GROUP1[res.tapIndex]
          setFormData(prev => ({ 
            ...prev, 
            category: selectedCategory.id 
          }))
        } else {
          // 选择了"更多分类"，显示第二组
          Taro.showActionSheet({
            itemList: CATEGORY_OPTIONS_GROUP2.map(cat => cat.name),
            success: (res2) => {
              const selectedCategory = CATEGORY_OPTIONS_GROUP2[res2.tapIndex]
              setFormData(prev => ({ 
                ...prev, 
                category: selectedCategory.id 
              }))
            }
          })
        }
      }
    })
  }

  // 获取分类显示名称
  const getCategoryName = (categoryId: string) => {
    const category = ALL_CATEGORY_OPTIONS.find(cat => cat.id === categoryId)
    return category ? category.name : '请选择分类'
  }

  // 表单验证
  const validateForm = () => {
    if (!formData.name.trim()) {
      Taro.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return false
    }

    if (!formData.description.trim()) {
      Taro.showToast({
        title: '请输入简介',
        icon: 'none'
      })
      return false
    }

    if (!formData.category) {
      Taro.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return false
    }

    return true
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后发布内容',
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

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // TODO: 上传图片到服务器
      let imageUrl = formData.image
      if (formData.image) {
        console.log('需要上传图片:', formData.image)
        // 这里应该调用图片上传API
        // imageUrl = await uploadImage(formData.image)
      }

      // TODO: 提交数据到服务器
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        image: imageUrl
      }
      
      console.log('提交数据:', submitData)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      Taro.showToast({
        title: '发布成功',
        icon: 'success'
      })
      
      // 延迟返回上一页
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
      
    } catch (error) {
      console.error('发布失败:', error)
      Taro.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className={styles.publishPage}>
      <CustomHeader title="发布" />
      
      <View className={styles.content}>
        {/* 图片上传区域 */}
        <View className={styles.imageSection}>
          {formData.image ? (
            <View className={styles.imageContainer}>
              <Image 
                src={formData.image} 
                className={styles.uploadedImage}
                mode="aspectFill"
                onClick={handlePreviewImage}
              />
              <View className={styles.imageActions}>
                <View className={styles.removeButton} onClick={handleRemoveImage}>
                  <Text className={styles.removeIcon}>×</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className={styles.uploadArea} onClick={handleChooseImage}>
              <Image src="/assets/camera.svg" className={styles.uploadIcon} />
              <Text className={styles.uploadText}>点击添加图片</Text>
            </View>
          )}
        </View>

        {/* 名称输入 */}
        <View className={styles.formSection}>
          <Text className={styles.label}>名称</Text>
          <Input
            className={styles.nameInput}
            placeholder="请输入名称"
            value={formData.name}
            onInput={(e) => handleInputChange('name', e.detail.value)}
            maxlength={50}
          />
        </View>

        {/* 分类选择 */}
        <View className={styles.formSection}>
          <Text className={styles.label}>分类</Text>
          <View className={styles.categorySelector} onClick={handleCategorySelect}>
            <Text className={`${styles.categoryText} ${!formData.category ? styles.placeholder : ''}`}>
              {getCategoryName(formData.category)}
            </Text>
            <Text className={styles.arrow}>▼</Text>
          </View>
        </View>

        {/* 简介输入 */}
        <View className={styles.formSection}>
          <Text className={styles.label}>简介</Text>
          <Textarea
            className={styles.descriptionInput}
            placeholder="请输入简介内容"
            value={formData.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
            maxlength={200}
          />
          <View className={styles.charCount}>
            <Text className={styles.charCountText}>{descriptionLength}/200</Text>
          </View>
        </View>
      </View>

      {/* 底部提交按钮 */}
      <View className={styles.bottomSection}>
        <View 
          className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
          onClick={handleSubmit}
        >
          <Text className={styles.submitText}>
            {loading ? '发布中...' : '提交'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default RatingPublishPage
