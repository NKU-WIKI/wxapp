// pages/profile/edit/edit.js
const { ui, ToastType, storage } = require('../../../utils/index');
const behaviors = require('../../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior, 
    behaviors.userBehavior,
  ],

  data: {
    userInfo: null,
    loading: true,
    error: false,
    errorMsg: '',
    toptipsShow: false,
    toptipsMsg: '',
    toptipsType: 'info',
    formSubmitting: false,
    uploadingAvatar: false,
    // 选择器数据
    ranges: {
      countries: ['中国', '美国', '日本', '韩国', '英国', '法国', '德国', '澳大利亚', '加拿大', '其他'],
      languages: ['中文', '英语', '日语', '韩语', '法语', '德语', '西班牙语', '俄语', '其他']
    },
    // 表单字段定义
    groups: [
      {
        name: 'basic',
        title: '基本资料'
      },
      {
        name: 'contact',
        title: '联系方式'
      },
      {
        name: 'location',
        title: '位置信息'
      }
    ],
    formFields: [
      {
        type: 'input',
        name: 'nickname',
        label: '昵称',
        placeholder: '请输入昵称',
        maxlength: 20,
        required: true,
        group: 'basic'
      },
      {
        type: 'textarea',
        name: 'bio',
        label: '个人简介',
        placeholder: '一句话介绍自己',
        maxlength: 200,
        group: 'basic'
      },
      {
        type: 'input',
        name: 'wechatId',
        label: '微信号',
        maxlength: 20,
        placeholder: '选填',
        group: 'contact'
      },
      {
        type: 'input',
        name: 'qqId',
        label: 'QQ号',
        maxlength: 20,
        placeholder: '选填',
        required: true,
        group: 'contact'
      },
      {
        type: 'input',
        name: 'phone',
        label: '手机号',
        maxlength: 20,
        placeholder: '选填',
        group: 'contact'
      },
      {
        type: 'picker',
        name: 'location',
        label: '国家/城市',
        placeholder: '选择国家和城市',
        range: 'countries',
        group: 'location'
      }
    ]
  },

  onUnload() {
    // 清理定时器，避免内存泄漏
    if (this.toptipsTimer) {
      clearTimeout(this.toptipsTimer);
      this.toptipsTimer = null;
    }
  },

  async onShow() {
    console.debug('编辑页面 onShow');
    
    // 显示加载状态
    this.setData({ loading: true });
    
    try {
      console.debug('获取用户资料');
      const userInfo = await this._getUserInfo(true);
      
      if (userInfo) {
        // 保存原始头像URL，方便恢复
        if (userInfo.avatar) {
          userInfo.originalAvatar = userInfo.avatar;
        }
        
        this.setData({ 
          userInfo: userInfo,
          loading: false 
        });
        
        console.debug('用户信息已加载:', userInfo);
        
        // 使用更高效的异步初始化
        wx.nextTick(() => {
          this.initFormPanel();
        });
      } else {
        throw new Error('未获取到用户信息');
      }
    } catch (err) {
      console.error('获取用户资料失败:', err);
      this.setData({ 
        error: true, 
        errorMsg: '获取用户资料失败，请重试',
        loading: false
      });
    }
  },

  // 表单字段变更事件处理
  onFieldChange(e) {
    const { name, value } = e.detail;
    console.debug('字段变更:', name, value);
    
    // 更新用户信息
    this.setData({
      [`userInfo.${name}`]: value
    });
  },
  
  // 初始化form-panel组件
  initFormPanel() {
    console.debug('初始化表单面板');
    
    const formPanel = this.selectComponent('#profileForm');
    if (!formPanel) {
      console.error('未找到表单面板组件');
      return;
    }
    
    // 用户信息数据映射到表单数据
    const formData = {};
    if (this.data.userInfo) {
      // 获取所有表单字段的名称
      const fields = this.data.formFields.map(field => field.name);
      
      fields.forEach(field => {
        // 特殊处理location字段，从country和city组合
        if (field === 'location') {
          const country = this.data.userInfo.country || '';
          const city = this.data.userInfo.city || '';
          
          if (country) {
            formData[field] = city ? `${country} - ${city}` : country;
          } else {
            formData[field] = '';
          }
          
          console.debug('组合后的location字段:', formData[field]);
        } else {
          formData[field] = this.data.userInfo[field] || '';
        }
      });
      
      // 添加调试日志，检查联系方式字段
      console.debug('用户数据映射到表单:', 
        `nickname=${this.data.userInfo.nickname || '空'}`, 
        `bio=${this.data.userInfo.bio || '空'}`,
        `wechatId=${this.data.userInfo.wechatId || '空'}`, 
        `qqId=${this.data.userInfo.qqId || '空'}`,
        `phone=${this.data.userInfo.phone || '空'}`,
        `country=${this.data.userInfo.country || '空'}`,
        `city=${this.data.userInfo.city || '空'}`
      );
    }

    console.debug('设置表单数据:', formData);

    // 设置表单数据
    formPanel.setData({
      formData,
      _initialized: true
    });
    
    // 刷新组件
    this.setData({
      _formPanelRefreshKey: Date.now()
    });
  },

  // 表单提交处理
  onFormSubmit(e) {
    console.debug('表单提交:', e.detail);
    this.saveChanges(e.detail);
  },

  async saveChanges(formData) {
    if (this.data.formSubmitting) return;
    
    // 添加调试日志
    console.debug('准备保存表单数据:', JSON.stringify(formData));
    
    try {
      this.setData({ formSubmitting: true });
      this.showLoading('保存中...');

      // 创建更新数据对象
      const updateData = {};
      const fields = [
        'nickname', 'bio', 'wechatId', 'qqId', 'phone'
      ];
      
      // 添加基本字段
      fields.forEach(field => {
        if (formData[field] !== undefined) {
          updateData[field] = formData[field];
        }
      });
      
      // 处理location字段，将其分解为country和city
      if (formData.location) {
        console.debug('处理location字段:', formData.location);
        const locationParts = formData.location.split(' - ');
        if (locationParts.length > 0) {
          updateData.country = locationParts[0] || '';
          updateData.city = locationParts.length > 1 ? locationParts[1] : '';
          console.debug('分解后的国家和城市:', updateData.country, updateData.city);
        }
      }

      // 如果头像已更新，也添加到更新数据中
      if (this.data.userInfo && this.data.userInfo.avatar) {
        updateData.avatar = this.data.userInfo.avatar;
      }

      if (Object.keys(updateData).length === 0) {
        this.showToptips('无数据需要更新', 'info');
        return;
      }
      
      console.debug('最终提交的数据:', JSON.stringify(updateData));
      
      // 调用API更新资料
      const result = await this._updateUserProfile(updateData);
      if (!result) throw new Error('更新失败');

      // 更新成功
      this.showToptips('保存成功', 'success');

      // 强制更新全局用户信息和本地存储
      try {
        // 获取最新用户信息
        const latestUserInfo = await this._getUserInfo(true); // 强制刷新
        if (latestUserInfo) {
          console.debug('获取到最新的用户信息:', latestUserInfo);
          
          // 更新本地存储
          this.setStorage('userInfo', latestUserInfo);
          
          // 更新全局数据
          const app = getApp();
          if (app && app.globalData) {
            app.globalData.userInfo = latestUserInfo;
          }
          
          // 设置标记以便刷新个人页面
          this.setStorage('needRefreshProfile', true);
          
          // 设置另一个标记以支持强制刷新
          wx.setStorageSync('profileUpdateTime', Date.now());
        }
      } catch (err) {
        console.error('获取最新用户信息失败:', err);
      }
      
      // 使用更高效的页面跳转，减少延迟
      wx.nextTick(() => {
        // 查看tabBar配置，发现profile/profile是tabBar页面，可以使用switchTab
        wx.switchTab({
          url: '/pages/profile/profile'
        });
      });

    } catch (err) {
      console.error('保存失败:', err);
      this.showToptips('保存失败，请重试', 'error');
    } finally {
      this.hideLoading();
      this.setData({ formSubmitting: false });
    }
  },

  onRetry() {
    // 重新加载页面数据
    this.onShow();
  },

  // 处理头像加载错误
  onAvatarError() {
    console.debug('头像加载失败');
    // 设置默认头像
    this.setData({
      'userInfo.avatar': '',
      forceRefresh: Date.now()
    });
  },

  // 处理用户选择头像
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    
    // 检查头像URL是否存在
    if (!avatarUrl) {
      console.debug('未获取到头像URL');
      return;
    }
    
    console.debug('选择的头像URL类型:', typeof avatarUrl);
    console.debug('头像URL前缀:', avatarUrl.substring(0, 30) + '...');
    
    // 防抖处理，避免重复点击
    if (this.data.uploadingAvatar) {
      return;
    }
    
    try {
      this.setData({ uploadingAvatar: true });
      
      // 立即显示临时头像
      this.setData({
        'userInfo.avatar': avatarUrl
      });
      
      // 显示加载提示
      wx.showLoading({
        title: '头像上传中',
        mask: true
      });
      
      // 获取用户openid
      const openid = this.getStorage('openid');
      if (!openid) {
        throw new Error('无法获取用户openid');
      }
      
      // 使用Promise包装上传操作
      const uploadResult = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: `avatars/${openid}_${Date.now()}.jpg`,
          filePath: avatarUrl,
          success: resolve,
          fail: reject
        });
      });
      
      console.debug('头像上传成功:', uploadResult);
      
      if (uploadResult.fileID) {
        // 批量更新数据，减少setData调用
        this.setData({
          'userInfo.avatar': uploadResult.fileID
        });
        
        // 异步保存到服务器，不阻塞UI
        this.saveAvatarToServer(uploadResult.fileID);
        
        // 显示成功提示
        wx.showToast({
          title: '头像更新成功',
          icon: 'success',
          duration: 2000
        });
      }
      
    } catch (err) {
      console.error('头像上传失败:', err);
      
      // 显示错误提示
      wx.showToast({
        title: '上传失败，将使用临时头像',
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
      this.setData({ uploadingAvatar: false });
    }
  },
  
  // 异步保存头像到服务器
  async saveAvatarToServer(fileID) {
    try {
      await this._updateUserProfile({ avatar: fileID });
      console.debug('头像URL已保存到用户资料');
      
      // 使用nextTick进行异步更新，避免阻塞主线程
      wx.nextTick(async () => {
        try {
          const latestUserInfo = await this._getUserInfo(true);
          if (latestUserInfo) {
            // 更新本地存储
            this.setStorage('userInfo', latestUserInfo);
            
            // 更新全局数据
            const app = getApp();
            if (app && app.globalData) {
              app.globalData.userInfo = latestUserInfo;
            }
            
            // 设置标记以便刷新个人页面
            this.setStorage('needRefreshProfile', true);
            this.setStorage('profileUpdateTime', Date.now());
          }
        } catch (err) {
          console.error('更新本地数据失败:', err);
        }
      });
      
    } catch (err) {
      console.error('保存头像URL失败:', err);
    }
  },

  showToptips(msg, type = 'info') {
    this.setData({
      toptipsShow: true,
      toptipsMsg: msg,
      toptipsType: type
    });
    
    // 使用更高效的定时器，避免阻塞主线程
    if (this.toptipsTimer) {
      clearTimeout(this.toptipsTimer);
    }
    
    this.toptipsTimer = setTimeout(() => {
      this.setData({ toptipsShow: false });
      this.toptipsTimer = null;
    }, 3000);
  },
});