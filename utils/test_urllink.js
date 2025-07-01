/**
 * URL Link 功能测试脚本
 * 仅在开发环境使用，用于测试云函数和url_link生成功能
 */

const { logger } = require('./logger');

/**
 * 测试generateUrlLink云函数
 * @param {string} testPostId 测试用的帖子ID
 */
async function testGenerateUrlLink(testPostId = '123') {
  logger.debug('开始测试generateUrlLink云函数', { testPostId });
  
  const isMiniProgram = typeof wx !== 'undefined'
    && wx.cloud
    && typeof wx.cloud.callFunction === 'function';

  if (!isMiniProgram) {
    logger.error('测试失败：非微信小程序环境');
    return false;
  }

  try {
    const res = await wx.cloud.callFunction({
      name: 'generateUrlLink',
      data: { postId: testPostId }
    });

    logger.debug('云函数调用结果', res);

    if (res && res.result && res.result.code === 200) {
      const urlLink = res.result.data?.urlLink;
      if (urlLink) {
        logger.debug('测试成功！生成的url_link:', urlLink);
        return { success: true, urlLink };
      } else {
        logger.error('测试失败：返回数据中没有urlLink字段');
        return { success: false, error: '返回数据格式异常' };
      }
    } else {
      logger.error('测试失败：云函数返回错误', res.result);
      return { success: false, error: res.result?.message || '云函数执行失败' };
    }
  } catch (error) {
    logger.error('测试失败：云函数调用异常', error);
    return { success: false, error: error.message };
  }
}

/**
 * 测试完整的发帖url_link流程
 * 需要在页面中调用，并且用户已登录
 */
async function testPostUrlLinkFlow() {
  logger.debug('开始测试完整发帖url_link流程');
  
  // 构造测试帖子数据
  const testPostData = {
    title: '测试帖子 - URL Link功能',
    content: '这是一个用于测试URL Link功能的帖子',
    category_id: 1,
    is_public: true,
    allow_comment: true
  };

  try {
    const { generatePostUrlLink } = require('./index');
    const postBehavior = require('../behaviors/postBehavior');
    
    // 模拟发帖流程
    logger.debug('开始创建测试帖子');
    const result = await postBehavior._createPost(testPostData);
    
    if (result && result.code === 200 && result.data) {
      logger.debug('测试帖子创建成功', result.data);
      
      if (result.data.urlLink) {
        logger.debug('URL Link生成成功！', { 
          postId: result.data.id,
          urlLink: result.data.urlLink 
        });
        return { 
          success: true, 
          postId: result.data.id, 
          urlLink: result.data.urlLink 
        };
      } else {
        logger.warn('帖子创建成功但URL Link生成失败', result.data);
        return { 
          success: true, 
          postId: result.data.id, 
          urlLink: null,
          warning: 'URL Link生成失败'
        };
      }
    } else {
      logger.error('测试帖子创建失败', result);
      return { success: false, error: '帖子创建失败' };
    }
  } catch (error) {
    logger.error('测试流程异常', error);
    return { success: false, error: error.message };
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  logger.debug('=== URL Link 功能测试开始 ===');
  
  const results = {
    cloudFunction: null,
    fullFlow: null
  };

  // 测试1：云函数调用
  logger.debug('测试1：云函数基础调用');
  results.cloudFunction = await testGenerateUrlLink();
  
  // 测试2：完整流程（需要登录状态）
  logger.debug('测试2：完整发帖流程');
  try {
    results.fullFlow = await testPostUrlLinkFlow();
  } catch (error) {
    results.fullFlow = { success: false, error: '需要在已登录的页面环境中测试' };
    logger.warn('完整流程测试跳过：需要登录环境');
  }

  logger.debug('=== URL Link 功能测试结果 ===');
  logger.debug('云函数测试:', results.cloudFunction);
  logger.debug('完整流程测试:', results.fullFlow);
  logger.debug('=== 测试结束 ===');

  return results;
}

module.exports = {
  testGenerateUrlLink,
  testPostUrlLinkFlow,
  runAllTests
}; 