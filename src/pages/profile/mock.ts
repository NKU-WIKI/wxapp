import starIcon from "../../assets/star-filled.svg";
import historyIcon from "../../assets/history.svg";
const commentIcon = "/assets/comment.png";
const likeIcon = "/assets/like.png";
const favoriteIcon = "/assets/favorite.png";
const feedbackIcon = "/assets/feedback.png";
const notificationIcon = "/assets/notification.png";
const clearIcon = "/assets/clear.png";
const aboutIcon = "/assets/about.png";
const logoutIcon = "/assets/logout.png";
const settingsIcon = '/assets/settings.png';

export const mockUser = {
  avatar: "https://picsum.photos/id/1025/80/80",
  nickname: "北极熊",
  university: "南开大学",
  bio: "卷又卷不动，躺又躺不平",
  stats: [
    { value: 238, label: "帖子" },
    { value: "1,459", label: "获赞" },
    { value: 328, label: "关注" },
    { value: 892, label: "粉丝" },
    { value: "5w", label: "token" },
  ],
  actions: [
    { name: "我的收藏", icon: starIcon },
    { name: "浏览历史", icon: historyIcon },
    { name: "我的评论", icon: commentIcon },
    { name: "我的点赞", icon: likeIcon },
    { name: "我的收藏", icon: favoriteIcon },
    { name: "草稿箱", icon: starIcon },
    { name: "意见反馈", icon: feedbackIcon },
    { name: "设置", icon: settingsIcon },
  ],
  settings: [
    { name: "消息通知", icon: notificationIcon },
    { name: "清除缓存", icon: clearIcon },
    { name: "关于我们", icon: aboutIcon },
    { name: "退出登录", icon: logoutIcon },
  ],
}; 