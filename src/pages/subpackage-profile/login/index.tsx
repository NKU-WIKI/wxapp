import { useState, useEffect } from 'react';
import { View, Image, Text, Input, Checkbox } from '@tarojs/components';
import { useDispatch } from 'react-redux';
import Taro from '@tarojs/taro';
import { AppDispatch } from '@/store';
import { login, loginWithUsername, registerUser } from '@/store/slices/userSlice';
import styles from './index.module.scss';

// 图标路径
const logo = '/assets/wiki-lc-green.png';
const phoneIcon = '/assets/phone-login.svg';
const shieldIcon = '/assets/shield-login.svg';
const wechatIcon = '/assets/wechat.svg';
const qqIcon = '/assets/qq.svg';
const userIcon = '/assets/user.svg';
const lockIcon = '/assets/lock.svg';

type LoginMode = 'phone' | 'username' | 'register';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [loginMode, setLoginMode] = useState<LoginMode>('phone');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  // 获取页面参数
  useEffect(() => {
    const router = Taro.getCurrentInstance().router;
    if (router?.params?.redirect) {
      setRedirectUrl(decodeURIComponent(router.params.redirect));
    }
  }, []);

  // 登录成功后的跳转处理
  const handleLoginSuccess = () => {
    Taro.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      if (redirectUrl) {
        // 如果有重定向URL，根据URL类型选择跳转方式
        if (redirectUrl.startsWith('/pages/')) {
          // 使用 redirectTo 替换当前登录页面，避免页面栈问题
          Taro.redirectTo({ url: redirectUrl });
        } else {
          Taro.switchTab({ url: redirectUrl });
        }
      } else {
        // 默认跳转到首页
        Taro.switchTab({ url: '/pages/home/index' });
      }
    }, 1000);
  };

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

  // 手机号/验证码登录逻辑 (保留，但目前未实现)
  const handlePhoneLogin = () => {
    if (!checkAgreement()) return;

    
    
    Taro.showToast({ title: '手机登录功能暂未开放', icon: 'none' });
  };

  const handleGetCode = () => {
    
    Taro.showToast({ title: '暂不支持获取验证码', icon: 'none' });
  };

  // 用户名密码登录逻辑
  const handleUsernameLogin = async () => {
    if (!checkAgreement()) return;

    if (!username.trim() || !password.trim()) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    try {
      await dispatch(loginWithUsername({ username: username.trim(), password })).unwrap();
      handleLoginSuccess();
    } catch (error) {
      
      Taro.showToast({
        title: error as string || '登录失败',
        icon: 'none',
        duration: 3000
      });
    }
  };

  // 用户注册逻辑
  const handleRegister = async () => {
    if (!checkAgreement()) return;

    if (!username.trim() || !password.trim() || !nickname.trim()) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码输入不一致', icon: 'none' });
      return;
    }

    if (password.length < 6) {
      Taro.showToast({ title: '密码长度至少6位', icon: 'none' });
      return;
    }

    try {
      await dispatch(registerUser({
        username: username.trim(),
        password,
        nickname: nickname.trim()
      })).unwrap();
      Taro.showToast({ title: '注册成功', icon: 'success' });
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
      }, 1000);
    } catch (error) {
      
      Taro.showToast({
        title: error as string || '注册失败',
        icon: 'none',
        duration: 3000
      });
    }
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

      {/* 登录模式切换按钮 */}
      <View className={styles.modeTabs}>
        <Text
          className={`${styles.modeTab} ${loginMode === 'phone' ? styles.activeTab : ''}`}
          onClick={() => setLoginMode('phone')}
        >
          手机号登录
        </Text>
        <Text
          className={`${styles.modeTab} ${loginMode === 'username' ? styles.activeTab : ''}`}
          onClick={() => setLoginMode('username')}
        >
          账号登录
        </Text>
      </View>

      <View className={styles.form}>
        {/* 手机号登录表单 */}
        {loginMode === 'phone' && (
          <>
            <View className={styles.inputWrapper}>
              <Image src={phoneIcon} className={styles.inputIcon} />
              <Input
                type='number'
                placeholder='请输入手机号码'
                className={styles.input}
                onInput={() => {}}
              />
            </View>
            <View className={styles.inputWrapper}>
              <Image src={shieldIcon} className={styles.inputIcon} />
              <Input
                type='number'
                placeholder='请输入验证码'
                className={styles.input}
                onInput={() => {}}
              />
              <Text className={styles.getCodeBtn} onClick={handleGetCode}>
                获取验证码
              </Text>
            </View>
            <View className={styles.loginButton} onClick={handlePhoneLogin}>
              <Text>登录/注册</Text>
            </View>
          </>
        )}

        {/* 用户名密码登录表单 */}
        {loginMode === 'username' && (
          <>
            <View className={styles.inputWrapper}>
              <Image src={userIcon} className={styles.inputIcon} />
              <Input
                type='text'
                placeholder='请输入用户名'
                className={styles.input}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
            <View className={styles.inputWrapper}>
              <Image src={lockIcon} className={styles.inputIcon} />
              <Input
                type='text'
                password
                placeholder='请输入密码'
                className={styles.input}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
            <View className={styles.buttonGroup}>
              <View className={styles.loginButton} onClick={handleUsernameLogin}>
                <Text>登录</Text>
              </View>
              <View className={styles.registerButton} onClick={() => setLoginMode('register')}>
                <Text>注册</Text>
              </View>
            </View>
          </>
        )}

        {/* 注册表单 */}
        {loginMode === 'register' && (
          <>
            <View className={styles.inputWrapper}>
              <Image src={userIcon} className={styles.inputIcon} />
              <Input
                type='text'
                placeholder='请输入用户名'
                className={styles.input}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
            <View className={styles.inputWrapper}>
              <Image src={userIcon} className={styles.inputIcon} />
              <Input
                type='text'
                placeholder='请输入昵称'
                className={styles.input}
                onInput={(e) => setNickname(e.detail.value)}
              />
            </View>
            <View className={styles.inputWrapper}>
              <Image src={lockIcon} className={styles.inputIcon} />
              <Input
                type='text'
                password
                placeholder='请输入密码'
                className={styles.input}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
            <View className={styles.inputWrapper}>
              <Image src={lockIcon} className={styles.inputIcon} />
              <Input
                type='text'
                placeholder='请确认密码'
                className={styles.input}
                onInput={(e) => setConfirmPassword(e.detail.value)}
              />
            </View>
            <View className={styles.buttonGroup}>
              <View className={styles.loginButton} onClick={handleRegister}>
                <Text>注册</Text>
              </View>
              <View className={styles.registerButton} onClick={() => setLoginMode('username')}>
                <Text>返回登录</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View className={styles.quickLogin}>
        <View className={styles.divider}>
          <Text className={styles.dividerText}>快速登录</Text>
        </View>
        <View className={styles.socialIcons}>
          <Image src={wechatIcon} className={styles.socialIcon} onClick={handleWechatLogin} />
          <Image src={qqIcon} className={styles.socialIcon} />
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
