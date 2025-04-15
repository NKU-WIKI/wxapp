const behaviors = require('../../behaviors/index');

Component({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.commentBehavior,
    behaviors.authBehavior
  ],
  
  properties: {
    // 帖子ID
    postId: {
      type: null,
      value: 0,
      observer: function(newVal) {
        if (newVal) {
          this.loadComments();
        }
      }
    },
    // 是否允许回复
    allowReply: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 评论数据
    comments: [],
    
    // 基础状态
    loading: false,
    error: false,
    errorMsg: '加载评论失败',
    
    // 分页状态
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
    
    // 评论输入相关
    commentText: '',
    commentFocus: false,
    replyTo: null,
    isSubmitting: false,
    
    // 当前用户信息
    currentUserOpenid: ''
  },

  lifetimes: {
    attached() {
      // 自动获取当前用户openid
      const openid = this.getStorage('openid');
      
      if (openid) {
        this.setData({ currentUserOpenid: openid });
      }
      
      // 如果提供了postId，自动加载评论
      if (this.properties.postId) {
        this.loadComments();
      }
    },

    ready() {
      // 打印调试日志，用于检查组件状态
      console.debug('评论组件就绪，初始输入内容:', this.data.commentText);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 加载评论
    loadComments() {
      const postId = Number(this.properties.postId);
      const { page, pageSize } = this.data;
      
      if (!postId) {
        return Promise.reject(new Error('未提供帖子ID'));
      }
      
      this.setData({ loading: true, error: false, errorMsg: '' });
      
      return this._getCommentList(postId, { page, limit: pageSize })
        .then(result => {
          if (result) {
            const { list: comments, total, has_more } = result;
            
            // 直接使用原始评论数据，由comment-item组件处理格式化
            const commentList = comments && comments.length ? comments : [];
            
            // 更新评论列表和分页信息
            this.setData({
              comments: this.data.page === 1 ? commentList : [...this.data.comments, ...commentList],
              hasMore: has_more,
              total: total || 0
            });
          } else {
            throw new Error('获取评论失败');
          }
        })
        .catch(error => {
          this.setData({ error: true, errorMsg: error.message || '加载评论失败' });
          return Promise.reject(error);
        })
        .finally(() => {
          this.setData({ loading: false });
        });
    },
    
    // 重置分页
    resetPagination() {
      this.setData({
        page: 1,
        hasMore: true,
        total: 0
      });
    },
    
    // 刷新评论列表
    refresh() {
      this.resetPagination();
      this.setData({ comments: [] }, () => {
        this.loadComments();
      });
    },
    
    // 重试加载评论
    retry() {
      this.loadComments();
      this.triggerEvent('retry');
    },

    // 加载更多评论
    loadMore() {
      if (this.data.loading || !this.data.hasMore) return;
      
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadComments();
      });
      
      this.triggerEvent('loadmore');
    },
    
    // 定位到指定评论
    locateComment(commentId) {
      if (!commentId) return;
      
      // 在当前评论列表中查找指定评论
      const targetIndex = this.data.comments.findIndex(comment => comment.id == commentId);
      
      if (targetIndex >= 0) {
        // 如果找到评论，滚动到该评论位置
        this.highlightAndScrollToComment(targetIndex);
      } else {
        // 如果没找到，可能在后续页，先重置列表然后加载所有评论直到找到指定评论
        this.loadCommentUntilFound(commentId);
      }
    },
    
    // 高亮并滚动到指定评论
    highlightAndScrollToComment(index) {
      // 临时添加高亮类
      const comments = [...this.data.comments];
      comments[index] = { ...comments[index], highlighted: true };
      
      this.setData({ comments }, () => {
        // 使用选择器查询评论元素位置
        const query = this.createSelectorQuery();
        query.select(`.comment-item-${comments[index].id}`).boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec(res => {
          if (res && res[0]) {
            const commentElem = res[0];
            const scrollTop = res[1].scrollTop;
            
            // 计算目标滚动位置，留一些顶部空间
            const targetScrollTop = commentElem.top + scrollTop - 100;
            
            // 滚动到指定位置
            wx.pageScrollTo({
              scrollTop: targetScrollTop,
              duration: 300
            });
            
            // 添加高亮效果
            wx.createSelectorQuery()
              .select(`.comment-item-${comments[index].id}`)
              .fields({ node: true, size: true }, function (res) {
                if (res && res.node) {
                  res.node.addClass('highlighted');
                  // 3秒后移除高亮
                  setTimeout(() => {
                    res.node.removeClass('highlighted');
                  }, 3000);
                }
              })
              .exec();
          }
        });
      });
    },
    
    // 逐页加载直到找到指定评论
    loadCommentUntilFound(commentId) {
      // 重置分页并重新加载
      this.resetPagination();
      
      // 递归函数，不断加载更多直到找到评论
      const loadAndFind = () => {
        this.loadComments().then(() => {
          // 检查是否找到评论
          const index = this.data.comments.findIndex(c => c.id == commentId);
          
          if (index >= 0) {
            // 找到了，高亮并滚动到指定位置
            this.highlightAndScrollToComment(index);
          } else if (this.data.hasMore) {
            // 还有更多评论，继续加载
            this.setData({ page: this.data.page + 1 }, () => {
              loadAndFind();
            });
          } else {
            // 加载完所有评论仍未找到
            this.showToast('未找到指定评论', 'error');
          }
        }).catch(() => {
          this.showToast('加载评论失败', 'error');
        });
      };
      
      loadAndFind();
    },
    
    // 处理回复评论
    handleReply(e) {
      if (this.data.isSubmitting) return;
      
      const { commentId, nickname } = e.detail;
      
      this.setData({
        replyTo: {
          commentId,
          nickname,
        },
        commentFocus: true
      });
    },
    
    // 处理点赞评论
    handleLike(e) {
      const { id } = e.detail;
      
      // 检查登录状态
      if (!this._checkLogin()) return;
      
      // 更新评论点赞状态
      this._toggleCommentLike(id)
        .then(res => {
          console.debug('点赞结果:', res);
          
          // 重新加载评论列表以获取更新后的点赞状态
          this.refresh();
        })
        .catch(err => {
          console.error('点赞失败:', err);
          this.showToast('点赞失败，请稍后重试', 'error');
        });
    },
    
    // 处理删除评论
    handleDelete(e) {
      const { id } = e.detail;
      
      // 找到要删除的评论所在位置
      const index = this.data.comments.findIndex(comment => comment.id == id);
      if (index === -1) return;
      
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条评论吗？',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            // 先移除本地数据再发起请求
            const newComments = [...this.data.comments];
            newComments.splice(index, 1);
            
            this.setData({ 
              comments: newComments,
              total: Math.max(0, this.data.total - 1)
            });
            
            // 发起删除请求
            this._deleteComment(id)
              .then(() => {
                this.showToast('删除成功', 'success');
                
                // 通知父组件更新评论计数
                this.triggerEvent('commentDeleted', {
                  postId: this.properties.postId,
                  commentId: id
                });
              })
              .catch(err => {
                console.error('删除评论失败:', err);
                this.showToast('删除失败，请稍后重试', 'error');
                
                // 恢复删除的评论
                this.refresh();
              });
          }
        }
      });
    },
    
    // 查看更多回复
    viewMoreReplies(e) {
      const { commentId } = e.currentTarget.dataset;
      this.triggerEvent('viewreplies', { commentId });
    },
    
    // 处理用户点击
    goToUserProfile(e) {
      const { userId } = e.detail;
      if (!userId) return;
      
      wx.navigateTo({
        url: `/pages/profile/profile?id=${userId}`,
        fail: () => {
          this.setStorage('temp_profile_id', userId);
          wx.switchTab({
            url: `/pages/profile/profile`
          });
        }
      });
    },
    
    // 预览评论图片
    previewCommentImage(e) {
      const { urls, current } = e.currentTarget.dataset;
      wx.previewImage({
        urls,
        current
      });
    },
    
    // 处理图片加载错误
    handleImageError(e) {
      const { urls, current } = e.currentTarget.dataset;
      console.debug('评论图片加载出错:', e);
      
      // 可以在这里设置默认图片或者其他处理逻辑
      // 例如替换为默认图片
      if (e.type === 'error') {
        // 可以在这里更新数据中的图片URL为默认图片
        // 但是要注意不要频繁更新，避免死循环
      }
    },
    
    // 阻止冒泡
    stopPropagation() {
      // 阻止事件冒泡
    },
    
    // 评论输入事件
    onCommentInput(e) {
      this.setData({
        commentText: e.detail.value
      });
    },
    
    // 评论获取焦点
    onCommentFocus() {
      // 检查用户登录
      this._checkLogin();
    },
    
    // 清除评论内容
    clearComment() {
      this.setData({
        commentText: '',
        replyTo: null
      });
    },
    
    // 取消回复
    cancelReply() {
      this.setData({
        commentText: '',
        replyTo: null,
        commentFocus: false
      });
    },
    
    // 提交评论
    submitComment() {
      const { commentText, replyTo } = this.data;
      const postId = Number(this.properties.postId);
      
      // 验证评论内容
      if (!commentText.trim()) {
        this.showToast('评论内容不能为空', 'error');
        return;
      }
      
      // 检查用户登录状态
      if (!this._checkLogin()) return;
      
      // 检查是否已提供帖子ID
      if (!postId) {
        this.showToast('缺少帖子ID', 'error');
        return;
      }
      
      // 设置提交中状态
      this.setData({ isSubmitting: true });
      
      // 处理回复情况，提取实际内容
      let content = commentText;
      let parentId = null;
      
      if (replyTo) {
        // 移除回复前缀
        const replyPrefix = `回复 @${replyTo.nickname}: `;
        content = content.replace(replyPrefix, '');
        parentId = replyTo.commentId;
      }
      
      // 提交评论
      this._createComment(postId, content, parentId)
        .then(result => {
          if (!result) throw new Error('评论失败');
          
          // 成功提示
          this.showToast('评论成功', 'success');
          
          // 清空输入框
          this.setData({
            commentText: '',
            replyTo: null,
            commentFocus: false
          });
          
          // 刷新评论列表
          this.refresh();
          
          // 通知父组件更新评论计数
          this.triggerEvent('commentAdded', {
            postId,
            comment: result
          });
        })
        .catch(error => {
          this.showToast('评论失败: ' + (error.message || '未知错误'), 'error');
        })
        .finally(() => {
          this.setData({ isSubmitting: false });
        });
    }
  }
})