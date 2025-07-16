import Taro from '@tarojs/taro';
import {
  NO_ERROR_TOAST_CODES,
  RESPONSE_SUCCESS_CODE,
  BASE_URL,
  HEADER_BRANCH_KEY
} from '@/constants';
import { BaseResponse } from '@/types/api/common';

const getToken = () => {
  // 实际项目中，token 通常从 Redux store 或 Taro.storage 中获取
  return Taro.getStorageSync('token');
};

const interceptor = (chain: any) => {
  const requestParams = chain.requestParams;

  Taro.showLoading({ title: '加载中...' });

  const token = getToken();
  // 根据环境设置请求分支
  const branch = process.env.NODE_ENV === 'development' ? 'dev' : 'main';

  requestParams.header = {
    ...requestParams.header,
    'Content-Type': 'application/json',
    [HEADER_BRANCH_KEY]: branch,
  };

  if (token) {
    requestParams.header.Authorization = `Bearer ${token}`;
  }

  return chain.proceed(requestParams).then(res => {
    Taro.hideLoading();

    // HTTP 状态码为 2xx
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const responseData = res.data as BaseResponse;
      // 业务码成功
      if (responseData.code === RESPONSE_SUCCESS_CODE) {
        // 返回完整的业务数据包，而不仅仅是 data 字段
        return responseData;
      }

      // 业务码失败，且不在忽略列表
      if (!NO_ERROR_TOAST_CODES.includes(responseData.code)) {
        Taro.showToast({
          title: responseData.message || '请求失败',
          icon: 'none',
          duration: 2000,
        });
      }
      return Promise.reject(responseData);
    }

    // HTTP 状态码非 2xx
    Taro.showToast({
      title: `服务器错误: ${res.statusCode}`,
      icon: 'none',
      duration: 2000,
    });
    return Promise.reject(res);
  });
};

Taro.addInterceptor(interceptor);
// Taro 内置的 log interceptor
// Taro.addInterceptor(Taro.interceptors.logInterceptor);
// Taro 内置的 timeout interceptor
Taro.addInterceptor(Taro.interceptors.timeoutInterceptor);

type HttpMethod = 'GET' | 'POST';

const request = <T = any>(
  method: HttpMethod,
  url: string,
  data?: object,
  options?: Omit<Taro.request.Option, 'url' | 'data' | 'method'>
): Promise<BaseResponse<T>> => {
  // 统一拼接 /api 前缀，严格遵循 backend-api/README.md 规范
  const finalUrl = `${BASE_URL}/api${url}`;
  return Taro.request({
    url: finalUrl,
    data,
    method,
    ...options,
  }) as unknown as Promise<BaseResponse<T>>;
};

const http = {
  get: <T = any>(url: string, data?: object, options?: Omit<Taro.request.Option, 'url' | 'data' | 'method'>) =>
    request<T>('GET', url, data, options),
  post: <T = any>(url: string, data?: object, options?: Omit<Taro.request.Option, 'url' | 'data' | 'method'>) =>
    request<T>('POST', url, data, options),
};

export default http;
