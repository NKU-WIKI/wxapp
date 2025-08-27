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
 * 在没有token的情况下，所有请求都会使用此tenant_id作为x-tenant-id头
 */
const getDefaultTenantId = () => {
  try {
    // 尝试从store中获取aboutInfo
    const store = require("@/store").default;
    const state = store.getState();
    const aboutInfo = state.user.aboutInfo;

    console.log('获取租户ID - store中的aboutInfo:', aboutInfo);

    if (aboutInfo?.tenants) {
      // 使用南开大学租户
      const tenantId = aboutInfo.tenants["南开大学"];
      if (tenantId) {
        console.log('使用store中的南开大学租户ID:', tenantId);
        return tenantId;
      }
    }

    // 如果store中没有，尝试从本地存储获取缓存的租户信息
    const cachedAboutInfo = Taro.getStorageSync("aboutInfo");
    console.log('获取租户ID - 本地存储中的aboutInfo:', cachedAboutInfo);

    if (cachedAboutInfo?.tenants) {
      const tenantId = cachedAboutInfo.tenants["南开大学"];
      if (tenantId) {
        console.log('使用本地存储中的南开大学租户ID:', tenantId);
        return tenantId;
      }
    }

    // 如果本地存储中也没有，尝试获取通用的default租户
    if (cachedAboutInfo?.tenants) {
      const defaultTenantId = cachedAboutInfo.tenants["default"] || Object.values(cachedAboutInfo.tenants)[0];
      if (defaultTenantId) {
        console.log('使用本地存储中的默认租户ID:', defaultTenantId);
        return defaultTenantId;
      }
    }
  } catch (error) {
    console.warn("从store获取租户信息失败:", error);
  }

  // 如果都获取失败，使用硬编码的南开大学租户ID作为最后手段
  const fallbackTenantId = "f6303899-a51a-460a-9cd8-fe35609151eb";
  console.warn("使用后备租户ID:", fallbackTenantId);
  return fallbackTenantId;
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

  console.log('请求拦截器 - token:', token ? '存在' : '不存在');
  console.log('请求拦截器 - tenantId:', tenantId);
  console.log('请求拦截器 - 请求URL:', requestParams.url);

  requestParams.header = {
    ...customHeader,
    "Content-Type": "application/json",
    [HEADER_BRANCH_KEY]: branch,
  };

  // 系统性处理租户标识：在没有token的情况下，所有请求都使用x-tenant-id头
  if (!token) {
    if (tenantId) {
      requestParams.header["x-tenant-id"] = tenantId;
      console.log('请求拦截器 - 添加x-tenant-id头:', tenantId);
    } else {
      console.warn('请求拦截器 - 没有token且无法获取tenantId，请求可能失败');
    }
  } else {
    // 如果有token，使用Authorization头
    requestParams.header.Authorization = `Bearer ${token}`;
    console.log('请求拦截器 - 使用Authorization头');
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

// 导出 getDefaultTenantId 函数供调试使用
export { getDefaultTenantId };
