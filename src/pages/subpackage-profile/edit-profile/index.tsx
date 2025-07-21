import { useState, useEffect } from 'react';
import { View, Text, Image, Input, Textarea, Button } from '@tarojs/components';
import { useDispatch, useSelector } from 'react-redux';
import Taro from '@tarojs/taro';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';
import { AppDispatch, RootState } from '@/store';
import { updateUserProfile } from '@/store/slices/userSlice';
import { User } from '@/types/api/user';
import { uploadApi } from '@/services/api/upload';

import cameraIcon from '@/assets/camera.svg';
import chevronRightIcon from '@/assets/chevron-right.svg';

export default function EditProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [qqId, setQqId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setAvatar(userInfo.avatar || '');
      setNickname(userInfo.nickname || '');
      setBio(userInfo.bio || '');
      setWechatId(userInfo.wechatId || '');
      setQqId(userInfo.qqId || '');
    }
  }, [userInfo]);

  // 如果 userInfo 为 null，显示加载状态或返回上一页
  if (!userInfo) {
    return (
      <View className={styles.editProfilePage}>
        <CustomHeader title="编辑资料" />
        <View className={styles.content}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setAvatar(tempFilePath); // Show local preview immediately
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadApi.uploadImage(tempFilePath);
          setAvatar(uploadedUrl); // Update with the server URL
          Taro.showToast({ title: '头像上传成功', icon: 'success' });
        } catch (error) {
          console.error("上传头像失败:", error);
          Taro.showToast({ title: '头像上传失败', icon: 'none' });
          setAvatar(userInfo?.avatar || ''); // Revert to original avatar on failure
        } finally {
          setIsUploading(false);
        }
      },
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
      avatar, // Send the new avatar URL
    };
  
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      Taro.navigateBack();
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' });
    }
  };

  return (
    <View className={styles.editProfilePage}>
      <CustomHeader title="编辑资料" />

      <View className={styles.content}>
        {/* Avatar Section */}
        <View className={styles.avatarSection} onClick={handleChooseAvatar}>
          <View className={styles.avatarWrapper}>
            <Image src={avatar || '/assets/profile.png'} className={styles.avatar} />
            <View className={styles.cameraIconWrapper}>
              <Image src={cameraIcon} className={styles.cameraIcon} />
            </View>
          </View>
          <Text className={styles.avatarText}>点击更换头像</Text>
        </View>

        {/* Basic Info */}
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>昵称</Text>
            <Input
              className={styles.infoInput}
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
            />
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>生日</Text>
            <View className={styles.infoValueContainer}>
              <Text className={styles.infoValue}>1995 年 8 月 16 日</Text>
              <Image src={chevronRightIcon} className={styles.arrowIcon} />
            </View>
          </View>
        </View>

        {/* Social Accounts */}
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>社交账号</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>微信号</Text>
            <Input
              className={styles.infoInput}
              value={wechatId}
              onInput={(e) => setWechatId(e.detail.value)}
            />
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>QQ号</Text>
            <Input
              className={styles.infoInput}
              value={qqId}
              onInput={(e) => setQqId(e.detail.value)}
            />
          </View>
        </View>

        {/* Personal Bio */}
        <View className={styles.bioCard}>
          <Text className={styles.cardTitle}>个人简介</Text>
          <Textarea
            className={styles.bioTextarea}
            value={bio}
            onInput={(e) => setBio(e.detail.value)}
            maxlength={-1}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <Button className={styles.saveButton} onClick={handleSave} disabled={isUploading}>
          {isUploading ? '上传中...' : '保存'}
        </Button>
      </View>
    </View>
  );
} 