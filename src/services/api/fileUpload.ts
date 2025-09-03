import { FileUploadRead } from "@/types/api/fileUpload";
import http from "../request";

/**
 * 上传文件到服务器（简化版）
 * @param filePath 文件临时路径
 * @returns Promise<any>
 */
export const uploadFileSimple = (filePath: string) => {
  return http.uploadFile("/tools/uploads/file", filePath);
};

/**
 * 获取文件信息
 * @param fileId 文件ID
 * @returns Promise<FileUploadRead>
 */
export const getFileInfo = (fileId: string): Promise<FileUploadRead> => {
  return http.get<FileUploadRead>(`/tools/uploads/${fileId}`)
    .then(res => res.data as FileUploadRead);
};

/**
 * 上传文件到服务器
 * @param filePath 文件临时路径
 * @param folder 可选的文件夹前缀
 * @returns Promise<FileUploadRead>
 */
export const uploadFile = (
  filePath: string, 
  folder?: string
): Promise<FileUploadRead> => {
  const options: any = {};
  if (folder) {
    options.formData = { folder };
  }
  
  return http.uploadFile<FileUploadRead>("/tools/uploads/file", filePath, options)
    .then(res => {
      // http.uploadFile 返回的是 BaseResponse<FileUploadRead> 格式
      // 所以我们需要访问 res.data 来获取实际的文件数据
      if (res.data) {
        return res.data;
      }
      throw new Error('上传响应数据为空');
    });
};

/**
 * 文件上传工具API
 */
const fileUploadApi = {
  uploadFile,
  uploadFileSimple,
  getFileInfo,
};

export default fileUploadApi;
