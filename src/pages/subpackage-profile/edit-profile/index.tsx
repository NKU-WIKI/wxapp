import { useState, useEffect } from 'react';
import { View, Text, Image, Input, Button } from '@tarojs/components';
import { useDispatch, useSelector } from 'react-redux';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { AppDispatch, RootState } from '@/store';
import { updateUserProfile } from '@/store/slices/userSlice';
import { User } from '@/types/api/user';
import { uploadApi } from '@/services/api/upload';

export default function EditProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const userInfo = user?.userInfo || null;

  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [qqId, setQqId] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setAvatar(userInfo.avatar || '');
      setNickname(userInfo.nickname || '');
      setBio(userInfo.bio || '');
      setWechatId(userInfo.wechatId || '');
      setQqId(userInfo.qqId || '');
      setPhone(userInfo.phone || '');
      setLocation('中国 北京'); // 默认位置
    }
  }, [userInfo]);

  const handleChooseAvatar = () => {
    if (isUploading) {
      Taro.showToast({ title: '正在上传中，请稍候', icon: 'none' });
      return;
    }
    
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setAvatar(tempFilePath);
        setIsUploading(true);
        Taro.showLoading({ title: '上传中...' });
        
        try {
          const uploadedUrl = await uploadApi.uploadImage(tempFilePath);
          setAvatar(uploadedUrl);
          Taro.showToast({ title: '头像上传成功', icon: 'success' });
        } catch (error) {
          console.error('上传头像失败:', error);
          Taro.showToast({ title: '头像上传失败', icon: 'none' });
          setAvatar(userInfo?.avatar || '');
        } finally {
          setIsUploading(false);
          Taro.hideLoading();
        }
      },
      fail: (error) => {
        console.log('用户取消选择图片或选择失败:', error);
        if (error.errMsg && !error.errMsg.includes('cancel')) {
          Taro.showToast({ title: '选择图片失败', icon: 'none' });
        }
      }
    });
  };

  const handleSave = async () => {
    if (isUploading) {
      Taro.showToast({ title: '正在上传头像...', icon: 'none' });
      return;
    }

    const formData: Partial<User> = {
      nickname,
      bio,
      wechatId,
      qqId,
      phone,
      avatar,
    };
  
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      Taro.navigateBack();
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' });
    }
  };

  const handleLocationSelect = () => {
    Taro.showToast({ title: '位置选择功能开发中', icon: 'none' });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  // 如果用户信息为空，显示加载状态
  if (!userInfo) {
    return (
      <View className={styles.container}>
        <View className={styles.pageWrapper}>
          <View className={styles.customHeader}>
            <Button className={styles.backButton} onClick={handleBack}>
              <Text>‹</Text>
            </Button>
            <Text className={styles.headerTitle}>编辑资料</Text>
          </View>
          <View className={styles.content}>
            <Text>加载中...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.pageWrapper}>
        {/* 自定义头部 */}
        <View className={styles.customHeader}>
          <Button className={styles.backButton} onClick={handleBack}>
            <Text>‹</Text>
          </Button>
          <Text className={styles.headerTitle}>编辑资料</Text>
        </View>

        {/* 主要内容 */}
        <View className={styles.content}>
          {/* 头像部分 */}
          <View className={styles.avatarSection}>
            <View className={styles.avatarUpload} onClick={handleChooseAvatar}>
              <Image 
                src={avatar || 'https://ai-public.mastergo.com/ai/img_res/e5f6df9701ea8cf889b7a90a029d2d29.jpg'} 
                className={styles.avatar}
                mode="aspectFill"
              />
              {isUploading && (
                <View className={styles.uploadingOverlay}>
                  <Text className={styles.uploadingText}>上传中...</Text>
                </View>
              )}
            </View>
            <Text className={styles.avatarTip}>点击更换头像</Text>
          </View>

          {/* 表单卡片 */}
          <View className={styles.formCard}>
            {/* 基本资料 */}
            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>基本资料</Text>
              
              <View className={styles.inputGroup}>
                <View className={styles.inputIcon}>
                  <Text className={styles.iconUser}>👤</Text>
                </View>
                <Text className={styles.inputLabel}>昵称</Text>
                <Input
                  className={styles.input}
                  value={nickname}
                  placeholder="张雨晨"
                  onInput={(e) => setNickname(e.detail.value)}
                />
              </View>

              <View className={styles.inputGroup}>
                <View className={styles.inputIcon}>
                  <Text className={styles.iconComment}>💬</Text>
                </View>
                <Text className={styles.inputLabel}>个人简介</Text>
                <Input
                  className={styles.input}
                  value={bio}
                  placeholder="热爱生活，享受每一天"
                  onInput={(e) => setBio(e.detail.value)}
                />
              </View>
            </View>

            {/* 联系方式 */}
            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>联系方式</Text>
              
              <View className={styles.inputGroup}>
                <View className={styles.inputIcon}>
                  <Text className={styles.iconWechat}>💚</Text>
                </View>
                <Text className={styles.inputLabel}>微信号</Text>
                <Input
                  className={styles.input}
                  value={wechatId}
                  placeholder="rainyday2023"
                  onInput={(e) => setWechatId(e.detail.value)}
                />
              </View>

              <View className={styles.inputGroup}>
                <View className={styles.inputIcon}>
                  <Text className={styles.iconQQ}>🔵</Text>
                </View>
                <Text className={styles.inputLabel}>QQ 号</Text>
                <Input
                  className={styles.input}
                  value={qqId}
                  placeholder="98765432"
                  onInput={(e) => setQqId(e.detail.value)}
                />
              </View>

              <View className={styles.inputGroup}>
                <View className={styles.inputIcon}>
                  <Text className={styles.iconPhone}>📱</Text>
                </View>
                <Text className={styles.inputLabel}>手机号</Text>
                <Input
                  className={styles.input}
                  value={phone}
                  placeholder="138****5678"
                  type="number"
                  onInput={(e) => setPhone(e.detail.value)}
                />
              </View>
            </View>

            {/* 位置信息 */}
            <View className={styles.formSection}>
              <Text className={styles.sectionTitle}>位置信息</Text>
              
              <View className={styles.inputGroup} onClick={handleLocationSelect}>
                <View className={styles.inputIcon}>
                  <Text className={styles.iconGlobe}>🌍</Text>
                </View>
                <Text className={styles.inputLabel}>国家/城市</Text>
                <Text className={styles.locationInput}>{location || '中国 北京'}</Text>
                <Text className={styles.chevronRight}>›</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 底部保存按钮 */}
        <View className={styles.footer}>
          <Button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={isUploading}
          >
            保存修改
          </Button>
        </View>
      </View>
    </View>
  );
}
