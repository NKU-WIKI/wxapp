/**
 * 文件上传相关的类型定义
 */

/**
 * 文件上传成功后的响应数据
 */
export interface FileUploadRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  key: string;
  bucket?: string | null;
  filename: string;
  content_type?: string | null;
  size: number;
  url?: string | null;
}

/**
 * 文件上传请求参数
 */
export interface FileUploadRequest {
  file: File | string; // 文件对象或文件路径
  folder?: string | null; // 可选的文件夹前缀
}

/**
 * 文件类型枚举
 */
export enum FileType {
  PDF = 'application/pdf',
  WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  WORD_LEGACY = 'application/msword',
  PPT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT_LEGACY = 'application/vnd.ms-powerpoint',
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  EXCEL_LEGACY = 'application/vnd.ms-excel',
  TXT = 'text/plain',
  ZIP = 'application/zip',
  RAR = 'application/x-rar-compressed',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
  IMAGE_GIF = 'image/gif',
  IMAGE_WEBP = 'image/webp'
}

/**
 * 支持的文件类型配置
 */
export const SUPPORTED_FILE_TYPES = [
  FileType.PDF,
  FileType.WORD,
  FileType.WORD_LEGACY,
  FileType.PPT,
  FileType.PPT_LEGACY,
  FileType.EXCEL,
  FileType.EXCEL_LEGACY,
  FileType.TXT,
  FileType.ZIP,
  FileType.RAR
];

/**
 * 支持的图片类型配置
 */
export const SUPPORTED_IMAGE_TYPES = [
  FileType.IMAGE_JPEG,
  FileType.IMAGE_PNG,
  FileType.IMAGE_GIF,
  FileType.IMAGE_WEBP
];

/**
 * 文件大小限制 (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 获取文件类型的显示名称
 */
export const getFileTypeDisplayName = (mimeType: string): string => {
  switch (mimeType) {
    case FileType.PDF:
      return 'PDF文档';
    case FileType.WORD:
    case FileType.WORD_LEGACY:
      return 'Word文档';
    case FileType.PPT:
    case FileType.PPT_LEGACY:
      return 'PowerPoint演示文稿';
    case FileType.EXCEL:
    case FileType.EXCEL_LEGACY:
      return 'Excel表格';
    case FileType.TXT:
      return '文本文件';
    case FileType.ZIP:
      return 'ZIP压缩包';
    case FileType.RAR:
      return 'RAR压缩包';
    case FileType.IMAGE_JPEG:
    case FileType.IMAGE_PNG:
    case FileType.IMAGE_GIF:
    case FileType.IMAGE_WEBP:
      return '图片文件';
    default:
      return '未知文件类型';
  }
};
