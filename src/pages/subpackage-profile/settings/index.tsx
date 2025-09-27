import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Button, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/userSlice';
import {
  setPersonalizedRecommendation,
  setAllowFileUpload,
  setAllowClipboardAccess,
} from '@/store/slices/settingsSlice';
import { RootState } from '@/store/rootReducer';
import { clearCache, getCacheSize } from '@/utils/cacheManager';
import { runNetworkDiagnosis } from '@/utils/networkDiagnosis';
import styles from './index.module.scss';

// 图标组件（使用Unicode字符）
const IconLock = () => <Text className={styles.icon}>🔒</Text>;
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
      } catch {
        setCacheSize('128KB');
      }
    };

    updateCacheSize();
  }, []);

  // 处理清除缓存
  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: `确定要清除所有缓存数据吗？当前缓存大小：${cacheSize}`,
      success: (res) => {
        if (res.confirm) {
          try {
            // 显示加载状态
            Taro.showLoading({
              title: '清理中...',
              mask: true,
            });

            // 使用新的缓存清除逻辑
            clearCache();

            // 延迟一下再更新缓存大小，确保清理完成
            setTimeout(() => {
              const newSize = getCacheSize();
              setCacheSize(newSize);

              Taro.hideLoading();
              Taro.showToast({
                title: '缓存已清除',
                icon: 'success',
              });
            }, 500);
          } catch {
            Taro.hideLoading();
            Taro.showToast({
              title: error instanceof Error ? error.message : '清除失败',
              icon: 'none',
            });
          }
        }
      },
      fail: () => {
        // 静默处理取消或错误
      },
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
            icon: 'success',
          });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1500);
        }
      },
      fail: () => {
        // 静默处理取消或错误
      },
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
            icon: 'success',
          });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1500);
        }
      },
      fail: () => {
        // 静默处理取消或错误
      },
    });
  };

  // 保存设置并返回profile页面
  const handleSaveSettings = () => {
    try {
      Taro.showToast({
        title: '设置已保存',
        icon: 'success',
      });

      // 延迟一下显示toast，然后返回profile页面
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch {
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'error',
      });
    }
  };

  // 使用useCallback优化Switch组件的回调，避免重渲染
  const handlePersonalizedRecommendationChange = useCallback(
    (value: boolean) => {
      dispatch(setPersonalizedRecommendation(value));
    },
    [dispatch],
  );

  const handleAllowFileUploadChange = useCallback(
    (value: boolean) => {
      dispatch(setAllowFileUpload(value));
    },
    [dispatch],
  );

  const handleAllowClipboardAccessChange = useCallback(
    (value: boolean) => {
      dispatch(setAllowClipboardAccess(value));
    },
    [dispatch],
  );

  // 处理网络诊断
  const handleNetworkDiagnosis = useCallback(() => {
    runNetworkDiagnosis();
  }, []);

  // 设置配置
  const settingsSections: SettingSection[] = [
    {
      title: '隐私与权限',
      icon: <IconLock />,
      items: [
        {
          label: '允许上传文件',
          type: 'toggle',
        },
      ],
    },
    {
      title: '通用设置',
      icon: <IconSettings />,
      items: [
        {
          label: '接受个性化内容推荐',
          type: 'toggle',
        },
        {
          label: '允许读取剪切板',
          type: 'toggle',
        },
        {
          label: '网络诊断',
          type: 'button',
          action: handleNetworkDiagnosis,
        },
        {
          label: '清除缓存',
          value: cacheSize,
          type: 'navigation',
          action: handleClearCache,
        },
      ],
    },
    {
      title: '账号与安全',
      icon: <IconShield />,
      items: [
        {
          label: '注销账号',
          type: 'navigation',
          action: handleDeleteAccount,
        },
        {
          label: '退出登录',
          type: 'navigation',
          action: handleLogout,
        },
      ],
    },
  ];

  const renderToggleSwitch = (
    label: string,
    _value: boolean,
    onChange: (_value: boolean) => void,
    description?: string,
  ) => (
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
    if (sectionTitle === '隐私与权限' && item.type === 'toggle') {
      switch (item.label) {
        case '允许上传文件':
          return renderToggleSwitch(
            item.label,
            settings.allowFileUpload,
            handleAllowFileUploadChange,
            '关闭后将无法在发帖、笔记和学习资源中上传文件',
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
            '根据点赞数量为您推荐内容',
          );
        case '允许读取剪切板':
          return renderToggleSwitch(
            item.label,
            settings.allowClipboardAccess,
            handleAllowClipboardAccessChange,
            '允许应用读取剪切板内容以便快速粘贴',
          );
        default:
          return null;
      }
    }

    if (sectionTitle === '通用设置' && item.type === 'button') {
      switch (item.label) {
        case '网络诊断':
          return (
            <View className={styles.settingItem} onClick={item.action}>
              <View className={styles.settingContent}>
                <View className={styles.networkDiagnosisContent}>
                  <Text className={styles.settingLabel}>{item.label}</Text>
                  <Text className={styles.networkDiagnosisSubtitle}>页面无法打开可点网络诊断</Text>
                </View>
              </View>
              <IconArrowRight />
            </View>
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
          <Text
            className={`${styles.settingLabel} ${item.label === '注销账号' || item.label === '退出登录' ? styles.dangerText : ''}`}
          >
            {item.label}
          </Text>
          {item.value && <Text className={styles.settingValue}>{item.value}</Text>}
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
