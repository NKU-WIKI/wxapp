import RobotIcon from "../../assets/robot.png";
import TranslateIcon from "../../assets/translate.png";
import PlanIcon from "../../assets/plan.png";
import BookIcon from "../../assets/book.png";
import CodeIcon from "../../assets/code.png";

export const hotspots = [
  {
    id: 1,
    title: "期末复习攻略分享",
    discussions: "2.3K 讨论",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 2,
    title: "校园美食探店",
    discussions: "1.8K 讨论",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=481&q=80",
  },
];

export const aiAssistants = [
  { id: 1, name: "作业助手", icon: RobotIcon },
  { id: 2, name: "英语口语", icon: TranslateIcon },
  { id: 3, name: "保研规划", icon: PlanIcon },
];

export const activity = {
  title: "校园音乐节",
  time: "2024-01-20 19:00",
  location: "大学生活动中心",
  image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
};

export const resources = [
  { id: 1, title: "考研资料", count: "12个精品资源", icon: BookIcon },
  { id: 2, title: "编程课程", count: "8个在线课程", icon: CodeIcon },
]; 