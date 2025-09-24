import Taro from '@tarojs/taro'

import { store } from '@/store'

/**
 * 检查文件上传权限
 * @returns {boolean} 是否允许上传文件
 */
export const checkFileUploadPermission = (): boolean => {
  const state = store.getState()
  return state.settings.allowFileUpload
}

/**
 * 检查文件上传权限并显示提示
 * @returns {boolean} 是否允许上传文件
 */
export const checkFileUploadPermissionWithToast = (): boolean => {
  const hasPermission = checkFileUploadPermission()

  if (!hasPermission) {
    Taro.showToast({
      title: '权限不够，请在设置中打开允许上传文件',
      icon: 'none',
      duration: 2500,
    })
  }

  return hasPermission
}

/**
 * 在上传文件前检查权限的高阶函数
 * @param uploadFunction 原始上传函数
 * @returns 包装后的上传函数
 */
export const withFileUploadPermission = <T extends any[], R>(
  uploadFunction: (..._args: T) => R
) => {
  return (...args: T): R | undefined => {
    if (!checkFileUploadPermissionWithToast()) {
      return undefined
    }
    return uploadFunction(...args)
  }
}
