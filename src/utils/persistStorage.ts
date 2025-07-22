import Taro from '@tarojs/taro';

// 创建一个适用于 Taro 环境的 redux-persist 存储适配器
const persistStorage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      const value = Taro.getStorageSync(key);
      return Promise.resolve(value || null);
    } catch (error) {
      console.error('persistStorage getItem error:', error);
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      Taro.setStorageSync(key, value);
      return Promise.resolve();
    } catch (error) {
      console.error('persistStorage setItem error:', error);
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      Taro.removeStorageSync(key);
      return Promise.resolve();
    } catch (error) {
      console.error('persistStorage removeItem error:', error);
      return Promise.resolve();
    }
  }
};

export default persistStorage;