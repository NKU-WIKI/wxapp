import React, { useState } from 'react';
import { View, Image, Text, Input } from '@tarojs/components';
import { useDispatch } from 'react-redux';
import Taro from '@tarojs/taro';
import { AppDispatch } from '@/store';
import { login } from '@/store/slices/userSlice';
import styles from './index.module.scss';

// 假设这些是新图标的路径
const logo = '/assets/wiki-lc-green.png';
const phoneIcon = '/assets/phone-login.svg';
const shieldIcon = '/assets/shield-login.svg';
const wechatIcon = '/assets/wechat.svg';
const qqIcon = '/assets/qq.svg';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  // 手机号/验证码登录逻辑 (保留，但目前未实现)
  const handlePhoneLogin = () => {
    console.log('Phone:', phone);
    console.log('Code:', code);
    Taro.showToast({ title: '手机登录功能暂未开放', icon: 'none' });
  };
  
  const handleGetCode = () => {
    console.log('Getting verification code for:', phone);
    Taro.showToast({ title: '暂不支持获取验证码', icon: 'none' });
  };

  const handleWechatLogin = async () => {
    try {
      console.log("Starting WeChat login...");
      const res = await Taro.login();
      console.log("Taro.login() result:", res);
      
      if (!res.code) {
        throw new Error("Failed to get WeChat login code");
      }
      
      console.log("Dispatching login with code:", res.code);
      await dispatch(login(res.code)).unwrap();
      console.log("Login successful, navigating to home");
      Taro.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      console.error('Login failed:', error);
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
        <Image src={logo} className={styles.logo} mode="aspectFit" />
        <Text className={styles.title}>开源·共治·普惠</Text>
        <Text className={styles.subtitle}>加入我们, 探索无限可能</Text>
      </View>

      <View className={styles.form}>
        <View className={styles.inputWrapper}>
          <Image src={phoneIcon} className={styles.inputIcon} />
          <Input
            type="number"
            placeholder="请输入手机号码"
            className={styles.input}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>
        <View className={styles.inputWrapper}>
          <Image src={shieldIcon} className={styles.inputIcon} />
          <Input
            type="number"
            placeholder="请输入验证码"
            className={styles.input}
            onInput={(e) => setCode(e.detail.value)}
          />
          <Text className={styles.getCodeBtn} onClick={handleGetCode}>
            获取验证码
          </Text>
        </View>
        <View className={styles.loginButton} onClick={handlePhoneLogin}>
          <Text>登录/注册</Text>
        </View>
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

      <View className={styles.footer}>
        <Text className={styles.agreement}>
          登录即表示同意{' '}
          <Text className={styles.link}>用户协议</Text> 和{' '}
          <Text className={styles.link}>隐私政策</Text>
        </Text>
      </View>
    </View>
  );
}
