Component({
  properties: {
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '搜索'
    },
    focus: {
      type: Boolean,
      value: false
    },
    showAction: {
      type: Boolean,
      value: true
    },
    actionText: {
      type: String,
      value: '搜索'
    },
    backgroundColor: {
      type: String,
      value: '#f5f5f5'
    },
    navBarHeight: {
      type: Number,
      value: 45
    },
    options: {
      type: Array,
      value: []
    }
  },

  data: {
    inputValue: '',
    userInput: '', // 存储用户实际输入的内容（不含前缀）
    showSelector: false,
    selectorOptions: [],
    selectedOption: 0,
    atPosition: -1,
    hasSelected: false,
    selectedType: ''
  },

  lifetimes: {
    attached() {
      this.setData({
        inputValue: this.properties.value,
        selectorOptions: this.properties.options || []
      })
    }
  },

  observers: {
    'options': function(options) {
      if (options) {
        this.setData({
          selectorOptions: options
        });
      }
    },
    'value': function(value) {
      // 当外部value属性变化时，更新inputValue
      if (value !== this.data.inputValue) {
        // 检查是否包含已知前缀
        const prefixMatch = value && typeof value === 'string' ? value.match(/^@(wiki|user|post|knowledge)\s/) : null;
        
        if (prefixMatch) {
          const prefixType = prefixMatch[1]; // 例如 "wiki"
          const userInputPart = value.substring(prefixMatch[0].length); // 前缀后面的内容
          
          console.debug('外部设置前缀:', prefixType, '用户输入:', userInputPart);
          
          // 找到对应的选项
          const option = this.data.selectorOptions.find(opt => opt.type === prefixType);
          
          if (option) {
            // 设置高亮前缀
            this.setData({
              inputValue: value,
              userInput: userInputPart,
              hasSelected: true,
              selectedType: prefixType,
              showSelector: false,
              atPosition: -1
            });
            return;
          }
        }
        
        // 如果没有前缀匹配，正常更新值
        this.setData({
          inputValue: value
        });
      }
    }
  },

  methods: {
    onInput(e) {
      const value = e.detail.value;
      let newValue = value;
      
      // 检测退格键 - 通过比较前后值的长度变化判断是否在删除
      const isDeleting = this.data.inputValue.length > value.length;
      
      // 如果已选择了一个前缀，并且用户正在删除内容
      if (this.data.hasSelected && this.data.selectedType && isDeleting) {
        // 获取当前完整前缀，例如 "@wiki "
        const fullPrefix = `@${this.data.selectedType} `;
        
        // 判断用户是否试图删除前缀的一部分
        // 1. 如果当前值不再以前缀开头
        // 2. 如果当前值等于前缀（带空格或不带空格），说明用户删除了所有内容后想继续删除前缀
        // 3. 如果当前值长度小于等于前缀长度，说明用户删到了前缀部分
        if (!value.startsWith(fullPrefix) || 
            value === fullPrefix || 
            value === `@${this.data.selectedType}` ||
            value.length <= fullPrefix.length) {
          
          // 用户尝试删除前缀，直接清空整个搜索框
          console.debug('检测到前缀删除操作，重置搜索框');
          this.setData({
            inputValue: '',
            userInput: '',
            hasSelected: false,
            selectedType: '',
            showSelector: false,
            atPosition: -1
          });
          
          // 触发输入事件，通知外部值已更改为空
          this.triggerEvent('input', { value: '' });
          return;
        }
      }
      
      // 已选择类型的情况下，需要保持前缀
      if (this.data.hasSelected && this.data.selectedType) {
        // 检查用户是否删除了前缀（如果是普通输入模式，不应该发生这种情况）
        if (!value.startsWith(`@${this.data.selectedType}`)) {
          // 确保在输入内容前添加前缀和空格
          newValue = `@${this.data.selectedType} ${value}`;
          console.debug('保持前缀:', newValue);
        }
      }
      
      this.setData({
        inputValue: newValue
      });
      
      // 已经选择了选项的情况
      if (this.data.hasSelected) {
        // 记录前缀后的实际用户输入部分
        const prefixLength = `@${this.data.selectedType} `.length;
        const userInputPart = newValue.substring(prefixLength);
        
        // 更新用户输入部分
        this.setData({
          userInput: userInputPart,
          showSelector: false,
          atPosition: -1
        });
        
        console.debug('用户输入更新:', userInputPart);
        this.triggerEvent('input', { value: newValue });
        return;
      }
      
      // 检测@符号
      const lastAtIndex = newValue.lastIndexOf('@');
      if (lastAtIndex !== -1 && (lastAtIndex === 0 || newValue[lastAtIndex - 1] === ' ')) {
        // 获取@后面的内容
        const inputAfterAt = newValue.substring(lastAtIndex + 1).toLowerCase();
        
        // 查找匹配的选项
        let matchedIndex = 0;
        let exactMatch = false;
        
        if (inputAfterAt) {
          // 尝试按输入匹配选项
          for (let i = 0; i < this.data.selectorOptions.length; i++) {
            const option = this.data.selectorOptions[i];
            const typeStr = option.type.toLowerCase();
            const textStr = option.text.toLowerCase();
            const valueStr = (option.value || '').toLowerCase().replace('@', '');
            
            // 精确匹配完整的type
            if (typeStr === inputAfterAt) {
              matchedIndex = i;
              exactMatch = true;
              break;
            }
            // 精确匹配完整的value（不含@符号）
            else if (valueStr && valueStr === inputAfterAt) {
              matchedIndex = i;
              exactMatch = true;
              break;
            }
            // 优先匹配value开头
            else if (valueStr && valueStr.startsWith(inputAfterAt)) {
              matchedIndex = i;
              break;
            }
            // 其次匹配type开头
            else if (typeStr.startsWith(inputAfterAt)) {
              matchedIndex = i;
              break;
            }
            // 最后匹配text开头
            else if (textStr.startsWith(inputAfterAt)) {
              matchedIndex = i;
              break;
            }
          }
        }
        
        // 如果完全匹配，自动选择该选项
        if (exactMatch) {
          this.handleOptionSelected(matchedIndex);
          return;
        }
        
        // 显示选择框
        this.setData({
          showSelector: true,
          atPosition: lastAtIndex,
          hasSelected: false,
          selectedType: '',
          selectedOption: matchedIndex // 设置匹配的选项
        });
        
        // 计算选择器位置
        this.updateSelectorPosition();
      } else {
        this.setData({
          showSelector: false,
          atPosition: -1
        });
      }
      
      this.triggerEvent('input', { value: newValue });
    },

    onClear() {
      // 重置所有状态
      this.setData({
        inputValue: '',
        userInput: '',
        showSelector: false,
        atPosition: -1,
        hasSelected: false,
        selectedType: '',
        focus: true
      });
      
      // 触发清除事件
      this.triggerEvent('clear');
      this.triggerEvent('input', { value: '' });
    },

    onFocus(e) {
      // 记录当前焦点状态，但不清除已选择的前缀
      if (this.data.hasSelected && this.data.selectedType) {
        console.debug('保持前缀高亮状态:', this.data.selectedType);
      }
      
      this.triggerEvent('focus', e.detail);
    },

    onBlur(e) {
      // 延迟隐藏选择框，以便能够点击选项
      setTimeout(() => {
        this.setData({
          showSelector: false
        });
      }, 200);
      this.triggerEvent('blur', e.detail);
    },

    onKeyboardHeightChange(e) {
      // 键盘高度变化，可以处理一些UI调整
      console.debug('键盘高度变化:', e.detail);
    },

    onConfirm(e) {
      // 如果选择框显示且有选中选项，则选择该选项
      if (this.data.showSelector && this.data.selectedOption >= 0) {
        this.handleOptionSelected(this.data.selectedOption);
        return;
      }
      
      // 检查是否只有前缀没有实际内容
      if (this.data.hasSelected && this.data.selectedType) {
        const value = this.data.inputValue || '';
        // 仅有前缀时，不触发搜索
        if (!this.data.userInput || this.data.userInput.trim() === '') {
          console.debug('输入框确认时只有前缀，不触发搜索');
          return;
        }
      }
      
      // 正常触发确认事件
      this.triggerEvent('confirm', { value: this.data.inputValue });
    },

    onAction() {
      this.triggerEvent('action', { value: this.data.inputValue });
    },
    
    // 选择选项
    onSelectOption(e) {
      const index = e.currentTarget.dataset.index;
      this.handleOptionSelected(index);
    },
    
    // 处理选项选择
    handleOptionSelected(index) {
      const option = this.data.selectorOptions[index];
      if (!option) return;
      
      const currentValue = this.data.inputValue;
      const atPosition = this.data.atPosition;
      
      // 使用选项的value值
      let newValue = '';
      if (atPosition !== -1) {
        // 替换@后的内容
        const beforeAt = currentValue.substring(0, atPosition);
        // 如果选项有value，使用它，否则只使用type
        if (option.value) {
          newValue = `${beforeAt}${option.value}`;
        } else {
          newValue = `${beforeAt}@${option.type}`;
        }
      } else {
        // 没有@符号的情况，直接使用value或构造一个
        newValue = option.value || `@${option.type}`;
      }
      
      // 提取实际用户输入部分
      let userInputPart = '';
      if (newValue.includes(' ')) {
        // 如果有空格，取空格后面的内容作为用户输入部分
        const parts = newValue.split(' ');
        if (parts.length > 1) {
          userInputPart = parts.slice(1).join(' ');
        }
      }
      
      // 触发选择事件
      this.triggerEvent('select', {
        option,
        value: newValue
      });
      
      // 同时触发输入变化事件
      this.triggerEvent('input', { value: newValue });
      
      // 清空用户输入内容，只保留前缀
      this.setData({
        inputValue: newValue,
        userInput: userInputPart, // 实际输入框中显示的内容
        showSelector: false,
        atPosition: -1,
        hasSelected: true,
        selectedType: option.type,
        focus: true
      });
      
      console.debug('设置搜索框前缀高亮:', {
        option: option,
        newValue: newValue,
        userInput: userInputPart,
        hasSelected: true,
        selectedType: option.type
      });
    },

    // 处理带前缀的输入
    onInputWithPrefix(e) {
      // 用户输入的内容（不含前缀）
      const value = e.detail.value || '';
      // 构建完整的带前缀的值
      const prefixedValue = `@${this.data.selectedType} ${value}`;
      
      console.debug('输入带前缀的内容:', value, '完整值:', prefixedValue);
      
      this.setData({
        inputValue: prefixedValue, // 完整值包含前缀
        userInput: value // 用户实际输入的部分
      });
      
      // 触发输入事件，向外传递完整值
      this.triggerEvent('input', { value: prefixedValue });
    },

    // 更新选择器位置
    updateSelectorPosition() {
      // 使用wx.createSelectorQuery获取搜索框位置
      const query = wx.createSelectorQuery().in(this);
      query.select('.search-bar').boundingClientRect(rect => {
        if (rect) {
          // 计算选择器应该显示的位置，确保在搜索框下方
          const top = rect.bottom + 10; // 搜索框底部位置再加10rpx的间距
          // 更新选择器样式
          this.setData({
            selectorStyle: `top: ${top}px;`
          });
        }
      }).exec();
    }
  }
})