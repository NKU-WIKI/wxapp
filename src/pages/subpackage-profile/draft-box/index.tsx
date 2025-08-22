import { useEffect, useState } from 'react';
import { View, ScrollView, Button as TaroButton } from '@tarojs/components';
import DraftItem from './components/DraftItem';
import { getDrafts, clearDrafts } from '@/utils/draft';
import styles from './index.module.scss';
import { DraftPost } from '@/types/draft';
import { Post } from '@/types/api/post.d';
import Button from '@/components/button';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchDrafts } from '@/store/slices/postSlice';

const DraftBox = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: serverDrafts, loading } = useSelector((state: RootState) => state.post);
  const [localDrafts, setLocalDrafts] = useState<DraftPost[]>([]);

  // 封装刷新本地草稿逻辑
  const refreshLocalDrafts = () => {
    setLocalDrafts(getDrafts());
  };

  // 封装刷新服务端草稿逻辑
  const refreshServerDrafts = () => {
    dispatch(fetchDrafts());
  };

  useEffect(() => {
    refreshLocalDrafts();
    refreshServerDrafts();
  }, [dispatch]);

  usePullDownRefresh(() => {
    refreshLocalDrafts();
    refreshServerDrafts();
    Taro.stopPullDownRefresh();
  });

  // 处理本地草稿编辑
  const handleLocalEdit = (draft: DraftPost) => {
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/publish/index?draftId=${draft.id}`
    });
  };

  // 处理服务端草稿编辑
  const handleServerEdit = (draft: Post) => {
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/publish/index?postId=${draft.id}&isEdit=true`
    });
  };

  // 处理本地草稿删除
  const handleLocalDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该本地草稿吗？',
      success: (res) => {
        if (res.confirm) {
          import('@/utils/draft').then(({ removeDraft }) => {
            removeDraft(id);
            setLocalDrafts(getDrafts());
          });
        }
      },
    });
  };

  // 处理服务端草稿删除（需要调用API）
  const handleServerDelete = (id: string) => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除该服务端草稿吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除草稿的API
          console.log('删除服务端草稿:', id);
          Taro.showToast({ title: '功能待实现', icon: 'none' });
        }
      },
    });
  };

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要放弃所有本地草稿吗？',
      success: (res) => {
        if (res.confirm) {
          clearDrafts();
          setLocalDrafts([]);
        }
      },
    });
  };

  // 合并并排序所有草稿
  const allDrafts = [
    ...localDrafts.map(draft => ({ ...draft, type: 'local' as const })),
    ...serverDrafts.filter(post => post.status === 'draft').map(post => ({
      id: post.id,
      title: post.title,
      content: post.content || '',
      avatar: post.user?.avatar || '',
      updatedAt: new Date(post.create_time || '').getTime(),
      type: 'server' as const
    }))
  ].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <View className={styles.container}>
      <ScrollView scrollY className={styles.scroll}>
        {loading && localDrafts.length === 0 ? (
          <View className={styles.loading}>加载中...</View>
        ) : allDrafts.length === 0 ? (
          <View className={styles.empty}>暂无草稿</View>
        ) : (
          <>
            {/* 服务端草稿 */}
            {allDrafts.filter(draft => draft.type === 'server').length > 0 && (
              <View className={styles.section}>
                <View className={styles.sectionTitle}>服务端草稿</View>
                {allDrafts.filter(draft => draft.type === 'server').map((draft) => (
                  <DraftItem
                    key={`server-${draft.id}`}
                    draft={draft}
                    onEdit={() => handleServerEdit(serverDrafts.find(p => p.id === draft.id)!)}
                    onDelete={() => handleServerDelete(draft.id)}
                  />
                ))}
              </View>
            )}
            
            {/* 本地草稿 */}
            {allDrafts.filter(draft => draft.type === 'local').length > 0 && (
              <View className={styles.section}>
                <View className={styles.sectionTitle}>本地草稿</View>
                {allDrafts.filter(draft => draft.type === 'local').map((draft) => (
                  <DraftItem
                    key={`local-${draft.id}`}
                    draft={draft}
                    onEdit={() => handleLocalEdit(draft)}
                    onDelete={() => handleLocalDelete(draft.id)}
                  />
                ))}
              </View>
            )}
          </>
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