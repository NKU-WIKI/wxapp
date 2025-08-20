/**
 * 图片URL处理工具函数
 */

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