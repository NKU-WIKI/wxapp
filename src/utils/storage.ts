import Taro from '@tarojs/taro'

/**
 * 存储数据到本地
 * @param key 存储键名
 * @param data 要存储的数据
 */
export const setStorage = <T>(key: string, data: T): void => {
  try {
    Taro.setStorageSync(key, data)
  } catch (error) {
    // 静默处理存储错误
  }
}

/**
 * 从本地获取数据
 * @param key 存储键名
 * @param defaultValue 默认值，当获取失败时返回
 * @returns 存储的数据或默认值
 */
export const getStorage = <T>(key: string, defaultValue?: T): T | undefined => {
  try {
    const data = Taro.getStorageSync(key)
    return data || defaultValue
  } catch (error) {
    
    return defaultValue
  }
}

/**
 * 从本地删除数据
 * @param key 存储键名
 */
export const removeStorage = (key: string): void => {
  try {
    Taro.removeStorageSync(key)
  } catch (error) {
    // 静默处理存储错误
  }
}

/**
 * 清除所有本地存储
 */
export const clearStorage = (): void => {
  try {
    Taro.clearStorageSync()
  } catch (error) {
    // 静默处理存储错误
  }
}
