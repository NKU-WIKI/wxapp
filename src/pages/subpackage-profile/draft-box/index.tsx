import { useEffect, useState } from 'react';
import { View, ScrollView, Button as TaroButton } from '@tarojs/components';
import DraftItem from './components/DraftItem';
import { getDrafts, clearDrafts } from '@/utils/draft';
import styles from './index.module.scss';
import { DraftPost } from '@/types/draft';
import Button from '@/components/button';
import Taro, { usePullDownRefresh } from '@tarojs/taro';

const DraftBox = () => {
  const [drafts, setDrafts] = useState<DraftPost[]>([]);

  // 封装刷新逻辑
  const refreshDrafts = () => {
    setDrafts(getDrafts());
  };

  useEffect(() => {
    refreshDrafts();
  }, []);

  usePullDownRefresh(() => {
    refreshDrafts();
    Taro.stopPullDownRefresh();
  });

  const handleEdit = (draft: DraftPost) => {
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/publish/index?draftId=${draft.id}`
    });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该草稿吗？',
      success: (res) => {
        if (res.confirm) {
          import('@/utils/draft').then(({ removeDraft }) => {
            removeDraft(id);
            setDrafts(getDrafts());
          });
        }
      },
    });
  };

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要放弃所有草稿吗？',
      success: (res) => {
        if (res.confirm) {
          clearDrafts();
          setDrafts([]);
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY className={styles.scroll}>
        {drafts.length === 0 ? (
          <View className={styles.empty}>暂无草稿</View>
        ) : (
          drafts.map((draft) => (
            <DraftItem
              key={draft.id}
              draft={draft}
              onEdit={() => handleEdit(draft)}
              onDelete={() => handleDelete(draft.id)}
            />
          ))
        )}
      </ScrollView>
      <View className={styles.bottomBar}>
        <Button
          className={styles.clearBtn}
          type="primary"
          onClick={handleClearAll}
        >
          放弃所有草稿
        </Button>
      </View>
    </View>
  );
};

export default DraftBox;