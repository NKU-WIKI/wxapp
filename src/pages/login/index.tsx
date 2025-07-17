import { useEffect } from 'react';
import { View, Image, Text, Button } from '@tarojs/components';
import { useDispatch, useSelector } from 'react-redux';
import Taro from '@tarojs/taro';
import { AppDispatch, RootState } from '@/store';
import { login } from '@/store/slices/userSlice';
import { fetchAboutInfo } from '@/store/slices/aboutSlice';
import styles from './index.module.scss';
import logo from '@/assets/logo.png';

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
    <View className={styles.loginPage}>
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
  );
} 