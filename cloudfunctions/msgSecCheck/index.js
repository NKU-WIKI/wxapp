// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云函数
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('msgSecCheck 云函数收到请求:', event);
  
  // 获取内容
  const content = event.content || '';
  
  // 内容为空时，直接放行
  if (!content || content.trim() === '') {
    return {
      code: 200,
      message: 'pass',
      data: {
        result: {
          suggest: 'pass'
        }
      }
    };
  }

  try {
    // 从云函数上下文中获取openid
    const openid = event.userInfo ? event.userInfo.openId : '';
    
    // 调用微信官方安全检测接口
    console.log('调用内容安全检测API, 内容:', content);
    
    const result = await cloud.openapi.security.msgSecCheck({
      content: content,
      scene: event.scene || 3,
      version: event.version || 2,
      openid: openid
    });
    
    console.log('内容安全检测结果:', result);
    
    // 检测结果标签映射
    const labelMap = {
      100: '正常',
      10001: '广告内容',
      20001: '时政内容',
      20002: '色情内容',
      20003: '辱骂内容',
      20006: '违法犯罪内容',
      20008: '欺诈内容', 
      20012: '低俗内容',
      20013: '版权内容',
      21000: '其他违规内容'
    };
    
    // 若result存在且有结果
    if (result && result.result) {
      const suggest = result.result.suggest;
      const label = result.result.label;
      const isRisky = suggest !== 'pass';
      
      return {
        code: 200,
        message: suggest === 'pass' ? 'pass' : (suggest === 'risky' ? 'risky' : 'review'),
        data: {
          result: {
            ...result.result,
            labelText: labelMap[label] || '未知类型',
            isRisky: isRisky
          }
        }
      };
    }
    
    // 默认返回通过
    return {
      code: 200,
      message: 'pass',
      data: {
        result: {
          suggest: 'pass',
          isRisky: false
        }
      }
    };
  } catch (error) {
    console.error('内容安全检测失败:', error);
    
    // 发生错误时默认放行，但加上警告标记
    return {
      code: 200,
      message: 'pass',
      data: {
        result: {
          suggest: 'pass',
          warning: '内容检测遇到错误，请谨慎处理',
          isRisky: false
        }
      }
    };
  }
} 