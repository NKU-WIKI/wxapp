import Taro from "@tarojs/taro";
import {
  NO_ERROR_TOAST_CODES,
  RESPONSE_SUCCESS_CODE,
  HEADER_BRANCH_KEY,
  REQUEST_BRANCH,
} from "@/constants";
import { BaseResponse } from "@/types/api/common";

const BASE_URL = process.env.BASE_URL;

const getToken = () => {
  return Taro.getStorageSync("token") || null;
};

/**
 * 获取默认租户ID
 * 优先从store获取，如果没有则从本地存储获取
 */
const getDefaultTenantId = () => {
  try {
    // 尝试从store中获取aboutInfo
    const store = require("@/store").default;
    const state = store.getState();
    const aboutInfo = state.user.aboutInfo;

    if (aboutInfo?.tenants) {
      // 使用默认租户
      return aboutInfo.tenants["default"] || "";
    }

    // 如果store中没有，尝试从本地存储获取缓存的租户信息
    const cachedAboutInfo = Taro.getStorageSync("aboutInfo");
    if (cachedAboutInfo?.tenants) {
      return cachedAboutInfo.tenants["default"] || "";
    }
  } catch (error) {
    console.warn("Failed to get tenant info from store:", error);
  }

  // 如果都获取失败，尝试使用硬编码的默认租户ID作为最后手段
  console.warn("Using fallback tenant ID");
  return "00000000-0000-0000-0000-000000000000";
};

const interceptor = (chain) => {
  const requestParams = chain.requestParams;
  const customHeader = requestParams.header || {};

  // 只在 header 中明确要求时才显示 loading
  if (customHeader["X-Show-Loading"] === true) {
    Taro.showLoading({ title: "加载中..." });
  }

  const token = getToken();
  const branch = REQUEST_BRANCH;
  const tenantId = getDefaultTenantId();

  requestParams.header = {
    ...customHeader,
    "Content-Type": "application/json",
    [HEADER_BRANCH_KEY]: branch,
  };

  // 如果没有token，添加x_tenant_id头部用于标识租户
  if (!token && tenantId) {
    requestParams.header["x-tenant-id"] = tenantId;
  }

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
          title: responseData.msg || responseData.message || "请求失败",
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

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const request = (
  method: HttpMethod,
  url: string,
  data?: object,
  options?: Omit<Taro.request.Option, "url" | "data" | "method">
): Promise<Taro.request.SuccessCallbackResult<BaseResponse<any>>> => {
  const finalUrl = `${BASE_URL}/api/v1${url}`;
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
  put: <T>(
    url: string,
    data?: object,
    options?: Omit<Taro.request.Option, "url" | "data" | "method">
  ) =>
    request("PUT", url, data, options).then(
      (res) => res.data as BaseResponse<T>
    ),
  delete: <T>(
    url: string,
    data?: object,
    options?: Omit<Taro.request.Option, "url" | "data" | "method">
  ) =>
    request("DELETE", url, data, options).then(
      (res) => res.data as BaseResponse<T>
    ),
};

export default http;
