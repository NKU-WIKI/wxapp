/**
 * 文件下载相关的API类型定义
 */

// 下载信息响应
export interface DownloadInfo {
  // 文件基本信息
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  
  // 下载权限状态
  can_download: boolean;
  download_permission: 'public' | 'authenticated' | 'restricted';
  
  // 文件完整性校验信息
  checksum?: string;
  checksum_type?: 'md5' | 'sha256';
  
  // 建议的下载方式
  download_method: 'direct' | 'stream' | 'chunked';
  
  // 相关统计数据
  download_count: number;
  last_downloaded_at?: string;
  
  // 文件元数据
  upload_time: string;
  uploader_id?: string;
  content_description?: string;
}

// 获取下载信息请求参数
export interface GetDownloadInfoRequest {
  link_id: string;
}

// 下载文件请求参数
export interface DownloadFileRequest {
  link_id: string;
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 下载信息API响应
export type GetDownloadInfoResponse = ApiResponse<DownloadInfo>;

// 错误响应类型
export interface ErrorResponse {
  code: number;
  message: string;
  detail?: any;
}