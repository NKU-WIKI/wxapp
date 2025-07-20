import React from 'react';
import { useEffect } from 'react';
import { View, Image, Text, Button, ScrollView } from '@tarojs/components';
import { useDispatch, useSelector } from 'react-redux';
import Taro from '@tarojs/taro';
import { AppDispatch, RootState } from '@/store';
import { login } from '@/store/slices/userSlice';
import { fetchAboutInfo } from '@/store/slices/aboutSlice';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';

// 图标路径常量
const logo = "/assets/logo.png";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { info: aboutInfo } = useSelector((state: RootState) => state.about);

  useEffect(() => {
    dispatch(fetchAboutInfo());
  }, [dispatch]);

  const handleLogin = async () => {
    try {
      const res = await Taro.login();
      await dispatch(login(res.code)).unwrap();
      Taro.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      Taro.showToast({ title: '登录失败', icon: 'none' });
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      {/* 1. 顶部必须是统一的自定义导航栏 */}
      <CustomHeader title="登录" hideBack={false} />
      
      {/* 2. 页面主体内容必须包裹在这个 View 和 ScrollView 中 */}
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }}>
          <View className={styles.loginContainer}>
            <View className={styles.mainContent}>
              <Image src={logo} className={styles.logo} mode="aspectFit" />
              {aboutInfo?.version && (
                <Text className={styles.version}>Version {aboutInfo.version}</Text>
              )}
              <Button className={styles.loginButton} onClick={handleLogin}>
                微信一键登录
              </Button>
            </View>
            <View className={styles.footer}>
              {aboutInfo?.copyright && (
                <Text className={styles.copyright}>{aboutInfo.copyright}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
} 