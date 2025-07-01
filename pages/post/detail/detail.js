const behaviors = require('../../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior, 
    behaviors.userBehavior,
    behaviors.postBehavior,
    behaviors.systemAdaptBehavior
  ],

  data: {

    isPostLoading: true,
    loadError: '',
    postDetail: null,
    postId: '',
    commentId: '',
  
    // 顶部提示
    toptips: {
      show: false,
      msg: '',
      type: 'error'
    },
    
    // 对话框
    dialog: {
      show: false,
      title: '',
      buttons: []
    },

    // 记录是否需要聚焦到评论区
    shouldFocusComment: false,
    // 当前用户角色
    role: ''
  },

  async onLoad(options) {
    // 从页面参数中获取帖子ID
    const postId = options.id;
    // 获取当前用户角色
    let role = '';
    try {
      role = wx.getStorageSync('role') || '';
    } catch (e) {}
    this.setData({
      postId: postId,
      role: role
    });
    
    // 处理评论ID和焦点参数
    if(options.commentId){
      this.setData({
        commentId: options.commentId
      });
    }
    
    // 记录是否需要聚焦到评论区
    if(options.focus === 'comment') {
      this.setData({
        shouldFocusComment: true
      });
    }
    

    
    // 加载帖子详情
    await this.loadPostDetail();
  },
  
  onReady() {
    // 如果有评论ID参数，等待页面准备好后定位到指定评论
    const { commentId, shouldFocusComment } = this.data;
    
    // 延迟执行以确保组件已加载
    setTimeout(() => {
      if (commentId) {
        this.scrollToComment(commentId);
      } else if (shouldFocusComment) {
        // 滚动到评论区域
        wx.createSelectorQuery()
          .select('.comment-list-container')
          .boundingClientRect(rect => {
            if (rect) {
              wx.pageScrollTo({
                scrollTop: rect.top,
                duration: 300
              });
            }
          })
          .exec();
      }
    }, 1000);
  },
  
  onShow() {

  },

  // 自定义分享内容
  onShareAppMessage(res) {
    const { postDetail } = this.data;
    
    // 检查是否是从分享按钮触发
    if (res.from === 'button') {
      console.log('从分享按钮分享', res.target);
    }
    
    // 如果帖子数据还没加载完成，提供默认分享内容
    if (!postDetail || !postDetail.data) {
      return {
        title: 'nkuwiki - 南开校园知识分享',
        path: `/pages/post/detail/detail?id=${this.data.postId}`,
        imageUrl: '/icons/logo.png'
      };
    }
    
    const post = postDetail.data;
    
    // 生成分享标题 - 优化显示
    let shareTitle = post.title || '南开校园分享';
    if (shareTitle.length > 30) {
      shareTitle = shareTitle.substring(0, 27) + '...';
    }
    
    // 添加作者信息
    const author = post.user_info?.nickname || post.nickname || '匿名用户';
    shareTitle = `${shareTitle} - @${author}`;
    
    // 构造分享路径
    const sharePath = `/pages/post/detail/detail?id=${post.id}`;
    
    // 选择分享图片
    let shareImageUrl = '/icons/logo.png'; // 默认图片
    
    // 如果帖子有图片，使用第一张图片
    if (post.image && post.image.length > 0) {
      try {
        const images = typeof post.image === 'string' 
          ? JSON.parse(post.image) 
          : post.image;
        if (Array.isArray(images) && images.length > 0) {
          shareImageUrl = images[0];
        }
      } catch (e) {
        console.log('解析帖子图片失败', e);
      }
    }
    
    console.log('生成分享内容', {
      title: shareTitle,
      path: sharePath,
      imageUrl: shareImageUrl
    });
    
    return {
      title: shareTitle,
      path: sharePath,
      imageUrl: shareImageUrl
    };
  },

  // 自定义分享到朋友圈
  onShareTimeline() {
    const { postDetail } = this.data;
    
    if (!postDetail || !postDetail.data) {
      return {
        title: 'nkuwiki - 南开校园知识分享',
        query: `id=${this.data.postId}`,
        imageUrl: '/icons/logo.png'
      };
    }
    
    const post = postDetail.data;
    let shareTitle = post.title || '南开校园分享';
    
    // 朋友圈标题稍长一些
    if (shareTitle.length > 50) {
      shareTitle = shareTitle.substring(0, 47) + '...';
    }
    
    const author = post.user_info?.nickname || post.nickname || '匿名用户';
    shareTitle = `${shareTitle} | ${author} 在nkuwiki分享`;
    
    // 选择分享图片
    let shareImageUrl = '/icons/logo.png';
    if (post.image && post.image.length > 0) {
      try {
        const images = typeof post.image === 'string' 
          ? JSON.parse(post.image) 
          : post.image;
        if (Array.isArray(images) && images.length > 0) {
          shareImageUrl = images[0];
        }
      } catch (e) {
        console.log('解析帖子图片失败', e);
      }
    }
    
    console.log('生成朋友圈分享内容', {
      title: shareTitle,
      query: `id=${post.id}`,
      imageUrl: shareImageUrl
    });
    
    return {
      title: shareTitle,
      query: `id=${post.id}`,
      imageUrl: shareImageUrl
    };
  },

  
  // 显示顶部提示
  showToptips(msg, type = 'error') {
    this.setData({
      'toptips.show': true,
      'toptips.msg': msg,
      'toptips.type': type
    });
    
    setTimeout(() => {
      this.setData({ 'toptips.show': false });
    }, 3000);
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 重新加载帖子详情
    this.loadPostDetail();
    
    // 获取评论列表组件实例，刷新评论列表
    const commentList = this.selectComponent('#commentList');
    if (commentList) {
      commentList.refresh();
    }
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },
  
  // 帖子删除回调
  onPostDeleted() {
    // 显示成功提示
    this.showToptips('帖子已删除', 'success');
    
    // 延迟返回
    setTimeout(() => {
      this.navigateBack();
    }, 1500);
  },
  
  // 获取页面状态组件实例
  getPageStatus() {
    return this.selectComponent('#pageStatus');
  },
  
  // 显示全屏加载
  showFullscreenLoading(text = '加载中...') {
    const pageStatus = this.getPageStatus();
    if (pageStatus) {
      pageStatus.showLoading({
        text,
        type: 'fullscreen',
        mask: true
      });
    }
  },
  
  // 隐藏全屏加载
  hideFullscreenLoading() {
    const pageStatus = this.getPageStatus();
    if (pageStatus) {
      pageStatus.hideLoading();
    }
  },
  
  // 显示错误状态
  showError(message) {
    const pageStatus = this.getPageStatus();
    if (pageStatus) {
      pageStatus.showError(message);
    }
  },

  // 滚动到指定评论的方法
  scrollToComment(commentId) {
    // 获取评论列表组件实例
    const commentList = this.selectComponent('#commentList');
    if (commentList) {
      // 调用评论列表组件的方法，定位到指定评论
      commentList.locateComment(commentId);
    }
  },

  // 加载帖子详情
  async loadPostDetail() {
    const { postId } = this.data;
    if (!postId) {
      this.setData({ 
        loadError: '帖子ID不存在',
        isPostLoading: false 
      });
      return;
    }
    
    this.setData({ isPostLoading: true, loadError: '' });
    
    try {
      const postDetail = await this._getPostDetail(postId);
      this.setData({
        postDetail: postDetail,
        isPostLoading: false
      });
      console.log('postDetail', postDetail);
    } catch (err) {
      console.error('加载帖子详情失败:', err);
      this.setData({ 
        loadError: '加载失败，请重试',
        isPostLoading: false 
      });
    }
  },

}); 