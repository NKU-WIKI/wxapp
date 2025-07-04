const { ToastType, msgSecCheck } = require('../../utils/index');
const behaviors = require('../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.postBehavior,
    behaviors.authBehavior,
    behaviors.userBehavior,
    behaviors.weuiBehavior,
    behaviors.systemAdaptBehavior
  ],

  data: {
    tabIndex: 0,
    tabTitles: ['富文本模式', 'Markdown'],
  
    // --- Form Data ---
    form: {
      title: '',
      content: '',
      images: [],
      isPublic: true,
      allowComment: true,
      category_id: 1,
      tags: [],
      phone: '',
      wechat: '',
      qq: ''
    },
    categoryId: 1,  
    tabItems:  [
      { category_id: 1, tag:'study', text: '学习交流' },
      { category_id: 2, tag:'life', text: '校园生活' },
      { category_id: 3, tag:'job', text: '就业创业' },
      { category_id: 4, tag:'club', text: '社团活动' },
      { category_id: 5, tag:'lost', text: '失物招领' }
    ],  
    tagInputValue: '',
    tagSelected: {}, // 用于标记标签选中状态
    customTags: [], // 自定义标签列表
    showCustomTagInput: false,
    forceRefresh: 0,

    // --- 统一验证规则 ---
    rules: {
      content: [
        { required: true, message: '请输入内容' },
        { min: 10, message: '内容至少10个字' }
      ]
    },

    // --- UI State ---
    canSubmit: false,
    submitting: false,
    error: false,
    errorMsg: '',
    
    // 是否是Markdown模式
    isMarkdownMode: false,
    
    // weui-uploader需要的函数
    selectFile: null,
    uploadFile: null,
    
    // 顶部消息条
    toptipsShow: false,
    toptipsMsg: '',
    toptipsType: 'error',

    // 预览对话框
    dialogShow: false,
    dialogTitle: '',
    dialogContent: '',
    dialogButtons: [],

    // Markdown预览状态
    showMarkdownPreview: false,

    // 设置按钮配置
    settingButtons: [
      {
        field: 'isPublic',
        icon: 'eye',
        text: '公开',
        iconSize: 24
      },
      {
        field: 'allowComment',
        icon: 'comment',
        text: '允许评论',
        iconSize: 24
      }
    ]
  },

  async onLoad() {
    // 打印当前页面栈
    const pages = getCurrentPages();
    console.debug('发帖页面 onLoad - 当前页面栈:', pages.map(p => p.route || p.__route__));
    
    // 初始化页面
    this.initPage();
    
    // 初始化上传组件
    this.initUploader();
    
    // 确保标签数组已初始化
    this.setData({
      'form.tags': [],
      tagSelected: {},
      customTags: [],
      canSubmit: false  // 初始状态设为false
    });
  },
  
  onShow() {
    // 打印当前页面栈
    const pages = getCurrentPages();
    console.debug('发帖页面 onShow - 当前页面栈:', pages.map(p => p.route || p.__route__));
  },
  
  onHide() {
    console.debug('发帖页面 onHide');
  },
  
  onUnload() {
    console.debug('发帖页面 onUnload');
  },

  async initPage() {
    // 检查登录状态
    const isLoggedIn = await this._checkLogin(true);
    if (!isLoggedIn) return;

    // 初始化表单
    this.initForm({
      title: '',
      content: '',
      images: [],
      isPublic: true,
      allowComment: true,
      category_id: 1,
      phone: '',
      wechat: '',
      qq: ''
    });
  },

  // 模式切换处理
  switchToMarkdownMode() {
    if (this.data.isMarkdownMode) return;
    
    // 切换到Markdown模式
    this.setData({
      isMarkdownMode: true,
      rules: this.data.rules
    });
    
    // 验证表单
    this.validatePostForm();
  },
  
  switchToNormalMode() {
    if (!this.data.isMarkdownMode) return;
    
    // 切换到普通模式
    this.setData({
      isMarkdownMode: false,
      rules: this.data.rules
    });
    
    // 从markdown内容中提取标题
    this._extractTitleFromMarkdown();
    
    // 验证表单
    this.validatePostForm();
  },
  
  // 从markdown内容中提取标题
  _extractTitleFromMarkdown() {
    const content = this.data.form.content || '';
    const titleMatch = content.match(/^#\s+(.+)$/m);
    
    if (titleMatch && titleMatch[1]) {
      // 提取到标题
      const title = titleMatch[1].trim();
      let newContent = content;
      
      // 从内容中移除标题行
      newContent = newContent.replace(/^#\s+(.+)$/m, '').trim();
      
      this.setData({
        'form.title': title,
        'form.content': newContent
      });
    }
  },

  // 使用baseBehavior的validateForm方法
  validatePostForm() {
    const content = this.data.form.content || '';
    
    // 检查内容是否为空
    if (!content) {
      this.setData({ canSubmit: false });
      return false;
    }
    
    // Markdown模式下自动处理标题
    if (this.data.isMarkdownMode) {
      // 无需标题检查，只要有内容即可
      this.setData({ canSubmit: true });
      return true;
    } else {
      // 富文本模式需要检查标题
      if (!this.data.form.title || this.data.form.title.length < 2) {
        this.setData({ canSubmit: false });
        return false;
      }
    }
    
    // 验证通过，可以提交
    this.setData({ canSubmit: true });
    return true;
  },
  
  // 表单变更
  onFormChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setFormField(field, value);
    this.validatePostForm();
  },

  // 开关切换
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.currentTarget.dataset.value !== undefined ? 
                  e.currentTarget.dataset.value : 
                  e.detail.value;
    
    this.setFormField(field, value);
    
    // 如果是切换公开/匿名状态，且设为匿名，则清空联系方式
    if (field === 'isPublic' && !value) {
      // 保存旧的联系方式，用于再次切换回公开时恢复
      this.setData({
        _tempContactInfo: {
          phone: this.data.form.phone || '',
          wechat: this.data.form.wechat || '',
          qq: this.data.form.qq || ''
        },
        'form.phone': '',
        'form.wechat': '',
        'form.qq': ''
      });
    } 
    // 如果是从匿名切换到公开，尝试恢复之前的联系方式
    else if (field === 'isPublic' && value && this.data._tempContactInfo) {
      this.setData({
        'form.phone': this.data._tempContactInfo.phone || '',
        'form.wechat': this.data._tempContactInfo.wechat || '',
        'form.qq': this.data._tempContactInfo.qq || ''
      });
    }
    
    this.validatePostForm();
  },

  // 标签相关方法
  selectTag(e) {
    const { tag } = e.currentTarget.dataset;
    if (!tag) return;
    
    // 创建标签选中状态的副本
    const newTagSelected = {...this.data.tagSelected};
    
    // 切换标签的选中状态
    if (newTagSelected[tag]) {
      delete newTagSelected[tag];
    } else {
      // 检查标签数量限制
      if (Object.keys(newTagSelected).length >= 3) {
        this._showToptips('最多添加3个标签', ToastType.error);
        return;
      }
      newTagSelected[tag] = true;
    }
    
    console.debug('标签选择状态:', newTagSelected);
    
    // 更新选中状态和表单数据
    this.setData({
      tagSelected: newTagSelected,
      'form.tags': Object.keys(newTagSelected)
    });
  },
  
  // 显示标签输入框
  showTagInput() {
    this.setData({
      showCustomTagInput: true
    });
  },
  
  // 隐藏标签输入框
  hideTagInput() {
    this.setData({
      showCustomTagInput: false,
      tagInputValue: ''
    });
  },
  
  onTagInput(e) {
    this.setData({
      tagInputValue: e.detail.value
    });
  },
  
  // 添加自定义标签
  addTag() {
    const value = this.data.tagInputValue.trim();
    if (!value) return;
    
    // 创建标签选中状态的副本
    const newTagSelected = {...this.data.tagSelected};
    
    // 检查标签是否已存在
    if (newTagSelected[value]) {
      this._showToptips('该标签已存在', ToastType.ERROR);
      return;
    }
    
    // 检查标签数量限制
    if (Object.keys(newTagSelected).length >= 3) {
      this._showToptips('最多添加3个标签', ToastType.ERROR);
      return;
    }
    
    // 添加标签
    newTagSelected[value] = true;
    
    // 添加到自定义标签列表
    const newCustomTags = [...this.data.customTags, value];
    
    // 更新选中状态和表单数据
    this.setData({
      tagSelected: newTagSelected,
      customTags: newCustomTags,
      'form.tags': Object.keys(newTagSelected),
      tagInputValue: ''
    });
  },
  
  // 移除自定义标签
  removeCustomTag(e) {
    const tag = e.currentTarget.dataset.tag;
    if (!tag) return;
    
    // 创建副本
    const newTagSelected = {...this.data.tagSelected};
    const newCustomTags = this.data.customTags.filter(t => t !== tag);
    
    // 移除标签
    delete newTagSelected[tag];
    
    // 更新状态
    this.setData({
      tagSelected: newTagSelected,
      customTags: newCustomTags,
      'form.tags': Object.keys(newTagSelected)
    });
  },

  // 显示图片上传组件
  showImageUploader() {
    const imageUploader = this.selectComponent('#imageUploader');
    if (imageUploader) {
      imageUploader.chooseImage();
    }
  },
  
  // 对话框按钮点击
  tapDialogButton(e) {
    this.setData({ dialogShow: false });
  },
  
  // 图片选择后的回调
  onImagesChoose(e) {
    console.debug('选择图片', e.detail);
    // 用户选择了图片，但还未上传
    const images = e.detail.images || [];
    this.validatePostForm();
  },
  
  // 图片上传完成后的回调
  onImagesUploaded(e) {
    console.debug('图片上传完成', e.detail);
    // 更新表单中的图片列表
    const images = e.detail.images || [];
    
    // 验证图片URL是否为云存储fileID格式
    const validImages = images.filter(img => {
      // 检查是否为云存储图片ID(cloud://...)或网络图片(http/https)
      return img && (
        img.startsWith('cloud://') || 
        img.startsWith('http://') || 
        img.startsWith('https://')
      );
    });
    
    if (validImages.length !== images.length) {
      console.debug('过滤掉无效图片:', images.length - validImages.length);
    }
    
    this.setFormField('images', validImages);

    // 对上传的图片进行安全检测
    this.checkImages(validImages);
    
    this.validatePostForm();
  },

  // 检测图片是否包含敏感内容
  async checkImages(images) {
    if (!images || images.length === 0) return;

    // 显示检测中提示
    wx.showLoading({
      title: '图片检测中',
      mask: true
    });

    try {
      // 对图片URL进行内容安全检测（使用imgSecCheck实际无法直接检测URL，这里用特殊格式标记图片内容）
      const imageContentToCheck = images.map((url, index) => `[图片${index+1}]`).join(', ');
      const checkResult = await msgSecCheck(imageContentToCheck, 3);

      // 根据检测结果处理
      if (!checkResult.pass) {
        // 图片检测不通过
        this._showToptips('上传的图片可能包含敏感内容，请更换后重试', 'error');
        
        // 显示模态框提示详情
        wx.showModal({
          title: '图片检测未通过',
          content: '上传的图片可能包含敏感内容，建议更换后重试',
          showCancel: false,
          confirmText: '知道了'
        });
        
        // 清空图片列表
        this.setFormField('images', []);
      }
    } catch (err) {
      console.error('图片检测失败:', err);
    } finally {
      wx.hideLoading();
    }
  },

  // 处理text-area组件的图片插入事件
  onImageInsert(e) {
    console.debug('富文本图片插入事件', e.detail);
    const { images } = e.detail;
    
    if (!images || images.length === 0) return;
    
    // 获取当前有效的图片URL列表
    const imageUrls = images.map(img => img.url).filter(url => url);
    
    if (imageUrls.length === 0) return;
    
    // 更新表单中的图片列表
    const currentImages = this.data.form.images || [];
    const newImages = [...currentImages];
    
    // 添加新的图片URL（避免重复）
    imageUrls.forEach(url => {
      if (!newImages.includes(url)) {
        newImages.push(url);
      }
    });
    
    // 更新表单
    this.setFormField('images', newImages);
    
    // 如果不是Markdown模式，确保图片能显示在内容中
    if (!this.data.isMarkdownMode) {
      console.debug('富文本模式：更新图片列表 ', newImages.length, ' 张');
    }
    
    // 验证表单
    this.validatePostForm();
  },

  // 处理text-area组件的图片删除事件
  onImageDelete(e) {
    console.debug('富文本图片删除事件', e.detail);
    const { imageId, remainingImages } = e.detail;
    
    // 获取当前图片列表
    const currentImages = this.data.form.images || [];
    
    // 如果没有剩余图片信息，可能需要清空所有图片
    if (!remainingImages || remainingImages.length === 0) {
      console.debug('已删除所有图片');
      this.setFormField('images', []);
      this.validatePostForm();
      return;
    }
    
    // 从剩余图片中提取URL
    const remainingUrls = remainingImages.map(img => img.url).filter(url => url);
    
    // 更新表单中的图片列表（只保留剩余的图片URL）
    console.debug('删除图片前：', currentImages.length, '张');
    console.debug('删除图片后：', remainingUrls.length, '张');
    
    // 更新表单
    this.setFormField('images', remainingUrls);
    
    // 验证表单
    this.validatePostForm();
  },

  // 提交表单
  async submitForm() {
    console.debug('开始提交表单');
    
    // 再次验证表单
    this.validatePostForm();
    if (!this.data.canSubmit) {
      this._showToptips('请填写完整信息', ToastType.ERROR);
      return;
    }

    this.setData({ submitting: true });

    // 组合标题和内容
    let finalContent = this.data.form.content;
    let finalTitle = this.data.form.title;

    // 如果是 Markdown 模式，从内容中提取标题
    if (this.data.isMarkdownMode) {
      const titleMatch = finalContent.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        finalTitle = titleMatch[1].trim();
        finalContent = finalContent.replace(/^#\s+(.+)$/m, '').trim();
      } else {
        // 如果没有一级标题，使用内容的前20个字符作为标题
        finalTitle = finalContent.substring(0, 20);
      }
    }
    
    // 准备提交的数据
    const postData = {
      ...this.data.form,
      title: finalTitle,
      content: finalContent
    };

    try {
      // 内容安全检查
      const contentToCheck = `${postData.title}\n${postData.content}`;
      const checkResult = await msgSecCheck(contentToCheck, 2);

      if (!checkResult.pass) {
        this._showToptips('内容包含敏感信息，请修改后重试', ToastType.ERROR);
        wx.showModal({
          title: '内容审核未通过',
          content: `原因：${checkResult.message || '可能包含敏感词'}`,
          showCancel: false,
          confirmText: '返回修改'
        });
        this.setData({ submitting: false });
        return;
      }
      
      // 调用 behavior 中的 _createPost 方法
      const result = await this._createPost(postData);

      if (result) {
        // 发布成功
        this.showToast('发布成功', ToastType.SUCCESS);
        
        // 通知首页刷新
        const pages = getCurrentPages();
        if (pages.length > 1) {
          const prePage = pages[pages.length - 2];
          if (prePage && typeof prePage.onPullDownRefresh === 'function') {
            console.debug('调用首页刷新');
            prePage.onPullDownRefresh();
          }
        }

        // 延迟返回
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        
      } else {
        // 发布失败
        this._showToptips('发布失败，请稍后重试', ToastType.ERROR);
        this.setData({ submitting: false });
      }
    } catch (err) {
      console.error('发布帖子失败', err);
      this._showToptips(err.message || '发布失败，请检查网络', ToastType.ERROR);
      this.setData({ submitting: false });
    }
  },

  // 显示顶部提示
  _showToptips(msg, type = 'error') {
    this.setData({
      toptipsShow: true,
      toptipsMsg: msg,
      toptipsType: type
    });

    setTimeout(() => {
      this.setData({
        toptipsShow: false
      });
    }, 3000);
  },

  // 处理text-area组件的预览状态变化
  onPreviewChange(e) {
    const { showPreview } = e.detail;
    this.setData({
      showMarkdownPreview: showPreview
    });
  },

  // 设置表单字段
  setFormField(field, value) {
    const newData = {};
    newData[`form.${field}`] = value;
    this.setData(newData, () => {
      this.validatePostForm();
    });
  },

  // 处理模式Tab切换事件
  onModeTabChange(e) {
    const { index } = e.detail;
    
    // index为1表示Markdown模式，0表示富文本模式
    if (index === 1) {
      this.switchToMarkdownMode();
    } else {
      this.switchToNormalMode();
    }
  },

  // 分类选择
  selectCategory(e) {
    const { tab } = e.detail;
    const categoryId = tab.category_id;
    
    // 在发帖页面，必须选择一个分类，忽略取消选择的情况
    if (categoryId === 0) {
      console.debug('发帖页面不允许取消选择分类');
      return;
    }
    
    // 避免重复设置相同分类
    if (categoryId === this.data.categoryId) {
      console.debug('阻止重复设置相同分类:', categoryId);
      return;
    }
    
    console.debug('设置分类:', categoryId);
    
    // 使用setTimeout微延迟，避免可能的渲染问题
    setTimeout(() => {
      this.setData({
        categoryId,
        'form.category_id': categoryId
      });
    }, 10);
  },

  // 添加自动获取联系方式的方法
  async fillContactInfo() {
    try {
      // 显示加载状态
      wx.showLoading({
        title: '获取中...',
        mask: true
      });
      
      // 使用authBehavior中的_getUserInfo方法获取用户信息
      const userInfo = await this._getUserInfo(true);
      
      if (userInfo) {
        // 提取联系方式信息
        const phone = userInfo.phone || '';
        const wechat = userInfo.wechatId || '';
        const qq = userInfo.qqId || '';
        
        // 更新表单数据
        this.setData({
          'form.phone': phone,
          'form.wechat': wechat,
          'form.qq': qq
        });
        
        wx.showToast({
          title: '获取成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '获取失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('获取联系方式失败:', err);
      wx.showToast({
        title: '获取失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
}); 