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

    const result = await cloud.openapi.urlscheme.generate({
      jumpWxa: {
        path: 'pages/post/detail/detail',
        query: `id=${postId}`
      },
      expireType: 0,
      expireInterval: 1
    });

    console.log('生成url_scheme成功:', result);

    if (result && result.openlink) {
      return {
        code: 200,
        message: 'success',
        data: {
          urlLink: result.openlink
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