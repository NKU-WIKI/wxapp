import { View } from "@tarojs/components";
import { ReactNode } from "react";
import classnames from "classnames";
import styles from "./index.module.scss";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  const cardClass = classnames(styles.card, className);
  return <View className={cardClass}>{children}</View>;
}
