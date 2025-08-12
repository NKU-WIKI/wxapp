import { View, Text, Image } from '@tarojs/components';
import styles from './RagResult.module.scss';

interface RagSourceItem {
  title: string;
  content?: string;
  platform?: string;
  original_url?: string;
  relevance?: number;
}

interface RagData {
  response: string;
  sources?: RagSourceItem[];
}

interface Props {
  data: RagData | null;
}

const platformIcon = '/assets/globe.svg';
const botAvatar = '/assets/wiki.svg';

export default function RagResult({ data }: Props) {
  if (!data) return null;
  const { response, sources = [] } = data;
  return (
    <View className={styles.ragContainer}>
      <View className={styles.card}>
        <View className={styles.header}>
          <Image src={botAvatar} className={styles.avatar} />
          <Text className={styles.title}>南开小知 · AI 智能助理</Text>
        </View>
        <Text className={styles.responseText}>{response}</Text>
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
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}


