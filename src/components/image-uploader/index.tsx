import React, { FC } from 'react'
import { View, Image, Text } from '@tarojs/components'
import classnames from 'classnames'
import { useImageUpload, ImageUploadOptions } from '@/hooks/useImageUpload'

import styles from './index.module.scss'

export interface ImageUploaderProps {
  /** 初始图片列表 */
  initialImages?: string[]
  /** 最大上传数量 */
  maxCount?: number
  /** 是否显示上传按钮 */
  showUploadButton?: boolean
  /** 上传按钮文本 */
  uploadButtonText?: string
  /** 自定义类名 */
  className?: string
  /** 上传选项 */
  uploadOptions?: Omit<ImageUploadOptions, 'onSuccess' | 'onError'>
  /** 上传成功回调 */
  onUploadSuccess?: (_urls: string[]) => void
  /** 上传失败回调 */
  onUploadError?: (_error: Error) => void
  /** 图片变化回调 */
  onChange?: (_images: string[]) => void
  /** 删除图片回调 */
  onRemove?: (_index: number) => void
}

const ImageUploader: FC<ImageUploaderProps> = ({
  initialImages = [],
  maxCount = 9,
  showUploadButton = true,
  uploadButtonText = '上传图片',
  className,
  uploadOptions,
  onUploadSuccess,
  onUploadError,
  onChange,
  onRemove
}) => {
  const {
    images,
    isUploading,
    uploadProgress,
    uploadImages,
    removeImage
  } = useImageUpload(initialImages)

  // 处理图片变化 - 使用useCallback优化
  const handleImageChange = React.useCallback((_newImages: string[]) => {
    onChange?.(_newImages)
  }, [onChange])

  React.useEffect(() => {
    handleImageChange(images)
  }, [images, handleImageChange])

  // 处理上传 - 使用useCallback优化
  const handleUpload = React.useCallback(async () => {
    if (isUploading) return

    try {
      await uploadImages({
        maxCount,
        ...uploadOptions,
        onSuccess: (_urls) => {
          onUploadSuccess?.(_urls)
        },
        onError: (_error) => {
          onUploadError?.(_error)
        }
      })
    } catch (error) {
      // 错误已在 hook 中处理
    }
  }, [isUploading, maxCount, uploadOptions, uploadImages, onUploadSuccess, onUploadError])

  // 处理删除 - 使用useCallback优化
  const handleRemove = React.useCallback((_index: number) => {
    removeImage(_index)
    onRemove?.(_index)
  }, [removeImage, onRemove])

  const containerClasses = classnames(styles.container, className)

  return (
    <View className={containerClasses}>
      {/* 已上传的图片列表 */}
      {images.map((image, index) => (
        <View key={`image-${index}-${image}`} className={styles.imageWrapper}>
          <Image
            src={image}
            className={styles.uploadedImage}
            mode='aspectFill'
          />
          {/* 只有真实图片（非临时图片）才显示删除按钮 */}
          {image.startsWith('http') && (
            <View
              className={styles.removeButton}
              onClick={() => handleRemove(index)}
            >
              <Text className={styles.removeIcon}>×</Text>
            </View>
          )}
          {/* 临时图片显示上传中状态 */}
          {!image.startsWith('http') && isUploading && (
            <View className={styles.uploadingOverlay}>
              <Text className={styles.uploadingText}>上传中...</Text>
            </View>
          )}
        </View>
      ))}

      {/* 上传按钮 */}
      {showUploadButton && images.length < maxCount && (
        <View
          className={classnames(styles.uploadButton, {
            [styles.disabled]: isUploading
          })}
          onClick={handleUpload}
        >
          {isUploading ? (
            <View className={styles.uploadingContainer}>
              <Text className={styles.uploadProgress}>{uploadProgress}%</Text>
              <Text className={styles.uploadingText}>上传中...</Text>
            </View>
          ) : (
            <View className={styles.uploadContent}>
              <Image
                src='/assets/camera.svg'
                className={styles.cameraIcon}
              />
              <Text className={styles.uploadText}>
                {uploadButtonText} ({images.length}/{maxCount})
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default ImageUploader
