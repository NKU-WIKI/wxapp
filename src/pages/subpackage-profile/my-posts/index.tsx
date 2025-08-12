import { useEffect, useState } from 'react';
import { View, ScrollView, Text } from '@tarojs/components';
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import MyPostItem from './components/MyPostItem';
import Button from '@/components/button';
import styles from './index.module.scss';
import { Post } from '@/types/api/post.d';
import postApi from '@/services/api/post';

const PAGE_SIZE = 20;

const MyPostsPage = () => {
  const userState = useSelector((state: RootState) => state.user);
  const userInfo = userState?.userInfo;
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMyPosts = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const nextPage = reset ? 1 : page;
      const response = await postApi.getPosts({
        page: nextPage,
        page_size: PAGE_SIZE,
        tab: 'new' // 使用new标签获取最新帖子
      });

      if (response.code === 200 && response.data) {
        // 过滤出当前用户的帖子
        const myPosts = response.data.filter(post => post.user_id === userInfo?.id);
        
        if (reset) {
          setPosts(myPosts);
          setPage(1);
          setHasMore(myPosts.length === PAGE_SIZE);
        } else {
          setPosts(prev => [...prev, ...myPosts]);
          setHasMore(myPosts.length === PAGE_SIZE);
        }
      }
    } catch (error) {
      console.error('获取我的帖子失败:', error);
      Taro.showToast({
        title: '获取帖子失败',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      loadMyPosts(true);
    }
  }, [userInfo?.id]);

  usePullDownRefresh(() => {
    loadMyPosts(true);
    Taro.stopPullDownRefresh();
  });

  useReachBottom(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMyPosts(false);
    }
  });

  const handleDelete = async (postId: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这篇帖子吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await postApi.deletePost(postId);
            if (response.code === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              });
              // 从列表中移除被删除的帖子
              setPosts(prev => prev.filter(post => post.id !== postId));
            } else {
              throw new Error(response.msg || '删除失败');
            }
          } catch (error) {
            console.error('删除帖子失败:', error);
            Taro.showToast({
              title: '删除失败',
              icon: 'error'
            });
          }
        }
      },
    });
  };

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除所有已发布的帖子吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 批量删除所有帖子
            const deletePromises = posts.map(post => 
              postApi.deletePost(post.id)
            );
            
            await Promise.all(deletePromises);
            
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 清空列表
            setPosts([]);
            setPage(1);
            setHasMore(false);
          } catch (error) {
            console.error('批量删除帖子失败:', error);
            Taro.showToast({
              title: '删除失败',
              icon: 'error'
            });
          }
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollY className={styles.scroll}>
        {posts.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyTitle}>暂无发布的帖子</Text>
            <Text className={styles.emptyDescription}>快去发布你的第一篇帖子吧！</Text>
          </View>
        ) : (
          posts.map((post) => (
            <MyPostItem
              key={post.id}
              post={post}
              onDelete={() => handleDelete(post.id)}
            />
          ))
        )}
      </ScrollView>
      {posts.length > 0 && (
        <View className={styles.bottomBar}>
          <Button
            className={styles.clearBtn}
            type="danger"
            onClick={handleClearAll}
          >
            删除所有已发布的帖子
          </Button>
        </View>
      )}
    </View>
  );
};

export default MyPostsPage; 