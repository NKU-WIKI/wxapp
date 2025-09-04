/**
 * 缓存管理工具
 */

import Taro from '@tarojs/taro';

/**
 * 获取当前缓存大小（估算）
 */
export const getCacheSize = (): string => {
  try {
    // 微信小程序没有直接获取缓存大小的API，这里做一个估算
    const storageInfo = Taro.getStorageInfoSync();
    const keys = storageInfo.keys;
    let totalSize = 0;

    // 估算每个存储项的大小
    for (const key of keys) {
      try {
        const data = Taro.getStorageSync(key);
        if (data) {
          // 粗略估算数据大小（字符长度 * 2字节）
          const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
          totalSize += dataStr.length * 2;
        }
      } catch (error) {
        // 忽略单个存储项的错误
      }
    }

    // 转换为可读的格式
    if (totalSize < 1024) {
      return `${totalSize}B`;
    } else if (totalSize < 1024 * 1024) {
      return `${Math.round(totalSize / 1024)}KB`;
    } else {
      return `${Math.round(totalSize / (1024 * 1024))}MB`;
    }
  } catch (error) {
    // 如果获取失败，返回估算值
    return '128KB';
  }
};

/**
 * 清除所有缓存数据
 * 但保留用户设置和登录状态等重要数据
 */
export const clearCache = (): void => {
  try {
    const storageInfo = Taro.getStorageInfoSync();
    const keys = storageInfo.keys;
    
    // 需要保留的关键数据
    const preserveKeys = [
      'token',
      'persist:user',
      'persist:settings',
      // 设置相关的所有keys
      'settings_message_notification',
      'settings_push_notification',
      'settings_private_message',
      'settings_font_size',
      'settings_night_mode',
      'settings_who_can_message',
      'settings_who_can_comment',
      'settings_who_can_view_posts',
      'settings_personalized_recommendation',
      'settings_allow_image_saving',
    ];

    // 清除非关键缓存数据
    for (const key of keys) {
      if (!preserveKeys.includes(key) && !key.startsWith('persist:')) {
        try {
          Taro.removeStorageSync(key);
        } catch (error) {
          // 忽略单个删除失败的情况
        }
      }
    }

    // 清除文件缓存（临时文件）
    try {
      const fileManager = Taro.getFileSystemManager();
      const tempFilePath = `${Taro.env.USER_DATA_PATH}/temp`;
      
      // 检查临时目录是否存在
      try {
        fileManager.accessSync(tempFilePath);
        // 如果存在，删除临时文件夹
        fileManager.rmdirSync(tempFilePath, true);
      } catch (error) {
        // 目录不存在或删除失败，忽略
      }
    } catch (error) {
      // 文件系统操作失败，忽略
    }

  } catch (error) {
    throw new Error('清除缓存失败，请重试');
  }
};

/**
 * 清除图片缓存
 */
export const clearImageCache = (): void => {
  try {
    // 微信小程序会自动管理图片缓存，我们只能清除本地存储的图片相关数据
    const storageInfo = Taro.getStorageInfoSync();
    const keys = storageInfo.keys;
    
    // 查找并删除图片相关的缓存key
    for (const key of keys) {
      if (key.includes('image') || key.includes('photo') || key.includes('pic')) {
        try {
          Taro.removeStorageSync(key);
        } catch (error) {
          // 忽略单个删除失败
        }
      }
    }
  } catch (error) {
    throw new Error('清除图片缓存失败');
  }
};

/**
 * 获取缓存详情
 */
export const getCacheDetails = () => {
  try {
    const storageInfo = Taro.getStorageInfoSync();
    const cacheSize = getCacheSize();
    
    return {
      totalSize: cacheSize,
      itemCount: storageInfo.keys.length,
      currentSize: storageInfo.currentSize,
      limitSize: storageInfo.limitSize,
      keys: storageInfo.keys.filter(key => 
        !key.startsWith('persist:') && 
        !key.startsWith('settings_') && 
        key !== 'token'
      )
    };
  } catch (error) {
    return {
      totalSize: '128KB',
      itemCount: 0,
      currentSize: 0,
      limitSize: 10240, // 10MB 默认限制
      keys: []
    };
  }
};
