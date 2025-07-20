import React, { useEffect } from 'react';
import { View, ScrollView, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPostById } from '@/store/slices/postSlice';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';
import PostItem from '@/components/post-item'; // 替换为 PostItem
import CommentSection from './components/CommentSection';
import BottomInput from './components/BottomInput';
import EmptyState from '@/components/empty-state';
import EmptyIcon from '@/assets/empty.svg'; // 引入一个图标

const PostDetailPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = Taro.useRouter();
  const { currentPost, detailLoading, detailError } = useSelector((state: RootState) => state.post);

  useEffect(() => {
    if (router.params.id) {
      const postId = Number(router.params.id);
      dispatch(fetchPostById(postId));
    }
  }, [router.params.id, dispatch]);

  const renderContent = () => {
    if (detailLoading === 'pending') {
      return <Text>加载中...</Text>;
    }

    if (detailError || !currentPost) {
      return <EmptyState icon={EmptyIcon} text="帖子加载失败，请稍后重试" />;
    }

    return (
      <>
        <PostItem post={currentPost} className={styles.detailPostItem} />
        <CommentSection comments={currentPost.comments || []} />
      </>
    );
  };

  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title="帖子详情" />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY className={styles.scrollView}>
          <View className={styles.mainContent}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
      <BottomInput />
    </View>
  );
};

export default PostDetailPage; 