const { storage } = require('../../utils/index');

Component({
  
  properties: {
    customClass: {
      type: String,
      value: ''
    }
  },

  data: {
    features: [
      { icon: 'book', text: '发帖' },
      { icon: 'comment', text: '评论' },
      { icon: 'star', text: '收藏' },
      { icon: 'share', text: '分享' }
    ],
    isAgreed: false
  },

  methods: {
    onLoginTap() {
      this.triggerEvent('login')
    },
    onCheckboxChange(e) {
      const isAgreed = e.detail.value.length > 0;
      this.setData({ isAgreed });
      storage.set('isAgreed', isAgreed);
    },
    refreshAgreementState() {
      this.setData({
        isAgreed: !!storage.get('isAgreed')
      });
    },
    onAgreementTap(e) {
      const type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '/pages/login/privacy/privacy?type=' + type
      });
    }
  }
}) 