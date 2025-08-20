import Taro from "@tarojs/taro";
import { HEADER_BRANCH_KEY, REQUEST_BRANCH, DEFAULT_DEV_TOKEN } from "@/constants";
import { BaseResponse } from "@/types/api/common";
import { normalizeImageUrl } from "@/utils/image";

// 上传图片响应类型
interface UploadImageResponse {
  url: string;
  file_id?: string;
}

const BASE_URL = process.env.BASE_URL;

/**
 * 上传图片文件
 * @param filePath 图片临时文件路径
 * @returns 图片URL
 */
export const uploadImage = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const token = Taro.getStorageSync("token") || DEFAULT_DEV_TOKEN;
    if (!token) {
      return reject(new Error("未找到登录凭证"));
    }

    Taro.uploadFile({
      url: `${BASE_URL}/api/v1/uploads/file`,
      filePath: filePath,
      name: "file",
      header: {
        Authorization: `Bearer ${token}`,
        [HEADER_BRANCH_KEY]: REQUEST_BRANCH,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data: BaseResponse<UploadImageResponse> = JSON.parse(res.data);
            if (data.code === 0 && data.data.url) {
              // 确保URL使用HTTPS协议
              let imageUrl = data.data.url;
              if (imageUrl.startsWith('http:')) {
                imageUrl = imageUrl.replace('http:', 'https:');
              }
              // 标准化URL（处理以/开头的相对路径等）
              resolve(normalizeImageUrl(imageUrl));
            } else {
              reject(new Error(data.message || data.msg || "上传失败"));
            }
          } catch (e) {
            reject(new Error("解析服务器响应失败"));
          }
        } else {
          reject(new Error(`上传失败，状态码：${res.statusCode}`));
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