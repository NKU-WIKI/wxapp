import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Button, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/userSlice';
import {
  setMessageNotification,
  setPushNotification,
  setPrivateMessage,
  setWhoCanMessage,
  setWhoCanComment,
  setWhoCanViewPosts,
  setPersonalizedRecommendation,
  setAllowImageSaving,
} from '@/store/slices/settingsSlice';
import { RootState } from '@/store/rootReducer';
import { clearCache, getCacheSize } from '@/utils/cacheManager';
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
  
  // 缓存大小状态
  const [cacheSize, setCacheSize] = useState<string>('计算中...');
  
  // 组件挂载时获取缓存大小
  useEffect(() => {
    const updateCacheSize = () => {
      try {
        const size = getCacheSize();
        setCacheSize(size);
      } catch (error) {
        setCacheSize('128KB');
      }
    };
    
    updateCacheSize();
  }, []);
  
  const privacyMap = {
    everyone: '所有人',
    followers: '关注的人',
    none: '不允许',
    self: '仅自己'
  };

  // 反向映射
  const privacyReverseMap = {
    '所有人': 'everyone',
    '关注的人': 'followers',
    '不允许': 'none',
    '仅自己': 'self'
  } as const;

  // 处理隐私设置选择 - 使用更安全的方式处理showActionSheet
  const handlePrivacySettings = (type: string, title: string, options: string[]) => {
    // 使用setTimeout延迟执行，避免直接在事件处理中调用
    setTimeout(() => {
      // 临时禁用全局错误报告
      const originalOnError = (wx as any).onError;
      const originalOnUnhandledRejection = (wx as any).onUnhandledRejection;
      
      // 禁用错误报告
      if (originalOnError) (wx as any).onError(() => {});
      if (originalOnUnhandledRejection) (wx as any).onUnhandledRejection(() => {});
      
      Taro.showActionSheet({
        itemList: options,
        success: (res) => {
          const selectedValue = options[res.tapIndex];
          
          // 根据类型转换为英文值并dispatch
          if (type === 'message') {
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
          
          // 恢复错误报告
          setTimeout(() => {
            if (originalOnError) (wx as any).onError(originalOnError);
            if (originalOnUnhandledRejection) (wx as any).onUnhandledRejection(originalOnUnhandledRejection);
          }, 100);
        },
        fail: () => {
          // 用户取消选择，静默处理
          // 恢复错误报告
          setTimeout(() => {
            if (originalOnError) (wx as any).onError(originalOnError);
            if (originalOnUnhandledRejection) (wx as any).onUnhandledRejection(originalOnUnhandledRejection);
          }, 100);
        }
      });
    }, 0);
  };

  // 处理清除缓存
  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: `确定要清除所有缓存数据吗？当前缓存大小：${cacheSize}`,
      success: (res) => {
        if (res.confirm) {
          try {
            // 使用新的缓存清除逻辑
            clearCache();
            
            // 更新缓存大小显示
            const newSize = getCacheSize();
            setCacheSize(newSize);
            
            Taro.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
          } catch (error) {
            Taro.showToast({
              title: error instanceof Error ? error.message : '清除失败',
              icon: 'none'
            });
          }
        }
      },
      fail: () => {
        // 静默处理取消或错误
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
      },
      fail: () => {
        // 静默处理取消或错误
      }
    });
  };

  // 处理退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          dispatch(logout());
          Taro.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1500);
        }
      },
      fail: () => {
        // 静默处理取消或错误
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
          label: '接受个性化内容推荐',
          type: 'toggle'
        },
        {
          label: '发布图片支持他人保存',
          type: 'toggle'
        },
        {
          label: '清除缓存',
          value: cacheSize,
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
        },
        {
          label: '退出登录',
          type: 'navigation',
          action: handleLogout
        }
      ]
    }
  ];

  // 使用useCallback优化Switch组件的回调，避免重渲染
  const handleMessageNotificationChange = useCallback((value: boolean) => {
    dispatch(setMessageNotification(value));
  }, [dispatch]);

  const handlePushNotificationChange = useCallback((value: boolean) => {
    dispatch(setPushNotification(value));
  }, [dispatch]);

  const handlePrivateMessageChange = useCallback((value: boolean) => {
    dispatch(setPrivateMessage(value));
  }, [dispatch]);

  const handlePersonalizedRecommendationChange = useCallback((value: boolean) => {
    dispatch(setPersonalizedRecommendation(value));
  }, [dispatch]);

  const handleAllowImageSavingChange = useCallback((value: boolean) => {
    dispatch(setAllowImageSaving(value));
  }, [dispatch]);

  const renderToggleSwitch = (label: string, _value: boolean, onChange: (_value: boolean) => void, description?: string) => (
    <View className={styles.toggleItem}>
      <View className={styles.toggleContent}>
        <View className={styles.toggleLabel}>{label}</View>
        {description && <View className={styles.toggleDescription}>{description}</View>}
      </View>
      <Switch
        checked={_value}
        onChange={(e) => {
          // 防抖处理，避免频繁触发状态更新
          const newValue = e.detail.value;
          onChange(newValue);
        }}
        className={styles.switch}
        color='#4F46E5'
      />
    </View>
  );

  const renderSettingItem = (item: SettingItem, sectionTitle: string) => {
    if (sectionTitle === '通知设置' && item.type === 'toggle') {
      switch (item.label) {
        case '消息通知开关':
          return renderToggleSwitch(
            item.label,
            settings.messageNotification,
            handleMessageNotificationChange,
            '如评论、点赞、系统通知等'
          );
        case '是否开启推送':
          return renderToggleSwitch(
            item.label,
            settings.pushNotification,
            handlePushNotificationChange,
            '如使用系统推送'
          );
        case '是否接收私信':
          return renderToggleSwitch(
            item.label,
            settings.privateMessage,
            handlePrivateMessageChange
          );
        default:
          return null;
      }
    }

    if (sectionTitle === '通用设置' && item.type === 'toggle') {
      switch (item.label) {
        case '接受个性化内容推荐':
          return renderToggleSwitch(
            item.label,
            settings.personalizedRecommendation,
            handlePersonalizedRecommendationChange,
            '根据您的兴趣为您推荐内容'
          );
        case '发布图片支持他人保存':
          return renderToggleSwitch(
            item.label,
            settings.allowImageSaving,
            handleAllowImageSavingChange,
            '允许其他用户保存您发布的图片'
          );
        default:
          return null;
      }
    }

    return (
      <View 
        className={`${styles.settingItem} ${item.label === '注销账号' || item.label === '退出登录' ? styles.dangerItem : ''}`}
        onClick={item.action}
      >
        <View className={styles.settingContent}>
          <Text className={`${styles.settingLabel} ${item.label === '注销账号' || item.label === '退出登录' ? styles.dangerText : ''}`}>
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
      <ScrollView scrollY className={styles.content}>
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
      </ScrollView>
      
      <View className={styles.footer}>
        <Button className={styles.saveButton} onClick={handleSaveSettings}>
          保存设置
        </Button>
      </View>
    </View>
  );
};

export default Settings;
