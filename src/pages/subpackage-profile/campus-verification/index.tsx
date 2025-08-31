import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCampusVerificationInfo, submitCampusVerification, resetSubmitStatus } from '@/store/slices/campusVerificationSlice';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';

const CampusVerification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const campusVerificationState = useSelector((state: RootState) => state.campusVerification);
  const [school, setSchool] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 页面显示时获取认证信息
  useDidShow(() => {
    dispatch(fetchCampusVerificationInfo());
  });

  // 监听提交状态变化
  useEffect(() => {
    if (campusVerificationState.submitStatus === 'succeeded') {
      Taro.showToast({
        title: '提交成功',
        icon: 'success'
      });
      
      // 重置提交状态
      dispatch(resetSubmitStatus());
      
      // 提交成功后返回上一页
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } else if (campusVerificationState.submitStatus === 'failed') {
      Taro.showToast({
        title: campusVerificationState.error || '提交失败，请重试',
        icon: 'error'
      });
      dispatch(resetSubmitStatus());
    }
  }, [campusVerificationState.submitStatus, campusVerificationState.error, dispatch]);

  // 选择图片
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setCardImage(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        Taro.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
    });
  };

  // 提交认证
  const handleSubmit = async () => {
    if (!school.trim()) {
      Taro.showToast({
        title: '请输入学校',
        icon: 'error'
      });
      return;
    }

    if (!name.trim()) {
      Taro.showToast({
        title: '请输入姓名',
        icon: 'error'
      });
      return;
    }

    if (!studentId.trim()) {
      Taro.showToast({
        title: '请输入学号',
        icon: 'error'
      });
      return;
    }

    if (!cardImage) {
      Taro.showToast({
        title: '请上传校园卡照片',
        icon: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(submitCampusVerification({
        school: school.trim(),
        name: name.trim(),
        student_id: studentId.trim(),
        card_image: cardImage
      })).unwrap();
    } catch (error) {
      console.error('提交认证失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染认证状态
  const renderVerificationStatus = () => {
    const { info } = campusVerificationState;
    
    if (!info) return null;

    if (info.is_verified && info.verification_status === 'approved') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>✅</View>
          <Text className={styles.statusTitle}>认证成功</Text>
          <Text className={styles.statusText}>您的校园认证已通过审核</Text>
        </View>
      );
    }

    if (info.verification_status === 'pending') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>⏳</View>
          <Text className={styles.statusTitle}>审核中</Text>
          <Text className={styles.statusText}>您的认证申请正在审核中，请耐心等待</Text>
        </View>
      );
    }

    if (info.verification_status === 'rejected') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>❌</View>
          <Text className={styles.statusTitle}>认证失败</Text>
          <Text className={styles.statusText}>您的认证申请未通过，请重新提交</Text>
          <Button 
            className={styles.resubmitButton} 
            onClick={() => {
              // 重置状态，显示表单
              dispatch(resetSubmitStatus());
            }}
          >
            重新提交
          </Button>
        </View>
      );
    }

    return null;
  };

  // 如果正在加载，显示加载状态
  if (campusVerificationState.status === 'loading') {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="校园认证" />
        <View className={styles.content}>
          <View className={styles.loadingContainer}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        </View>
      </View>
    );
  }

  // 如果已认证或正在审核，显示状态
  const statusView = renderVerificationStatus();
  if (statusView) {
    return (
      <View className={styles.pageContainer}>
        <CustomHeader title="校园认证" />
        <View className={styles.content}>
          {statusView}
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="校园认证" />
      <View className={styles.content}>
        <View className={styles.formContainer}>
          {/* 学校输入 */}
          <View className={styles.inputGroup}>
            <Text className={styles.label}>学校</Text>
            <Input
              className={styles.input}
              placeholder="请输入所在学校"
              value={school}
              onInput={(e) => setSchool(e.detail.value)}
            />
          </View>

          {/* 姓名输入 */}
          <View className={styles.inputGroup}>
            <Text className={styles.label}>姓名</Text>
            <Input
              className={styles.input}
              placeholder="请输入真实姓名"
              value={name}
              onInput={(e) => setName(e.detail.value)}
            />
          </View>

          {/* 学号输入 */}
          <View className={styles.inputGroup}>
            <Text className={styles.label}>学号</Text>
            <Input
              className={styles.input}
              placeholder="请输入学号"
              value={studentId}
              onInput={(e) => setStudentId(e.detail.value)}
            />
          </View>

          {/* 校园卡照片上传 */}
          <View className={styles.inputGroup}>
            <Text className={styles.label}>上传校园卡照片</Text>
            <View className={styles.uploadArea} onClick={handleChooseImage}>
              {cardImage ? (
                <Image src={cardImage} className={styles.uploadedImage} mode="aspectFit" />
              ) : (
                <View className={styles.uploadPlaceholder}>
                  <Image src="/assets/camera.svg" className={styles.cameraIcon} />
                  <Text className={styles.uploadText}>点击或拖拽上传校园卡正面照片</Text>
                </View>
              )}
            </View>
            <Text className={styles.uploadTip}>支持jpg、png、jpeg格式,大小不超过5M</Text>
          </View>

          {/* 提交按钮 */}
          <Button 
            className={styles.submitButton} 
            onClick={handleSubmit}
            disabled={isSubmitting || campusVerificationState.submitStatus === 'loading'}
          >
            {isSubmitting || campusVerificationState.submitStatus === 'loading' ? '提交中...' : '提交认证'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default CampusVerification; 