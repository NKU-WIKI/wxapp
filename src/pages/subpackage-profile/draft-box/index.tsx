import { useEffect, useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
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
import { deleteDraft as apiDeleteDraft, clearAllDrafts as apiClearAllDrafts } from '@/services/api/post';

const DraftBox = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: serverDrafts, draftsLoading } = useSelector((state: RootState) => state.post);
  const [localDrafts, setLocalDrafts] = useState<DraftPost[]>([]);

  // 封装刷新本地草稿逻辑
  const refreshLocalDrafts = () => {
    const list = getDrafts();
    console.log('[drafts] local count:', list.length);
    setLocalDrafts(list);
  };

  // 封装刷新服务端草稿逻辑
  const refreshServerDrafts = () => {
    console.log('[drafts] refreshing server drafts...');
    dispatch(fetchDrafts());
  };

  useEffect(() => {
    refreshLocalDrafts();
    refreshServerDrafts();
  }, [dispatch]);

  usePullDownRefresh(() => {
    refreshLocalDrafts();
    refreshServerDrafts();
    console.log('[drafts] pull-down refreshed');
    Taro.stopPullDownRefresh();
  });

  // 处理本地草稿编辑
  const handleLocalEdit = async (draft: DraftPost) => {
    try {
      const { removeDraft } = await import('@/utils/draft');
      removeDraft(draft.id);
      setLocalDrafts(getDrafts());
    } catch {}
    Taro.navigateTo({ url: `/pages/subpackage-interactive/publish/index?draftId=${draft.id}` });
  };

  // 处理服务端草稿编辑
  const handleServerEdit = async (draft: Post) => {
    try {
      // 不再提前删除，避免发布页 GET 404；仅缓存以便发布页兜底使用
      Taro.setStorageSync('tmp_server_draft', draft);
    } catch {}
    Taro.navigateTo({ url: `/pages/subpackage-interactive/publish/index?postId=${draft.id}&isEdit=true` });
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
          apiDeleteDraft(id)
            .then(() => {
              Taro.showToast({ title: '已删除', icon: 'success' });
              dispatch(fetchDrafts());
            })
            .catch(() => Taro.showToast({ title: '删除失败', icon: 'none' }));
        }
      },
    });
  };

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认操作',
      content: '确定要删除所有草稿（本地+服务端）吗？',
      success: (res) => {
        if (res.confirm) {
          // 本地
          clearDrafts();
          setLocalDrafts([]);
          // 服务端
          apiClearAllDrafts()
            .then(() => dispatch(fetchDrafts()))
            .catch(() => {});
        }
      },
    });
  };

  // 合并并排序所有草稿
  const allDrafts = [
    ...localDrafts.map(draft => ({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      avatar: draft.avatar,
      updatedAt: draft.updatedAt,
      source: 'local' as const,
    })),
    ...serverDrafts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content || '',
      avatar: post.user?.avatar || '',
      updatedAt: new Date(post.updated_at || post.created_at || (post as any).create_time || '').getTime() || Date.now(),
      source: 'server' as const,
    }))
  ]
  // 去重：以 id 优先服务端覆盖本地
  .reduce((acc: any[], item) => {
    const idx = acc.findIndex(d => d.id === item.id);
    if (idx >= 0) {
      // 服务端覆盖本地
      if (item.source === 'server') acc[idx] = item;
    } else {
      acc.push(item);
    }
    return acc;
  }, [])
  .sort((a, b) => b.updatedAt - a.updatedAt);

  useEffect(() => {
    console.log('[drafts] merged list length:', allDrafts.length, 'server:', serverDrafts.length, 'local:', localDrafts.length, 'loading:', draftsLoading);
  }, [allDrafts.length, serverDrafts.length, localDrafts.length, draftsLoading]);

  return (
    <View className={styles.container}>
      <ScrollView scrollY className={styles.scroll}>
        {draftsLoading === 'pending' && localDrafts.length === 0 ? (
          <View className={styles.loading}>加载中...</View>
        ) : allDrafts.length === 0 ? (
          <View className={styles.empty}>暂无草稿</View>
        ) : (
          <>
            {/* 合并后的草稿列表 */}
              <View className={styles.section}>
              {allDrafts.map((draft) => (
                  <DraftItem
                  key={draft.id}
                    draft={draft}
                  onEdit={() => {
                    if (draft.source === 'server') {
                      handleServerEdit(serverDrafts.find(p => p.id === draft.id)!);
                    } else {
                      handleLocalEdit(draft);
                    }
                  }}
                  onDelete={() => {
                    if (draft.source === 'local') handleLocalDelete(draft.id);
                    else handleServerDelete(draft.id);
                  }}
                  />
                ))}
              </View>
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