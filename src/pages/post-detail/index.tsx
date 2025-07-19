import React from 'react';
import { View, ScrollView } from '@tarojs/components';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';
import PostDetailContent from './components/PostDetailContent';
import CommentSection from './components/CommentSection';
import BottomInput from './components/BottomInput';

const PostDetailPage = () => {
  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title="帖子详情" />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY className={styles.scrollView}>
          <View className={styles.mainContent}>
            <PostDetailContent />
            <CommentSection />
          </View>
        </ScrollView>
      </View>
      <BottomInput />
    </View>
  );
};

export default PostDetailPage; 