const behaviors = require('../../behaviors/index');
const { storage } = require('../../utils/util');

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
          // 兼容旧版本，设置资源ID和类型
          this.setData({
            resourceId: newVal,
            resourceType: 'post'
          });
          this.loadComments();
        }
      }
    },
    // 资源ID（新属性）
    resourceId: {
      type: null,
      value: 0,
      observer: function(newVal) {
        if (newVal && this.data.resourceType) {
          this.loadComments();
        }
      }
    },
    // 资源类型（新属性）
    resourceType: {
      type: String,
      value: 'post',
      observer: function(newVal) {
        if (this.data.resourceId && newVal) {
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
      
      // 初始化behavior对象引用
      
      console.debug('评论组件初始化:', {
        openid: openid,
        postId: this.properties.postId,
        resourceId: this.data.resourceId,
        resourceType: this.data.resourceType
      });
      
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
      console.debug('加载评论');
      const resourceId = this.data.resourceId;
      const resourceType = this.data.resourceType;

      if (!resourceId) {
        console.debug('缺少必要的resourceId参数');
        this.setData({ 
          loading: false,
          error: true,
          errorMsg: '参数错误' 
        });
        return;
      }

      console.debug('开始加载评论列表:', {
        resourceId,
        resourceType,
        page: this.data.page
      });

      this._getCommentList(this.data.resourceId, {
        resourceType: this.data.resourceType,
        page: this.data.page,
        page_size: this.data.pageSize
      })
        .then(res => {
          if (res) {
            const { list: comments, total, has_more } = res;
            console.debug('获取到评论:', comments.length);
            
            // 将API返回的扁平评论列表转换为树状结构
            const commentList = buildCommentTree(comments);
            
            // 更新评论列表和分页信息，只使用顶级评论
            this.setData({
              comments: this.data.page === 1 ? commentList : [...this.data.comments, ...commentList],
              hasMore: has_more,
              total: total || 0,
              loading: false,
              error: false
            });

            // 如果是首次加载，为有回复的评论预加载部分回复
            if (this.data.page === 1) {
              this.preloadReplies(commentList);
            }
          } else {
            throw new Error('获取评论失败');
          }
        })
        .catch(error => {
          console.error('加载评论失败:', error);
          this.setData({ 
            loading: false,
            error: true, 
            errorMsg: error.message || '加载评论失败' 
          });
        });
    },
    
    // 预加载评论回复
    preloadReplies(comments) {
      if (!comments || !Array.isArray(comments)) return;

      comments.forEach(comment => {
        // 如果评论没有回复但reply_count > 0，加载前几条回复
        if ((!comment.replies || comment.replies.length === 0) && comment.reply_count > 0) {
          // 获取该评论的所有回复
          this._getCommentList(this.data.resourceId, {
            resourceType: this.data.resourceType,
            parentId: comment.id,
            page: 1,
            page_size: 5
          })
          .then(result => {
            if (result && result.list && result.list.length > 0) {
              // 更新评论的回复列表
              const comments = [...this.data.comments];
              const idx = comments.findIndex(c => c.id === comment.id);
              if (idx !== -1) {
                comments[idx].replies = result.list;
                comments[idx].reply_count = result.total || comments[idx].reply_count;
                this.setData({ comments });
                console.debug(`为评论${comment.id}加载了${result.list.length}条回复`);
              }
            }
          })
          .catch(err => {
            console.debug(`加载评论${comment.id}的回复失败:`, err);
          });
        }
      });
    },

    // 加载评论回复
    loadCommentReplies(commentId, page = 1, pageSize = 5) {
      if (!commentId) return Promise.reject(new Error('缺少评论ID'));

      return this._getCommentList(this.data.resourceId, {
        resourceType: this.data.resourceType,
        parentId: commentId,
        page,
        page_size: pageSize
      })
      .then(result => {
        if (result && result.list) {
          // 更新对应评论的回复列表
          const comments = [...this.data.comments];
          const commentIndex = comments.findIndex(c => c.id == commentId);

          if (commentIndex !== -1) {
            // 如果找到评论，更新其回复
            const comment = comments[commentIndex];
            comment.replies = page === 1 ? result.list : [...(comment.replies || []), ...result.list];
            comment.reply_count = result.total || comment.reply_count || 0;

            this.setData({ comments });
          }

          return result;
        }
        return null;
      })
      .catch(err => {
        console.debug('加载回复失败:', err);
        return null;
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
      return this.loadComments({ refresh: true });
    },
    
    // 重试加载评论
    retry() {
      this.loadComments();
      this.triggerEvent('retry');
    },

    // 加载更多评论
    loadMore() {
      if (this.data.hasMore && !this.data.loading) {
        this.setData({
          page: this.data.page + 1
        });
        this.loadComments();
      }
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
      
      const { commentId, nickname, openid } = e.detail;
      if (!commentId) return;

      const comment = this.data.comments.find(c => c.id === commentId);
      if (!comment) return;
      
      this.setData({
        replyToComment: comment,
        replyToReply: null,
        commentFocus: true
      });

      // 触发事件，以便页面可以滚动到评论框
      this.triggerEvent('focusComment', { commentId });
    },
    
    // 处理删除评论
    handleDelete(e) {
      const { id, success } = e.detail;
      
      // 无论是否已经删除，都更新UI
      // 找到要删除的评论所在位置
      const index = this.data.comments.findIndex(comment => comment.id == id);
      if (index === -1) return;
      
      // 更新本地数据
      const newComments = [...this.data.comments];
      newComments.splice(index, 1);
      
      this.setData({ 
        comments: newComments,
        total: Math.max(0, this.data.total - 1)
      });
      
      // 通知父组件更新评论计数
      this.triggerEvent('commentDeleted', {
        postId: this.properties.postId,
        commentId: id
      });
    },
    
    // 阻止冒泡
    stopPropagation() {
      // 阻止事件冒泡
    },
    
    // 评论输入事件
    onCommentInput(e) {
      const value = e.detail.value;
      console.debug('评论内容变化:', value);
      this.setData({
        commentText: value
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
        replyToComment: null,
        replyToReply: null,
        commentFocus: false
      });
    },
    
    // 提交评论
    async submitComment() {
      const that = this;
      if (this.data.isSubmitting) {
        console.debug('已在提交中，忽略重复点击');
        return;
      }
      
      const content = this.data.commentText ? this.data.commentText.trim() : '';
      if (!content) {
        this.showToast('评论内容不能为空', 'error');
        return;
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        this.showToast('请先登录', 'error');
        return;
      }
      
      const resourceId = this.data.resourceId;
      const resourceType = this.data.resourceType;
      const parentId = this.data.replyToComment?.id || null;
      const replyToInfo = null;

      const savedCommentText = content;
      this.setData({
        commentText: '',
        replyToComment: null,
        showReplyInfo: false
      });

      this.setData({ isSubmitting: true });
      
      console.debug('开始提交评论，参数:', {
        resourceId,
        resourceType,
        content,
        parentId
      });
      
      try {
        // 构建评论参数
        const commentParams = {
          content: savedCommentText,
          resourceId: resourceId,
          resourceType: resourceType
        };

        // 如果有回复ID，添加到参数中
        if (parentId) {
          commentParams.parent_id = parentId;
        }

        const result = await this._createComment(commentParams);
        
        console.debug('评论API响应:', result);
        
        if (result && result.code === 200) {
          this.showToast('评论成功', 'success');
          
          const commentId = result.details?.comment_id || (result.data && result.data.id);
          
          if (!commentId) {
            console.debug('无法获取新评论ID，刷新列表');
            this.refresh();
            return;
          }
          
          try {
            const userInfo = await this._getUserInfo(openid);
            
            if (userInfo && userInfo.code === 200) {
              const { nickname, avatar, bio } = userInfo.data;

              const newComment = {
                id: commentId,
                content: savedCommentText,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                parent_id: parentId,
                resource_id: resourceId,
                resource_type: resourceType,
                user: {
                  id: openid,
                  nickname,
                  avatar,
                  bio
                },
                reply_count: 0,
                replies: []
              };

              if (parentId) {
                const commentIndex = this.data.comments.findIndex(c => c.id === parentId);

                if (commentIndex !== -1) {
                  const comments = [...this.data.comments];
                  const parentComment = {...comments[commentIndex]};

                  if (!parentComment.replies) {
                    parentComment.replies = [];
                  }

                  parentComment.replies.unshift(newComment);

                  parentComment.reply_count = (parentComment.reply_count || 0) + 1;

                  const maxDisplayReplies = 5;
                  if (parentComment.replies.length > maxDisplayReplies) {
                    parentComment.replies = parentComment.replies.slice(0, maxDisplayReplies);
                  }

                  comments[commentIndex] = parentComment;
                  this.setData({ comments });

                  this.triggerEvent('replyAdded', {
                    resourceId,
                    resourceType,
                    commentId: parentId,
                    reply: newComment
                  });
                } else {
                  this.refresh();

                  this.triggerEvent('replyAdded', {
                    resourceId,
                    resourceType,
                    commentId: parentId,
                    reply: newComment
                  });
                }
              } else {
                this.setData({
                  comments: [newComment, ...this.data.comments],
                  total: this.data.total + 1
                });

                this.triggerEvent('commentAdded', {
                  resourceId,
                  resourceType,
                  comment: newComment
                });
              }
            } else {
              console.debug('用户信息获取失败，刷新列表');
              this.refresh();
            }
          } catch (error) {
            console.error('获取用户信息失败:', error);
            this.refresh();
          }
        } else {
          console.error('评论创建失败:', result);
          this.showToast('评论提交失败，请重试', 'error');
          
          this.setData({
            commentText: savedCommentText
          });
        }
      } catch (error) {
        console.error('评论提交失败:', error);
        this.showToast('评论提交失败，请重试', 'error');
        
        this.setData({
          commentText: savedCommentText
        });
      } finally {
        setTimeout(() => {
          this.setData({ isSubmitting: false });
        }, 500);
      }
    },

   
  }
})

// 将API返回的扁平评论列表转换为树状结构
function buildCommentTree(commentList) {
  if (!commentList || !Array.isArray(commentList)) return [];

  console.debug('接收到评论列表:', commentList.length);

  // 创建评论映射
  const commentMap = {};

  // 第一步：将所有评论保存到映射
  commentList.forEach(comment => {
    // 确保评论对象有基本属性
    if (!comment.replies) {
      comment.replies = [];
    }

    // 重新计算回复数量（如果需要）
    comment.reply_count = comment.reply_count || 0;

    // 将评论加入映射表
    commentMap[comment.id] = comment;
  });

  // 第二步：分离顶级评论和回复评论
  const topComments = [];
  const replyComments = [];

  // 先将所有评论分类
  commentList.forEach(comment => {
    if (comment.parent_id === null) {
      // 顶级评论
      topComments.push(comment);
    } else {
      // 回复评论
      replyComments.push(comment);
      comment.is_reply = true;
    }
  });

  console.debug('顶级评论数量:', topComments.length);
  console.debug('回复评论数量:', replyComments.length);

  // 第三步：为避免二次遍历出现的问题，先清空所有已添加的回复
  topComments.forEach(comment => {
    comment.replies = [];
    comment.reply_count = 0;
  });

  // 第四步：组织回复关系
  replyComments.forEach(reply => {
    const parentId = reply.parent_id;
    const parentComment = commentMap[parentId];

    if (parentComment) {
      // 将回复添加到父评论的replies数组
      parentComment.replies.push(reply);

      // 标记为回复
      reply.is_reply = true;

      // 更新父评论的回复计数
      parentComment.reply_count += 1;
    } else {
      // 找不到父评论，可能是被删除了或者数据不完整
      // 将此回复作为顶级评论处理
      console.debug('找不到父评论:', parentId, '将回复作为顶级评论处理');
      reply.parent_id = null;
      reply.is_orphan_reply = true; // 标记为孤立回复
      topComments.push(reply);
    }
  });

  // 第五步：对每个评论的回复列表按时间排序
  Object.values(commentMap).forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) => {
        return new Date(b.create_time) - new Date(a.create_time);
      });
    }
  });

  // 第六步：对顶级评论按时间排序并返回
  topComments.sort((a, b) => {
    return new Date(b.create_time) - new Date(a.create_time);
  });

  // 打印调试信息
  topComments.forEach((comment, index) => {
    console.debug(`顶级评论${index+1}: id=${comment.id}, 回复数=${comment.replies.length}/${comment.reply_count}`);
  });

  return topComments;
}