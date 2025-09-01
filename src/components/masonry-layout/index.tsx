import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { NoteListItem } from '@/services/api/note';
import NoteCard from '@/components/note-card';
import styles from './index.module.scss';

interface MasonryLayoutProps {
  notes: NoteListItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const MasonryLayout = ({ 
  notes, 
  loading, 
  hasMore, 
  onLoadMore, 
  onRefresh,
  refreshing 
}: MasonryLayoutProps) => {
  const [columns, setColumns] = useState<NoteListItem[][]>([[], []]);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // 调试信息
  useEffect(() => {
    // 调试信息已移除
  }, [notes, loading, hasMore, refreshing]);

  // 获取屏幕信息
  useEffect(() => {
    Taro.getSystemInfo({
      success: (res) => {
        // 减去顶部导航栏和底部tabbar的高度
        const availableHeight = res.windowHeight - 100; // 100px为大概的导航栏高度
        setScrollViewHeight(availableHeight);
      }
    });
  }, []);

  // 智能分配笔记到列
  const redistributeNotes = useCallback((noteList: NoteListItem[]) => {
    const newColumns: NoteListItem[][] = [[], []];
    const newHeights = [0, 0];

    noteList.forEach((note) => {
      // 计算笔记卡片的预估高度
      const estimatedHeight = calculateNoteHeight(note);
      
      // 选择高度较小的列
      const shortestColumnIndex = newHeights[0] <= newHeights[1] ? 0 : 1;
      
      newColumns[shortestColumnIndex].push(note);
      newHeights[shortestColumnIndex] += estimatedHeight;
    });

    setColumns(newColumns);
  }, []);

  // 计算笔记卡片的预估高度
  const calculateNoteHeight = (note: NoteListItem): number => {
    // 根据noteId计算图片高度（与NoteCard中的逻辑保持一致）
    const imageConfigs = [
      { width: 300, height: 200 },  // 3:2 比例
      { width: 300, height: 250 },  // 6:5 比例
      { width: 300, height: 180 },  // 5:3 比例
      { width: 300, height: 320 },  // 15:16 比例 - 较高
      { width: 300, height: 160 },  // 15:8 比例 - 较矮
      { width: 300, height: 280 },  // 15:14 比例
      { width: 300, height: 220 },  // 15:11 比例
      { width: 300, height: 300 },  // 1:1 正方形
      { width: 300, height: 240 },  // 5:4 比例
      { width: 300, height: 190 },  // 30:19 比例
    ];
    
    const hash = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const configIndex = hash % imageConfigs.length;
    const config = imageConfigs[configIndex];
    
    // 按比例缩放图片高度到卡片宽度
    const cardWidth = 160; // 大约的卡片宽度
    const imageHeight = (config.height / config.width) * cardWidth;
    
    // 标题区域高度（下1/3部分）
    const titleHeight = 60; // 预估标题区域高度，包含padding
    
    // 底部作者信息栏高度
    const footerHeight = 40; // 作者头像、姓名、点赞数
    
    // 基础高度
    let height = imageHeight + titleHeight + footerHeight;
    
    // 根据标题长度微调高度
    if (note.title && note.title.length > 15) {
      height += 20; // 标题较长时增加高度
    }

    return Math.round(height);
  };

  // 当notes变化时重新分布
  useEffect(() => {
    redistributeNotes(notes);
  }, [notes, redistributeNotes]);

  // 处理滚动到底部
  const handleScrollToLower = useCallback(() => {
    if (!loading && hasMore) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore]);

  // 处理下拉刷新
  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      onRefresh();
    }
  }, [refreshing, onRefresh]);

  return (
    <View className={styles.masonryContainer}>
      <ScrollView
        className={styles.scrollView}
        style={{ height: scrollViewHeight }}
        scrollY
        onScrollToLower={handleScrollToLower}
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        lowerThreshold={100}
        refresherThreshold={80}
      >
        <View className={styles.masonryContent}>
          {/* 左列 */}
          <View className={styles.column}>
            {columns[0].map((note, index) => (
              <NoteCard
                key={`left-${note.id}-${index}`}
                note={note}
                style={{ marginBottom: '12px' }}
              />
            ))}
          </View>

          {/* 右列 */}
          <View className={styles.column}>
            {columns[1].map((note, index) => (
              <NoteCard
                key={`right-${note.id}-${index}`}
                note={note}
                style={{ marginBottom: '12px' }}
              />
            ))}
          </View>
        </View>

        {/* 加载状态 */}
        {loading && (
          <View className={styles.loadingContainer}>
            <View className={styles.loadingDot}></View>
            <View className={styles.loadingDot}></View>
            <View className={styles.loadingDot}></View>
          </View>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && notes.length > 0 && (
          <View className={styles.noMoreContainer}>
            <View className={styles.noMoreText}>没有更多内容了</View>
          </View>
        )}

        {/* 底部安全区域 */}
        <View className={styles.bottomSafeArea}></View>
      </ScrollView>
    </View>
  );
};

export default MasonryLayout;
