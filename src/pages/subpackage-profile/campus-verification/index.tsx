import { View, Text, Input, Button, Image, ScrollView } from '@tarojs/components';
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
  const [realName, setRealName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [organizationName, setOrganizationName] = useState('南开大学'); // 默认学校名称
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [contactPhone, setContactPhone] = useState('');
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
      
      // 提交成功后重新获取认证信息
      setTimeout(() => {
        dispatch(fetchCampusVerificationInfo());
      }, 1000);
    } else if (campusVerificationState.submitStatus === 'failed') {
      
      
      // 检查是否是重复提交的错误
      const errorMessage = campusVerificationState.error || '';
      if (errorMessage.includes('未完成的认证申请') || errorMessage.includes('等待审核完成')) {
        Taro.showToast({
          title: '您已提交认证申请，请耐心等待审核完成',
          icon: 'none',
          duration: 4000
        });
      } else {
        Taro.showToast({
          title: errorMessage || '提交失败，请重试',
          icon: 'error',
          duration: 3000
        });
      }
      
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
      fail: (_err) => {
        
        Taro.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
    });
  };

  // 提交认证
  const handleSubmit = async () => {
    if (!realName.trim()) {
      Taro.showToast({
        title: '请输入真实姓名',
        icon: 'error'
      });
      return;
    }

    if (!organizationName.trim()) {
      Taro.showToast({
        title: '请输入学校名称',
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
        title: '请上传学生证照片',
        icon: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(submitCampusVerification({
        real_name: realName.trim(),
        id_number: idNumber.trim() || undefined,
        organization_name: organizationName.trim(),
        student_id: studentId.trim(),
        department: department.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        card_image: cardImage
      })).unwrap();
    } catch (error) {
      
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

    if (info.verification_status === 'auto_reviewing') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>🤖</View>
          <Text className={styles.statusTitle}>自动审核中</Text>
          <Text className={styles.statusText}>您的认证申请正在自动审核中，请耐心等待</Text>
        </View>
      );
    }

    if (info.verification_status === 'pending_manual_review') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>👤</View>
          <Text className={styles.statusTitle}>等待人工审核</Text>
          <Text className={styles.statusText}>您的认证申请已提交，等待人工审核</Text>
        </View>
      );
    }

    if (info.verification_status === 'pending') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>⏳</View>
          <Text className={styles.statusTitle}>认证中</Text>
          <Text className={styles.statusText}>您的认证申请正在处理中，请耐心等待</Text>
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

    if (info.verification_status === 'appealing') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>📝</View>
          <Text className={styles.statusTitle}>申诉中</Text>
          <Text className={styles.statusText}>您的认证申诉正在处理中</Text>
        </View>
      );
    }

    if (info.verification_status === 'expired') {
      return (
        <View className={styles.statusContainer}>
          <View className={styles.statusIcon}>⏰</View>
          <Text className={styles.statusTitle}>认证已过期</Text>
          <Text className={styles.statusText}>您的认证申请已过期，请重新提交</Text>
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
      <View style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
        <CustomHeader title='校园认证' />
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <ScrollView scrollY style={{ height: '100%' }}>
            <View className={styles.content}>
              <View className={styles.loadingContainer}>
                <Text className={styles.loadingText}>加载中...</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // 根据认证状态决定显示内容
  const { info } = campusVerificationState;
  
  // 如果有认证信息且状态为auto_reviewing、pending_manual_review或pending，显示状态
  if (info && (info.verification_status === 'auto_reviewing' || info.verification_status === 'pending_manual_review' || info.verification_status === 'pending')) {
    const statusView = renderVerificationStatus();
    return (
      <View style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
        <CustomHeader title='校园认证' />
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <ScrollView scrollY style={{ height: '100%' }}>
            <View className={styles.content}>
              {statusView}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // 如果有认证信息且状态为approved，显示成功状态
  if (info && info.verification_status === 'approved') {
    const statusView = renderVerificationStatus();
    return (
      <View style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
        <CustomHeader title='校园认证' />
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <ScrollView scrollY style={{ height: '100%' }}>
            <View className={styles.content}>
              {statusView}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // 其他情况（包括rejected、expired、draft或没有记录）显示表单
  return (
    <View style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <CustomHeader title='校园认证' />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }}>
          <View className={styles.content}>
            <View className={styles.formContainer}>
              {/* 真实姓名输入 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>
                  真实姓名<Text className='required-asterisk'> *</Text>
                </Text>
                <Input
                  className={styles.input}
                  placeholder='请输入真实姓名，必须与证件上的姓名一致'
                  value={realName}
                  onInput={(e) => setRealName(e.detail.value)}
                />
              </View>

              {/* 身份证号输入 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>身份证号</Text>
                <Input
                  className={styles.input}
                  placeholder='请输入18位身份证号（可选但推荐填写）'
                  value={idNumber}
                  onInput={(e) => setIdNumber(e.detail.value)}
                />
              </View>

              {/* 学校名称输入 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>
                  学校名称<Text className='required-asterisk'> *</Text>
                </Text>
                <Input
                  className={styles.input}
                  placeholder='请输入学校名称'
                  value={organizationName}
                  onInput={(e) => setOrganizationName(e.detail.value)}
                />
              </View>

              {/* 学号输入 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>
                  学号<Text className='required-asterisk'> *</Text>
                </Text>
                <Input
                  className={styles.input}
                  placeholder='请输入学号'
                  value={studentId}
                  onInput={(e) => setStudentId(e.detail.value)}
                />
              </View>

              {/* 院系名称输入 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>院系名称</Text>
                <Input
                  className={styles.input}
                  placeholder='请输入院系或部门名称（可选）'
                  value={department}
                  onInput={(e) => setDepartment(e.detail.value)}
                />
              </View>

              {/* 联系电话输入 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>联系电话</Text>
                <Input
                  className={styles.input}
                  placeholder='请输入联系电话，用于审核过程中的联系（可选）'
                  value={contactPhone}
                  onInput={(e) => setContactPhone(e.detail.value)}
                />
              </View>

              {/* 学生证照片上传 */}
              <View className={styles.inputGroup}>
                <Text className={styles.label}>
                  上传学生证照片<Text className='required-asterisk'> *</Text>
                </Text>
                <View className={styles.uploadArea} onClick={handleChooseImage}>
                  {cardImage ? (
                    <Image src={cardImage} className={styles.uploadedImage} mode='aspectFit' />
                  ) : (
                    <View className={styles.uploadPlaceholder}>
                      <Image src='/assets/camera.svg' className={styles.cameraIcon} />
                      <Text className={styles.uploadText}>点击上传学生证正面照片</Text>
                    </View>
                  )}
                </View>
                <Text className={styles.uploadTip}>支持jpg、png、jpeg格式，大小不超过5M</Text>
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
        </ScrollView>
      </View>
    </View>
  );
};

export default CampusVerification; 
