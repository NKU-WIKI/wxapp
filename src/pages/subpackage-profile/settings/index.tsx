import React from 'react';
import { View, Text, Button, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/userSlice';
import {
  setMessageNotification,
  setPushNotification,
  setPrivateMessage,
  setFontSize,
  setNightMode,
  setWhoCanMessage,
  setWhoCanComment,
  setWhoCanViewPosts,
} from '@/store/slices/settingsSlice';
import { RootState } from '@/store/rootReducer';
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
  
  // 从 Redux store 获取设置状态
  const settings = useSelector((state: RootState) => state.settings);
  
  // 映射中文和英文值
  const fontSizeMap = {
    small: '小',
    medium: '中',
    large: '大'
  };
  
  const nightModeMap = {
    auto: '自动跟随系统',
    light: '关闭',
    dark: '开启'
  };
  
  const privacyMap = {
    everyone: '所有人',
    followers: '关注的人',
    none: '不允许',
    self: '仅自己'
  };

  // 反向映射
  const fontSizeReverseMap = {
    '小': 'small',
    '中': 'medium', 
    '大': 'large'
  } as const;
  
  const nightModeReverseMap = {
    '自动跟随系统': 'auto',
    '关闭': 'light',
    '开启': 'dark'
  } as const;
  
  const privacyReverseMap = {
    '所有人': 'everyone',
    '关注的人': 'followers',
    '不允许': 'none',
    '仅自己': 'self'
  } as const;

  // 处理字体大小选择
  const handleFontSizeChange = (size: string) => {
    const englishSize = fontSizeReverseMap[size as keyof typeof fontSizeReverseMap];
    if (englishSize) {
      dispatch(setFontSize(englishSize));
      Taro.showToast({
        title: `字体大小已设置为${size}`,
        icon: 'success'
      });
    }
  };

  // 处理隐私设置选择
  const handlePrivacySettings = (type: string, title: string, options: string[]) => {
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        const selectedValue = options[res.tapIndex];
        
        // 根据类型转换为英文值并dispatch
        if (type === 'night') {
          const englishValue = nightModeReverseMap[selectedValue as keyof typeof nightModeReverseMap];
          if (englishValue) {
            dispatch(setNightMode(englishValue));
          }
        } else if (type === 'message') {
          const englishValue = privacyReverseMap[selectedValue as keyof typeof privacyReverseMap];
          if (englishValue && englishValue !== 'self') {
            dispatch(setWhoCanMessage(englishValue));
          }
        } else if (type === 'comment') {
          const englishValue = privacyReverseMap[selectedValue as keyof typeof privacyReverseMap];
          if (englishValue && englishValue !== 'self') {
            dispatch(setWhoCanComment(englishValue));
          }
        } else if (type === 'view') {
          const englishValue = privacyReverseMap[selectedValue as keyof typeof privacyReverseMap];
          if (englishValue && englishValue !== 'none') {
            dispatch(setWhoCanViewPosts(englishValue));
          }
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

  // 保存设置并返回profile页面
  const handleSaveSettings = () => {
    try {
      Taro.showToast({
        title: '设置已保存',
        icon: 'success'
      });
      
      // 延迟一下显示toast，然后返回profile页面
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
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
          value: privacyMap[settings.whoCanMessage],
          type: 'selection',
          options: ['所有人', '关注的人', '不允许'],
          action: () => handlePrivacySettings('message', '私信权限', ['所有人', '关注的人', '不允许'])
        },
        {
          label: '谁可以评论我的帖子',
          value: privacyMap[settings.whoCanComment],
          type: 'selection',
          options: ['所有人', '关注的人', '不允许'],
          action: () => handlePrivacySettings('comment', '评论权限', ['所有人', '关注的人', '不允许'])
        },
        {
          label: '谁可以查看我的帖子',
          value: privacyMap[settings.whoCanViewPosts],
          type: 'selection',
          options: ['所有人', '关注的人', '仅自己'],
          action: () => handlePrivacySettings('view', '查看权限', ['所有人', '关注的人', '仅自己'])
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
          value: nightModeMap[settings.nightMode],
          type: 'selection',
          options: ['自动跟随系统', '开启', '关闭'],
          action: () => handlePrivacySettings('night', '夜间模式', ['自动跟随系统', '开启', '关闭'])
        },
        {
          label: '字体大小调整',
          value: fontSizeMap[settings.fontSize],
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

  const renderToggleSwitch = (label: string, _value: boolean, onChange: (_value: boolean) => void, description?: string) => (
    <View className={styles.toggleItem}>
      <View className={styles.toggleContent}>
        <View className={styles.toggleLabel}>{label}</View>
        {description && <View className={styles.toggleDescription}>{description}</View>}
      </View>
      <Switch
        checked={value}
        onChange={(e) => onChange(e.detail.value)}
        className={styles.switch}
        color='#4F46E5'
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
            className={`${styles.fontSizeButton} ${fontSizeMap[settings.fontSize] === size ? styles.fontSizeButtonActive : ''}`}
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
            settings.messageNotification,
            (value) => dispatch(setMessageNotification(value)),
            '如评论、点赞、系统通知等'
          );
        case '是否开启推送':
          return renderToggleSwitch(
            item.label,
            settings.pushNotification,
            (value) => dispatch(setPushNotification(value)),
            '如使用系统推送'
          );
        case '是否接收私信':
          return renderToggleSwitch(
            item.label,
            settings.privateMessage,
            (value) => dispatch(setPrivateMessage(value))
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
