/**
 * UI操作工具
 */

const ToastType = {
  SUCCESS: 'success',
  LOADING: 'loading',
  ERROR: 'error',
  NONE: 'none'
};

// 直接导出ui函数
const showToast = (title, type = ToastType.NONE, duration = 1500, mask = false) => {
  // 支持对象形式的参数
  if (typeof type === 'object') {
    const options = type;
    type = options.type || ToastType.NONE;
    duration = options.duration || 1500;
    mask = options.mask || false;
  }
  
  // 对于错误类型的长提示，使用模态框而不是Toast
  if (title && (type === ToastType.ERROR || type === 'error')) {
    wx.showModal({
      title: '提示',
      content: title,
      showCancel: false,
      confirmText: '知道了'
    });
    return;
  }
  
  if (type === ToastType.LOADING || type === 'loading') {
    wx.showLoading({ title, mask });
  } else {
    wx.showToast({
      title,
      icon: type,
      duration,
      mask
    });
  }
};

const hideToast = () => {
  wx.hideLoading();
  wx.hideToast();
};

/**
 * 显示模态对话框
 * @param {Object} options 配置对象
 * @param {String} options.title 标题
 * @param {String} options.content 内容
 * @param {String} [options.confirmText='确定'] 确认按钮文字
 * @param {String} [options.cancelText='取消'] 取消按钮文字
 * @param {Boolean} [options.showCancel=true] 是否显示取消按钮
 * @returns {Promise<Boolean>} 用户点击确认返回 true，取消返回 false
 */
const showModal = ({ title = '提示', content = '', confirmText = '确定', cancelText = '取消', showCancel = true } = {}) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      showCancel,
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: (err) => {
        console.error('wx.showModal 调用失败:', err);
        reject(err);
      }
    });
  });
};

const showActionSheet = items => {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: items,
      success: res => resolve(res.tapIndex),
      fail: err => reject(err)
    });
  });
};

const copyText = (text, tip = '复制成功') => {
  wx.setClipboardData({
    data: text,
    success: () => showToast(tip)
  });
};

module.exports = {
  showToast,
  hideToast,
  showModal,
  showActionSheet,
  copyText,
  ToastType
}; 