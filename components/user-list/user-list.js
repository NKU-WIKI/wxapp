const baseBehavior = require('../../behaviors/baseBehavior');
const userBehavior = require('../../behaviors/userBehavior');

Component({
  behaviors: [baseBehavior, userBehavior],

  properties: {
    // 筛选条件
    filter: {
      type: Object,
      value: {
        type: 'all' // 默认所有用户
      }
    },
    // 用户列表
    user: {
      type: Array,
      value: []
    },
    // 是否自动加载数据
    auto_load: {
      type: Boolean,
      value: true
    }
  },

  data: {
    // 用户列表 (内部使用，与属性同步)
    users: [],
    
    // 基础状态
    loading: false,
    error: false,
    errorText: '加载失败，请稍后再试',
    empty: true,
    emptyText: '暂无数据',
    
    // 分页状态
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
    hasMore: true,
    loadingMore: false,
    
    // 加载状态
    loadingText: '加载中...',
    
    // 按钮相关配置
    noMoreText: '没有更多数据了',
    
    // 添加最后更新时间记录
    _lastUpdateTime: 0,
    
    // 添加淡入淡出效果的样式
    fadeStyle: ''
  },

  lifetimes: {
    attached() {
      // 添加最后更新时间记录
      this.setData({
        _lastUpdateTime: 0
      });
      
      // 如果设置了auto_load=false并且有传入用户数据，则不加载
      if (!this.properties.auto_load && this.properties.user && this.properties.user.length > 0) {
        // 同步外部传入的用户数据到内部
        this.setData({
          users: this.properties.user,
          empty: this.properties.user.length === 0
        });
        return;
      }
      
      // 组件attached后异步加载数据
      setTimeout(() => {
        this.loadInitialData();
      }, 100);
    },
    
    detached() {
      // 组件销毁时的清理工作
    }
  },

  observers: {
    'filter': function(filter) {
      // 当filter变化时，如果auto_load=false则不刷新列表
      if (!filter || !this.properties.auto_load) return;
      
      // 添加淡出效果
      this.setData({
        fadeStyle: 'opacity: 0.5; transition: opacity 0.2s ease;'
      });
      
      // 强制刷新数据，使用平滑加载避免闪烁
      this.loadInitialData(true, true).then(() => {
        // 数据加载完成后淡入
        setTimeout(() => {
          this.setData({
            fadeStyle: 'opacity: 1; transition: opacity 0.3s ease;'
          });
        }, 100);
      });
    },
    'user': function(users) {
      // 当user属性变化时同步到内部users
      if (users) {
        this.setData({
          users: users,
          empty: users.length === 0
        });
      }
    }
  },

  methods: {
    // 重置分页
    resetPagination() {
      this.setData({
        page: 1,
        hasMore: true,
        total: 0,
        total_pages: 0
      });
    },
    
    // 加载初始数据
    async loadInitialData(force = false, smoothLoading = false) {
      // 如果设置了auto_load=false并且不是强制刷新，则跳过加载
      if (!this.properties.auto_load && !force) {
        return Promise.resolve();
      }
      
      if (force) {
        this.setData({
          _lastUpdateTime: 0 // 重置最后更新时间
        });
      }
      
      // 防止短时间内重复调用，但强制刷新时忽略此限制
      const now = Date.now();
      if (!force && this.data._lastUpdateTime && now - this.data._lastUpdateTime < 5000) {
        return Promise.resolve();
      }
      
      try {
        // 只有在非平滑加载时才显示loading状态
        if (!smoothLoading) {
          this.setData({
            loading: true,
            loadingText: '正在加载...'
          });
        }
        
        this.setData({ error: false });
        this.resetPagination();
        
        // 更新最后加载时间
        this.setData({ _lastUpdateTime: now });
        
        // 调用API获取用户列表
        const result = await this._getUserList(this.data.filter || {}, 1, this.data.page_size);
        
        if (result && result.data) {
          const users = result.data || [];
          const pagination = result.pagination || {};
          
          // 更新数据
          this.setData({
            users: users,
            hasMore: pagination.has_more !== undefined ? pagination.has_more : (users.length >= this.data.page_size),
            total: pagination.total || 0,
            total_pages: pagination.total_pages || 0,
            empty: users.length === 0,
            loading: false
          });
          
          // 在平滑加载模式下，数据加载完成后恢复透明度
          if (smoothLoading) {
            setTimeout(() => {
              this.setData({
                fadeStyle: 'opacity: 1; transition: opacity 0.3s ease;'
              });
            }, 100);
          }
        } else {
          throw new Error(result?.message || '获取数据失败');
        }
        
        return Promise.resolve();
      } catch (err) {
        this.setData({
          loading: false,
          error: true,
          errorText: err.message || '加载失败，请稍后再试'
        });
        return Promise.reject(err);
      }
    },
    
    // 更新空状态
    updateEmptyState(users) {
      this.setData({
        empty: !users || users.length === 0
      });
    },
    
    // 加载更多
    async loadMore() {
      if (!this.data.hasMore || this.data.loadingMore) return;
      
      try {
        // 设置加载状态
        this.setData({ loadingMore: true });
        
        // 触发外部loadmore事件，让父组件知道我们正在加载更多
        this.triggerEvent('loadmore');
        
        // 如果是外部传入数据模式，则不需要自己加载，等待父组件更新
        if (!this.properties.auto_load) {
          // 等待父组件处理，5秒后如果还没处理完就自动隐藏loading
          setTimeout(() => {
            if (this.data.loadingMore) {
              this.setData({ loadingMore: false });
            }
          }, 5000);
          return;
        }
        
        // 调用API获取更多用户
        const nextPage = this.data.page + 1;
        const result = await this._getUserList(this.data.filter || {}, nextPage, this.data.page_size);
        
        if (result && result.data) {
          const newUsers = result.data || [];
          const pagination = result.pagination || {};
          
          // 合并数据
          const combinedUsers = [...this.data.users, ...newUsers];
          
          // 更新数据
          this.setData({
            users: combinedUsers,
            page: nextPage,
            hasMore: pagination.has_more !== undefined ? pagination.has_more : (newUsers.length >= this.data.page_size),
            total: pagination.total || 0,
            total_pages: pagination.total_pages || 0
          });
        } else {
          throw new Error(result?.message || '获取更多数据失败');
        }
      } catch (err) {
        wx.showToast({
          title: err.message || '加载更多失败',
          icon: 'none'
        });
      } finally {
        // 确保无论如何都会隐藏加载状态
        this.setData({ loadingMore: false });
      }
    },
    
    // 处理重试
    handleRetry() {
      this.loadInitialData(true);
    },
    
    // 显示加载更多
    showLoadingMore() {
      this.setData({ loadingMore: true });
    },
    
    // 隐藏加载更多
    hideLoadingMore() {
      this.setData({ loadingMore: false });
    },
    
    // 刷新列表
    refresh() {
      return this.loadInitialData(true);
    },
    
    // 处理用户关注
    handleUserFollow(e) {
      const { user_id } = e.detail;
      
      // 更新列表中该用户的关注状态
      const { users } = this.data;
      const updatedUsers = users.map(user => {
        if (user.openid === user_id) {
          return {
            ...user,
            isFollowed: !user.isFollowed,
            follower_count: user.isFollowed ? 
              Math.max(0, (user.follower_count || 0) - 1) : 
              ((user.follower_count || 0) + 1)
          };
        }
        return user;
      });
      
      this.setData({ users: updatedUsers });
      
      // 触发关注事件，让父组件处理
      this.triggerEvent('follow', { user_id, is_followed: !users.find(u => u.openid === user_id)?.isFollowed });
    }
  }
}); 