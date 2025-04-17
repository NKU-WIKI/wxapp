Component({
  properties: {
    appName: {
      type: String,
      value: 'nkuwiki'
    },
    version: {
      type: String,
      value: ''
    },
    subtitle: {
      type: String,
      value: '校园知识共享平台'
    },
    logoSize: {
      type: Number,
      value: 220
    }
  },

  data: {
    isAnimating: false,
    hasVersion: false
  },

  lifetimes: {
    attached() {
      // 检查version是否有效
      this.setData({
        hasVersion: !!this.properties.version
      });
    }
  },

  methods: {
    onTap() {
      if (this.data.isAnimating) return;
      
      this.setData({ isAnimating: true });
      
      // 添加动画结束监听
      setTimeout(() => {
        this.setData({ isAnimating: false });
      }, 1000);

      this.triggerEvent('tap');
    }
  }
});