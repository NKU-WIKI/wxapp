import { useState, useEffect } from 'react';
import { View, Image, Text, Checkbox } from '@tarojs/components';
import { useDispatch } from 'react-redux';
import Taro from '@tarojs/taro';
import { AppDispatch } from '@/store';
import { login } from '@/store/slices/userSlice';
import styles from './index.module.scss';

// 图标路径
const logo = '/assets/wiki-lc-green.png';
const wechatIcon = '/assets/wechat.svg';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  // 获取页面参数
  useEffect(() => {
    const router = Taro.getCurrentInstance().router;
    if (router?.params?.redirect) {
      setRedirectUrl(decodeURIComponent(router.params.redirect));
    }
  }, []);


  // 检查协议同意状态
  const checkAgreement = () => {

    if (!agreedToTerms) {

      Taro.showToast({ title: '请先阅读并同意用户协议和隐私政策', icon: 'none' });
      return false;
    }

    return true;
  };

  // 协议查看函数
  const handleViewUserAgreement = () => {
    Taro.navigateTo({ url: '/pages/subpackage-profile/user-agreement/index' });
  };

  const handleViewPrivacyPolicy = () => {
    Taro.navigateTo({ url: '/pages/subpackage-profile/privacy-policy/index' });
  };


  const handleWechatLogin = async () => {
    if (!checkAgreement()) {
      return;
    }

    try {
      Taro.showLoading({ title: '正在登录...' });

      const res = await Taro.login();

      if (!res.code) {
        throw new Error("获取微信登录code失败");
      }

      await dispatch(login(res.code)).unwrap();

      Taro.hideLoading();
      Taro.showToast({ title: '登录成功', icon: 'success' });

      setTimeout(() => {
        if (redirectUrl) {
          // 如果有重定向URL，根据URL类型选择跳转方式
          if (redirectUrl.startsWith('/pages/')) {
            Taro.navigateTo({ url: redirectUrl });
          } else {
            Taro.switchTab({ url: redirectUrl });
          }
        } else {
          // 默认跳转到首页
          Taro.switchTab({ url: '/pages/home/index' });
        }
      }, 1500);
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: `登录失败: ${error}`,
        icon: 'none',
        duration: 3000
      });
    }
  };

  return (
    <View className={styles.loginContainer}>
      <View className={styles.header}>
        <Image src={logo} className={styles.logo} mode='aspectFit' />
        <Text className={styles.title}>开源·共治·普惠</Text>
        <Text className={styles.subtitle}>加入我们, 探索无限可能</Text>
      </View>


      <View className={styles.quickLogin}>
        <View className={styles.wechatLoginContainer} onClick={handleWechatLogin}>
          <Image src={wechatIcon} className={styles.socialIcon} />
          <Text className={styles.wechatLoginText}>微信一键登录</Text>
        </View>
      </View>

      {/* 协议同意区域 */}
      <View className={styles.agreementSection}>
        <View
          className={styles.agreementRow}
          onClick={() => {
            setAgreedToTerms(!agreedToTerms);
          }}
        >
          <Checkbox
            value='agree'
            checked={agreedToTerms}
            className={styles.checkbox}
          />
          <Text className={styles.agreementText}>
            我已仔细阅读并同意{' '}
            <Text
              className={styles.link}
              onClick={(e) => {
                e.stopPropagation();
                handleViewUserAgreement();
              }}
            >
              《用户服务协议》
            </Text>
            和{' '}
            <Text
              className={styles.link}
              onClick={(e) => {
                e.stopPropagation();
                handleViewPrivacyPolicy();
              }}
            >
              《隐私政策》
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
