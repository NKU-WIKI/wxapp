import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Post } from "@/types/api/post.d";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { toggleAction } from "@/store/slices/postSlice";

// 引入所有需要的图标
import heartIcon from "@/assets/heart-outline.svg"; // 空心
import heartActiveIcon from "@/assets/heart-bold.svg"; // 实心
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star-outline.svg"; // 空心
import starActiveIcon from "@/assets/star-filled.svg"; // 实心
import sendIcon from "@/assets/send.svg";
import moreIcon from "@/assets/more-horizontal.svg";

interface PostCardProps {
  post: Post;
  className?: string;
}

const PostCard = ({ post, className = "" }: PostCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, token } = useSelector((state: RootState) => state.user);
  
  const navigateToDetail = () => {
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}`,
    });
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    
    // 检查用户是否登录
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    // 处理不同的操作
    if (action === 'like' || action === 'favorite') {
      // 直接派发 action 到 Redux，让 Redux 处理状态更新
      dispatch(toggleAction({ 
        postId: post.id, 
        actionType: action
      }))
      .then(response => {
        console.log(`${action}操作成功:`, response);
      })
      .catch(error => {
        console.error(`${action}操作失败:`, error);
        Taro.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      });
    } else if (action === 'comment') {
      // 跳转到详情页并聚焦评论区
      navigateToDetail();
    } else if (action === 'share') {
      Taro.showShareMenu({
        withShareTicket: true
      });
    }
  };

  const handleMoreAction = (e) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    Taro.showActionSheet({
      itemList: ['删除', '编辑', '举报'],
      success: function (res) {
        console.log(`选择了第${res.tapIndex}个按钮`);
        const actions = ['delete', 'edit', 'report'];
        const selectedAction = actions[res.tapIndex];
        
        if (selectedAction === 'delete') {
          Taro.showModal({
            title: '确认删除',
            content: '确定要删除这条帖子吗？',
            success: function (res) {
              if (res.confirm) {
                console.log('确认删除帖子', post.id);
                // TODO: 调用删除API
              }
            }
          });
        } else if (selectedAction === 'edit') {
          console.log('编辑帖子', post.id);
          // TODO: 跳转到编辑页面
        } else if (selectedAction === 'report') {
          console.log('举报帖子', post.id);
          // TODO: 调用举报API
        }
      },
      fail: function (res) {
        console.log(res.errMsg);
      }
    });
  };

  const ActionButton = ({ icon, activeIcon, count, isActive, action }) => (
    <View
      className={`${styles.actionButton} ${isActive ? styles.active : ""}`}
      onClick={(e) => handleActionClick(e, action)}
    >
      <Image
        src={isActive ? activeIcon : icon}
        className={styles.actionIcon}
      />
      <Text className={styles.actionCount}>{count}</Text>
    </View>
  );

  return (
    <View className={`${styles.postCard} ${className}`} onClick={navigateToDetail}>
      {/* 作者信息 */}
      <View className={styles.authorInfo}>
        <Image src={post.author_info.avatar} className={styles.avatar} />
        <View className={styles.authorText}>
          <Text className={styles.authorName}>{post.author_info.nickname}</Text>
          <Text className={styles.postTime}>{post.create_time}</Text>
        </View>
        <View 
          className={styles.moreButton}
          style={
            { "--icon-url": `url(${moreIcon})` } as React.CSSProperties
          }
          onClick={handleMoreAction}
        />
        {/*
          这里可以根据 is_following_author 状态来显示关注按钮
          <Button className={styles.followButton}>关注</Button>
        */}
      </View>

      {/* 帖子内容 */}
      <View className={styles.content}>
        <Text className={styles.title}>{post.title}</Text>
        <Text className={styles.text} numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {/* 图片展示 */}
      {post.image_urls && post.image_urls.length > 0 && (
        <View className={styles.images}>
          {post.image_urls.map((url, index) => (
            <Image key={index} src={url} className={styles.postImage} />
          ))}
        </View>
      )}

      {/* 标签 */}
      {post.tag && (
        <View className={styles.tags}>
          {(() => {
            // 安全处理不同格式的tag数据
            if (Array.isArray(post.tag)) {
              return post.tag.map(tag => (
                <Text key={tag} className={styles.tag}>#{tag.trim()}</Text>
              ));
            }
            
            if (typeof post.tag === 'string') {
              // 尝试解析JSON字符串
              try {
                const parsedTags = JSON.parse(post.tag as string);
                if (Array.isArray(parsedTags)) {
                  return parsedTags.map(tag => (
                    <Text key={tag} className={styles.tag}>#{tag.trim()}</Text>
                  ));
                }
              } catch (e) {
                // 不是JSON，检查是否是逗号分隔的字符串
                const tagStr = post.tag as string;
                if (tagStr.includes(',')) {
                  return tagStr.split(',').map(tag => (
                    <Text key={tag} className={styles.tag}>#{tag.trim()}</Text>
                  ));
                }
                // 单个标签
                return <Text className={styles.tag}>#{tagStr.trim()}</Text>;
              }
            }
            
            return null;
          })()}
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.actions}>
          <ActionButton
            icon={heartIcon}
            activeIcon={heartActiveIcon}
            count={post.like_count}
            isActive={post.is_liked}
            action="like"
          />
          <ActionButton
            icon={commentIcon}
            activeIcon={commentIcon}
            count={post.comment_count}
            isActive={false} // 评论按钮通常没有激活状态
            action="comment"
          />
          <ActionButton
            icon={starIcon}
            activeIcon={starActiveIcon}
            count={post.favorite_count}
            isActive={post.is_favorited}
            action="favorite"
          />
        </View>
        <View
          className={styles.shareIcon}
          onClick={(e) => handleActionClick(e, "share")}
        >
          <Image src={sendIcon} style={{ width: '100%', height: '100%' }} />
        </View>
      </View>
    </View>
  );
};

export default PostCard;
