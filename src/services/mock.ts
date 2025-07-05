import { Post } from '../types/post';

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: {
      name: '南开艺术学院的小艺',
      avatar: 'https://picsum.photos/id/1027/80/80',
      school: '在校学生',
    },
    time: '2小时前',
    content:
      '今天漫步南开大学校园，感受到百年学府的厚重与活力。阳光透过梧桐树叶洒在主楼前，学子们穿梭其中，构成一幅生机勃勃的画面。站在伯苓大讲堂前，仿佛能听到“允公允能，日新月异”的校训回响。分享一组照片，希望能带给大家一份学术氛围与青春活力。',
    image: 'https://picsum.photos/id/1015/300/150', // 列表预览图
    images: [ // 详情页图集
      'https://picsum.photos/id/1015/300/300',
      'https://picsum.photos/id/1016/300/300',
    ],
    tags: ['#南开大学', '#大学生活'],
    location: '南开大学八里台校区',
    likes: '2.8k',
    stars: 128,
    commentsCount: 128,
    comments: [
      {
        id: 1,
        author: {
          name: 'NKUWiki',
          avatar: 'https://picsum.photos/id/10/80/80',
        },
        content:
          '南开大学的主楼建于1982年，是学校的标志性建筑之一。伯苓大讲堂则是为纪念南开创始人张伯苓先生而命名。“允公允能，日新月异”的校训出自张伯苓先生，寓意南开人要心怀天下、追求卓越。',
        time: '1小时前',
        likes: 89,
        isAIAssistant: true,
      },
      {
        id: 2,
        author: {
          name: '南开数院小可爱',
          avatar: 'https://picsum.photos/id/1011/80/80',
        },
        content:
          '南开的秋天最美了，主楼前的梧桐树开始变黄了吗？期待今年的落叶大道！',
        time: '45分钟前',
        likes: 56,
      },
    ],
  },
  {
    id: 2,
    author: {
      name: '千堆雪',
      avatar: 'https://picsum.photos/id/1005/40/40',
      school: '本科生',
    },
    time: '10分钟前',
    content:
      '大家好！我是计算机系的新生，想请教一下学长学姐们关于专业课程的选择建议。特别是对算法和数据结构感兴趣，不知道大家有什么推荐的课程或学习路径吗？',
    tags: ['#新生求助', '#课程咨询', '#计算机', '#算法'],
    likes: 18,
    commentsCount: 23,
  },
  {
    id: 3,
    author: {
      name: '大列巴',
      avatar: 'https://picsum.photos/id/1011/40/40',
      school: '硕士生',
    },
    time: '2小时前',
    content:
      '【活动预告】下周三下午3点在图书馆报告厅举办"互联网创业经验分享会"，特邀三位优秀校友分享创业历程。感兴趣的同学欢迎报名参加！详情戳图片👇',
    image: 'https://picsum.photos/id/10/300/150',
    tags: ['#创业分享', '#校园活动', '#讲座', '#校友'],
    likes: 45,
    commentsCount: 32,
  },
];

export const getPostById = (id: number): Post | undefined => {
  return MOCK_POSTS.find(post => post.id === id);
} 