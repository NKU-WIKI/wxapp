const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  console.log('generateUrlLink 云函数收到请求:', event);
  
  try {
    const { postId } = event;
    
    if (!postId) {
      return {
        code: 400,
        message: 'postId is required',
        data: null
      };
    }

    const result = await cloud.openapi.urllink.generate({
      path: `pages/post/detail/detail?id=${postId}`,
      query: '',
      expire_type: 0,
      expire_interval: 1
    });

    console.log('生成url_link成功:', result);

    if (result && result.urlLink) {
      return {
        code: 200,
        message: 'success',
        data: {
          urlLink: result.urlLink
        }
      };
    } else {
      throw new Error('微信接口返回数据异常');
    }

  } catch (error) {
    console.error('生成url_link失败:', error);
    
    return {
      code: 500,
      message: '生成分享链接失败',
      data: {
        error: error.message,
        errorDetails: error
      }
    };
  }
} 