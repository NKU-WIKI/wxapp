import Taro from '@tarojs/taro';
import { HEADER_BRANCH_KEY, REQUEST_BRANCH } from '@/constants';

export const uploadApi = {
  uploadImage: (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const token = Taro.getStorageSync('token');
      if (!token) {
        return reject(new Error('未找到登录凭证'));
      }

      Taro.uploadFile({
        url: `${process.env.BASE_URL}/api/wxapp/upload/image`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`,
          [HEADER_BRANCH_KEY]: REQUEST_BRANCH,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            if (data.code === 200 && data.data.url) {
              resolve(data.data.url);
            } else {
              reject(new Error(data.details || '上传失败'));
            }
          } else {
            reject(new Error(`上传失败，状态码：${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },
};
