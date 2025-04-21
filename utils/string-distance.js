/**
 * 字符串相似度计算工具
 * 这个文件使用similarity库进行字符串相似度计算
 */

let stringDistance = null;

try {
  // 尝试加载similarity库
  const similarityLib = require('similarity');
  
  // 确保导出的是函数
  if (typeof similarityLib === 'function') {
    stringDistance = {
      // similarity库本身就是接受两个字符串返回相似度的函数
      similarity: (a, b) => {
        if (!a || !b) return 0;
        return similarityLib(a, b);
      }
    };
  }
} catch (error) {
  console.error('加载similarity库失败:', error);
}

// 如果没有找到有效的库，使用内部实现
if (!stringDistance) {
  // 计算Levenshtein距离
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    
    // 初始化矩阵
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }
    
    // 填充矩阵
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // 删除
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  // 创建自定义的字符串相似度对象
  stringDistance = {
    // 计算相似度，返回0-1之间的值
    similarity: (a, b) => {
      if (!a || !b) return 0;
      if (a === b) return 1.0;
      
      const distance = levenshtein(a, b);
      const maxLength = Math.max(a.length, b.length);
      
      if (maxLength === 0) return 1.0;
      return 1.0 - distance / maxLength;
    }
  };
}

// 添加适配后的接口
if (!stringDistance.levenshtein) {
  stringDistance.levenshtein = (a, b) => {
    if (!a || !b) return a ? a.length : (b ? b.length : 0);
    
    const matrix = [];
    
    // 初始化矩阵
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }
    
    // 填充矩阵
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // 删除
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }
    
    return matrix[b.length][a.length];
  };
}

module.exports = stringDistance; 