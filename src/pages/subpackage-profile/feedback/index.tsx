import { useState } from 'react';
import { View, Text, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import uploadIcon from '@/assets/feedback.svg';
import xCircleIcon from '@/assets/x-circle.svg';
import messageCircleIcon from '@/assets/message-circle.svg';
import lightbulbIcon from '@/assets/lightbulb.svg';
import moreIcon from '@/assets/more-horizontal.svg';

const FEEDBACK_TYPES = [
  { key: 'bug', label: '功能异常', icon: xCircleIcon },
  { key: 'ux', label: '体验问题', icon: messageCircleIcon },
  { key: 'suggest', label: '产品建议', icon: lightbulbIcon },
  { key: 'other', label: '其他', icon: moreIcon },
];

export default function FeedbackPage() {
  const [type, setType] = useState('bug');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleTypeClick = (key: string) => setType(key);

  const handleDescChange = e => setDesc(e.detail.value);

  const handleUpload = async () => {
    if (files.length >= 3) {
      Taro.showToast({ title: '最多上传3个文件', icon: 'none' });
      return;
    }
    const res = await Taro.chooseImage({ count: 3 - files.length });
    setFiles([...files, ...res.tempFiles || res.tempFilePaths.map(path => ({ path }))]);
  };

  const handleRemoveFile = idx => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Taro.showToast({ title: '请填写问题描述', icon: 'none' });
      return;
    }
    setSubmitting(true);
    // TODO: 上传逻辑
    setTimeout(() => {
      setSubmitting(false);
      Taro.showToast({ title: '反馈提交成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1200);
    }, 1000);
  };

  return (
    <View className={styles.page}>
      {/* 反馈类型 */}
      <View className={styles.section} style={{ marginTop: 20 }}>
        <Text className={styles.sectionTitle}>反馈类型</Text>
        <View className={styles.typeGrid}>
          {FEEDBACK_TYPES.map(item => (
            <View
              key={item.key}
              className={`${styles.typeBtn} ${type === item.key ? styles.selected : ''}`}
              onClick={() => handleTypeClick(item.key)}
            >
              <View className={styles.typeIcon} style={{ '--icon-url': `url(${item.icon})` } as any} />
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* 问题描述 */}
      <View className={styles.section} style={{ marginTop: 24 }}>
        <Text className={styles.sectionTitle}>问题描述</Text>
        <Textarea
          className={styles.textarea}
          value={desc}
          onInput={handleDescChange}
          placeholder='请详细描述您遇到的问题...'
          maxlength={500}
          autoHeight
        />
      </View>
      {/* 上传附件 */}
      <View className={styles.section} style={{ marginTop: 24 }}>
        <Text className={styles.sectionTitle}>上传附件</Text>
        <View
          className={styles.uploadBox}
          onClick={handleUpload}
        >
          <View className={styles.uploadIcon} style={{ '--icon-url': `url(${uploadIcon})` } as any} />
          <Text className={styles.uploadText}>点击或拖拽上传文件</Text>
        </View>
        <View className={styles.fileList}>
          {files.map((file, idx) => (
            <View key={idx} className={styles.fileItem}>
              <Text>{file.name || file.path.split('/').pop()}</Text>
              <Text className={styles.removeFile} onClick={e => { e.stopPropagation(); handleRemoveFile(idx); }}>删除</Text>
            </View>
          ))}
        </View>
        <Text className={styles.uploadTip}>最多可上传3个文件，单个文件不超过5MB</Text>
      </View>
      {/* 提交按钮 */}
      <Button
        className={styles.submitBtn}
        onClick={handleSubmit}
        loading={submitting}
        style={{ marginTop: 40, width: 343, height: 48, borderRadius: 24 }}
      >
        提交反馈
      </Button>
    </View>
  );
} 