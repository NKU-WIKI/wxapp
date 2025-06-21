const behaviors = require('../../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior, 
    behaviors.userBehavior,
    behaviors.knowledgeBehavior,
    behaviors.commentBehavior,
    behaviors.systemAdaptBehavior
  ],

  data: {

    isLoading: true,
    loadError: '',
    knowledgeDetail: null,
    id: '',
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
    
    // 是否正在编辑
    isEditing: false,
    
    // 用户操作菜单
    actionSheet: {
      show: false,
      itemList: []
    },
    
    // 评论功能控制
    commentEnabled: false
  },

  async onLoad(options) {
    // 从页面参数中获取知识ID和数据
    const id = options.id;
    
    // 尝试从options中获取传入的知识详情数据
    let knowledgeData = null;
    try {
      if (options.data) {
        const parsedData = JSON.parse(decodeURIComponent(options.data));
        
        // 检查返回的数据是否有data数组格式
        if (parsedData.data && Array.isArray(parsedData.data)) {
          // 查找id匹配的项目
          knowledgeData = parsedData.data.find(item => item.id == id);
        } 
        // 检查是否本身就是数组
        else if (Array.isArray(parsedData)) {
          // 查找id匹配的项目
          knowledgeData = parsedData.find(item => item.id == id);
        }
        // 直接使用对象，检查id是否匹配
        else if (parsedData.id && parsedData.id == id) {
          knowledgeData = parsedData;
        }
        // 直接使用对象
        else {
          knowledgeData = parsedData;
        }
      }
    } catch (err) {
      console.debug('解析传入数据失败:', err);
    }
    
    this.setData({
      id: id,
      // 如果有传入数据，直接使用
      knowledgeDetail: knowledgeData ? { data: knowledgeData } : null
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
    

    
    // 如果没有传入数据，则加载知识详情
    if (!knowledgeData) {
      await this.loadKnowledgeDetail();
    } else {
      // 处理relevance值的格式
      this.processKnowledgeData();
      this.setData({ isLoading: false });
    }
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
    // 不再每次显示页面时都刷新内容
    // 如果需要刷新，可以使用下拉刷新
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
    // 不重新加载知识详情，避免调用API
    
    // 只刷新评论列表
    const commentList = this.selectComponent('#commentList');
    if (commentList) {
      commentList.refresh();
    }
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },
  
  // 知识删除回调
  onKnowledgeDeleted() {
    // 显示成功提示
    this.showToptips('知识条目已删除', 'success');
    
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

  // 处理知识数据（格式化relevance等）
  processKnowledgeData() {
    const { knowledgeDetail } = this.data;
    if (knowledgeDetail && knowledgeDetail.data && knowledgeDetail.data.relevance !== undefined) {
      // 如果relevance小于等于1，认为是小数形式（0-1范围），转换为百分比
      if (knowledgeDetail.data.relevance <= 1) {
        knowledgeDetail.data.relevance = Math.round(knowledgeDetail.data.relevance * 100);
      } else {
        // 如果已经是百分比形式，确保是整数
        knowledgeDetail.data.relevance = Math.round(knowledgeDetail.data.relevance);
      }
      
      this.setData({ knowledgeDetail });
    }
  },

  // 加载知识详情
  async loadKnowledgeDetail() {
    const { id } = this.data;
    if (!id) {
      this.setData({ 
        loadError: '知识条目ID不存在',
        isLoading: false 
      });
      return;
    }
    
    this.setData({ isLoading: true, loadError: '' });
    
    try {
      // 如果已有数据，无需再次加载
      if (this.data.knowledgeDetail && this.data.knowledgeDetail.data) {
        this.processKnowledgeData();
        this.setData({ isLoading: false });
        return;
      }
      
      // 调用API获取知识详情
      const result = await this._getKnowledgeDetail(id);
      
      if (result && result.data) {
        this.setData({ 
          knowledgeDetail: result,
          isLoading: false 
        });
        
        // 处理relevance的格式
        this.processKnowledgeData();
        
        // 增加浏览次数
        this.increaseViewCount();
      } else {
        throw new Error('获取知识详情失败');
      }
    } catch (error) {
      console.error('加载知识详情失败:', error);
      
      // 检查是否有已存在的部分数据
      const { knowledgeDetail } = this.data;
      if (knowledgeDetail && knowledgeDetail.data) {
        // 如果有部分数据，仍然显示，只是提示加载完整数据失败
        this.showToptips('加载完整数据失败，显示部分内容');
        this.setData({ isLoading: false });
      } else {
        // 如果完全没有数据，则显示错误状态
        this.setData({
          loadError: '加载知识详情失败: ' + (error.message || '未知错误'),
          isLoading: false
        });
      }
    }
  },
  
  // 更新浏览量
  async increaseViewCount() {
    try {
      const { id } = this.data;
      if (!id) return;
      
      // 暂时不调用API，直接本地更新浏览量
      // await this._increaseKnowledgeViewCount(id);
      
      // 本地更新浏览量显示
      if (this.data.knowledgeDetail && this.data.knowledgeDetail.data) {
        const newDetail = {...this.data.knowledgeDetail};
        newDetail.data.view_count = (parseInt(newDetail.data.view_count) || 0) + 1;
        this.setData({
          knowledgeDetail: newDetail
        });
      }
    } catch (err) {
      console.debug('更新浏览量失败:', err);
    }
  },
  
  // 点赞/取消点赞
  async toggleLike() {
    try {
      // 判断是否已登录
      if (!this.isLoggedIn()) {
        this.showToptips('请先登录', 'error');
        return;
      }
      
      const { id, knowledgeDetail } = this.data;
      if (!id || !knowledgeDetail || !knowledgeDetail.data) return;
      
      const isLiked = knowledgeDetail.data.is_liked;
      
      // 暂时不调用API
      // await this._toggleKnowledgeLike(id, !isLiked);
      
      // 本地更新点赞状态和数量
      const newDetail = {...knowledgeDetail};
      newDetail.data.is_liked = !isLiked;
      newDetail.data.like_count = isLiked 
        ? Math.max(0, (parseInt(newDetail.data.like_count) || 0) - 1) 
        : (parseInt(newDetail.data.like_count) || 0) + 1;
      
      this.setData({
        knowledgeDetail: newDetail
      });
      
      this.showToptips(isLiked ? '已取消点赞' : '点赞成功', 'success');
    } catch (err) {
      console.error('点赞操作失败:', err);
      this.showToptips('操作失败，请重试', 'error');
    }
  },
  
  // 收藏/取消收藏
  async toggleCollect() {
    try {
      // 判断是否已登录
      if (!this.isLoggedIn()) {
        this.showToptips('请先登录', 'error');
        return;
      }
      
      const { id, knowledgeDetail } = this.data;
      if (!id || !knowledgeDetail || !knowledgeDetail.data) return;
      
      const isCollected = knowledgeDetail.data.is_collected;
      
      // 暂时不调用API
      // await this._toggleKnowledgeCollect(id, !isCollected);
      
      // 本地更新收藏状态和数量
      const newDetail = {...knowledgeDetail};
      newDetail.data.is_collected = !isCollected;
      newDetail.data.collect_count = isCollected 
        ? Math.max(0, (parseInt(newDetail.data.collect_count) || 0) - 1) 
        : (parseInt(newDetail.data.collect_count) || 0) + 1;
      
      this.setData({
        knowledgeDetail: newDetail
      });
      
      this.showToptips(isCollected ? '已取消收藏' : '收藏成功', 'success');
    } catch (err) {
      console.error('收藏操作失败:', err);
      this.showToptips('操作失败，请重试', 'error');
    }
  },
  
  // 显示操作菜单
  showActionSheet() {
    const { knowledgeDetail } = this.data;
    if (!knowledgeDetail || !knowledgeDetail.data) return;
    
    // 检查用户权限
    const canEdit = this.checkEditPermission();
    
    // 准备菜单项
    const itemList = [];
    
    // 基础操作
    itemList.push('复制链接');
    
    // 如果有原始链接，添加复制原始链接选项
    // 兼容不同的URL字段名：original_url 或 url
    if (knowledgeDetail.data.original_url || knowledgeDetail.data.url) {
      itemList.push('复制原始链接');
      itemList.push('在浏览器中打开');
    }
    
    // 编辑和删除选项（需要权限）
    if (canEdit) {
      itemList.push('编辑');
      itemList.push('删除');
    }
    
    // 设置操作菜单
    this.setData({
      'actionSheet.show': true,
      'actionSheet.itemList': itemList
    });
  },
  
  // 处理操作菜单选择
  handleActionSheetSelect(e) {
    const { index } = e.detail;
    const { actionSheet, knowledgeDetail, id } = this.data;
    
    if (index < 0 || !actionSheet.itemList[index]) return;
    
    const selectedItem = actionSheet.itemList[index];
    
    // 根据选择执行对应操作
    switch (selectedItem) {
      case '复制链接':
        this.copyLink();
        break;
      case '复制原始链接':
        this.copyOriginalLink();
        break;
      case '在浏览器中打开':
        this.openInBrowser();
        break;
      case '编辑':
        this.editKnowledge();
        break;
      case '删除':
        this.confirmDelete();
        break;
    }
    
    // 关闭操作菜单
    this.setData({
      'actionSheet.show': false
    });
  },
  
  // 复制当前页面链接
  copyLink() {
    const { id } = this.data;
    const link = `/pages/knowledge/detail/detail?id=${id}`;
    
    wx.setClipboardData({
      data: link,
      success: () => {
        this.showToptips('链接已复制', 'success');
      }
    });
  },
  
  // 复制原始链接
  copyOriginalLink() {
    const { knowledgeDetail } = this.data;
    if (!knowledgeDetail || !knowledgeDetail.data) return;
    
    // 兼容不同的URL字段名：original_url 或 url
    const originalUrl = knowledgeDetail.data.original_url || knowledgeDetail.data.url;
    if (!originalUrl) return;
    
    wx.setClipboardData({
      data: originalUrl,
      success: () => {
        this.showToptips('原始链接已复制', 'success');
      }
    });
  },
  
  // 在浏览器中打开原始链接
  openInBrowser() {
    const { knowledgeDetail } = this.data;
    if (!knowledgeDetail || !knowledgeDetail.data) return;
    
    // 兼容不同的URL字段名：original_url 或 url
    const originalUrl = knowledgeDetail.data.original_url || knowledgeDetail.data.url;
    if (!originalUrl) return;
    
    // 跳转到webview页面
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(originalUrl)}&title=${encodeURIComponent(knowledgeDetail.data.title || '')}`
    });
  },
  
  // 检查编辑权限
  checkEditPermission() {
    // 此处应当根据实际权限逻辑判断
    // 例如：管理员或知识创建者可以编辑
    const { knowledgeDetail } = this.data;
    
    // 如果用户是管理员，返回true
    if (this.isAdmin()) return true;
    
    // 如果知识是用户创建的，返回true
    if (knowledgeDetail && knowledgeDetail.data && knowledgeDetail.data.creator_id) {
      const userInfo = this.getUserInfo();
      if (userInfo && userInfo.openid === knowledgeDetail.data.creator_id) {
        return true;
      }
    }
    
    return false; // 默认没有编辑权限
  },
  
  // 编辑知识
  editKnowledge() {
    const { id } = this.data;
    
    // 跳转到编辑页面
    wx.navigateTo({
      url: `/pages/knowledge/edit/edit?id=${id}`
    });
  },
  
  // 确认删除
  async confirmDelete() {
    const confirmed = await this.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？'
    });
    
    if (confirmed) {
      this.deleteKnowledge();
    }
  },
  
  // 删除知识
  async deleteKnowledge() {
    const { id } = this.data;
    
    try {
      // 显示加载
      wx.showLoading({ title: '删除中...' });
      
      // 暂时不调用API
      // await this._deleteKnowledge(id);
      
      // 模拟删除成功
      setTimeout(() => {
        // 隐藏加载
        wx.hideLoading();
        
        // 显示成功提示
        this.showToptips('删除成功', 'success');
        
        // 延迟返回上一页
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      }, 500);
    } catch (err) {
      // 隐藏加载
      wx.hideLoading();
      
      console.error('删除失败:', err);
      this.showToptips('删除失败，请重试', 'error');
    }
  },
  
  // 关闭操作菜单
  closeActionSheet() {
    this.setData({
      'actionSheet.show': false
    });
  },
  
  // 处理评论提交事件
  onCommentSubmit(e) {
    // 显示功能正在开发中的提示
    wx.showModal({
      title: '提示',
      content: '知识库评论功能正在开发中，请耐心等待',
      showCancel: false,
      confirmText: '知道了'
    });
    
    // 记录到日志
    console.log('知识库评论功能尚未实现，评论内容:', e.detail);
  },
  
  // 分享功能处理
  onShareAppMessage() {
    const { knowledgeDetail, id } = this.data;
    
    // 默认标题、路径和图片
    let title = '分享知识';
    let path = `/pages/knowledge/detail/detail?id=${id}`;
    let imageUrl = '';
    
    // 如果有知识详情，使用详情中的信息
    if (knowledgeDetail && knowledgeDetail.data) {
      title = knowledgeDetail.data.title || title;
      
      // 如果有图片，使用图片作为分享封面
      if (knowledgeDetail.data.image) {
        imageUrl = knowledgeDetail.data.image;
      }
    }
    
    return {
      title,
      path,
      imageUrl
    };
  }
}); 