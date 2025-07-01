/**
 * 小程序分享工具函数
 * 提供统一的分享内容生成和处理
 */

const { logger } = require('./logger');

/**
 * 生成帖子分享内容
 * @param {Object} post 帖子数据
 * @param {Object} options 可选配置
 * @returns {Object} 分享配置对象
 */
function generatePostShareContent(post, options = {}) {
  const {
    maxTitleLength = 30,
    includeAuthor = true,
    defaultTitle = 'nkuwiki - 南开校园知识分享',
    defaultImage = '/icons/logo.png'
  } = options;

  if (!post || !post.id) {
    logger.warn('生成分享内容失败：帖子数据无效');
    return {
      title: defaultTitle,
      path: '/pages/index/index',
      imageUrl: defaultImage
    };
  }

  // 生成分享标题
  let shareTitle = post.title || '南开校园分享';
  if (shareTitle.length > maxTitleLength) {
    shareTitle = shareTitle.substring(0, maxTitleLength - 3) + '...';
  }

  // 添加作者信息
  if (includeAuthor) {
    const author = post.user_info?.nickname || post.nickname || '匿名用户';
    shareTitle = `${shareTitle} - @${author}`;
  }

  // 构造分享路径
  const sharePath = `/pages/post/detail/detail?id=${post.id}`;

  // 选择分享图片
  let shareImageUrl = defaultImage;
  if (post.image && post.image.length > 0) {
    try {
      const images = typeof post.image === 'string' 
        ? JSON.parse(post.image) 
        : post.image;
      if (Array.isArray(images) && images.length > 0) {
        shareImageUrl = images[0];
      }
    } catch (e) {
      logger.debug('解析帖子图片失败', e);
    }
  }

  logger.debug('生成帖子分享内容', {
    title: shareTitle,
    path: sharePath,
    imageUrl: shareImageUrl
  });

  return {
    title: shareTitle,
    path: sharePath,
    imageUrl: shareImageUrl
  };
}

/**
 * 生成朋友圈分享内容
 * @param {Object} post 帖子数据
 * @param {Object} options 可选配置
 * @returns {Object} 朋友圈分享配置对象
 */
function generateTimelineShareContent(post, options = {}) {
  const {
    maxTitleLength = 50,
    suffix = '在nkuwiki分享',
    defaultTitle = 'nkuwiki - 南开校园知识分享',
    defaultImage = '/icons/logo.png'
  } = options;

  if (!post || !post.id) {
    logger.warn('生成朋友圈分享内容失败：帖子数据无效');
    return {
      title: defaultTitle,
      query: '',
      imageUrl: defaultImage
    };
  }

  // 生成朋友圈标题
  let shareTitle = post.title || '南开校园分享';
  
  const author = post.user_info?.nickname || post.nickname || '匿名用户';
  const fullTitle = `${shareTitle} | ${author} ${suffix}`;
  
  if (fullTitle.length > maxTitleLength) {
    const availableLength = maxTitleLength - author.length - suffix.length - 4; // 4 for ' | '
    shareTitle = shareTitle.substring(0, availableLength - 3) + '...';
  }
  
  const finalTitle = `${shareTitle} | ${author} ${suffix}`;

  // 选择分享图片
  let shareImageUrl = defaultImage;
  if (post.image && post.image.length > 0) {
    try {
      const images = typeof post.image === 'string' 
        ? JSON.parse(post.image) 
        : post.image;
      if (Array.isArray(images) && images.length > 0) {
        shareImageUrl = images[0];
      }
    } catch (e) {
      logger.debug('解析帖子图片失败', e);
    }
  }

  logger.debug('生成朋友圈分享内容', {
    title: finalTitle,
    query: `id=${post.id}`,
    imageUrl: shareImageUrl
  });

  return {
    title: finalTitle,
    query: `id=${post.id}`,
    imageUrl: shareImageUrl
  };
}

/**
 * 生成通用页面分享内容
 * @param {Object} pageInfo 页面信息
 * @returns {Object} 分享配置对象
 */
function generatePageShareContent(pageInfo = {}) {
  const {
    title = 'nkuwiki - 南开校园知识分享',
    path = '/pages/index/index',
    imageUrl = '/icons/logo.png',
    desc = '南开大学校园知识分享平台'
  } = pageInfo;

  return {
    title,
    path,
    imageUrl,
    desc
  };
}

/**
 * 获取当前页面路径（用于分享）
 * @returns {string} 当前页面路径
 */
function getCurrentPagePath() {
  try {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const route = currentPage.route || currentPage.__route__;
      const options = currentPage.options || {};
      
      // 构造完整路径
      let path = `/${route}`;
      const queryParams = Object.keys(options).map(key => `${key}=${options[key]}`);
      if (queryParams.length > 0) {
        path += `?${queryParams.join('&')}`;
      }
      
      return path;
    }
  } catch (e) {
    logger.warn('获取当前页面路径失败', e);
  }
  
  return '/pages/index/index';
}

/**
 * 创建页面分享混入对象
 * @param {Object} config 分享配置
 * @returns {Object} 包含分享方法的混入对象
 */
function createShareMixin(config = {}) {
  return {
    // 分享给朋友
    onShareAppMessage(res) {
      const { generateContent, fallbackContent } = config;
      
      try {
        if (typeof generateContent === 'function') {
          return generateContent.call(this, res);
        }
        
        // 默认分享内容
        return fallbackContent || generatePageShareContent({
          path: getCurrentPagePath()
        });
      } catch (e) {
        logger.error('生成分享内容失败', e);
        return generatePageShareContent();
      }
    },

    // 分享到朋友圈
    onShareTimeline() {
      const { generateTimelineContent, fallbackTimelineContent } = config;
      
      try {
        if (typeof generateTimelineContent === 'function') {
          return generateTimelineContent.call(this);
        }
        
        // 默认朋友圈分享内容
        return fallbackTimelineContent || {
          title: 'nkuwiki - 南开校园知识分享',
          query: '',
          imageUrl: '/icons/logo.png'
        };
      } catch (e) {
        logger.error('生成朋友圈分享内容失败', e);
        return {
          title: 'nkuwiki - 南开校园知识分享',
          query: '',
          imageUrl: '/icons/logo.png'
        };
      }
    }
  };
}

module.exports = {
  generatePostShareContent,
  generateTimelineShareContent,
  generatePageShareContent,
  getCurrentPagePath,
  createShareMixin
}; 