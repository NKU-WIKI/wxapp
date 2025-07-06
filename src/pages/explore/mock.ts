import userIcon from '../../assets/group.png';
import nankaiLogo from '../../assets/logo-nankai.png';

export const searchScopes = [
  { id: 'website', label: '网站' },
  { id: 'wechat', label: '微信' },
  { id: 'market', label: '集市' },
  { id: 'xiaohongshu', label: '小红书' },
  { id: 'douyin', label: '抖音' },
  { id: 'deepsearch', label: 'Deep Search' },
];

export const recommendations = [
  { id: 1, text: '校园跑步打卡活动规则？', questionedBy: 756, icon: userIcon },
  { id: 2, text: '如何加入校园社团？', questionedBy: 543, icon: userIcon },
];

export const wikiSummary = {
  title: 'wiki 今日南开热点总结',
  items: [
    { 
      id: 1, 
      type: '科研突破', 
      content: '化学学院在《自然》发表新型纳米材料研究，相关成果获央视报道[1]。',
      source: { ref: 1, type: '微博话题', linkText: '#南开纳米新材料' }
    },
    { 
      id: 2, 
      type: '招生争议', 
      content: '知乎热帖讨论“强基计划面试公平性”，校方官微两小时内回应称“全程录像可复核”，舆情迅速降温[2]。',
      source: { ref: 2, type: '知乎问题', linkText: '“强基计划面试公平性”' }
    }
  ],
};

export const campusHotList = {
  title: '校园热榜',
  items: [
    { id: 1, rank: 1, title: '期末考试时间调整通知：12 月 20 日起陆续开始', discussions: '2.8 万讨论' },
    { id: 2, rank: 2, title: '新图书馆开放时间延长至晚上 11 点', discussions: '1.5 万讨论' },
    { id: 3, rank: 3, title: '校园跑步打卡活动正式启动', discussions: '9,826 讨论' },
  ]
}; 