import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';

import CustomHeader from '@/components/custom-header';
import Button from '@/components/button';

// Type imports
import { HistoryItem as HistoryItemType } from '@/types/history';

// Utils imports
import * as historyUtils from '@/utils/history';

// Relative imports
import HistoryItem from './components/HistoryItem';
import styles from './index.module.scss';

const PAGE_SIZE = 20;

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItemType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = useCallback((reset = false) => {
    const nextPage = reset ? 1 : page;
    const data = historyUtils.getHistory(nextPage, PAGE_SIZE);
    

    
    if (reset) {
      setHistory(data);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHistory(prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
  }, [page]);

  useEffect(() => {
    loadHistory(true);
  }, [loadHistory]);

  usePullDownRefresh(() => {
    loadHistory(true);
    Taro.stopPullDownRefresh();
  });

  useReachBottom(() => {
    if (hasMore) {
      const nextPage = page + 1;
      const data = historyUtils.getHistory(nextPage, PAGE_SIZE);
      setHistory(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    }
  });

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该条浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          historyUtils.removeHistory(id);
          setHistory(historyUtils.getHistory(1, page * PAGE_SIZE));
        }
      },
    });
  };

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          historyUtils.clearHistory();
          setHistory([]);
          setPage(1);
          setHasMore(false);
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <CustomHeader title='浏览历史' hideBack={false} />
      <ScrollView scrollY className={styles.scroll}>
        {history.length === 0 ? (
          <View className={styles.empty}>暂无浏览历史</View>
        ) : (
          history.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        )}
      </ScrollView>
      <View className={styles.bottomBar}>
        <Button
          className={styles.clearBtn}
          type='primary'
          onClick={handleClearAll}
        >
          清空所有浏览历史
        </Button>
      </View>
    </View>
  );
};

export default HistoryPage; 
