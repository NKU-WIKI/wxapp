import React from 'react';
import { View, Input, Image } from '@tarojs/components';
import Button from '@/components/button';
import styles from '../index.module.scss';
import SendIcon from '@/assets/send.svg';

const BottomInput = () => {
  return (
    <View className={styles.bottomInput}>
      <Input
        className={styles.input}
        placeholder="说点什么..."
      />
      <Button variant="ghost" size="icon" className={styles.sendButton}>
        <Image src={SendIcon} style={{ width: '24px', height: '24px' }} />
      </Button>
    </View>
  );
};

export default BottomInput; 