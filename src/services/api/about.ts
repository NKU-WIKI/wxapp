import http from '../request';

export interface AboutInfo {
  copyright: string;
  version: string;
  // 可以根据接口实际返回添加更多字段
}

export const aboutApi = {
  getAboutInfo: () => {
    return http.get<AboutInfo>('/wxapp/about');
  },
}; 