const behaviors = require('../../behaviors/index');
const { formatRelativeTime, parseJsonField, storage } = require('../../utils/index');

Component({
  behaviors: [behaviors.baseBehavior, behaviors.postBehavior, behaviors.userBehavior, behaviors.authBehavior],

  options: {
    pureDataPattern: /^_/,
    multipleSlots: true,
    addGlobalClass: true,
    styleIsolation: 'apply-shared'
  },

  properties: {
    post: {
      type: Object,
      value: {}
    },
    showAction: { type: Boolean, value: true },
    showComment: { type: Boolean, value: true },
    showFollow: { type: Boolean, value: true },
    showUserInfo: { type: Boolean, value: true },
    showImage: { type: Boolean, value: true },
    showContent: { type: Boolean, value: true },
    isCard: { type: Boolean, value: false },
    index: { type: Number, value: -1 },
    customStyle: { type: String, value: '' },
    detailPage: { type: Boolean, value: false },
    isProcessing: { type: Boolean, value: false },
    contentExpanded: { type: Boolean, value: false },
    contentOverflow: { type: Boolean, value: false },
    formattedTime: { type: String, value: '' },
    isMarkdown: { type: Boolean, value: true },
    previewHeight: { type: Number, value: 120 },
    currentUserOpenid: { type: String, value: '' },
    role: { type: String, value: '' },
    isLoggedIn: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 已经不需要defaultAvatar，我们使用name=profile的icon替代
  },

  observers: {
    'post': function(post) {
      console.debug('[post-item] received post data:', post);
      if (!post || !post.id) return;
      
      // 格式化时间
      this.setData({
        formattedTime: post.create_time ? formatRelativeTime(post.create_time) : ''
      });

      // 处理头像
      if (post.user && post.user.avatar && !post.avatar) {
        post.avatar = post.user.avatar;
      }

      // 解析JSON字段
      this._parseJsonFields(post);
      
      if(!this.properties.detailPage){
        // 检查内容是否需要展开按钮
        this.checkContentOverflow();
      }
    },
    
    'detailPage': function(detailPage) {
      if (detailPage) {
        this.setData({ contentExpanded: true });
      }
    }
  },

  lifetimes: {
    async ready() {
      let openid = '';
      let role = '';
      const isLoggedIn = this.properties.isLoggedIn;
      if (isLoggedIn) {
        const { storage } = require('../../utils/index');
        openid = storage.get('openid');
        const userInfo = storage.get('userInfo') || {};
        role = userInfo.role || '';
        this.setData({ currentUserOpenid: openid, role });
      } else {
        this.setData({ currentUserOpenid: '', role: '' });
      }
      console.debug('[post-item] ready, role:', role, 'openid:', openid);
      // 只在详情页面时刷新状态
      if (this.properties.detailPage) {
        // 添加防御性检查，避免post为null时产生错误
        if (!this.properties.post || !this.properties.post.id) {
          console.debug('帖子数据尚未加载，等待父组件提供数据');
          return;
        }
        await this.getPostDetail(this.properties.post.id);
        await this.updatePostStatus();
      }
      else{
        // 检查内容是否溢出
        this.checkContentOverflow();
      }
    }
  },

  methods: {
    // 从服务器更新帖子状态
    async updatePostStatus() {
      if (!this.properties.post?.id) return;
      
      try {
        const postId = this.properties.post.id;
        const openid = storage.get('openid');
        
        if (openid) {
          const res = await this._getPostStatus(postId);
          
          if (res?.code === 200 && res.data) {
            // 返回的数据结构是：{ "postId1": {状态1}, "postId2": {状态2}, ... }
            const postStatus = res.data[postId];
            
            if (!postStatus) {
              console.debug('找不到该帖子的状态:', postId);
              return;
            }
            
            // 更新状态数据，按照API文档中的规范解构
            const { 
              is_liked, 
              is_favorited, 
              is_following, 
              is_commented,
              like_count, 
              favorite_count, 
              comment_count,
              view_count
            } = postStatus;

            const updatedPost = {...this.data.post};
            updatedPost.is_liked = !!is_liked;
            updatedPost.is_favorited = !!is_favorited;
            updatedPost.is_following = !!is_following;
            updatedPost.like_count = like_count || 0;
            updatedPost.favorite_count = favorite_count || 0;
            updatedPost.comment_count = comment_count || 0;
            updatedPost.is_commented = !!is_commented;
            if (view_count !== undefined) {
              updatedPost.view_count = view_count || 0;
            }
            
            // 更新整个post对象，不显示加载状态
            this.setData({ 
              post: updatedPost,
              isProcessing: false
            }, () => {
              console.debug('更新帖子状态成功 [ID:' + postId + ']');
            });
          }
        }
      } catch (err) {
        console.debug('获取帖子状态失败:', err);
        // 确保错误时也取消加载状态
        this.setData({ isProcessing: false });
      }
    },

    async getPostDetail(postId) {
      try {
        const res = await this._getPostDetail(postId);
        if (res.code === 200 && res.data) {
          this.setData({
            post: res.data,
            isProcessing: false
          });
        } else {
          throw new Error('获取帖子详情失败');
        }
      } catch (err) {
        console.debug('[加载帖子详情失败]', err);
        // 确保错误时也取消加载状态
        this.setData({ isProcessing: false });
        throw err;
      }
    },
   
    // 检查内容是否超出
    checkContentOverflow() {
      // 详情页始终展开
      if (this.properties.detailPage) {
        this.setData({ contentExpanded: true, contentOverflow: false });
        return;
      }
      
      const content = this.properties.post?.content;
      if (!content) {
        this.setData({ 
          contentOverflow: false,
          previewHeight: 60
        });
        return;
      }
      
      const contentLength = content.trim().length;
      
      // 设置基础高度并判断是否需要展开按钮
      // 短内容直接适应高度，不需要展开按钮
      // 长内容设置一个合理的初始高度，需要展开按钮
      if (contentLength <= 50) {
        // 短内容，设置较小的初始高度，让autoHeight生效，不显示展开按钮
        this.setData({
          previewHeight: 120,
          contentOverflow: false
        });
      } else if (contentLength <= 150) {
        // 中等内容，设置较小的初始高度并显示展开按钮
        this.setData({
          previewHeight: 160,
          contentOverflow: true
        });
      } else {
        // 长内容，设置较大的初始高度并显示展开按钮
        const highPreviewHeight = contentLength > 300 ? 250 : 200;
        this.setData({
          previewHeight: highPreviewHeight,
          contentOverflow: true
        });
      }
    },
    
    // 展开/收起内容
    onExpandTap() {
      this.setData({ contentExpanded: !this.properties.contentExpanded });
    },
    
    // 点击头像或作者
    onAvatarTap() {
      const post = this.properties.post;
      if (!post) return;
      // 首先尝试直接从post对象获取openid
      const openid = post?.openid || (post?.user?.openid);
      const currentOpenid = storage.get('openid');
      console.debug('点击头像或作者', openid, currentOpenid);
      if (openid !== currentOpenid) {
        wx.navigateTo({
          url: `/pages/user/user?openid=${openid}`,
        });
      }else{
        wx.navigateTo({
          url: `/pages/profile/profile`,
        });
      }
    },
    
    // 点击作者名称
    onAuthorTap() {
      // 复用头像点击方法
      this.onAvatarTap();
    },
    
    // 点击帖子
    onPostTap() {
      const postId = this.properties.post?.id;
      console.debug('[post-item] onPostTap - postId:', postId);
      if (postId) {
        wx.navigateTo({ url: `/pages/post/detail/detail?id=${postId}` });
      }
    },
    
    // 点击图片
    onImageTap(e) {
      const { index } = e.currentTarget.dataset;
      const urls = this.properties.post?.images || [];
      wx.previewImage({ current: urls[index], urls });
    },
    
    // 点击标签
    onTagTap(e) {
      const tag = e.currentTarget.dataset.tag;
      wx.navigateTo({ url: `/pages/search/search?keyword=${encodeURIComponent(tag)}` });
    },
    
    // 点赞
    async onLikeTap() {
      if (this.data.isProcessing) return;
      if (!this.data.isLoggedIn) {
        this._checkLogin(true);
        return;
      }

      this.setData({ isProcessing: true });

      const originalPost = this.properties.post;
      const originalIsLiked = originalPost.is_liked;
      const originalLikeCount = originalPost.like_count || 0;

      try {
        const res = await this._likePost(this.properties.post.id);
        if (res && res.data) {
          const { is_active } = res.data;
          let newLikeCount = originalLikeCount;

          if (is_active && !originalIsLiked) {
            newLikeCount++;
          } else if (!is_active && originalIsLiked) {
            newLikeCount--;
          }
          
          if (newLikeCount < 0) {
            newLikeCount = 0;
          }

          this.setData({
            'post.is_liked': is_active,
            'post.like_count': newLikeCount
          });
        }
      } catch (err) {
        console.debug('点赞失败', err);
        // 如果API调用失败，可以回滚UI，但暂时保持简单
      } finally {
        this.setData({ isProcessing: false });
      }
    },
    
    // 收藏
    async onFavoriteTap() {
      if (this.data.isProcessing) return;
      if (!this.data.isLoggedIn) {
        this._checkLogin(true);
        return;
      }

      this.setData({ isProcessing: true });
      
      const originalPost = this.properties.post;
      const originalIsFavorited = originalPost.is_favorited;
      const originalFavoriteCount = originalPost.favorite_count || 0;

      try {
        const res = await this._favoritePost(this.properties.post.id);

        if (res && res.data) {
          const { is_active } = res.data;
          let newFavoriteCount = originalFavoriteCount;

          if (is_active && !originalIsFavorited) {
            newFavoriteCount++;
          } else if (!is_active && originalIsFavorited) {
            newFavoriteCount--;
          }
          
          if (newFavoriteCount < 0) {
            newFavoriteCount = 0;
          }

          this.setData({
            'post.is_favorited': is_active,
            'post.favorite_count': newFavoriteCount
          });
        }
      } catch (err) {
        console.debug('收藏失败', err);
      } finally {
        this.setData({ isProcessing: false });
      }
    },
    
    // 评论
    onCommentTap() {
      const postId = this.properties.post?.id;
      if (!postId) return;
      
      // 如果是在详情页，直接滚动到评论区域
      if (this.properties.detailPage) {
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
      } else {
        // 如果不是在详情页，跳转到详情页并传递focus=comment参数
        wx.navigateTo({ url: `/pages/post/detail/detail?id=${postId}&focus=comment` });
      }
    },
    
    // 关注
    async onFollowTap() {
      if (this.properties.isProcessing) return;
      
      const post = this.properties.post;
      if (!post?.openid) return;
      
      const openid = storage.get('openid');
      if (!openid) {
        this.showToast('请先登录', 'error');
        return;
      }
      
      // 不能关注自己
      if (post.openid === openid) {
        this.showToast('不能关注自己', 'error');
        return;
      }
      
      this.setData({ isProcessing: true });
      
      try {
        // 简化调用，userBehavior中的_toggleFollow会自动获取当前用户的openid
        const res = await this._toggleFollow({
          followed_id: post.openid
        });
        
        // 根据返回结果更新关注状态
        if (res && res.code === 200 && res.data) {
          // 直接使用API返回的is_following字段更新状态
          const { is_following } = res.data;
          // 更新UI状态
          this.setData({
            'post.is_following': !!is_following
          });
        }
      } catch (err) {
        console.error('关注失败:', err);
      } finally {
        this.setData({ isProcessing: false });
      }
    },
    
    // 查看更多评论
    onViewMoreComments() {
      const postId = this.properties.post?.id;
      if (postId) {
        wx.navigateTo({ url: `/pages/post/detail/detail?id=${postId}&tab=comment` });
      }
    },
    
    // 解析JSON字段
    _parseJsonFields(post) {
      if (!post) return;
      
      // 解析图片和标签
      ['image', 'tag'].forEach(field => {
        if (post[field] && typeof post[field] === 'string') {
          const parsed = parseJsonField(post[field], []);
          if (parsed.length > 0) {
            // image -> images, tag -> tags
            this.setData({ [`post.${field}s`]: parsed });
          }
        }
      });
    },
    
    // 空方法，用于阻止事件冒泡而不执行任何操作
    catchBubble() {
      // 不执行任何操作，仅用于阻止事件冒泡
    },
    
    // 删除帖子
    async onDeleteTap() {
      if (this.properties.isProcessing) return;
      
      const postId = this.properties.post?.id;
      if (!postId) return;
      
      const openid = storage.get('openid');
      if (!openid) {
        this.showToast('请先登录', 'error');
        return;
      }
      
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条帖子吗？',
        success: async (res) => {
          if (!res.confirm) return;
          
          try {
            this.setData({ isProcessing: true });
            const deleteRes = await this._deletePost(postId);
            
            if (deleteRes && deleteRes.code === 200) {
              wx.showToast('删除成功', 'success');
              
              // 触发删除成功事件，让父组件处理删除后的UI更新
              this.triggerEvent('delete', { postId });
              
              // 如果在详情页，返回上一页
              if (this.properties.detailPage) {
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              }
            }
          } catch (err) {
            console.debug('删除帖子失败:', err);
            wx.showToast('删除失败', 'error');
          } finally {
            this.setData({ isProcessing: false });
          }
        }
      });
    },
  }
}); 