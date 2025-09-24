import { FileUploadRead } from "@/types/api/fileUpload";
import http from "../request";

/**
 * 上传文件到服务器
 * @param filePath 文件临时路径
 * @param category 文件分类，默认为 'general'
 * @param isPublic 是否公开访问，默认为 false
 * @returns Promise<any>
 */
export const uploadFileSimple = async (
  filePath: string,
  category: string = "general",
  isPublic: boolean = false,
) => {
  const result = await http.uploadFile("/tools/uploads/file", filePath, {
    formData: {
      category,
      is_public: isPublic.toString(),
    },
  });

  return result;
};

/**
 * 获取文件信息
 * @param fileId 文件ID
 * @returns Promise<FileUploadRead>
 */
export const getFileInfo = (fileId: string): Promise<FileUploadRead> => {
  return http
    .get<FileUploadRead>(`/tools/uploads/${fileId}`)
    .then((res) => res.data as FileUploadRead);
};

/**
 * 上传文件到服务器
 * @param filePath 文件临时路径
 * @param category 文件分类，默认为 'general'
 * @param isPublic 是否公开访问，默认为 false
 * @returns Promise<FileUploadRead>
 */
export const uploadFile = (
  filePath: string,
  category: string = "general",
  isPublic: boolean = false,
): Promise<FileUploadRead> => {
  const formData: Record<string, string> = {
    category,
    is_public: isPublic.toString(),
  };

  return http
    .uploadFile<FileUploadRead>("/tools/uploads/file", filePath, {
      formData,
    })
    .then((res) => {
      // http.uploadFile 返回的是 BaseResponse<FileUploadRead> 格式
      // 所以我们需要访问 res.data 来获取实际的文件数据
      if (res.data) {
        return res.data;
      }
      throw new Error("上传响应数据为空");
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
