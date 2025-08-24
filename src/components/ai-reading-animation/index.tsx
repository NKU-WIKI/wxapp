import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useEffect, useState, useRef } from 'react';
import { DocSource } from '@/types/api/agent.d';
import styles from './index.module.scss';

interface AIReadingAnimationProps {
  sources: DocSource[];
  onComplete?: () => void;
  duration?: number; // 动画总时长，默认10秒
}

interface ReadingItem {
  source: DocSource;
  status: 'waiting' | 'reading' | 'completed';
  progress: number; // 0-100
  readingPosition: number; // 当前阅读位置
  thinkingStep: number; // 思考步骤
}

// 思考步骤定义
const thinkingSteps = [
  '📖 扫描文档结构...',
  '🔍 提取关键信息...',
  '🧠 理解内容主题...',
  '🔗 建立知识关联...',
  '✨ 生成推理结果...',
  '✅ 完成文档分析'
];

export default function AIReadingAnimation({ sources, onComplete, duration = 10000 }: AIReadingAnimationProps) {
  const [readingItems, setReadingItems] = useState<ReadingItem[]>([]);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [globalThinkingStep, setGlobalThinkingStep] = useState(0);
  const animationTimerRef = useRef<NodeJS.Timeout>();
  const progressTimerRef = useRef<NodeJS.Timeout>();
  const thinkingTimerRef = useRef<NodeJS.Timeout>();

  // 初始化阅读状态
  useEffect(() => {
    const initialItems: ReadingItem[] = sources.map(source => ({
      source,
      status: 'waiting',
      progress: 0,
      readingPosition: 0,
      thinkingStep: 0
    }));
    setReadingItems(initialItems);
  }, [sources]);

  // 全局思考步骤动画
  useEffect(() => {
    const thinkingInterval = duration / thinkingSteps.length;
    let step = 0;

    thinkingTimerRef.current = setInterval(() => {
      step = (step + 1) % thinkingSteps.length;
      setGlobalThinkingStep(step);
    }, thinkingInterval);

    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
    };
  }, [duration]);

  // 开始动画
  useEffect(() => {
    if (readingItems.length === 0) return;

    const itemDuration = duration / readingItems.length;
    let currentIndex = 0;

    const startReading = () => {
      if (currentIndex >= readingItems.length) {
        setIsCompleted(true);
        onComplete?.();
        return;
      }

      setCurrentReadingIndex(currentIndex);

      // 更新当前文档状态为阅读中
      setReadingItems(prev => prev.map((item, index) =>
        index === currentIndex
          ? { ...item, status: 'reading' as const }
          : item
      ));

      // 模拟阅读进度和思考步骤
      let progress = 0;
      let thinkingStep = 0;
      const progressInterval = itemDuration / 100; // 每10ms更新1%
      const contentLength = sources[currentIndex]?.content?.length || 100;
      let readingPosition = 0;

      progressTimerRef.current = setInterval(() => {
        progress += 1;
        readingPosition = Math.floor((progress / 100) * contentLength);
        thinkingStep = Math.floor((progress / 100) * thinkingSteps.length);

        setReadingItems(prev => prev.map((item, index) =>
          index === currentIndex
            ? {
                ...item,
                progress,
                readingPosition,
                thinkingStep: Math.min(thinkingStep, thinkingSteps.length - 1)
              }
            : item
        ));

        if (progress >= 100) {
          clearInterval(progressTimerRef.current);

          // 完成当前文档
          setReadingItems(prev => prev.map((item, index) =>
            index === currentIndex
              ? { ...item, status: 'completed' as const, progress: 100 }
              : item
          ));

          currentIndex++;
          setTimeout(startReading, 500); // 短暂延迟后开始下一个
        }
      }, progressInterval);
    };

    // 延迟1秒后开始动画
    const animationTimer = setTimeout(startReading, 1000);
    animationTimerRef.current = animationTimer;

    return () => {
      const currentAnimationTimer = animationTimerRef.current;
      const currentProgressTimer = progressTimerRef.current;
      const currentThinkingTimer = thinkingTimerRef.current;

      if (currentAnimationTimer) {
        clearTimeout(currentAnimationTimer);
      }
      if (currentProgressTimer) {
        clearInterval(currentProgressTimer);
      }
      if (currentThinkingTimer) {
        clearInterval(currentThinkingTimer);
      }
    };
  }, [readingItems.length, duration, sources, onComplete]);



  const getStatusText = (status: ReadingItem['status']) => {
    switch (status) {
      case 'waiting':
        return '等待中';
      case 'reading':
        return '阅览中';
      case 'completed':
        return '已阅览';
      default:
        return '阅览中';
    }
  };

  if (readingItems.length === 0) {
    return null;
  }

  // 截取内容片段用于显示
  const getContentSnippet = (content: string, position: number, length: number = 100) => {
    const start = Math.max(0, position - length / 2);
    const end = Math.min(content.length, start + length);
    return content.slice(start, end);
  };

  // 获取平台图标
  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'wechat':
        return '/assets/wechat.png';
      case 'website':
        return '/assets/website.png';
      default:
        return '/assets/file-text.svg';
    }
  };

  return (
    <View className={styles.container}>
      {/* 标题区域 */}
      <View className={styles.header}>
        <View className={styles.aiIcon}>
          <Image src='/assets/robot.svg' className={styles.icon} />
          <View className={styles.pulseRing} />
        </View>
        <View className={styles.titleSection}>
          <Text className={styles.title}>南开小知 · AI 智能助理</Text>
          <Text className={styles.subtitle}>
            正在深度研读 {sources.length} 个参考文献...
          </Text>
          <View className={styles.globalThinking}>
            <Text className={styles.thinkingStep}>
              {thinkingSteps[globalThinkingStep]}
            </Text>
          </View>
        </View>
      </View>

      {/* 参考文献列表 */}
      <ScrollView scrollY className={styles.sourcesList}>
        {readingItems.map((item) => {
          const isCurrentlyReading = item.status === 'reading';
          const contentSnippet = item.source.content ?
            getContentSnippet(item.source.content, item.readingPosition, 150) : '';
          const beforeText = item.source.content?.slice(0, item.readingPosition) || '';
          const afterText = item.source.content?.slice(item.readingPosition + 50) || '';

          return (
            <View
              key={item.source.id}
              className={`${styles.sourceItem} ${isCurrentlyReading ? styles.active : ''}`}
            >
              {/* 头部信息 */}
              <View className={styles.sourceHeader}>
                <View className={styles.platformIcon}>
                  <Image src={getPlatformIcon(item.source.platform)} className={styles.icon} />
                </View>
                <View className={styles.sourceInfo}>
                  <Text className={styles.sourceTitle}>{item.source.title}</Text>
                  <View className={styles.sourceMeta}>
                    {item.source.author && (
                      <Text className={styles.author}>👤 {item.source.author}</Text>
                    )}
                    {item.source.publish_time && (
                      <Text className={styles.publishTime}>
                        📅 {new Date(item.source.publish_time).toLocaleDateString('zh-CN')}
                      </Text>
                    )}
                    <Text className={styles.status}>{getStatusText(item.status)}</Text>
                  </View>
                </View>
              </View>

              {/* 文档内容展示 */}
              {item.source.content && (
                <View className={styles.contentContainer}>
                  <View className={styles.contentText}>
                    {/* 已读内容 */}
                    {beforeText && (
                      <Text className={styles.readText}>{beforeText}</Text>
                    )}

                    {/* 正在阅读的内容 */}
                    {isCurrentlyReading && contentSnippet && (
                      <View className={styles.readingHighlight}>
                        <Text className={styles.currentReadingText}>
                          {contentSnippet}
                        </Text>
                        <View className={styles.readingCursor} />
                      </View>
                    )}

                    {/* 未读内容 */}
                    {afterText && (
                      <Text className={styles.unreadText}>{afterText}</Text>
                    )}
                  </View>

                  {/* 阅读指示器 */}
                  {isCurrentlyReading && (
                    <View className={styles.readingIndicator}>
                      <View className={styles.thinkingDots}>
                        <View className={styles.dot} />
                        <View className={styles.dot} style={{ animationDelay: '0.2s' }} />
                        <View className={styles.dot} style={{ animationDelay: '0.4s' }} />
                      </View>
                      <Text className={styles.indicatorText}>
                        {thinkingSteps[item.thinkingStep]}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* 阅读进度条 */}
              <View className={styles.progressContainer}>
                <View
                  className={styles.progressBar}
                  style={{ width: `${item.progress}%` }}
                />
                <Text className={styles.progressText}>
                  {Math.round(item.progress)}%
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* 底部提示 */}
      <View className={styles.footer}>
        <Text className={styles.footerText}>
          {isCompleted
            ? '研读完成，正在生成回答...'
            : `正在研读第 ${currentReadingIndex + 1} 个文献，共 ${sources.length} 个`
          }
        </Text>
      </View>
    </View>
  );
}

