import { useState, useCallback } from 'react'

import Taro from '@tarojs/taro'


import { uploadImage } from '@/services/api/upload'

export interface ImageUploadOptions {
  maxCount?: number
  compress?: boolean
  quality?: number
  onSuccess?: (_urls: string[]) => void
  onError?: (_error: Error) => void
  onProgress?: (_progress: number) => void
}

export interface UseImageUploadReturn {
  images: string[]
  isUploading: boolean
  uploadProgress: number
  uploadImages: (_options?: ImageUploadOptions) => Promise<void>
  removeImage: (_index: number) => void
  clearImages: () => void
}

export const useImageUpload = (initialImages: string[] = []): UseImageUploadReturn => {
  const [images, setImages] = useState<string[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tempImages, setTempImages] = useState<string[]>([]) // 临时图片列表，减少闪烁

  const uploadImages = useCallback(
    async (options: ImageUploadOptions = {}) => {
      const {
        maxCount = 9,
        compress = true,
        quality = 0.8,
        onSuccess,
        onError,
        onProgress,
      } = options

      try {
        // 检查是否超过最大数量
        const remainingSlots = maxCount - images.length
        if (remainingSlots <= 0) {
          throw new Error(`最多只能上传 ${maxCount} 张图片`)
        }

        // 选择图片
        const chooseResult = await Taro.chooseImage({
          count: remainingSlots,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
        })

        if (chooseResult.tempFilePaths.length === 0) {
          return
        }

        setIsUploading(true)
        setUploadProgress(0)

        const totalFiles = chooseResult.tempFilePaths.length
        const uploadedUrls: string[] = []
        const tempImageUrls: string[] = []

        // 先添加临时图片路径，减少等待时的空白
        const tempPaths = chooseResult.tempFilePaths.slice(0, remainingSlots)
        setTempImages(tempPaths)

        // 逐个上传图片
        for (let i = 0; i < totalFiles; i++) {
          const tempFilePath = chooseResult.tempFilePaths[i]

          try {
            const url = await uploadImage(tempFilePath, { compress, quality })
            uploadedUrls.push(url)
            tempImageUrls[i] = url // 更新临时图片为真实URL

            // 减少进度更新频率，只在关键节点更新
            if (i === totalFiles - 1 || (i + 1) % Math.max(1, Math.floor(totalFiles / 3)) === 0) {
              const progress = Math.round(((i + 1) / totalFiles) * 100)
              setUploadProgress(progress)
              onProgress?.(progress)
            }
          } catch (uploadError) {
            tempImageUrls[i] = '' // 标记上传失败
            // 继续上传其他图片，不中断整个上传过程
          }
        }

        // 清理临时图片
        setTempImages([])

        if (uploadedUrls.length > 0) {
          const newImages = [...images, ...uploadedUrls]
          setImages(newImages)
          setUploadProgress(100) // 确保进度完成
          onProgress?.(100)
          onSuccess?.(uploadedUrls)
          Taro.showToast({ title: '上传成功', icon: 'success' })
        } else {
          throw new Error('所有图片上传都失败了')
        }
      } catch (error) {
        // 检查是否是用户取消操作
        if (error && typeof error === 'object' && 'errMsg' in error) {
          const errMsg = (error as any).errMsg
          if (errMsg && errMsg.includes('cancel')) {
            // 用户取消是正常行为，不触发错误回调和提示
            return
          }
        }

        const err = error instanceof Error ? error : new Error('上传失败')
        onError?.(err)
        Taro.showToast({ title: err.message, icon: 'none' })
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [images]
  )

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearImages = useCallback(() => {
    setImages([])
  }, [])

  return {
    images: [...images, ...tempImages], // 合并真实图片和临时图片
    isUploading,
    uploadProgress,
    uploadImages,
    removeImage,
    clearImages,
  }
}
