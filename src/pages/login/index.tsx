import { View, Text, Button } from "@tarojs/components";
import styles from "./index.module.scss";
import Taro from "@tarojs/taro";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { loginWithWechat } from "@/store/slices/userSlice";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = async () => {
    try {
      await dispatch(loginWithWechat()).unwrap();
      Taro.showToast({ title: "登录成功", icon: "success" });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      Taro.showToast({ title: "登录失败，请重试", icon: "none" });
    }
  };

  return (
    <View className={styles.container}>
      <Text className={styles.title}>欢迎来到 NKU-Wiki</Text>
      <Text className={styles.subtitle}>南开人的信息聚合平台</Text>
      <Button className={styles.loginButton} onClick={handleLogin}>
        微信一键登录
      </Button>
    </View>
  );
} 