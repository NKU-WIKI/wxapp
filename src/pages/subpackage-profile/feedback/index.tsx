
import { useState, useEffect } from 'react'

import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'


import uploadIcon from '@/assets/feedback.svg'
import lightbulbIcon from '@/assets/lightbulb.svg'
import messageCircleIcon from '@/assets/message-circle.svg'
import moreIcon from '@/assets/more-horizontal.svg'
import xCircleIcon from '@/assets/x-circle.svg'
import { uploadImage } from '@/services/api/upload'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { submitFeedback } from '@/store/slices/feedbackSlice'

// Type imports
import { CreateFeedbackParams, DeviceInfo } from '@/types/api/feedback.d'

import styles from './index.module.scss'

// API imports

// Assets imports

// Relative imports

const FEEDBACK_TYPES = [
  { key: 'bug', label: '功能异常', icon: xCircleIcon },
  { key: 'ux', label: '体验问题', icon: messageCircleIcon },
  { key: 'suggest', label: '产品建议', icon: lightbulbIcon },
  { key: 'other', label: '其他', icon: moreIcon },
]

export default function FeedbackPage() {
  const dispatch = useAppDispatch()
  const { submitting } = useAppSelector((state) => state.feedback)

  const [type, setType] = useState<'bug' | 'ux' | 'suggest' | 'other'>('bug')
  const [desc, setDesc] = useState('')
  const [files, setFiles] = useState<any[]>([])
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({})
  const [appVersion, setAppVersion] = useState('')

  // 获取设备信息和应用版本
  useEffect(() => {
    const getSystemInfo = async () => {
      try {
        const systemInfo = await Taro.getSystemInfo()
        setDeviceInfo({
          brand: systemInfo.brand,
          model: systemInfo.model,
          system: systemInfo.system,
          platform: systemInfo.platform,
          SDKVersion: systemInfo.SDKVersion,
          version: systemInfo.version,
          app_version: '1.0.0', // 应用版本号
        })

        const accountInfo = await Taro.getAccountInfoSync()
        setAppVersion(accountInfo.miniProgram?.version || '1.0.0')
      } catch (_systemError) {}
    }

    getSystemInfo()
  }, [])

  const handleTypeClick = (key: string) => setType(key as any)

  const handleDescChange = (e) => setDesc(e.detail.value)

  const handleUpload = async () => {
    if (files.length >= 3) {
      Taro.showToast({ title: '最多上传3个文件', icon: 'none' })
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: 3 - files.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      const newFiles = res.tempFiles || res.tempFilePaths.map((path) => ({ path }))
      setFiles([...files, ...newFiles])
    } catch (error) {
      // 检查是否是用户取消操作
      if (error && typeof error === 'object' && 'errMsg' in error) {
        const errMsg = (error as any).errMsg
        if (errMsg && errMsg.includes('cancel')) {
          // 用户取消是正常行为，不显示错误提示
          return
        }
      }

      Taro.showToast({ title: '选择图片失败', icon: 'none' })
    }
  }

  const handleRemoveFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx))
  }

  // 上传图片到服务器（统一使用 uploadApi）
  const uploadImages = async (): Promise<string[]> => {
    if (files.length === 0) return []
    const uploadPromises = files.map(async (file) => uploadImage(file.path))
    return Promise.all(uploadPromises)
  }

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Taro.showToast({ title: '请填写问题描述', icon: 'none' })
      return
    }

    try {
      // 先上传图片
      let imageUrls: string[] = []
      if (files.length > 0) {
        Taro.showLoading({ title: '上传图片中...' })
        imageUrls = await uploadImages()
        Taro.hideLoading()
      }

      // 构建反馈数据 - 根据后端Feedback模型
      const feedbackData: CreateFeedbackParams = {
        content: desc.trim(),
        type,
        images: imageUrls,
        device_info: deviceInfo,
        version: appVersion,
      }

      await dispatch(submitFeedback(feedbackData)).unwrap()

      Taro.showToast({ title: '反馈成功，感谢您的付出', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (_submitError) {
      Taro.showToast({
        title: '反馈失败',
        icon: 'none',
      })
    }
  }

  return (
    <View className={styles.page}>
      {/* 反馈类型 */}
      <View className={styles.section} style={{ marginTop: 20 }}>
        <Text className={styles.sectionTitle}>反馈类型</Text>
        <View className={styles.typeGrid}>
          {FEEDBACK_TYPES.map((item) => (
            <View
              key={item.key}
              className={`${styles.typeBtn} ${type === item.key ? styles.selected : ''}`}
              onClick={() => handleTypeClick(item.key)}
            >
              <View
                className={styles.typeIcon}
                style={{ '--icon-url': `url(${item.icon})` } as any}
              />
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 问题描述 */}
      <View className={styles.section} style={{ marginTop: 24 }}>
        <Text className={styles.sectionTitle}>问题描述</Text>
        <Textarea
          className={styles.textarea}
          value={desc}
          onInput={handleDescChange}
          placeholder="请详细描述您遇到的问题..."
          maxlength={500}
          autoHeight
        />
      </View>

      {/* 上传附件 */}
      <View className={styles.section} style={{ marginTop: 24 }}>
        <Text className={styles.sectionTitle}>上传附件</Text>
        <View className={styles.uploadBox} onClick={handleUpload}>
          <View
            className={styles.uploadIcon}
            style={{ '--icon-url': `url(${uploadIcon})` } as any}
          />
          <Text className={styles.uploadText}>点击或拖拽上传文件</Text>
        </View>
        <View className={styles.fileList}>
          {files.map((file, idx) => (
            <View key={idx} className={styles.fileItem}>
              <Text>{file.name || file.path.split('/').pop()}</Text>
              <Text
                className={styles.removeFile}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile(idx)
                }}
              >
                删除
              </Text>
            </View>
          ))}
        </View>
        <Text className={styles.uploadTip}>最多可上传3个文件，单个文件不超过5MB</Text>
      </View>

      {/* 提交按钮 */}
      <Button
        className={styles.submitBtn}
        onClick={handleSubmit}
        loading={submitting}
        style={{ marginTop: 40, width: 343, height: 48, borderRadius: 24 }}
      >
        提交反馈
      </Button>
    </View>
  )
}
