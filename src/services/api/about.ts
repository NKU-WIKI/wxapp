import http from '../request';

export interface AboutInfo {
  copyright: string;
  version: string;
  // 可以根据接口实际返回添加更多字段
}

export const aboutApi = {
  getAboutInfo: () => {
    // 路径前缀由 request 统一加 /api，这里保持业务段
    return http.get<AboutInfo>('/wxapp/about');
  },
}; 