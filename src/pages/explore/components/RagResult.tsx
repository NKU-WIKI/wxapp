import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import feedbackApi from '@/services/api/feedback';
import styles from './RagResult.module.scss';

interface RagSourceItem {
  title: string;
  content?: string;
  platform?: string;
  original_url?: string;
  relevance?: number;
}

interface RagData {
  answer: string;
  sources?: RagSourceItem[];
}

interface Props {
  data: RagData | null;
}

const platformIcon = '/assets/globe.svg';
const botAvatar = '/assets/wiki.svg';

export default function RagResult({ data }: Props) {
  if (!data) return null;
  const { answer, sources = [] } = data;
  return (
    <View className={styles.ragContainer}>
      <View className={styles.card}>
        <View className={styles.header}>
          <Image src={botAvatar} className={styles.avatar} />
          <Text className={styles.title}>南开小知 · AI 智能助理</Text>
        </View>
        <Text className={styles.responseText}>{answer}</Text>
        <View className={styles.thumbRow}>
          <Text
            className={styles.thumbUp}
            onClick={async () => {
              try {
                await feedbackApi.sendThumbFeedback({ scope: 'rag_answer', action: 'up' });
                Taro.showToast({ title: '已反馈', icon: 'success' });
              } catch {}
            }}
          >👍 有帮助</Text>
          <Text
            className={styles.thumbDown}
            onClick={async () => {
              try {
                await feedbackApi.sendThumbFeedback({ scope: 'rag_answer', action: 'down' });
                Taro.showToast({ title: '已反馈', icon: 'success' });
              } catch {}
            }}
          >👎 不准确</Text>
        </View>
      </View>

      {sources.length > 0 && (
        <View className={styles.card}>
          <Text className={styles.sourcesHeader}>信息来源（{sources.length}）</Text>
          {sources.map((s, idx) => (
            <View key={idx} className={styles.sourceItem}>
              <Image src={platformIcon} className={styles.platformIcon} />
              <View className={styles.sourceContent}>
                <Text className={styles.sourceTitle}>{s.title}</Text>
                <Text className={styles.sourceMeta}>{s.platform || 'unknown'} · 相关度 {s.relevance ? `${Math.round(s.relevance)}%` : '-'}</Text>
                <View className={styles.thumbRow}>
                  <Text
                    className={styles.thumbUp}
                    onClick={async () => {
                      try {
                        await feedbackApi.sendThumbFeedback({ scope: 'rag_source', action: 'up', title: s.title, extra: { platform: s.platform } });
                        Taro.showToast({ title: '感谢反馈', icon: 'success' });
                      } catch {}
                    }}
                  >👍 相关</Text>
                  <Text
                    className={styles.thumbDown}
                    onClick={async () => {
                      try {
                        await feedbackApi.sendThumbFeedback({ scope: 'rag_source', action: 'down', title: s.title, extra: { platform: s.platform } });
                        Taro.showToast({ title: '已记录', icon: 'success' });
                      } catch {}
                    }}
                  >👎 无关</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}


