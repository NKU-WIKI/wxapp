import Taro from "@tarojs/taro";
import {
  NO_ERROR_TOAST_CODES,
  RESPONSE_SUCCESS_CODE,
  HEADER_BRANCH_KEY,
} from "@/constants";
import { BaseResponse } from "@/types/api/common";

const BASE_URL = process.env.BASE_URL;

const getToken = () => {
  return Taro.getStorageSync("token");
};

const interceptor = (chain) => {
  const requestParams = chain.requestParams;
  const customHeader = requestParams.header || {};

  // 只在 header 中明确要求时才显示 loading
  if (customHeader["X-Show-Loading"] === true) {
    Taro.showLoading({ title: "加载中..." });
  }

  const token = getToken();
  const branch = process.env.NODE_ENV === "development" ? "dev" : "dev";

  requestParams.header = {
    ...customHeader,
    "Content-Type": "application/json",
    [HEADER_BRANCH_KEY]: branch,
  };

  if (token) {
    requestParams.header.Authorization = `Bearer ${token}`;
  }

  // 移除自定义头，避免发送到服务器
  const originalShowLoading = customHeader["X-Show-Loading"];
  if (requestParams.header["X-Show-Loading"]) {
    delete requestParams.header["X-Show-Loading"];
  }

  return chain.proceed(requestParams).then((res) => {
    if (originalShowLoading === true) {
      Taro.hideLoading();
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      Taro.showToast({
        title: `服务器错误: ${res.statusCode}`,
        icon: "none",
        duration: 2000,
      });
      return Promise.reject(res);
    }

    const responseData = res.data;
    if (responseData.code !== RESPONSE_SUCCESS_CODE) {
      if (!NO_ERROR_TOAST_CODES.includes(responseData.code)) {
        Taro.showToast({
          title: responseData.message || "请求失败",
          icon: "none",
          duration: 2000,
        });
      }
      return Promise.reject(responseData);
    }

    return res;
  });
};

Taro.addInterceptor(interceptor);
Taro.addInterceptor(Taro.interceptors.timeoutInterceptor);

type HttpMethod = "GET" | "POST";

const request = (
  method: HttpMethod,
  url: string,
  data?: object,
  options?: Omit<Taro.request.Option, "url" | "data" | "method">
): Promise<Taro.request.SuccessCallbackResult<BaseResponse<any>>> => {
  const finalUrl = `${BASE_URL}/api${url}`;
  return Taro.request({
    url: finalUrl,
    data,
    method,
    ...options,
  });
};

const http = {
  get: <T>(
    url: string,
    data?: object,
    options?: Omit<Taro.request.Option, "url" | "data" | "method">
  ) =>
    request("GET", url, data, options).then(
      (res) => res.data as BaseResponse<T>
    ),
  post: <T>(
    url: string,
    data?: object,
    options?: Omit<Taro.request.Option, "url" | "data" | "method">
  ) =>
    request("POST", url, data, options).then(
      (res) => res.data as BaseResponse<T>
    ),
};

export default http;
