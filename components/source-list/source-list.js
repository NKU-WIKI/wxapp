Component({
  options: {
    addGlobalClass: true
  },

  properties: {
    // 数据源列表
    sources: {
      type: Array,
      value: [],
      observer: function(newVal) {
        if (newVal && newVal.length > 0) {
          this.processSourceItems(newVal);
        } else {
          this.setData({
            processedSources: []
          });
        }
      }
    },
    // 是否展示排名
    showRank: {
      type: Boolean,
      value: true
    },
    // 是否展示阅读数和点赞
    showStats: {
      type: Boolean,
      value: true
    },
    // 是否展示官方标签
    showOfficial: {
      type: Boolean,
      value: true
    },
    // 是否展示来源和时间
    showSource: {
      type: Boolean,
      value: true
    },
    // 点击项目的加载状态
    loadingItemId: {
      type: String,
      value: ''
    },
    loading: {
      type: Boolean,
      value: false
    },
    emptyTip: {
      type: String,
      value: '暂无数据'
    },
    // 是否将导航逻辑委托给父组件
    delegateNavigation: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 处理后的数据源列表
    processedSources: []
  },

  lifetimes: {
    attached: function() {
      // 组件初始化时，处理一次数据
      if (Array.isArray(this.properties.sources)) {
        this.processSourceItems(this.properties.sources);
      }
    }
  },

  methods: {
    // 处理数据源列表中的每一项，添加缺失值，转换格式
    processSourceItems: function(sources) {
      if (!sources || !Array.isArray(sources)) {
        return;
      }
      
      const processedItems = sources.map((item, index) => {
        // 处理平台信息
        const platformInfo = this.getPlatformInfo(item);
        
        // 处理时间显示
        const displayTime = this.formatTime(item.publish_time || item.create_time);
        
        // 处理相关度
        const relevanceDisplay = this.formatRelevance(item.relevance);
        
        // 统计信息处理 - 使用统一的字段命名格式
        const stats = {
          view_count: this.formatNumber(item.view_count || item.views || item.read_count),
          like_count: this.formatNumber(item.like_count || item.likes),
          comment_count: this.formatNumber(item.comment_count),
          collect_count: this.formatNumber(item.collect_count || item.favorite_count),
          share_count: this.formatNumber(item.share_count),
          follower_count: this.formatNumber(item.follower_count),
          following_count: this.formatNumber(item.following_count),
        };
        
        // 处理摘要，避免与标题重复
        let summary = '';
        if (item.summary) {
          if (item.summary === item.title) {
            summary = '';  // 如果摘要与标题相同，清空摘要
          } else if (item.summary.startsWith(item.title)) {
            // 如果摘要以标题开头，只显示标题后的部分
            summary = item.summary.substring(item.title.length).trim();
          } else {
            summary = item.summary;
          }
        } else if (item.content) {
          if (item.content === item.title) {
            summary = '';  // 如果内容与标题相同，清空摘要
          } else if (item.content.startsWith(item.title)) {
            // 如果内容以标题开头，只显示标题后的部分
            summary = this.truncateText(item.content.substring(item.title.length).trim(), 100);
          } else {
            summary = this.truncateText(item.content, 100);
          }
        }
        
        return {
          ...item,
          title: item.title || '无标题',
          summary: summary,
          author: item.author || '',
          displayTime: displayTime,
          relevanceDisplay: relevanceDisplay,
          platformIcon: platformInfo.icon,
          platformName: platformInfo.name,
          is_official: !!item.is_official,
          // 保持向后兼容的同时添加新字段
          views: stats.view_count,
          likes: stats.like_count,
          // 添加统一格式的字段
          stats: stats
        };
      });
      
      this.setData({
        processedSources: processedItems
      });
    },
    
    // 截断文本
    truncateText(text, maxLength) {
      if (!text || typeof text !== 'string') {
        return '';
      }
      
      if (text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    },
    
    // 格式化数字（大于1000显示为1k+）
    formatNumber(num) {
      if (num === undefined || num === null) {
        return '';
      }
      
      const numValue = parseInt(num);
      if (isNaN(numValue)) {
        return '';
      }
      
      if (numValue >= 10000) {
        return (numValue / 10000).toFixed(1) + 'w';
      } else if (numValue >= 1000) {
        return (numValue / 1000).toFixed(1) + 'k';
      }
      
      return numValue.toString();
    },
    
    // 获取平台图标和名称
    getPlatformInfo(item) {
      let icon = 'website';
      let name = '网页';
      
      if (!item || !item.platform) {
        return { icon, name };
      }
      
      const platform = item.platform.toLowerCase();
      
      if (platform.includes('wechat') || platform.includes('weixin') || platform === 'wechat' || platform === 'weixin') {
        icon = 'wechat';
        name = '公众号';
      } else if (platform.includes('wxapp') || platform.includes('miniprogram') || platform === 'wxapp' || platform === 'miniprogram') {
        icon = 'logo';
        name = 'nkuwiki';
      } else if (platform.includes('web') || platform.includes('website') || platform === 'web' || platform === 'website') {
        icon = 'website';
        name = '网站';
      } else if (platform.includes('douyin') || platform === 'douyin') {
        icon = 'douyin';
        name = '抖音';
      } else if (platform.includes('blog') || platform === 'blog') {
        icon = 'blog';
        name = '博客';
      } else if (platform.includes('forum') || platform === 'forum') {
        icon = 'forum';
        name = '论坛';
      } else if (item.source_name) {
        name = item.source_name;
      }
      
      return { icon, name };
    },
    
    // 点击整个项目
    onItemTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.processedSources[index];
      
      // 执行跳转处理
      this.handleItemNavigation(item);
      
      this.triggerEvent('itemtap', {
        item: item,
        index: index
      });
    },
    
    // 点击标题
    onTitleTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.processedSources[index];
      
      // 执行跳转处理
      this.handleItemNavigation(item);
      
      this.triggerEvent('titletap', {
        item: item,
        index: index
      });
      
      return false; // 阻止冒泡
    },
    
    // 点击来源图标
    onSourceIconTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.processedSources[index];
      
      this.triggerEvent('sourcetap', {
        item: item,
        index: index
      });
      
      return false; // 阻止冒泡
    },
    
    // 处理项目跳转逻辑
    handleItemNavigation(item) {
      if (!item) return;
      
      // 判断是否为帖子类型
      const isPost = 
        // 判断是否有category_id字段，这是帖子的特有字段
        (item.category_id !== undefined) || 
        // 或者平台为wxapp且有id字段
        (item.platform === 'wxapp' && item.id) ||
        // 检查类型字段
        (item.type === 'post');
      
      console.debug('判断项目类型', item, isPost ? '帖子' : '外部链接');
      
      if (isPost) {
        // 帖子类型跳转到详情页
        wx.navigateTo({
          url: `/pages/post/detail/detail?id=${item.id}`
        });
      } else if (item.original_url) {
        // 检查是否是nkuwiki.com域名
        const isNkuwikiDomain = item.original_url.includes('nkuwiki.com');
        
        if (isNkuwikiDomain) {
          // nkuwiki.com域名下的网站用webview打开
          wx.navigateTo({
            url: `/pages/webview/webview?url=${encodeURIComponent(item.original_url)}&title=${encodeURIComponent(item.title || '')}`
          });
        } else {
          // 其他网站跳转到knowledge/detail页面
          if (item.id) {
            // 先获取父组件的数据
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            
            // 准备要传递的数据
            let dataToPass = null;
            // 如果当前页面是搜索页面，使用原始的搜索结果
            if (currentPage && currentPage.route && currentPage.route.includes('search')) {
              if (currentPage.data.showRagResults && currentPage.data.ragSources) {
                // 如果是RAG搜索结果，直接传递当前项目
                dataToPass = item;
              } else {
                // 否则使用普通搜索结果
                dataToPass = { data: currentPage.data.searchResults };
              }
            } else {
              dataToPass = item;
            }
            
            // 将数据编码为URL参数
            const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
            
            wx.navigateTo({
              url: `/pages/knowledge/detail/detail?id=${item.id}&data=${encodedData}`
            });
          } else {
            console.debug('无法跳转到知识详情页，ID缺失:', item);
            wx.showToast({
              title: '无法打开此内容',
              icon: 'none'
            });
          }
        }
      } else {
        // 无法确定跳转方式的情况，记录日志
        console.debug('无法确定项目跳转方式:', item);
        wx.showToast({
          title: '无法打开此内容',
          icon: 'none'
        });
      }
    },
    
    // 格式化相关度
    formatRelevance(relevance) {
      if (relevance === undefined || relevance === null) {
        return '';
      }
      
      // 如果是字符串，尝试提取数字部分
      if (typeof relevance === 'string') {
        // 如果包含 % 符号，截取前面的数字
        if (relevance.includes('%')) {
          const numStr = relevance.replace('%', '').trim();
          return numStr + '%';
        }
        
        // 尝试将字符串解析为数字
        const numValue = parseFloat(relevance);
        if (!isNaN(numValue)) {
          // 如果数字大于1，假设它是百分比值
          if (numValue > 1) {
            return Math.round(numValue) + '%';
          } else {
            // 否则假设它是0-1之间的小数
            return Math.round(numValue * 100) + '%';
          }
        }
        
        return relevance; // 返回原始字符串
      }
      
      // 如果是数字类型
      if (typeof relevance === 'number') {
        // 如果大于1，假设它已经是百分比
        if (relevance > 1) {
          return Math.round(relevance) + '%';
        } else {
          // 否则假设它是0-1之间的小数
          return Math.round(relevance * 100) + '%';
        }
      }
      
      return ''; // 对于其他情况返回空字符串
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) {
        return '';
      }
      
      try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
          return '';
        }
        
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 30) {
          // 超过30天显示日期
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        } else if (days > 0) {
          return `${days}天前`;
        } else if (hours > 0) {
          return `${hours}小时前`;
        } else if (minutes > 0) {
          return `${minutes}分钟前`;
        } else {
          return '刚刚';
        }
      } catch (e) {
        console.error('时间格式化错误:', e, timeStr);
        return '';
      }
    },
    
    // 格式化相对时间
    formatRelativeTime(dateStr) {
      return this.formatTime(dateStr);
    }
  }
}) 