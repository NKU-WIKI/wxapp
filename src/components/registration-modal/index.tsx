import { View, Text, Input, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import styles from "./index.module.scss";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, studentId: string) => void;
  activityTitle: string;
}

const RegistrationModal = ({ isOpen, onClose, onConfirm, activityTitle }: RegistrationModalProps) => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleConfirm = () => {
    if (!name || !studentId) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    onConfirm(name, studentId);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <View className={styles.modalOverlay}>
      <View className={styles.modalContent}>
        <Text className={styles.modalTitle}>报名信息</Text>
        <Text className={styles.activityTitle}>活动: {activityTitle}</Text>
        <Input
          className={styles.input}
          placeholder='请输入您的姓名'
          value={name}
          onInput={(e) => setName(e.detail.value)}
        />
        <Input
          className={styles.input}
          placeholder='请输入您的学号'
          value={studentId}
          onInput={(e) => setStudentId(e.detail.value)}
        />
        <View className={styles.buttonContainer}>
          <Button className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
            取消
          </Button>
          <Button className={`${styles.button} ${styles.confirmButton}`} onClick={handleConfirm}>
            确认报名
          </Button>
        </View>
      </View>
    </View>
  );
};

export default RegistrationModal;
