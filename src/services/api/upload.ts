import Taro from "@tarojs/taro";
import { HEADER_BRANCH_KEY, REQUEST_BRANCH } from "@/constants";
import { BaseResponse } from "@/types/api/common";

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
    const token = Taro.getStorageSync("token");
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
            if (data.code === 200 && data.data.url) {
              resolve(data.data.url);
            } else {
              reject(new Error(data.msg || "上传失败"));
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