

export interface Feedback {
  id: number;
  content: string;
  type: 'bug' | 'ux' | 'suggest' | 'other';
  contact?: string;
  images: string[]; // 改为 images 以匹配API文档
  device_info?: DeviceInfo;
  version?: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  admin_reply?: string;
  admin_id?: string;
  create_time: string;
  update_time: string;
}

export interface DeviceInfo {
  brand?: string;
  model?: string;
  system?: string;
  platform?: string;
  SDKVersion?: string;
  version?: string;
  app_version?: string;
}

export interface CreateFeedbackParams {
  content: string;
  type: 'bug' | 'ux' | 'suggest' | 'other';
  contact?: string;
  images?: string[]; // 改为 images 以匹配API文档
  device_info?: DeviceInfo;
  version?: string;
}

export interface CreateFeedbackResponse {
  id: number;
}

export interface GetFeedbackListParams {
  page?: number;
  page_size?: number;
  status?: string;
}

export interface GetFeedbackListResponse {
  data: Feedback[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
} 
