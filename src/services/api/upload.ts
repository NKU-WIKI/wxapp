import { normalizeImageUrl, compressImage, isImageFile } from '@/utils/image'
import http from '../request'

// 上传图片响应类型
interface UploadImageResponse {
  url: string
  file_id?: string
}

/**
 * 上传图片文件
 * @param filePath 图片临时文件路径
 * @param options 上传选项
 * @param options.compress 是否压缩图片 ('smart' | true | false，默认true)
 * @param options.maxSizeKB 智能压缩的最大文件大小（KB），默认1024KB（1MB）
 * @param options.quality 压缩质量 (0-1，默认0.85)
 * @returns 图片URL
 */
export const uploadImage = async (
  filePath: string,
  options: {
    compress?: 'smart' | boolean
    maxSizeKB?: number
    quality?: number
  } = {}
): Promise<string> => {
  let finalFilePath = filePath

  // 如果是图片格式且需要压缩，则先进行压缩
  const { compress = true, maxSizeKB = 1024, quality = 0.85 } = options

  if (compress && isImageFile(filePath)) {
    try {
      if (compress === 'smart') {
        // 使用智能压缩
        const { smartCompressImage } = await import('@/utils/image')
        finalFilePath = await smartCompressImage(filePath, maxSizeKB, quality)
      } else {
        // 使用传统压缩
        finalFilePath = await compressImage(filePath, quality)
      }
    } catch (error) {
      // 压缩失败时使用原文件
      finalFilePath = filePath
    }
  }

  try {
    const response = await http.uploadFile<UploadImageResponse>(
      '/tools/uploads/file',
      finalFilePath
    )

    if (response.data?.url) {
      let imageUrl = response.data.url
      if (imageUrl.startsWith('https:')) {
        imageUrl = imageUrl.replace('https:', 'http:')
      }
      return normalizeImageUrl(imageUrl)
    } else {
      throw new Error(response.msg || response.message || '上传失败')
    }
  } catch (error: any) {
    // 特殊处理413错误（文件过大）
    if (error.statusCode === 413) {
      throw new Error('文件大小超过限制')
    }
    throw error
  }
}

// Upload API对象
export const uploadApi = {
  uploadImage,
}

export default uploadApi
