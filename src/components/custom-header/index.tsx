import { View, Text, Image } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import backIcon from "../../assets/back.png";
import styles from "./index.module.scss";

interface CustomHeaderProps {
  title: string;
  extra?: React.ReactNode;
}

const CustomHeader = ({ title, extra }: CustomHeaderProps) => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  useEffect(() => {
    const getSystemInfo = async () => {
      const systemInfo = await Taro.getSystemInfoAsync();
      setStatusBarHeight(systemInfo.statusBarHeight || 0);
    };
    getSystemInfo();
  }, []);

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View
      className={styles.header}
      style={{ paddingTop: `${statusBarHeight}px` }}
    >
      <Image
        src={backIcon}
        className={styles.backButton}
        onClick={handleBack}
      />
      <Text className={styles.title}>{title}</Text>
      <View className={styles.extraContainer}>{extra || <View className={styles.placeholder} />}</View>
    </View>
  );
};

export default CustomHeader; 