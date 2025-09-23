/**
 * 学习资料项
 */
export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  college: string;
  subject: string;
  signatureType: 'anonymous' | 'realname';
  fileUrl?: string;
  fileName?: string;
  originalFileName?: string;
  netdiskLink?: string;
  qrCodeUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadTime: string;
  uploader?: string;
  downloadCount?: number;
  rating?: number;
  category: LearningMaterialCategory;
  // 新增字段：用于文件下载的链接ID
  linkId?: string;
}

/**
 * 学习资料分类
 */
/* eslint-disable no-unused-vars */
export enum LearningMaterialCategory {
  COURSE_NOTES = 'course_notes',
  FINAL_EXAM = 'final_exam',
  EBOOK = 'ebook',
  GRADUATE_EXAM = 'graduate_exam',
  LAB_REPORT = 'lab_report',
  OTHER = 'other'
}
/* eslint-enable no-unused-vars */

/**
 * 分类显示信息
 */
export interface CategoryInfo {
  id: LearningMaterialCategory;
  title: string;
  icon: string;
  description: string;
}

/**
 * 文件类型映射
 */
export const getFileTypeFromExtension = (filename: string): string => {
  if (!filename) return 'unknown';
  
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint';
    case 'xls':
    case 'xlsx':
      return 'Excel';
    case 'txt':
      return 'TXT';
    case 'zip':
    case 'rar':
    case '7z':
      return 'Archive';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'Image';
    default:
      return 'File';
  }
};

/**
 * 获取文件类型图标
 */
export const getFileTypeIcon = (filename: string): string => {
  const fileType = getFileTypeFromExtension(filename);
  
  switch (fileType) {
    case 'PDF':
      return '📄';
    case 'Word':
      return '📝';
    case 'PowerPoint':
      return '📊';
    case 'Excel':
      return '📈';
    case 'TXT':
      return '📃';
    case 'Archive':
      return '🗜️';
    case 'Image':
      return '🖼️';
    default:
      return '📎';
  }
};
