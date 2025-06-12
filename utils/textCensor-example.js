/**
 * 敏感词系统使用示例
 * 演示如何使用更新后的从后端获取敏感词的系统
 */

const textCensor = require('./textCensor');
const banwordManager = require('./banwordManager');

/**
 * 基本使用示例
 */
async function basicExample() {
  console.log('=== 基本使用示例 ===');
  
  // 检测敏感词
  const testText = '这是一段包含敏感词的测试文本';
  const result = await textCensor.check(testText);
  
  console.log('检测结果:', result);
  
  if (result.risk) {
    console.log('发现敏感内容:', result.reason);
    console.log('匹配的敏感词:', result.matches);
    
    // 过滤敏感词
    const filteredText = await textCensor.filter(testText);
    console.log('过滤后文本:', filteredText);
  } else {
    console.log('文本安全');
  }
}

/**
 * 敏感词管理示例
 */
async function managementExample() {
  console.log('\n=== 敏感词管理示例 ===');
  
  // 获取敏感词分类
  const categories = await banwordManager.getCategories();
  console.log('敏感词分类:', categories);
  
  // 获取特定分类的敏感词
  if (categories.length > 0) {
    const words = await banwordManager.getCategoryWords(categories[0]);
    console.log(`${categories[0]} 分类的敏感词数量:`, words.length);
  }
  
  // 强制更新敏感词库
  console.log('强制更新敏感词库...');
  await banwordManager.forceUpdate();
  console.log('更新完成');
}

/**
 * 自定义敏感词示例
 */
async function customWordsExample() {
  console.log('\n=== 自定义敏感词示例 ===');
  
  // 添加自定义敏感词
  await textCensor.addCustomWord('自定义敏感词');
  console.log('添加自定义敏感词: 自定义敏感词');
  
  // 测试自定义敏感词
  const testText = '这里包含自定义敏感词';
  const result = await textCensor.check(testText);
  console.log('检测包含自定义敏感词的文本:', result.risk);
  
  // 删除自定义敏感词
  await textCensor.removeCustomWord('自定义敏感词');
  console.log('删除自定义敏感词');
}

/**
 * 缓存管理示例
 */
async function cacheExample() {
  console.log('\n=== 缓存管理示例 ===');
  
  // 检查缓存状态
  console.log('缓存是否过期:', banwordManager.isCacheExpired());
  
  // 设置缓存过期时间（5分钟）
  banwordManager.setCacheExpiryTime(5 * 60 * 1000);
  console.log('设置缓存过期时间为5分钟');
  
  // 清除缓存
  banwordManager.clearCache();
  console.log('清除缓存');
  
  // 重新获取敏感词库
  const library = await banwordManager.getLibrary();
  console.log('重新获取敏感词库，分类数量:', Object.keys(library).length);
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await basicExample();
    await managementExample();
    await customWordsExample();
    await cacheExample();
    
    console.log('\n=== 所有示例执行完成 ===');
  } catch (error) {
    console.error('示例执行出错:', error);
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  basicExample,
  managementExample,
  customWordsExample,
  cacheExample,
  runAllExamples
}; 