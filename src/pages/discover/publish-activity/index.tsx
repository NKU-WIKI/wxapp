import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import activityApi from '@/services/api/activity';
import { ActivityCreateRequest, ActivityType, ActivityVisibility } from '@/types/api/activity.d';
import CustomHeader from '../../../components/custom-header';
import styles from './index.module.scss';

interface FormState {
  title: string;
  category: string;
  description: string;
  activity_type: ActivityType;
  start_time: string; // 手动输入日期时间
  end_time: string;   // 手动输入日期时间
  location: string;
  tags: string;
}

export default function PublishActivity() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const [form, setForm] = useState<FormState>({
    title: '',
    category: '',
    description: '',
    activity_type: ActivityType.Offline,
    start_time: format(now),
    end_time: format(oneHourLater),
    location: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const requiredFilled = form.title && form.category && form.description && form.start_time && form.end_time;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const parseDate = (value: string) => {
    // 支持 "YYYY-MM-DD HH:mm" 简易解析
    const replaced = value.replace('T', ' ');
    const ts = Date.parse(replaced.replace(/-/g, '/')); // iOS 兼容
    return isNaN(ts) ? null : new Date(ts);
  };

  const handleSubmit = async () => {
    if (!requiredFilled) {
      Taro.showToast({ title: '请完善必填项', icon: 'none' });
      return;
    }
    const start = parseDate(form.start_time);
    const end = parseDate(form.end_time);
    if (!start || !end) {
      Taro.showToast({ title: '时间格式不正确', icon: 'none' });
      return;
    }
    if (end <= start) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: ActivityCreateRequest = {
        title: form.title,
        category: form.category,
        description: form.description,
        activity_type: form.activity_type,
        start_time: start,
        end_time: end,
        location: form.location || undefined,
        tags: form.tags ? form.tags.split(/[,，\s]+/).filter(Boolean) : undefined,
        visibility: ActivityVisibility.Public
      } as ActivityCreateRequest;
      const res: any = await activityApi.createActivity(payload);
      if (res && res.code === 0) {
        Taro.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => { Taro.navigateBack(); }, 600);
      }
    } catch (e) {
      // 错误已由拦截器处理
    } finally {
      setSubmitting(false);
    }
  };

  const activityTypes: { label: string; value: ActivityType }[] = [
    { label: '线下', value: ActivityType.Offline },
    { label: '线上', value: ActivityType.Online },
    { label: '混合', value: ActivityType.Hybrid },
  ];

  return (
    <View className={styles.publishActivityPage}>
      <CustomHeader title='发布活动' hideBack={false} />

      <View className={styles.formItem}>
        <Text className={styles.label}>标题 *</Text>
        <Input className={styles.input} value={form.title} placeholder='例如：校园技术交流会' onInput={e => update('title', e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>分类 *</Text>
        <Input className={styles.input} value={form.category} placeholder='例如：技术 / 社团 / 招新' onInput={e => update('category', e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>活动类型 *</Text>
        <View className={styles.typeSelector}>
          {activityTypes.map(t => (
            <View
              key={t.value}
              className={`${styles.typeOption} ${form.activity_type === t.value ? styles.typeOptionActive : ''}`}
              onClick={() => update('activity_type', t.value)}
            >
              <Text>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>开始时间 * (YYYY-MM-DD HH:mm)</Text>
        <Input
          className={styles.input}
          value={form.start_time}
          placeholder='例如 2025-09-01 14:00'
          onInput={e => update('start_time', e.detail.value)}
        />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>结束时间 * (YYYY-MM-DD HH:mm)</Text>
        <Input
          className={styles.input}
          value={form.end_time}
          placeholder='例如 2025-09-01 16:00'
          onInput={e => update('end_time', e.detail.value)}
        />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>地点</Text>
        <Input className={styles.input} value={form.location} placeholder='线下活动填写地点，线上可留空' onInput={e => update('location', e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>标签</Text>
        <Input className={`${styles.input} ${styles.tagsInput}`} value={form.tags} placeholder='多个用逗号或空格分隔' onInput={e => update('tags', e.detail.value)} />
        <Text className={styles.helper}>示例：技术 分享 招新</Text>
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>描述 *</Text>
        <Textarea className={styles.textarea} value={form.description} placeholder='介绍活动目的、流程、参与要求等...' onInput={e => update('description', e.detail.value)} />
      </View>

      <View
        className={`${styles.submitBtn} ${(!requiredFilled || submitting) ? styles.disabledBtn : ''}`}
        onClick={() => { if (!submitting) handleSubmit(); }}
      >
        <Text>{submitting ? '提交中...' : '发布活动'}</Text>
      </View>
    </View>
  );
}
