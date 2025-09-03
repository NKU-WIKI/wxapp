import Taro from "@tarojs/taro";
import { BaseResponse } from "@/types/api/common";
import { normalizeImageUrl, compressImage, isImageFile } from "@/utils/image";

// 上传图片响应类型
interface UploadImageResponse {
  url: string;
  file_id?: string;
}

const BASE_URL = process.env.BASE_URL;

/**
 * 上传图片文件
 * @param filePath 图片临时文件路径
 * @param options 上传选项
 * @param options.compress 是否压缩图片 (默认true)
 * @param options.quality 压缩质量 (0-1，默认0.8)
 * @returns 图片URL
 */
export const uploadImage = (
  filePath: string,
  options: {
    compress?: boolean;
    quality?: number;
  } = {}
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const token = Taro.getStorageSync("token")
    if (!token) {
      return reject(new Error("未找到登录凭证"));
    }

    let finalFilePath = filePath;
    
    // 如果是图片格式且需要压缩，则先进行压缩
    const {
      compress = true,
      quality = 0.8
    } = options;
    
    if (compress && isImageFile(filePath)) {
      try {
        
        finalFilePath = await compressImage(filePath, quality);
        
      } catch (error) {
        
        finalFilePath = filePath;
      }
    }
    
    Taro.uploadFile({
      url: `${BASE_URL}/api/v1/tools/uploads/file`,
      filePath: finalFilePath,
      name: "file",
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data: BaseResponse<UploadImageResponse> = JSON.parse(res.data);
            if (data.code === 0 && (data.data as any)?.url) {
              let imageUrl = (data.data as any).url as string;
              if (imageUrl.startsWith('https:')) {
                imageUrl = imageUrl.replace('https:', 'http:');
              }
              resolve(normalizeImageUrl(imageUrl));
            } else {
              reject(new Error((data as any).message || (data as any).msg || "上传失败"));
            }
          } catch (e) {
            reject(new Error("解析服务器响应失败"));
          }
        } else {
          // 特殊处理413错误（文件过大），提供更具体的错误信息
          if (res.statusCode === 413) {
            reject(new Error("文件大小超过限制"));
          } else {
            reject(new Error(`上传失败，状态码：${res.statusCode}`));
          }
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

// Upload API对象
export const uploadApi = {
  uploadImage,
};

export default uploadApi;
