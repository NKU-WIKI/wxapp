// Icon imports
import userIcon from '@/assets/user.svg';
import clockIcon from '@/assets/clock.svg';
import starIcon from '@/assets/star.svg';
import wechatIcon from '@/assets/wechat.svg';
import websiteIcon from '@/assets/website.png';
import fileTextIcon from '@/assets/file-text.svg';

import { View, Text, Image, RichText } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import feedbackApi from '@/services/api/feedback';
import { markdownToHtml } from '@/utils/markdown';
import styles from './RagResult.module.scss';

interface RagSourceItem {
  title: string;
  content?: string;
  platform?: string;
  original_url?: string;
  url?: string;
  publish_time?: string;
  author?: string;
  pagerank_score?: number;
  relevance?: number;
}

interface RagData {
  answer: string;
  sources?: RagSourceItem[];
}

interface Props {
  data: RagData | null;
}

const botAvatar = '/assets/wiki.svg';

// 根据platform返回对应的图标
const getPlatformIcon = (platform?: string): string => {
  switch (platform?.toLowerCase()) {
    case 'wechat':
      return wechatIcon;
    case 'website':
      return websiteIcon;
    case 'post':
      return fileTextIcon;
    default:
      return websiteIcon; // 默认使用website图标
  }
};

export default function RagResult({ data }: Props) {
  const [renderedAnswer, setRenderedAnswer] = useState<string>('');

  // 同步将markdown转换为HTML
  useEffect(() => {
    if (!data?.answer) {
      setRenderedAnswer('');
      return;
    }

    try {
      const html = markdownToHtml(data.answer);
      setRenderedAnswer(html);
    } catch (error) {
      console.error('Failed to render markdown:', error);
      setRenderedAnswer(data.answer); // 失败时使用原始文本
    }
  }, [data?.answer]);

  if (!data) return null;
  const { sources = [] } = data;


  return (
    <View className={styles.ragContainer}>
      <View className={styles.card}>
        <View className={styles.header}>
          <Image src={botAvatar} className={styles.avatar} />
          <Text className={styles.title}>南开小知 · AI 智能助理</Text>
        </View>
        <View className={styles.responseText}>
          <RichText nodes={renderedAnswer} />
        </View>
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
          <View className={styles.sourcesHeader}>
            <Text>信息来源</Text>
            <View className={styles.sourcesCount}>{sources.length}</View>
          </View>
          {sources.map((s, idx) => (
            <View key={idx} className={styles.sourceItem}>
              <Image src={getPlatformIcon(s.platform)} className={styles.platformIcon} />
              <View className={styles.sourceContent}>
                <Text className={styles.sourceTitle}>{s.title}</Text>

                {s.content && (
                  <Text className={styles.sourceContentText}>{s.content}</Text>
                )}

                <View className={styles.sourceMeta}>
                  {s.author && (
                    <View className={styles.metaItem}>
                      <Image src={userIcon} className={styles.metaIcon} />
                      <Text>{s.author}</Text>
                    </View>
                  )}

                  {s.publish_time && (
                    <View className={styles.metaItem}>
                      <Image src={clockIcon} className={styles.metaIcon} />
                      <Text>{new Date(s.publish_time).toLocaleDateString('zh-CN')}</Text>
                    </View>
                  )}

                  {(s.relevance || s.pagerank_score) && (
                    <View className={styles.metaItem}>
                      <Image src={starIcon} className={styles.metaIcon} />
                      <Text>
                        {s.relevance ? `相关度${Math.round(s.relevance)}%` : ''}
                        {s.relevance && s.pagerank_score ? ' · ' : ''}
                        {s.pagerank_score ? `评分${s.pagerank_score.toFixed(2)}` : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {(s.original_url || s.url) && (
                  <Text
                    className={styles.sourceUrl}
                    onClick={() => {
                      const url = s.original_url || s.url;
                      if (url) {
                        Taro.setClipboardData({
                          data: url,
                          success: () => Taro.showToast({ title: '链接已复制', icon: 'success' })
                        });
                      }
                    }}
                  >
                    🔗 {s.original_url || s.url}
                  </Text>
                )}

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


