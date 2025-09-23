import Taro from '@tarojs/taro';
import type { DownloadInfo } from '@/types/api/download.d';
import type { BaseResponse } from '@/types/api/common.d';
import request from '../request';

/**
 * 获取文件下载信息
 * @param linkId 链接ID
 */
export const getDownloadInfo = async (linkId: string): Promise<BaseResponse<DownloadInfo>> => {
  try {
    return await request.get<DownloadInfo>(`/links/${linkId}/download/info`);
  } catch (error) {
    throw error;
  }
};

/**
 * 下载文件
 * @param linkId 链接ID
 * @param options 下载选项
 */
export const downloadFile = async (
  linkId: string, 
  options?: {
    showProgress?: boolean;
  }
): Promise<{ tempFilePath: string }> => {
  try {
    const { showProgress = true } = options || {};
    
    if (showProgress) {
      Taro.showLoading({
        title: '获取下载信息...',
        mask: true
      });
    }

    // 首先获取下载信息
    const downloadInfo = await getDownloadInfo(linkId);
    
    if (!downloadInfo.data?.can_download) {
      throw new Error('无权限下载此文件');
    }

    if (showProgress) {
      Taro.hideLoading();
      Taro.showLoading({
        title: '开始下载...',
        mask: true
      });
    }

    // 构造下载URL
    const downloadUrl = `${process.env.BASE_URL}/api/v1/links/${linkId}/download`;
    
    // 获取请求头
    const token = Taro.getStorageSync('token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 使用Promise包装Taro下载文件
    return new Promise((resolve, reject) => {
      const downloadTask = Taro.downloadFile({
        url: downloadUrl,
        header: headers,
        success: (res) => {
          if (showProgress) {
            Taro.hideLoading();
          }
          
          if (res.statusCode === 200) {
            Taro.showToast({
              title: '下载完成',
              icon: 'success'
            });
            resolve({ tempFilePath: res.tempFilePath });
          } else {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`));
          }
        },
        fail: (_error) => {
          if (showProgress) {
            Taro.hideLoading();
          }
          reject(new Error('下载失败，请重试'));
        }
      });

      // 显示下载进度
      if (showProgress) {
        downloadTask.onProgressUpdate((res) => {
          const progress = Math.round(res.progress);
          Taro.showLoading({
            title: `下载中... ${progress}%`,
            mask: true
          });
        });
      }
    });

  } catch (error: any) {
    if (options?.showProgress) {
      Taro.hideLoading();
    }
    
    let errorMessage = '下载失败';
    
    if (error?.response?.status === 403) {
      errorMessage = '无权限下载此文件';
    } else if (error?.response?.status === 404) {
      errorMessage = '文件不存在';
    } else if (error?.response?.status === 429) {
      errorMessage = '下载频率过高，请稍后重试';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    Taro.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });
    
    throw error;
  }
};

/**
 * 保存文件到相册（仅图片文件）
 * @param tempFilePath 临时文件路径
 */
export const saveImageToAlbum = async (tempFilePath: string): Promise<void> => {
  try {
    // 请求保存图片权限
    const authRes = await Taro.getSetting();
    if (!authRes.authSetting['scope.writePhotosAlbum']) {
      try {
        await Taro.authorize({ scope: 'scope.writePhotosAlbum' });
      } catch (authError) {
        // 用户拒绝授权，引导用户去设置页面
        const modalRes = await Taro.showModal({
          title: '需要相册权限',
          content: '需要获取相册权限来保存图片，是否去设置页面开启？',
          confirmText: '设置',
          cancelText: '取消'
        });

        if (modalRes.confirm) {
          await Taro.openSetting();
        }
        return;
      }
    }

    // 保存到相册
    await Taro.saveImageToPhotosAlbum({
      filePath: tempFilePath
    });

    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    });
  } catch (error) {
    Taro.showToast({
      title: '保存失败',
      icon: 'none'
    });
    throw error;
  }
};

/**
 * 获取文件信息
 * @param tempFilePath 临时文件路径
 */
export const getFileInfo = async (tempFilePath: string): Promise<Taro.getFileInfo.SuccessCallbackResult> => {
  return new Promise((resolve, reject) => {
    Taro.getFileInfo({
      filePath: tempFilePath,
      success: (res) => resolve(res),
      fail: (error) => reject(error)
    });
  });
};