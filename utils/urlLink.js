/**
 * URL Link 工具函数
 * 用于生成微信小程序的分享链接
 */

const { logger } = require('./logger');

/**
 * 生成帖子的微信分享链接
 * @param {string|number} postId 帖子ID
 * @returns {Promise<string|null>} 返回生成的url_link，失败时返回null
 */
async function generatePostUrlLink(postId) {
  if (!postId) {
    logger.error('generatePostUrlLink: postId is required');
    return null;
  }

  const isMiniProgram = typeof wx !== 'undefined'
    && wx.cloud
    && typeof wx.cloud.callFunction === 'function';

  if (!isMiniProgram) {
    logger.warn('generatePostUrlLink: 非微信小程序环境，无法调用云函数');
    return null;
  }

  try {
    logger.debug('开始生成url_link', { postId });
    
    const res = await wx.cloud.callFunction({
      name: 'generateUrlLink',
      data: { postId: String(postId) }
    });

    if (res && res.result && res.result.code === 200 && res.result.data) {
      const urlLink = res.result.data.urlLink;
      logger.debug('url_link生成成功', { postId, urlLink });
      return urlLink;
    } else {
      logger.error('云函数返回格式异常', res);
      return null;
    }
  } catch (error) {
    logger.error('调用generateUrlLink云函数失败', { error, postId });
    return null;
  }
}

module.exports = {
  generatePostUrlLink
}; 