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
  online_url: string;
  tags: string;
  max_participants: number;
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
    online_url: '',
    tags: '',
    max_participants: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const requiredFilled = form.title && form.category && form.description && form.start_time && form.end_time &&
    ((form.activity_type === ActivityType.Offline && form.location) ||
     (form.activity_type === ActivityType.Online && form.online_url) ||
     (form.activity_type === ActivityType.Hybrid));

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const parseDate = (value: string) => {
    // 支持 "YYYY-MM-DD HH:mm" 简易解析
    const replaced = value.replace('T', ' ');
    const ts = Date.parse(replaced.replace(/-/g, '/')); // iOS 兼容
    return Number.isNaN(ts) ? null : new Date(ts);
  };

  const handleSubmit = async () => {
    if (!requiredFilled) {
      Taro.showToast({ title: '请完善必填项', icon: 'none' });
      return;
    }

    // 根据活动类型验证具体字段
    if (form.activity_type === ActivityType.Offline && !form.location) {
      Taro.showToast({ title: '线下活动请填写地点', icon: 'none' });
      return;
    }
    if (form.activity_type === ActivityType.Online && !form.online_url) {
      Taro.showToast({ title: '线上活动请填写活动链接', icon: 'none' });
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
        location: form.activity_type !== ActivityType.Online ? (form.location || undefined) : undefined,
        online_url: form.activity_type !== ActivityType.Offline ? (form.online_url || undefined) : undefined,
        tags: form.tags ? form.tags.split(/[,，\s]+/).filter(Boolean) : undefined,
        max_participants: form.max_participants > 0 ? form.max_participants : null,
        visibility: ActivityVisibility.Public
      } as ActivityCreateRequest;
      const res: any = await activityApi.createActivity(payload);
      if (res && res.code === 0) {
        Taro.showToast({ title: '发布成功', icon: 'success' });
        // 重新启用自动跳转，发布成功后返回上一页
        setTimeout(() => { Taro.navigateBack(); }, 1000);
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

  // 预定义活动分类
  const activityCategories: { label: string; value: string }[] = [
    { label: '运动健身', value: '运动健身' },
    { label: '创意艺术', value: '创意艺术' },
    { label: '志愿公益', value: '志愿公益' },
    { label: '吃喝娱乐', value: '吃喝娱乐' },
    { label: '学习搭子', value: '学习搭子' },
    { label: '其他活动', value: '其他活动' },
  ];

  return (
    <View className={styles.publishActivityPage}>
      <CustomHeader title='发布活动' hideBack={false} />

      <View className={styles.formItem}>
        <Text className={styles.label}>活动标题 *</Text>
        <Input className={styles.input} value={form.title} placeholder='例如：校园技术交流会' onInput={e => update('title', e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>活动内容 *</Text>
        <Textarea className={styles.textarea} value={form.description} placeholder='介绍活动目的、流程、参与要求等...' onInput={e => update('description', e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>分类 *</Text>
        <View className={styles.categorySelector}>
          {activityCategories.map(category => (
            <View
              key={category.value}
              className={`${styles.categoryOption} ${form.category === category.value ? styles.categoryOptionActive : ''}`}
              onClick={() => update('category', category.value)}
            >
              <Text>{category.label}</Text>
            </View>
          ))}
        </View>
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
        <Text className={styles.label}>活动时间 *</Text>
        <View className={styles.timeRow}>
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>开始时间</Text>
            <Input
              className={styles.input}
              value={form.start_time}
              placeholder='2025-09-01 14:00'
              onInput={e => update('start_time', e.detail.value)}
            />
          </View>
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>结束时间</Text>
            <Input
              className={styles.input}
              value={form.end_time}
              placeholder='2025-09-01 16:00'
              onInput={e => update('end_time', e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 动态显示地点或链接输入框 */}
      {form.activity_type === ActivityType.Offline && (
        <View className={styles.formItem}>
          <Text className={styles.label}>地点 *</Text>
          <Input
            className={styles.input}
            value={form.location}
            placeholder='请填写活动地点，例如：图书馆201会议室'
            onInput={e => update('location', e.detail.value)}
          />
        </View>
      )}

      {form.activity_type === ActivityType.Online && (
        <View className={styles.formItem}>
          <Text className={styles.label}>线上链接 *</Text>
          <Input
            className={styles.input}
            value={form.online_url}
            placeholder='请填写线上活动链接，例如：腾讯会议链接'
            onInput={e => update('online_url', e.detail.value)}
          />
        </View>
      )}

      {form.activity_type === ActivityType.Hybrid && (
        <>
          <View className={styles.formItem}>
            <Text className={styles.label}>地点</Text>
            <Input
              className={styles.input}
              value={form.location}
              placeholder='请填写线下活动地点'
              onInput={e => update('location', e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>线上链接</Text>
            <Input
              className={styles.input}
              value={form.online_url}
              placeholder='请填写线上参与链接'
              onInput={e => update('online_url', e.detail.value)}
            />
          </View>
        </>
      )}

      <View className={styles.formItem}>
        <Text className={styles.label}>标签</Text>
        <Input className={`${styles.input} ${styles.tagsInput}`} value={form.tags} placeholder='多个用逗号或空格分隔' onInput={e => update('tags', e.detail.value)} />
        <Text className={styles.helper}>示例：技术 分享 招新</Text>
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>参与人数上限</Text>
        <View className={styles.participantCounterWrapper}>
          <View
            className={styles.counterButton}
            onClick={() => {
              
              const newValue = Math.max(1, form.max_participants - 1);
              
              setForm(prev => {
                
                const newState = { ...prev, max_participants: newValue };
                
                return newState;
              });
            }}
          >
            <Text className={styles.counterButtonText}>-</Text>
          </View>
          <View className={styles.counterDisplay}>
            <Text className={styles.counterNumber}>{form.max_participants}</Text>
            <Text className={styles.counterUnit}>人</Text>
          </View>
          <View
            className={styles.counterButton}
            onClick={() => {
              
              const newValue = Math.min(999, form.max_participants + 1);
              
              setForm(prev => {
                
                const newState = { ...prev, max_participants: newValue };
                
                return newState;
              });
            }}
          >
            <Text className={styles.counterButtonText}>+</Text>
          </View>
        </View>
        <Text className={styles.helper}>最少1人，最多999人</Text>
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
