/**
 * 图片URL处理工具函数
 */
import Taro from '@tarojs/taro';

const BASE_URL = process.env.BASE_URL;

/**
 * 标准化图片URL
 * 将相对路径转换为完整的URL，并统一使用 HTTP 协议
 * @param url 图片URL
 * @returns 完整的图片URL（http）
 */
export const normalizeImageUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  
  // 微信/本地临时文件路径优先处理：wxfile:// 或 http(s)://tmp/ 直接返回
  if (trimmed.startsWith('wxfile://') || /^https?:\/\/tmp\//i.test(trimmed)) {
    return trimmed;
  }
  
  // 如果已经是完整的HTTP/HTTPS URL，统一将 https 降级为 http（排除 http(s)://tmp/ 已在上方处理）
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^https:\/\//i, 'http://');
  }
  
  // 如果是本地资源路径（以/assets/开头），直接返回
  if (trimmed.startsWith('/assets/')) {
    return trimmed;
  }
  
  // 如果是相对路径（以/开头），拼接BASE_URL，并确保使用 http
  if (trimmed.startsWith('/')) {
    let base = BASE_URL || '';
    base = base.replace(/^https:\/\//i, 'http://');
    return `${base}${trimmed}`;
  }
  
  // 其他情况，直接返回原URL
  return trimmed;
};

/**
 * 批量标准化图片URL数组
 * @param urls 图片URL数组
 * @returns 标准化后的图片URL数组（http）
 */
export const normalizeImageUrls = (urls?: string[]): string[] => {
  if (!Array.isArray(urls)) {
    return [];
  }
  
  return urls.map(url => normalizeImageUrl(url)).filter(url => url !== '');
};

/**
 * 压缩图片
 * @param filePath 图片文件路径
 * @param quality 压缩质量 (0-1，默认0.8)
 * @returns Promise<string> 压缩后的临时文件路径
 */
export const compressImage = (
  filePath: string,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查是否为图片格式
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const isImage = imageExtensions.some(ext => 
      filePath.toLowerCase().includes(ext)
    );
    
    if (!isImage) {
      // 非图片格式直接返回原路径
      resolve(filePath);
      return;
    }

    // 使用Taro的图片压缩API，保持原始尺寸
    Taro.compressImage({
      src: filePath,
      quality: Math.round(quality * 100), // Taro需要0-100的整数
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (err) => {
        console.warn('图片压缩失败，使用原图片:', err);
        // 压缩失败时返回原路径
        resolve(filePath);
      }
    });
  });
};

/**
 * 检查文件是否为图片格式
 * @param filePath 文件路径
 * @returns boolean
 */
export const isImageFile = (filePath: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  return imageExtensions.some(ext => 
    filePath.toLowerCase().includes(ext)
  );
};