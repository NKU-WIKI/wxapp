import React, { useState, useEffect } from 'react';
import { View, Text, Button, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/userSlice';
import styles from './index.module.scss';

// 图标组件（使用Unicode字符）
const IconLock = () => <Text className={styles.icon}>🔒</Text>;
const IconBell = () => <Text className={styles.icon}>🔔</Text>;
const IconSettings = () => <Text className={styles.icon}>⚙️</Text>;
const IconShield = () => <Text className={styles.icon}>🛡️</Text>;
const IconArrowRight = () => <Text className={styles.arrow}>›</Text>;

interface SettingItem {
  label: string;
  value?: string;
  type: 'navigation' | 'toggle' | 'button' | 'selection';
  options?: string[];
  action?: () => void;
}

interface SettingSection {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

const Settings: React.FC = () => {
  const dispatch = useDispatch();

  // 设置状态
  const [messageNotification, setMessageNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [privateMessage, setPrivateMessage] = useState(true);
  const [fontSize, setFontSize] = useState('中');
  const [nightMode, setNightMode] = useState('自动跟随系统');
  
  // 隐私设置状态
  const [whoCanMessage, setWhoCanMessage] = useState('所有人');
  const [whoCanComment, setWhoCanComment] = useState('关注的人');
  const [whoCanViewPosts, setWhoCanViewPosts] = useState('所有人');

  // 设置键名常量
  const SETTINGS_KEYS = {
    MESSAGE_NOTIFICATION: 'settings_message_notification',
    PUSH_NOTIFICATION: 'settings_push_notification', 
    PRIVATE_MESSAGE: 'settings_private_message',
    FONT_SIZE: 'settings_font_size',
    NIGHT_MODE: 'settings_night_mode',
    WHO_CAN_MESSAGE: 'settings_who_can_message',
    WHO_CAN_COMMENT: 'settings_who_can_comment',
    WHO_CAN_VIEW_POSTS: 'settings_who_can_view_posts'
  };

  // 加载保存的设置
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedMessageNotification = Taro.getStorageSync(SETTINGS_KEYS.MESSAGE_NOTIFICATION);
        const savedPushNotification = Taro.getStorageSync(SETTINGS_KEYS.PUSH_NOTIFICATION);
        const savedPrivateMessage = Taro.getStorageSync(SETTINGS_KEYS.PRIVATE_MESSAGE);
        const savedFontSize = Taro.getStorageSync(SETTINGS_KEYS.FONT_SIZE);
        const savedNightMode = Taro.getStorageSync(SETTINGS_KEYS.NIGHT_MODE);
        const savedWhoCanMessage = Taro.getStorageSync(SETTINGS_KEYS.WHO_CAN_MESSAGE);
        const savedWhoCanComment = Taro.getStorageSync(SETTINGS_KEYS.WHO_CAN_COMMENT);
        const savedWhoCanViewPosts = Taro.getStorageSync(SETTINGS_KEYS.WHO_CAN_VIEW_POSTS);

        // 只有当有保存的值时才更新状态
        if (savedMessageNotification !== '') {
          setMessageNotification(savedMessageNotification);
        }
        if (savedPushNotification !== '') {
          setPushNotification(savedPushNotification);
        }
        if (savedPrivateMessage !== '') {
          setPrivateMessage(savedPrivateMessage);
        }
        if (savedFontSize) {
          setFontSize(savedFontSize);
        }
        if (savedNightMode) {
          setNightMode(savedNightMode);
        }
        if (savedWhoCanMessage) {
          setWhoCanMessage(savedWhoCanMessage);
        }
        if (savedWhoCanComment) {
          setWhoCanComment(savedWhoCanComment);
        }
        if (savedWhoCanViewPosts) {
          setWhoCanViewPosts(savedWhoCanViewPosts);
        }
      } catch (error) {
        console.log('加载设置失败:', error);
      }
    };

    loadSettings();
  }, []);

  // 保存单个设置到本地存储
  const saveSetting = (key: string, value: any) => {
    try {
      Taro.setStorageSync(key, value);
    } catch (error) {
      console.log('保存设置失败:', error);
    }
  };

  // 处理字体大小选择
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    saveSetting(SETTINGS_KEYS.FONT_SIZE, size);
    // 这里可以实际应用字体大小设置
    Taro.showToast({
      title: `字体大小已设置为${size}`,
      icon: 'success'
    });
  };

  // 处理隐私设置选择
  const handlePrivacySettings = (_type: string, title: string, options: string[], _currentValue: string, setter: (value: string) => void) => {
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        const selectedValue = options[res.tapIndex];
        setter(selectedValue);
        
        // 根据setter函数保存对应的设置
        if (setter === setWhoCanMessage) {
          saveSetting(SETTINGS_KEYS.WHO_CAN_MESSAGE, selectedValue);
        } else if (setter === setWhoCanComment) {
          saveSetting(SETTINGS_KEYS.WHO_CAN_COMMENT, selectedValue);
        } else if (setter === setWhoCanViewPosts) {
          saveSetting(SETTINGS_KEYS.WHO_CAN_VIEW_POSTS, selectedValue);
        } else if (setter === setNightMode) {
          saveSetting(SETTINGS_KEYS.NIGHT_MODE, selectedValue);
        }
        
        Taro.showToast({
          title: `${title}已设置为: ${selectedValue}`,
          icon: 'success'
        });
      }
    });
  };

  // 处理清除缓存
  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存逻辑
          Taro.clearStorage();
          Taro.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  };

  // 处理设备管理
  const handleDeviceManagement = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  // 处理黑名单管理
  const handleBlacklistManagement = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  // 处理注销账号
  const handleDeleteAccount = () => {
    Taro.showModal({
      title: '注销账号',
      content: '注销后将无法恢复，确定要注销账号吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          dispatch(logout());
          Taro.showToast({
            title: '账号已注销',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1500);
        }
      }
    });
  };

  // 保存设置
  const handleSaveSettings = () => {
    try {
      // 保存所有当前设置到本地存储
      saveSetting(SETTINGS_KEYS.MESSAGE_NOTIFICATION, messageNotification);
      saveSetting(SETTINGS_KEYS.PUSH_NOTIFICATION, pushNotification);
      saveSetting(SETTINGS_KEYS.PRIVATE_MESSAGE, privateMessage);
      saveSetting(SETTINGS_KEYS.FONT_SIZE, fontSize);
      saveSetting(SETTINGS_KEYS.NIGHT_MODE, nightMode);
      saveSetting(SETTINGS_KEYS.WHO_CAN_MESSAGE, whoCanMessage);
      saveSetting(SETTINGS_KEYS.WHO_CAN_COMMENT, whoCanComment);
      saveSetting(SETTINGS_KEYS.WHO_CAN_VIEW_POSTS, whoCanViewPosts);
      
      Taro.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    } catch (error) {
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'error'
      });
    }
  };

  // 设置配置
  const settingsSections: SettingSection[] = [
    {
      title: '隐私与权限',
      icon: <IconLock />,
      items: [
        {
          label: '黑名单管理',
          type: 'navigation',
          action: handleBlacklistManagement
        },
        {
          label: '谁可以私信我',
          value: whoCanMessage,
          type: 'selection',
          options: ['所有人', '关注的人', '不允许'],
          action: () => handlePrivacySettings('message', '私信权限', ['所有人', '关注的人', '不允许'], whoCanMessage, setWhoCanMessage)
        },
        {
          label: '谁可以评论我的帖子',
          value: whoCanComment,
          type: 'selection',
          options: ['所有人', '关注的人', '不允许'],
          action: () => handlePrivacySettings('comment', '评论权限', ['所有人', '关注的人', '不允许'], whoCanComment, setWhoCanComment)
        },
        {
          label: '谁可以查看我的帖子',
          value: whoCanViewPosts,
          type: 'selection',
          options: ['所有人', '关注的人', '仅自己'],
          action: () => handlePrivacySettings('view', '查看权限', ['所有人', '关注的人', '仅自己'], whoCanViewPosts, setWhoCanViewPosts)
        }
      ]
    },
    {
      title: '通知设置',
      icon: <IconBell />,
      items: [
        {
          label: '消息通知开关',
          type: 'toggle'
        },
        {
          label: '是否开启推送',
          type: 'toggle'
        },
        {
          label: '是否接收私信',
          type: 'toggle'
        }
      ]
    },
    {
      title: '通用设置',
      icon: <IconSettings />,
      items: [
        {
          label: '夜间模式',
          value: nightMode,
          type: 'selection',
          options: ['自动跟随系统', '开启', '关闭'],
          action: () => handlePrivacySettings('night', '夜间模式', ['自动跟随系统', '开启', '关闭'], nightMode, setNightMode)
        },
        {
          label: '字体大小调整',
          value: fontSize,
          type: 'button'
        },
        {
          label: '清除缓存',
          value: '128MB',
          type: 'navigation',
          action: handleClearCache
        }
      ]
    },
    {
      title: '账号与安全',
      icon: <IconShield />,
      items: [
        {
          label: '登录设备管理',
          type: 'navigation',
          action: handleDeviceManagement
        },
        {
          label: '注销账号',
          type: 'navigation',
          action: handleDeleteAccount
        }
      ]
    }
  ];

  // 包装的开关更改处理函数，立即保存设置
  const handleToggleChange = (setter: (value: boolean) => void, storageKey: string) => {
    return (value: boolean) => {
      setter(value);
      saveSetting(storageKey, value);
    };
  };

  const renderToggleSwitch = (label: string, value: boolean, onChange: (value: boolean) => void, description?: string) => (
    <View className={styles.toggleItem}>
      <View className={styles.toggleContent}>
        <View className={styles.toggleLabel}>{label}</View>
        {description && <View className={styles.toggleDescription}>{description}</View>}
      </View>
      <Switch
        checked={value}
        onChange={(e) => onChange(e.detail.value)}
        className={styles.switch}
        color="#4F46E5"
      />
    </View>
  );

  const renderFontSizeSelector = () => (
    <View className={styles.fontSizeSelector}>
      <View className={styles.fontSizeLabel}>字体大小调整</View>
      <View className={styles.fontSizeButtons}>
        {['小', '中', '大'].map((size) => (
          <Button
            key={size}
            className={`${styles.fontSizeButton} ${fontSize === size ? styles.fontSizeButtonActive : ''}`}
            onClick={() => handleFontSizeChange(size)}
          >
            {size}
          </Button>
        ))}
      </View>
    </View>
  );

  const renderSettingItem = (item: SettingItem, sectionTitle: string) => {
    if (sectionTitle === '通知设置' && item.type === 'toggle') {
      switch (item.label) {
        case '消息通知开关':
          return renderToggleSwitch(
            item.label,
            messageNotification,
            handleToggleChange(setMessageNotification, SETTINGS_KEYS.MESSAGE_NOTIFICATION),
            '如评论、点赞、系统通知等'
          );
        case '是否开启推送':
          return renderToggleSwitch(
            item.label,
            pushNotification,
            handleToggleChange(setPushNotification, SETTINGS_KEYS.PUSH_NOTIFICATION),
            '如使用系统推送'
          );
        case '是否接收私信':
          return renderToggleSwitch(
            item.label,
            privateMessage,
            handleToggleChange(setPrivateMessage, SETTINGS_KEYS.PRIVATE_MESSAGE)
          );
        default:
          return null;
      }
    }

    if (item.label === '字体大小调整') {
      return renderFontSizeSelector();
    }

    return (
      <View 
        className={`${styles.settingItem} ${item.label === '注销账号' ? styles.dangerItem : ''}`}
        onClick={item.action}
      >
        <View className={styles.settingContent}>
          <Text className={`${styles.settingLabel} ${item.label === '注销账号' ? styles.dangerText : ''}`}>
            {item.label}
          </Text>
          {item.value && (
            <Text className={styles.settingValue}>{item.value}</Text>
          )}
          {item.label === '登录设备管理' && (
            <Text className={styles.deviceInfo}>
              最近登录：iPhone 15 Pro Max, 2025-07-18
            </Text>
          )}
        </View>
        <IconArrowRight />
      </View>
    );
  };

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className={styles.section}>
            <View className={styles.sectionHeader}>
              {section.icon}
              <Text className={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View className={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} className={styles.itemWrapper}>
                  {renderSettingItem(item, section.title)}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      
      <View className={styles.footer}>
        <Button className={styles.saveButton} onClick={handleSaveSettings}>
          保存设置
        </Button>
      </View>
    </View>
  );
};

export default Settings;
