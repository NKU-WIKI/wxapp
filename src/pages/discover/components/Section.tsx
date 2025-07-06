import { View, Text } from "@tarojs/components";
import styles from "./Section.module.scss";
import React from 'react';

interface SectionProps {
  title: string;
  extraText?: string;
  children: React.ReactNode;
  titleStyle?: React.CSSProperties;
}

const Section = ({ title, extraText, children, titleStyle = {} }: SectionProps) => (
  <View className={styles.section}>
    <View className={styles.sectionHeader}>
      <Text className={styles.sectionTitle} style={titleStyle}>{title}</Text>
      {extraText && <Text className={styles.sectionExtra}>{extraText}</Text>}
    </View>
    <View className={styles.sectionContent}>{children}</View>
  </View>
);

export default Section; 