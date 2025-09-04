/**
 * 图片URL处理工具函数
 */
import Taro from '@tarojs/taro';

const BASE_URL = process.env.BASE_URL;

/**
 * 标准化图片URL
 * 将相对路径转换为完整的URL，并统一使用 HTTPS 协议
 * @param url 图片URL
 * @returns 完整的图片URL（https）
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

  // 如果已经是完整的HTTP URL，统一升级为 https（排除 http(s)://tmp/ 已在上方处理）
  if (/^http:\/\//i.test(trimmed)) {
    const httpsUrl = trimmed.replace(/^http:\/\//i, 'https://');
    return httpsUrl;
  }

  // 如果已经是HTTPS URL，直接返回
  if (/^https:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 如果是本地资源路径（以/assets/开头），直接返回
  if (trimmed.startsWith('/assets/')) {
    return trimmed;
  }

  // 如果是相对路径（以/开头），拼接BASE_URL，并确保使用 https
  if (trimmed.startsWith('/')) {
    let base = BASE_URL || '';
    // 确保BASE_URL使用HTTPS协议
    if (base && !base.startsWith('https://')) {
      base = base.replace(/^http:\/\//i, 'https://');
    }
    const fullUrl = `${base}${trimmed}`;
    return fullUrl;
  }

  // 其他情况，直接返回原URL
  return trimmed;
};

/**
 * 批量标准化图片URL数组
 * @param urls 图片URL数组
 * @returns 标准化后的图片URL数组（https）
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
  return new Promise((resolve) => {
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
      fail: (_err) => {
        
        // 压缩失败时返回原路径
        resolve(filePath);
      }
    });
  });
};

/**
 * 智能压缩图片
 * 根据图片大小自动决定是否需要压缩
 * @param filePath 图片文件路径
 * @param maxSizeKB 最大文件大小（KB），超过此大小才会压缩，默认1024KB（1MB）
 * @param quality 压缩质量 (0-1，默认0.85)
 * @returns Promise<string> 压缩后的临时文件路径
 */
export const smartCompressImage = async (
  filePath: string,
  maxSizeKB: number = 1024,
  quality: number = 0.85
): Promise<string> => {
  try {
    // 检查是否为图片格式
    if (!isImageFile(filePath)) {
      return filePath;
    }

    // 获取文件信息
    const fileInfo = await Taro.getFileInfo({
      filePath: filePath
    });

    // 检查是否成功获取文件信息
    if ('size' in fileInfo) {
      const fileSizeKB = fileInfo.size / 1024; // 转换为KB
      
      console.log(`📸 图片大小: ${fileSizeKB.toFixed(2)}KB, 阈值: ${maxSizeKB}KB`);
      
      // 如果文件大小小于阈值，不需要压缩
      if (fileSizeKB <= maxSizeKB) {
        console.log('✅ 图片大小合适，无需压缩');
        return filePath;
      }
      
      // 如果文件大小超过阈值，进行压缩
      console.log(`🔄 图片过大，开始压缩，目标质量: ${quality}`);
      
      // 根据文件大小动态调整压缩质量，但保持较高的质量
      let compressionQuality = quality;
      
      // 根据文件大小与阈值的比例，智能预估初始压缩质量
      const sizeRatio = fileSizeKB / maxSizeKB;
      
      if (sizeRatio > 3) {
        // 文件大小超过阈值的3倍，使用较低质量
        compressionQuality = Math.max(0.75, quality - 0.1);
        console.log(`📉 文件过大(${sizeRatio.toFixed(1)}倍)，调整压缩质量为: ${compressionQuality}`);
      } else if (sizeRatio > 2) {
        // 文件大小超过阈值的2倍，使用适中质量
        compressionQuality = Math.max(0.8, quality - 0.05);
        console.log(`📉 文件较大(${sizeRatio.toFixed(1)}倍)，调整压缩质量为: ${compressionQuality}`);
      } else if (sizeRatio > 1.5) {
        // 文件大小超过阈值的1.5倍，轻微调整质量
        compressionQuality = Math.max(0.82, quality - 0.03);
        console.log(`📉 文件稍大(${sizeRatio.toFixed(1)}倍)，调整压缩质量为: ${compressionQuality}`);
      } else {
        // 文件大小接近阈值，保持高质量
        compressionQuality = quality;
        console.log(`✅ 文件大小合适，保持压缩质量: ${compressionQuality}`);
      }
      
      // 尝试多次压缩，逐步调整质量直到达到目标大小
      let finalPath = filePath;
      let attempts = 0;
      const maxAttempts = 5; // 增加尝试次数，更精细地控制
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 第${attempts}次压缩尝试，质量: ${compressionQuality}`);
        
        finalPath = await compressImage(filePath, compressionQuality);
        
        // 检查压缩后的文件大小
        try {
          const compressedInfo = await Taro.getFileInfo({
            filePath: finalPath
          });
          
          if ('size' in compressedInfo) {
            const compressedSizeKB = compressedInfo.size / 1024;
            const compressionRatio = ((fileSizeKB - compressedSizeKB) / fileSizeKB * 100).toFixed(1);
            
            console.log(`📊 第${attempts}次压缩结果: ${fileSizeKB.toFixed(2)}KB → ${compressedSizeKB.toFixed(2)}KB (节省${compressionRatio}%)`);
            
            // 目标：压缩到接近maxSizeKB，允许±20%的误差
            const targetMin = maxSizeKB * 0.8;  // 最低目标：2.4MB
            const targetMax = maxSizeKB * 1.2;  // 最高目标：3.6MB
            
            if (compressedSizeKB >= targetMin && compressedSizeKB <= targetMax) {
              console.log(`✅ 压缩完成，文件大小在目标范围内: ${compressedSizeKB.toFixed(2)}KB (目标: ${targetMin.toFixed(0)}KB - ${targetMax.toFixed(0)}KB)`);
              return finalPath;
            }
            
            // 如果压缩过度（文件太小），提高质量重新压缩
            if (compressedSizeKB < targetMin) {
              compressionQuality = Math.min(0.95, compressionQuality + 0.05); // 提高质量
              console.log(`📈 压缩过度，提高质量到: ${compressionQuality}`);
              continue;
            }
            
            // 如果文件仍然过大，降低质量
            if (compressedSizeKB > targetMax) {
              if (compressedSizeKB > maxSizeKB * 2) {
                // 文件仍然很大，适度降低质量
                compressionQuality = Math.max(0.7, compressionQuality - 0.08);
                console.log(`📉 文件仍然过大，降低质量到: ${compressionQuality}`);
              } else {
                // 文件接近目标，轻微降低质量
                compressionQuality = Math.max(0.75, compressionQuality - 0.03);
                console.log(`📉 轻微调整质量到: ${compressionQuality}`);
              }
            }
          } else {
            console.log('✅ 压缩完成，但无法获取压缩后文件大小');
            return finalPath;
          }
        } catch (error) {
          console.warn('⚠️ 无法获取压缩后文件信息，返回当前压缩结果');
          return finalPath;
        }
      }
      
      // 如果多次尝试后仍未达到目标，返回最后一次压缩结果
      console.log(`⚠️ 达到最大压缩次数，返回最终结果`);
      return finalPath;
    } else {
      console.warn('⚠️ 无法获取文件大小信息，跳过压缩');
      return filePath;
    }
    
  } catch (error) {
    console.error('❌ 智能压缩失败:', error);
    // 压缩失败时返回原路径
    return filePath;
  }
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
